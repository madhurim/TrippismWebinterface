angular.module('TrippismUIApp').directive('farerangewidgetInfo',
                ['FareRangeFactory', '$filter', '$timeout', 'UtilFactory', 'FareforecastFactory', 'urlConstant', 'DestinationFactory','$rootScope',
function (FareRangeFactory, $filter, $timeout, UtilFactory, FareforecastFactory, urlConstant, DestinationFactory, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            widgetParams: '=',
        },
        templateUrl: urlConstant.partialViewsPath + 'farerangePartial.html',
        controller: function ($scope) {
            $scope.GetCurrencySymbol = GetCurrencySymbol;
            $scope.initFarerangeSummary = function () {
                var isVisible = false; // this determines the widget visibility according to different parameters                
                $scope.IsWidgetClosed = true;
                $scope.formats = Dateformat();
                $scope.format = $scope.formats[5];

                $scope.FareRangeWidgetDataFound = false;
                $scope.DepartDate = new Date($scope.widgetParams.Fareforecastdata.DepartureDate);
                $scope.ReturnDate = new Date($scope.widgetParams.Fareforecastdata.ReturnDate);

                var frdt = new Date($scope.widgetParams.Fareforecastdata.DepartureDate);
                var todt = new Date($scope.widgetParams.Fareforecastdata.ReturnDate);
                var timeDiff = Math.abs(todt.getTime() - frdt.getTime());
                $scope.staydaylength = Math.ceil(timeDiff / (1000 * 3600 * 24));
                $scope.LatestDepartureDate = new Date($scope.widgetParams.Fareforecastdata.ReturnDate);
                $scope.LatestDepartureDate.setDate($scope.LatestDepartureDate.getDate() + 5);

                var daydiff = getLengthOfStay($scope.widgetParams.Fareforecastdata.DepartureDate, $scope.LatestDepartureDate);
                if (daydiff > 15) {
                    $scope.LatestDepartureDate = new Date($scope.widgetParams.Fareforecastdata.DepartureDate);
                    $scope.LatestDepartureDate.setDate($scope.LatestDepartureDate.getDate() + 14);
                }
                $scope.LatestDepartureDate = $filter('date')($scope.LatestDepartureDate, 'yyyy-MM-dd')
                $scope.loadfareRangeInfo();

                //Coding for get fareforcast data
                $scope.fareinfopromise = FareforecastFactory.fareforecast($scope.widgetParams.Fareforecastdata).then(function (data) {
                    $scope.IsRequestCompleted = true;
                    if (data.status == 404 || data.status == 400) {
                        $scope.FareNoDataFound = true;
                        $scope.$emit('widgetLoaded', { name: "fareforcastinfo", isVisible: false });
                        return;
                    }
                    $scope.$emit('widgetLoaded', { name: "fareforcastinfo", isVisible: true });
                    $scope.FareNoDataFound = false;
                    $scope.FareforecastData = data;
                    DestinationFactory.DestinationDataStorage.currentPage.fareForecast = {
                        HighestPredictedFare: $scope.amountBifurcation(data.Forecast.HighestPredictedFare),
                        LowestPredictedFare: $scope.amountBifurcation(data.Forecast.LowestPredictedFare),
                        CurrencySymbol: GetCurrencySymbol(data.Forecast.CurrencyCode),
                        Recommendation: data.Recommendation
                    };
                });
            }

            $scope.loadfareRangeInfo = function () {
                $scope.fareRangeInfoLoaded = false;
                $scope.FareRangeWidgetDataFound = false;
                if ($scope.widgetParams != undefined) {
                    $scope.fareRangeData;
                    var data = {
                        "Origin": $scope.widgetParams.Fareforecastdata.Origin.toUpperCase(),
                        "Destination": $scope.widgetParams.Fareforecastdata.Destination,
                        "EarliestDepartureDate": $scope.widgetParams.Fareforecastdata.DepartureDate,
                        "LatestDepartureDate": $scope.LatestDepartureDate,
                        "Lengthofstay": $scope.staydaylength
                    };

                    $scope.farerangepromise = FareRangeFactory.fareRange(data).then(function (data) {
                        if (data.status == 404 || data.status == 400) {
                            ////No Data Found then return                            
                            $scope.$emit('widgetLoaded', { name: "farerangeInfo", isVisible: false });
                            return;
                        }
                        var originairport = _.find($scope.widgetParams.AvailableAirports, function (airport) { return airport.airport_Code == $scope.widgetParams.Fareforecastdata.Origin });
                        var destinationairport = _.find($scope.widgetParams.AvailableAirports, function (airport) { return airport.airport_Code == $scope.widgetParams.Fareforecastdata.Destination });

                        // Done this code where citycode and airport code is same
                        var originList = _.where($scope.widgetParams.AvailableAirports, { airport_CityCode: $scope.widgetParams.Fareforecastdata.Origin });
                        var originairportObj = _.find(originList, function (airport) { return airport.airport_IsMAC == true });
                        if (originairportObj != undefined) originairport.airport_IsMAC = true;
                        else originairport.airport_IsMAC = false;

                        var desList = _.where($scope.widgetParams.AvailableAirports, { airport_CityCode: $scope.widgetParams.Fareforecastdata.Destination });
                        var destinationairportObj = _.find(desList, function (airport) { return airport.airport_IsMAC == true });
                        if (destinationairportObj != undefined) destinationairport.airport_IsMAC = true;
                        else destinationairport.airport_IsMAC = false;

                        if (originairport != undefined && destinationairport != undefined) {
                            // If both airports are not MAC
                            if (!originairport.airport_IsMAC && !destinationairport.airport_IsMAC) {
                                $scope.IsMacOrigin = false;
                                data.IsMacOrigin = false
                                $scope.fareRangeData = data;
                            }
                                // If Origin airport is MAC and Destination is not
                            else if ((originairport.airport_IsMAC && !destinationairport.airport_IsMAC) || (originairport.airport_IsMAC && destinationairport.airport_IsMAC)) {
                                $scope.IsMacOrigin = true;
                                var origins = _.groupBy(data.FareData, 'OriginLocation');
                                if (origins != undefined) {
                                    var MinimumLocation = [];
                                    _.each(origins, function (org) {
                                        MinimumLocation.push(_.min(org, function (loc) { return loc.MinimumFare; }));
                                    });
                                    var MinSelectedLocation = _.min(MinimumLocation, function (loc) { return loc.MinimumFare; });

                                    var faredata = {
                                        DestinationLocation: MinSelectedLocation.DestinationLocation,
                                        OriginLocation: MinSelectedLocation.OriginLocation,
                                        IsMacOrigin: true,
                                        FareData: origins[MinSelectedLocation.OriginLocation]
                                    };
                                    $scope.fareRangeData = faredata;
                                }
                            }
                                // If Destination airport is MAC and Origin  is not
                            else if (!originairport.airport_IsMAC && destinationairport.airport_IsMAC) {
                                $scope.IsMacDestination = true;
                                var destinations = _.groupBy(data.FareData, 'DestinationLocation');
                                if (destinations != undefined) {
                                    var MinimumLocation = [];
                                    _.each(destinations, function (org) {
                                        MinimumLocation.push(_.min(org, function (loc) { return loc.MinimumFare; }));
                                    });
                                    var MinSelectedLocation = _.min(MinimumLocation, function (loc) { return loc.MinimumFare; });

                                    var faredata = {
                                        DestinationLocation: MinSelectedLocation.DestinationLocation,
                                        OriginLocation: MinSelectedLocation.OriginLocation,
                                        IsMacOrigin: false,
                                        IsMacDestination: true,
                                        FareData: destinations[MinSelectedLocation.DestinationLocation]
                                    };
                                    $scope.fareRangeData = faredata;
                                }
                            }
                            else if (data.FareData != undefined && data.FareData[0].OriginLocation == undefined) {
                                $scope.fareRangeData = data;
                            }
                        }
                        $scope.fareRangeInfoLoaded = true;
                    });
                }
            }

            function GetCurrencySymbol(code) {
                return UtilFactory.GetCurrencySymbol(code);
            }
            $scope.amountBifurcation = function (value) { return UtilFactory.amountBifurcation(value); };
        },
        link: function (scope, elem, attrs) {
            scope.$on('destinationFareInfo', function (event, data) {
                scope.lowestFareObj = data;
            });

            scope.$watch('widgetParams', function (newValue, oldValue) {
                if (newValue != undefined) {
                    scope.initFarerangeSummary();
                }
            });

            scope.$watchGroup(['fareRangeData', 'lowestFareObj'], function (newValue, oldValue) {
                if (newValue[0] != undefined && newValue[1] != undefined) {
                    if (newValue[1].LowestFare && !isNaN(newValue[1].LowestFare.Fare))
                        scope.isFareFound = true;
                    else if (newValue[1].LowestNonStopFare && !isNaN(newValue[1].LowestNonStopFare.Fare))
                        scope.isFareFound = true;

                    PreparHtmldata();
                }
            })
            scope.$on('setExchangeRate', function (event, args) {
                PreparHtmldata();
            });
            function PreparHtmldata() {
                if (scope.fareRangeData != undefined && scope.fareRangeData != "") {
                    // replace(/-/g, "/") used because of safari date convert problem
                    var FrmDate = new Date(scope.widgetParams.Fareforecastdata.DepartureDate.split('T')[0].replace(/-/g, "/"));
                    var Todate = new Date(scope.widgetParams.Fareforecastdata.ReturnDate.split('T')[0].replace(/-/g, "/"));
                    for (i = 0; i < scope.fareRangeData.FareData.length; i++) {
                        var WeekStartDate = new Date(scope.fareRangeData.FareData[i].DepartureDateTime.split('T')[0].replace(/-/g, "/"));
                        if (WeekStartDate >= FrmDate && WeekStartDate <= Todate) {

                            if (!scope.isFareFound || (scope.fareRangeData.FareData[i].MinimumFare == scope.fareRangeData.FareData[i].MedianFare && scope.fareRangeData.FareData[i].MinimumFare == scope.fareRangeData.FareData[i].MaximumFare))
                                break;

                            scope.FareRangeWidgetData = {
                                MinimumFare: (scope.fareRangeData.FareData[i].MinimumFare) * $rootScope.currencyInfo.rate,
                                MaximumFare: (scope.fareRangeData.FareData[i].MaximumFare) * $rootScope.currencyInfo.rate,
                                MedianFare: (scope.fareRangeData.FareData[i].MedianFare) * $rootScope.currencyInfo.rate,
                                //CurrencyCode: UtilFactory.GetCurrencySymbol(scope.fareRangeData.FareData[i].CurrencyCode),
                                CurrencyCode: $rootScope.currencyInfo.symbol,
                                Count: scope.fareRangeData.FareData[i].Count,
                                IsMacOrigin: scope.fareRangeData.IsMacOrigin,
                                IsMacDestination: scope.fareRangeData.IsMacDestination,
                                DestinationLocation: scope.fareRangeData.DestinationLocation,
                                OriginLocation: scope.fareRangeData.OriginLocation,
                            };
                            scope.FareRangeWidgetDataFound = true;
                            $timeout(function () {
                                setFareRangeChart();
                            }, 0, false);
                            break;
                        }
                    }
                    scope.$emit('widgetLoaded', { name: "farerangeInfo", isVisible: scope.FareRangeWidgetDataFound });
                }

            }

            function setFareRangeChart() {
                var chartFareObj = {
                    MinimumFare: Math.ceil(scope.FareRangeWidgetData.MinimumFare),
                    MedianFare: Math.ceil(scope.FareRangeWidgetData.MedianFare),
                    MaximumFare: Math.ceil(scope.FareRangeWidgetData.MaximumFare)
                };

                (function (H) {
                    var defaultPlotOptions = H.getOptions().plotOptions,
                        columnType = H.seriesTypes.column,
                        wrap = H.wrap,
                        each = H.each;

                    defaultPlotOptions.lineargauge = H.merge(defaultPlotOptions.column, {});
                    H.seriesTypes.lineargauge = H.extendClass(columnType, {
                        type: 'lineargauge',
                        setVisible: function () {
                            columnType.prototype.setVisible.apply(this, arguments);
                            if (this.markLine) {
                                this.markLine['hide']();
                            }
                        },
                        drawPoints: function () {
                            // Draw the Column like always
                            columnType.prototype.drawPoints.apply(this, arguments);
                            // Add a Marker
                            var series = this,
                                chart = this.chart,
                                inverted = chart.inverted,
                                xAxis = this.xAxis,
                                yAxis = this.yAxis,
                                point = this.points[0], // we know there is only 1 point
                                markLine = this.markLine,
                                ani = markLine ? 'animate' : 'attr';

                            // Hide column
                            point.graphic.hide();

                            // solve problem of some portion of Low, High text gets hidden due to overflow
                            $timeout(function () {
                                angular.element('#fareRageChart .highcharts-container').css({ overflow: 'visible' });
                            });
                        }
                    });
                }(Highcharts));

                $('#fareRageChart').highcharts({
                    chart: {
                        height: 85,
                        type: 'lineargauge',
                        inverted: true,
                        marginTop: 10
                    },
                    title: false,
                    credits: {
                        enabled: false
                    },
                    exporting: { enabled: false },
                    animation: false,
                    enableMouseTracking: false,
                    tooltip: false,
                    xAxis: {
                        lineColor: '#C0C0C0',
                        labels: {
                            enabled: false
                        },
                        tickLength: 1,
                    },
                    yAxis: {
                        min: 0,
                        max: 100,
                        gridLineWidth: 0,
                        tickWidth: 1,
                        tickColor: '#C0C0C0',
                        gridLineColor: '#C0C0C0',
                        gridLineWidth: 1,
                        startOnTick: true,
                        endOnTick: true,
                        tickPositions: [0, 50, 100],
                        title: null,
                        labels: {
                            step: 1,
                            useHTML: true,
                            formatter: function () {
                                var value = $filter('number')(this.value);
                                if (this.value == 0)
                                    return '<div class="gauge-label">Low<br/><span class="font-imp">' + scope.FareRangeWidgetData.CurrencyCode + ' ' + chartFareObj.MinimumFare + '</span></div>';
                                else if (this.value == 50)
                                    return '<div class="gauge-label">Median<br/><span class="font-imp">' + scope.FareRangeWidgetData.CurrencyCode + ' ' + chartFareObj.MedianFare + '</span></div>';
                                else if (this.value == 100)
                                    return '<div class="gauge-label">High<br/><span class="font-imp">' + scope.FareRangeWidgetData.CurrencyCode + ' ' + chartFareObj.MaximumFare + '</span></div>';
                            }
                        },
                        plotBands: [{
                            from: 0,
                            to: 50,
                            color: '#92d050'
                        },
                        {
                            from: 50,
                            to: 100,
                            color: '#ffff00'
                        }]
                    },
                    legend: {
                        enabled: false
                    },
                    series: [{
                        data: [0],
                        dataLabels: {
                            enabled: false,
                        }
                    }]
                });
            }
        }
    }
}]);