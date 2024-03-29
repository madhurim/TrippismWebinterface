﻿angular.module('TrippismUIApp').directive('seasonalityInfo', [
                                                    '$compile',
                                                    '$timeout',
                                                    '$filter',
                                                    'SeasonalityFactory',
                                                    'dataConstant',
                                                    'urlConstant',
    function ($compile, $timeout, $filter, SeasonalityFactory, dataConstant, urlConstant) {
        return {
            restrict: 'E',
            scope: {
                seasonalityParams: '=',
            },
            templateUrl: urlConstant.partialViewsPath + 'seasonalityPartial.html',
            controller: ['$scope', function (scope) {
                scope.loadSeasonalityInfo = function () {
                    scope.loadSeasonalityInfoLoaded = false;
                    scope.SeasonalityNoDataFound = false;
                    if (scope.seasonalityParams != undefined) {
                        if (scope.loadSeasonalityInfoLoaded == false) {
                            var Seasonalitydata = {
                                "Destination": scope.seasonalityParams.DestinationAirport.airport_Code,
                            };
                            $timeout(function () {
                                scope.seasonalitypromise = SeasonalityFactory.Seasonality(Seasonalitydata).then(function (data) {
                                    if (data.status != 200) {
                                        scope.SeasonalityNoDataFound = true;
                                        return;
                                    }
                                    data = data.data;
                                    scope.SeasonalityData = data.Seasonality;
                                    var now = new Date();
                                    var NextDate = addDays(now, 30);

                                    var filteredSeasonalityData = [];
                                    for (var i = 0; i < scope.SeasonalityData.length; i++) {
                                        var datetocheck = new Date(scope.SeasonalityData[i].WeekStartDate.split('T')[0].replace(/-/g, "/"));
                                        if (datetocheck > now && datetocheck < NextDate)
                                            filteredSeasonalityData.push(scope.SeasonalityData[i]);
                                    }
                                    if (filteredSeasonalityData.length == 0) {
                                        for (var i = 0; i < 5; i++)
                                            filteredSeasonalityData.push(scope.SeasonalityData[i]);
                                    }
                                    data.Seasonality = filteredSeasonalityData;
                                    scope.loadSeasonalityInfoLoaded = true;

                                });
                            }, 0, false);
                        }

                    }
                };
            }],
            link: function (scope, elem, attrs) {
                scope.$watch('seasonalityParams', function (newValue, oldValue) {
                    if (newValue != undefined && newValue.Fareforecastdata != undefined)
                        initseasonalityData();
                });
                var divID = 'seasonality';
                function initseasonalityData() {
                    scope.formats = Dateformat();
                    scope.format = scope.formats[5];
                    scope.DepartDate = new Date(scope.seasonalityParams.Fareforecastdata.DepartureDate);
                    scope.ReturnDate = new Date(scope.seasonalityParams.Fareforecastdata.ReturnDate);
                    var mapHTML = "<div style='background:white;overflow-x:hidden;' id='" + divID + "'></div>";
                    elem.append($compile(mapHTML)(scope));
                    scope.loadSeasonalityInfo();
                }

                scope.loadingSeasonality = true;
                scope.$watch('loadSeasonalityInfoLoaded',
                  function (newValue) {
                      scope.loadingSeasonality = angular.copy(!newValue);
                      if (newValue == true) {
                          angular.element("#lastDiv").removeClass("no-border");
                      } else {
                          angular.element("#lastDiv").addClass("no-border");
                      }
                  }
                );
                scope.$watch('SeasonalityData', function (newValue, oldValue) {
                    {
                        DisplayChart();
                        setSeasonalitySummaryData();
                    }
                })

                function setSeasonalitySummaryData() {
                    if (scope.SeasonalityData != undefined && scope.SeasonalityData != "") {
                        // replace(/-/g, "/") used because of safari date convert problem
                        var FrmDate = new Date(scope.seasonalityParams.Fareforecastdata.DepartureDate.split('T')[0].replace(/-/g, "/"));
                        var Todate = new Date(scope.seasonalityParams.Fareforecastdata.ReturnDate.split('T')[0].replace(/-/g, "/"))
                        var Frmmonth = FrmDate.getMonth() + 1;
                        var Tomonth = Todate.getMonth() + 1;
                        var Fromweeks = _.filter(scope.SeasonalityData, function (dt) {
                            return (new Date(dt.WeekStartDate.split('T')[0].replace(/-/g, "/")).getMonth() + 1) == Frmmonth;
                        });
                        Fromweeks = Fromweeks.concat(_.filter(scope.SeasonalityData, function (dt) {
                            return (new Date(dt.WeekStartDate.split('T')[0].replace(/-/g, "/")).getMonth() + 1) == (Frmmonth - 1) == 0 ? 12 : Frmmonth - 1;
                        }));

                        if (Frmmonth != Tomonth) {
                            var ToWeeks = _.filter(scope.SeasonalityData, function (dt) {
                                return (new Date(dt.WeekStartDate.split('T')[0].replace(/-/g, "/")).getMonth() + 1) == Tomonth;
                            });
                            Fromweeks = Fromweeks.concat(ToWeeks);
                        }
                        var chartrec = _.sortBy(Fromweeks, 'WeekStartDate');
                        for (i = 0; i < chartrec.length; i++) {
                            // replace(/-/g, "/") used because of safari date convert problem
                            var WeekStartDate = new Date(chartrec[i].WeekStartDate.split('T')[0].replace(/-/g, "/"));
                            var WeekEndDate = new Date(chartrec[i].WeekEndDate.split('T')[0].replace(/-/g, "/"));
                            if (FrmDate >= WeekStartDate && FrmDate <= WeekEndDate) {
                                var SeasonalityIndicator = "";
                                if (chartrec[i].SeasonalityIndicator == "High")
                                    NumberOfObervations = 3;
                                if (chartrec[i].SeasonalityIndicator == "Medium")
                                    NumberOfObervations = 2;
                                if (chartrec[i].SeasonalityIndicator == "Low")
                                    NumberOfObervations = 1;
                                scope.SeasonalityWidgetData = {
                                    NoofIcons: NumberOfObervations
                                };
                                scope.SeasonalityWidgetDataFound = true;
                                return;
                            }
                        }
                    }
                }

                scope.Chart = [];
                function DisplayChart() {
                    var chartDataLow = [];
                    var chartDataMedium = [];
                    var chartDataHigh = [];
                    var chartDataAll = [];
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

                            // highlight graph marker
                            var startdaterange = new Date($filter('date')(serise.startdate, scope.format, null));
                            var enddaterange = new Date($filter('date')(serise.enddate, scope.format, null));
                            var departDate = new Date($filter('date')(scope.DepartDate, scope.format, null));
                            if (departDate >= startdaterange && departDate <= enddaterange)
                                serise.marker = { fillColor: '#39a848', states: { hover: { fillColor: '#39a848' } } };

                            chartDataAll.push(serise);
                        }
                        var PrevDate = "";
                        var options = {
                            chart: {
                                height: 200,
                                type: 'line',
                                renderTo: divID,
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

                                        if (departDate >= startdaterange && departDate <= enddaterange)
                                            result = '<span style="font-weight: bold; font-size:12px">'
                                        else
                                            result = '<span>'
                                        return result += Highcharts.dateFormat('%m-%Y', this.value) + '</span><b>';
                                    },
                                    rotation: -45
                                },
                                tickInterval: 2 * 336 * 3600 * 1000,
                                minTickInterval: 2 * 336 * 3600 * 1000
                            },
                            yAxis: {
                                min: 1,
                                max: 3,
                                tickInterval: 1,
                                title: {
                                    text: 'Traffic Category'
                                },
                                labels: {
                                    formatter: function () {
                                        if (this.value == 1) {
                                            return '<span> Off-Peak </span>';
                                        }
                                        else if (this.value == 2) {
                                            return '<span> Medium </span>';
                                        }
                                        else if (this.value == 3) {
                                            return '<span> Peak </span>';
                                        }
                                    }
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            tooltip: {
                                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>' + dataConstant.highChartTwoDecimalCurrencyFormat + '$</b><br/>',
                                formatter: function () {
                                    var yresult = '';

                                    if (this.y == 1)
                                        yresult = '<span> Off-Peak </span>';

                                    else if (this.y == 2)
                                        yresult = '<span> Medium </span>';

                                    else if (this.y == 3)
                                        yresult = '<span> Peak </span>';

                                    else
                                        yresult = '<span> </span>';

                                    return '<span style="color:#87ceeb">Year Week: </span> <b> [#' + this.point.YearWeekNumber + ' of ' + Highcharts.dateFormat('%Y', new Date(this.point.startdate)) + '], [ ' + Highcharts.dateFormat('%m-%e-%Y', new Date(this.x)) + ' / ' + Highcharts.dateFormat(dataConstant.highChartDateFormat, new Date(this.point.enddate)) + ' ] </b><br>' +
                                        '<span style="color:#87ceeb">Traffic Category: </span> <b> ' + yresult + '</b>';

                                }
                            },
                            series: [{
                                name: "Low Seasonality",
                                data: chartDataAll,
                                pointStart: startdate,
                                color: '#adff2f',
                            },
                            ]
                        };

                        $timeout(function () {
                            scope.Chart = new Highcharts.Chart(options);
                            angular.element('#lastDiv').addClass('newouterDiv');
                        }, 0, false);
                    }
                }
            }
        }
    }]);
