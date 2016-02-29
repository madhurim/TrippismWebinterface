angular.module('TrippismUIApp').directive('farerangewidgetInfo',
                ['$compile', 'FareRangeFactory', '$filter', '$timeout', '$rootScope', 'UtilFactory', 'FareforecastFactory', 'TrippismConstants',
    function ($compile, FareRangeFactory, $filter, $timeout, $rootScope, UtilFactory,FareforecastFactory, TrippismConstants) {
        return {
            restrict: 'E',
            scope: {
                widgetParams: '=',
            },
            templateUrl: '/Views/Partials/FarerangePartial.html',
            controller : function($scope)
            {
                $scope.initFarerangeSummary = function () {
                    var isVisible = false; // this determines the widget visibility according to different parameters
                    var isVisibilityRecorded = false;
                    $scope.IsWidgetClosed = true;
                    $scope.formats = Dateformat();
                    $scope.format = $scope.formats[5];
                    $scope.closeWidget = function () {
                        $scope.IsWidgetClosed = false;
                    }
                    $scope.FareRangeWidgetDataFound = false;
                    $scope.DepartDate = $filter('date')($scope.widgetParams.Fareforecastdata.DepartureDate, $scope.format, null);
                    $scope.ReturnDate = $filter('date')($scope.widgetParams.Fareforecastdata.ReturnDate, $scope.format, null);
                    var frdt = new Date($scope.widgetParams.Fareforecastdata.DepartureDate);
                    var todt = new Date($scope.widgetParams.Fareforecastdata.ReturnDate);
                    var timeDiff = Math.abs(todt.getTime() - frdt.getTime());
                    $scope.staydaylength = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    $scope.LatestDepartureDate = new Date($scope.widgetParams.Fareforecastdata.ReturnDate); //.split('T')[0].replace(/-/g, "/"))
                    $scope.LatestDepartureDate.setDate($scope.LatestDepartureDate.getDate() + 5);

                    var daydiff = getLengthOfStay($scope.widgetParams.Fareforecastdata.DepartureDate, $scope.LatestDepartureDate);
                    if (daydiff > 15) {
                        $scope.LatestDepartureDate = new Date($scope.widgetParams.Fareforecastdata.DepartureDate);//.split('T')[0].replace(/-/g, "/"))
                        $scope.LatestDepartureDate.setDate(LatestDepartureDate.getDate() + 14);
                    }
                    $scope.LatestDepartureDate = $filter('date')($scope.LatestDepartureDate, 'yyyy-MM-dd')
                    $scope.loadfareRangeInfo();

                    //Coding for get fareforcast data
                    $scope.fareinfopromise = FareforecastFactory.fareforecast($scope.widgetParams.Fareforecastdata).then(function (data) {
                        $scope.IsRequestCompleted = true;
                        $scope.inProgressFareinfo = false;
                        if (data.status == 404 || data.status == 400) {
                            $scope.FareApiLoaded = true;
                            $scope.FareNoDataFound = true;
                            return;
                        }
                        $scope.FareNoDataFound = false;
                        $scope.FareforecastData = data;
                        // Setting up fare data for email
                        $scope.widgetParams.dataforEmail.FareForecastDataForEmail = {};
                        $scope.widgetParams.dataforEmail.FareForecastDataForEmail = data;

                    });
                }
              
                $scope.loadfareRangeInfo = function () {
                    $scope.fareRangeInfoLoaded = false;
                    $scope.FareRangeWidgetDataFound = false;
                    if ($scope.widgetParams != undefined) {
                        $scope.fareRangeData = "";
                        var data = {
                            "Origin": $scope.widgetParams.Fareforecastdata.Origin.toUpperCase(),
                            "Destination": $scope.widgetParams.Fareforecastdata.Destination,
                            "EarliestDepartureDate": $scope.widgetParams.Fareforecastdata.DepartureDate,
                            "LatestDepartureDate": $scope.LatestDepartureDate,
                            "Lengthofstay": $scope.staydaylength  //TrippismConstants.DefaultLenghtOfStay
                        };
                        if ($scope.fareRangeInfoLoaded == false && $scope.fareRangeData == "") {
                            $scope.farerangepromise = FareRangeFactory.fareRange(data).then(function (data) {
                                if (data.status == 404 || data.status == 400) {
                                    $scope.fareRangeInfoNoDataFound = true;
                                    ////No Data Found then return 
                                    $scope.$emit('widgetLoaded', { name: "farerangeInfo", isVisible: false });
                                    //console.log("farerangeInfo data sent..");
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

                                            var locationairport = _.find($scope.widgetParams.AvailableAirports, function (airport) { return airport.airport_Code == MinSelectedLocation.OriginLocation.toUpperCase() });
                                            if (locationairport != undefined)
                                                $scope.SelectedLocation = MinSelectedLocation.OriginLocation + ', ' + locationairport.airport_FullName + ", " + locationairport.airport_CityName;

                                            var faredata = {
                                                DestinationLocation: MinSelectedLocation.DestinationLocation,
                                                OriginLocation: MinSelectedLocation.OriginLocation,
                                                IsMacOrigin: true,
                                                SelectedLocation: $scope.SelectedLocation,
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

                                            var locationairport = _.find($scope.widgetParams.AvailableAirports, function (airport) { return airport.airport_Code == MinSelectedLocation.DestinationLocation.toUpperCase() });
                                            if (locationairport != undefined)
                                                $scope.SelectedDestinationLocation = MinSelectedLocation.DestinationLocation + ', ' + locationairport.airport_FullName + ", " + locationairport.airport_CityName;

                                            var faredata = {
                                                DestinationLocation: MinSelectedLocation.DestinationLocation,
                                                OriginLocation: MinSelectedLocation.OriginLocation,
                                                IsMacOrigin: false,
                                                IsMacDestination: true,
                                                SelectedLocation: '',
                                                SelectedDestinationLocation: $scope.SelectedDestinationLocation,
                                                FareData: destinations[MinSelectedLocation.DestinationLocation]
                                            };
                                            $scope.fareRangeData = faredata;
                                        }
                                    }
                                    else if (data.FareData != undefined && data.FareData[0].OriginLocation == undefined) {
                                        $scope.fareRangeData = data;
                                    }

                                    //$scope.farerangeParams.FareRangeData = $scope.fareRangeData;
                                }
                                $scope.fareRangeInfoLoaded = true;
                            });

                        }
                    }
                }
            },
            link: function (scope, elem, attrs) {

                scope.$watch('widgetParams', function (newValue, oldValue) {
                    if (newValue != undefined) {
                        scope.initFarerangeSummary();
                    }
                });

                scope.GetCurrencySymbol = function (code) {
                    return UtilFactory.GetCurrencySymbol(code);
                }
                scope.$watch('fareRangeData', function (newValue, oldValue) {
                    if (newValue != oldValue && newValue != "" && newValue != undefined) {
                        var isVisible = !scope.loadingFareRange;
                        scope.$emit('widgetLoaded', { name: "farerangeInfo", isVisible: isVisible });
                        PreparHtmldata();
                    }
                })
                function PreparHtmldata() {
                    if (scope.fareRangeData != undefined && scope.fareRangeData != "") {
                        // replace(/-/g, "/") used because of safari date convert problem
                        var FrmDate = new Date(scope.widgetParams.Fareforecastdata.DepartureDate.split('T')[0].replace(/-/g, "/"));
                        var Todate = new Date(scope.widgetParams.Fareforecastdata.ReturnDate.split('T')[0].replace(/-/g, "/"));
                        for (i = 0; i < scope.fareRangeData.FareData.length; i++) {
                            var WeekStartDate = new Date(scope.fareRangeData.FareData[i].DepartureDateTime.split('T')[0].replace(/-/g, "/"));
                            if (WeekStartDate >= FrmDate && WeekStartDate <= Todate) {
                                scope.FareRangeWidgetData = {
                                    MinimumFare: scope.fareRangeData.FareData[i].MinimumFare,
                                    MaximumFare: scope.fareRangeData.FareData[i].MaximumFare,
                                    MedianFare: scope.fareRangeData.FareData[i].MedianFare,
                                    CurrencyCode: UtilFactory.GetCurrencySymbol(scope.fareRangeData.FareData[i].CurrencyCode)
                                };
                                scope.FareRangeWidgetDataFound = true;
                                break;
                            }
                        }
                    }

                }
            }
        }
    }]);