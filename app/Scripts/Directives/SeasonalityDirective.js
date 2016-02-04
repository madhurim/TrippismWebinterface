angular.module('TrippismUIApp').directive('seasonalityInfo', [
                                                    '$compile',
                                                    '$rootScope',
                                                    '$timeout',
                                                    '$filter',
                                                    'SeasonalityFactory',
                                                    'TrippismConstants',
    function ($compile, $rootScope, $timeout, $filter, SeasonalityFactory, TrippismConstants) {
        return {
            restrict: 'E',

            scope: {
                seasonalityParams: '=',
            },
            templateUrl: '/Views/Partials/SeasonalityPartial.html',
            link: function (scope, elem, attrs) {
                scope.formats = Dateformat();
                scope.format = scope.formats[5];
                scope.Isviewmoredisplayed = false;
                scope.ChartLoaded = false;

                scope.$on('ontabClicked', function (event, args) {
                    if (scope.ChartLoaded) {
                        $timeout(function () { $(window).resize(); }, 100, false);
                    }
                });


                scope.SeasonalityDisplay = function () {
                    scope.MarkerSeasonalityInfo.Seasonality = scope.SeasonalityData;
                    scope.mailmarkereasonalityInfo.Seasonality = scope.SeasonalityData;
                    scope.Isviewmoredisplayed = true;
                };

                scope.$parent.divSeasonality = false;
                scope.loadingSeasonality = true;
                scope.$watch('loadSeasonalityInfoLoaded',
                  function (newValue) {
                      scope.loadingSeasonality = angular.copy(!newValue);
                      scope.seasonalityParams.loadingSeasonality = scope.loadingSeasonality;
                      scope.$parent.divSeasonality = newValue;
                      //if (newValue == true) {
                      //    angular.element("#lastDiv").removeClass("no-border");
                      //} else {
                      //    angular.element("#lastDiv").addClass("no-border");
                      //}
                  }
                );

                scope.loadSeasonalityInfo = function () {
                    scope.MarkerSeasonalityInfo = "";
                    scope.loadSeasonalityInfoLoaded = false;
                    scope.SeasonalityNoDataFound = false;
                    if (scope.seasonalityParams != undefined) {
                        if (scope.loadSeasonalityInfoLoaded == false) {
                            if (scope.MarkerSeasonalityInfo == "") {
                                var Seasonalitydata = {
                                    "Destination": scope.seasonalityParams.Destinatrion, // JFK
                                };

                                $timeout(function () {
                                    scope.inProgressSeasonalityinfo = true;
                                    scope.seasonalitypromise = SeasonalityFactory.Seasonality(Seasonalitydata).then(function (data) {

                                        if (data.status == 404) {
                                            scope.SeasonalityNoDataFound = true;
                                            scope.seasonalityParams.SeasonalityData = "";
                                            return;
                                        }
                                        scope.SeasonalityData = data.Seasonality;
                                        scope.seasonalityParams.SeasonalityData = data.Seasonality;

                                        var defaultSeasonality = data.Seasonality;
                                        var now = new Date();
                                        var NextDate = addDays(now, 30);

                                        var filteredSeasonalityData = [];
                                        for (var i = 0; i < defaultSeasonality.length; i++) {
                                            scope.MarkerSeasonalityInfo.Seasonality = [];
                                            var datetocheck = new Date(defaultSeasonality[i].WeekStartDate.split('T')[0].replace(/-/g, "/"));
                                            if (datetocheck > now && datetocheck < NextDate)
                                                filteredSeasonalityData.push(defaultSeasonality[i]);
                                        }
                                        if (filteredSeasonalityData.length == 0) {
                                            for (var i = 0; i < 5; i++)
                                                filteredSeasonalityData.push(defaultSeasonality[i]);
                                        }
                                        data.Seasonality = filteredSeasonalityData;
                                        scope.MarkerSeasonalityInfo = data;
                                        scope.mailmarkereasonalityInfo = data;

                                        scope.inProgressSeasonalityinfo = false;
                                        scope.loadSeasonalityInfoLoaded = true;

                                    });
                                }, 0, false);
                            }
                        }

                    }
                };
                scope.$watchGroup(['seasonalityParams'], function (newValue, oldValue, scope) {
                    //Add Scope For Chart
                    if (scope.seasonalityParams != undefined) {
                        scope.DepartDate = $filter('date')(scope.seasonalityParams.Fareforecastdata.DepartureDate, scope.format, null);
                        scope.ReturnDate = $filter('date')(scope.seasonalityParams.Fareforecastdata.ReturnDate, scope.format, null);
                        scope.chartHeight = 300;
                        scope.TabIndex = "seasonality" + scope.seasonalityParams.tabIndex;
                        var mapHTML = "<div id='" + scope.TabIndex + "'></div>";
                        elem.append($compile(mapHTML)(scope));
                    }
                    scope.loadSeasonalityInfo();

                });
                scope.$watch('SeasonalityData', function (newValue, oldValue) {
                    DisplayChart();
                })


                scope.Chart = [];
                function DisplayChart() {
                    var chartDataLow = [];
                    var chartDataMedium = [];
                    var chartDataHigh = [];
                    var rec = 1;
                    var startdate;

                    if (scope.SeasonalityData != undefined && scope.SeasonalityData != "") {

                        var chartrec = _.sortBy(scope.SeasonalityData, 'WeekStartDate');

                        for (i = 0; i < chartrec.length; i++) {
                            var WeekStartDate = new Date(chartrec[i].WeekStartDate.split('T')[0].replace(/-/g, "/"));
                            var WeekEndDate = new Date(chartrec[i].WeekEndDate.split('T')[0].replace(/-/g, "/"));
                            if (i == 0)
                            { startdate = Date.UTC(WeekStartDate.getFullYear(), WeekStartDate.getMonth(), WeekStartDate.getDate()); }

                            var utcdate = Date.UTC(WeekStartDate.getFullYear(), WeekStartDate.getMonth(), WeekStartDate.getDate());
                            var endutcdate = Date.UTC(WeekEndDate.getFullYear(), WeekEndDate.getMonth(), WeekEndDate.getDate());
                            var SeasonalityIndicator = 1;
                            var NumberOfObervations = 0;
                            if (chartrec[i].SeasonalityIndicator == "Low") {
                                SeasonalityIndicator = 1;
                            }
                            if (chartrec[i].SeasonalityIndicator == "Medium") {
                                SeasonalityIndicator = 2;
                            }
                            if (chartrec[i].SeasonalityIndicator == "High") {
                                SeasonalityIndicator = 3;
                            }
                            if (chartrec[i].NumberOfObservations == "GreaterThan10000")
                                NumberOfObervations = 12000;
                            if (chartrec[i].NumberOfObservations == "LessThan10000")
                                NumberOfObervations = 8000;
                            if (chartrec[i].NumberOfObservations == "LessThan1000")
                                NumberOfObervations = 800;

                            var serise = {
                                x: utcdate,
                                y: SeasonalityIndicator,
                                z: NumberOfObervations,
                                startdate: utcdate,
                                enddate: endutcdate,
                                YearWeekNumber: chartrec[i].YearWeekNumber
                            };
                            if (SeasonalityIndicator == 1)
                                chartDataLow.push(serise);
                            else if (SeasonalityIndicator == 2)
                                chartDataMedium.push(serise);
                            else if (SeasonalityIndicator == 3)
                                chartDataHigh.push(serise);
                            rec++;

                        }
                        //   }

                        var PrevDate = "";
                        var options = {
                            chart: {
                                height: scope.chartHeight,
                                type: 'bubble',
                                renderTo: scope.TabIndex,
                            },
                            title: {
                                text: ''
                            },
                            credits: {
                                enabled: false
                            },
                            exporting: { enabled: false },
                            xAxis: {
                                type: 'datetime',
                                labels: {
                                    formatter: function () {
                                        var result = "";
                                        var startdaterange = new Date($filter('date')(this.value, scope.format, null));
                                        var enddaterange = new Date($filter('date')(this.value, scope.format, null));
                                        enddaterange = new Date(enddaterange.setDate(enddaterange.getDate() + 13));
                                        var departDate = new Date($filter('date')(scope.DepartDate, scope.format, null));
                                        //startdaterange.getMonth() + 1 >= departDate.getMonth() + 1 && 
                                        if (departDate >= startdaterange && departDate <= enddaterange)
                                            result = '<span style="font-weight: bold; font-size:12px">'
                                        else
                                            result = '<span>'

                                        var d = new Date(this.value);
                                        return result += Highcharts.dateFormat(TrippismConstants.HighChartDateFormat, this.value) + '</span><b>';

                                        //var result = "";
                                        //var startdaterange = new Date($filter('date')(this.value, scope.format, null));
                                        //var enddaterange = new Date($filter('date')(this.value, scope.format, null));
                                        //enddaterange = enddaterange.setDate(startdaterange.getDate() + 13);
                                        //startdaterange = $filter('date')(startdaterange, scope.format, null);
                                        //enddaterange = $filter('date')(enddaterange, scope.format, null);

                                        //if ((scope.DepartDate >= startdaterange && scope.DepartDate <= enddaterange) ||
                                        //   (scope.ReturnDate >= startdaterange && scope.ReturnDate <= enddaterange))
                                        //    result = '<span style="font-weight: bold; font-size:12px">'
                                        //else
                                        //    result = '<span>'

                                        //var d = new Date(this.value);
                                        //return result += Highcharts.dateFormat(TrippismConstants.HighChartDateFormat, this.value) + '</span><b>';
                                    },
                                    rotation: -45
                                },
                                tickInterval: 336 * 3600 * 1000,
                                minTickInterval: 336 * 3600 * 1000,
                                title: {
                                    text: 'Historical Traffic Seasonality for [ ' + scope.seasonalityParams.DestinationairportName.airport_FullName + ' , ' + scope.seasonalityParams.DestinationairportName.airport_CityName + ']'
                                }
                            },
                            yAxis: {
                                min: 0,
                                max: 4,
                                tickInterval: 1,
                                title: {
                                    text: 'Traffic Category'
                                },
                                labels: {
                                    formatter: function () {

                                        var result = '';
                                        if (this.value == 1) {
                                            result = '<span> ' + 'Low' + ' </span>';
                                        }
                                        else if (this.value == 2) {
                                            result = '<span> ' + 'Medium' + ' </span>';
                                        }
                                        else if (this.value == 3) {
                                            result = '<span> ' + 'High' + ' </span>';
                                        }
                                        else {
                                            result = '<span> ' + '' + ' </span>';
                                        }
                                        return result;
                                    }
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            tooltip: {
                                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>' + TrippismConstants.HighChartTwoDecimalCurrencyFormat + '$</b><br/>',
                                formatter: function () {
                                    var yresult = '';

                                    if (this.y == 1)
                                        yresult = '<span> ' + 'Low' + ' </span>';

                                    else if (this.y == 2)
                                        yresult = '<span> ' + 'Medium' + ' </span>';

                                    else if (this.y == 3)
                                        yresult = '<span> ' + 'High' + ' </span>';

                                    else
                                        yresult = '<span> ' + '' + ' </span>';

                                    //var zresult = '';
                                    //if (this.point.z == 12000)
                                    //    zresult = '<span> ' + '> 10000' + ' </span>';

                                    //else if (this.point.z == 8000)
                                    //    zresult = '<span> ' + '< 10000' + ' </span>';

                                    //else if (this.point.z == 800)
                                    //    zresult = '<span> ' + '< 1000' + ' </span>';

                                    //else
                                    //    zresult = '<span> ' + '' + ' </span>';
                                    return '<span style="color:#87ceeb">Year Week :</span> <b> [#' + this.point.YearWeekNumber + ' of ' + Highcharts.dateFormat('%Y', new Date(this.point.startdate)) + '], [ ' + Highcharts.dateFormat('%m-%e-%Y', new Date(this.x)) + ' / ' + Highcharts.dateFormat(TrippismConstants.HighChartDateFormat, new Date(this.point.enddate)) + ' ] </b><br>' +
                                        '<span style="color:#87ceeb">Volume :</span> <b> ' + yresult + '</b>'; //+
                                    //'<span style="color:#87ceeb">Booking Quantities :</span> <b>' + zresult + '</b>';
                                }
                            },
                            series: [{
                                name: "Low Seasonality",
                                data: chartDataLow,
                                pointStart: startdate,
                                color: '#adff2f',
                            },
                            {
                                name: "Medium Seasonality",
                                data: chartDataMedium,
                                pointStart: startdate,
                                color: '#2e8b57',
                            },
                            {
                                name: "High Seasonality",
                                data: chartDataHigh,
                                pointStart: startdate,
                                color: '#87ceeb',
                            }]
                        };

                        $timeout(function () {
                            scope.Chart = new Highcharts.Chart(options);
                            scope.ChartLoaded = true;
                        }, 0, false);
                    }
                }
            }
        }
    }]);
