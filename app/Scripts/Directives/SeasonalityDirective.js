angular.module('TrippismUIApp').directive('seasonalityInfo', [
                                                    '$compile',
                                                    '$timeout',
                                                    '$filter',
                                                    'SeasonalityFactory',
                                                    'TrippismConstants',
    function ($compile, $timeout, $filter, SeasonalityFactory, TrippismConstants) {
        return {
            restrict: 'E',
            scope: {
                seasonalityParams: '=',
            },
            templateUrl: '/Views/Partials/SeasonalityPartial.html',
            controller: ['$scope', function (scope) {
                scope.loadSeasonalityInfo = function () {
                    scope.MarkerSeasonalityInfo = "";
                    scope.loadSeasonalityInfoLoaded = false;
                    scope.SeasonalityNoDataFound = false;
                    if (scope.seasonalityParams != undefined) {
                        if (scope.loadSeasonalityInfoLoaded == false) {
                            if (scope.MarkerSeasonalityInfo == "") {
                                var Seasonalitydata = {
                                    "Destination": scope.seasonalityParams.DestinationairportName.airport_Code, // scope.seasonalityParams.Destinatrion, // JFK
                                };
                                $timeout(function () {
                                    scope.inProgressSeasonalityinfo = true;
                                    scope.seasonalitypromise = SeasonalityFactory.Seasonality(Seasonalitydata).then(function (data) {

                                        if (data.status == 404) {
                                            scope.SeasonalityNoDataFound = true;
                                            return;
                                        }
                                        scope.SeasonalityData = data.Seasonality;
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
            }],
            link: function (scope, elem, attrs) {
                scope.$watch('seasonalityParams', function (newValue, oldValue) {
                    if (newValue != undefined)
                        initseasonalityData();
                });
                function initseasonalityData() {
                    scope.formats = Dateformat();
                    scope.format = scope.formats[5];
                    scope.Isviewmoredisplayed = false;
                    scope.ChartLoaded = false;

                    scope.DepartDate = $filter('date')(scope.seasonalityParams.Fareforecastdata.DepartureDate, scope.format, null);
                    scope.ReturnDate = $filter('date')(scope.seasonalityParams.Fareforecastdata.ReturnDate, scope.format, null);
                    scope.chartHeight = 300;
                    scope.divID = "seasonality"; // + scope.seasonalityParams.tabIndex
                    var mapHTML = "<div id='" + scope.divID + "'></div>";
                    elem.append($compile(mapHTML)(scope));
                    scope.loadSeasonalityInfo();
                }
                //SeasonalityData for Mail
                //scope.SeasonalityDisplay = function () {
                //    scope.MarkerSeasonalityInfo.Seasonality = scope.SeasonalityData;
                //    scope.mailmarkereasonalityInfo.Seasonality = scope.SeasonalityData;
                //    scope.Isviewmoredisplayed = true;
                //};

                scope.loadingSeasonality = true;
                scope.$watch('loadSeasonalityInfoLoaded',
                  function (newValue) {
                      scope.loadingSeasonality = angular.copy(!newValue);
                      scope.$parent.divSeasonality = newValue;
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
                            //if (SeasonalityIndicator == 1)
                            //    chartDataLow.push(serise);
                            //else if (SeasonalityIndicator == 2)
                            //    chartDataMedium.push(serise);
                            //else if (SeasonalityIndicator == 3)
                            //    chartDataHigh.push(serise);

                            //if (SeasonalityIndicator == 1)
                            //    serise.marker = { symbol: 'diamond', fillColor: 'rgba(255,0,0,.5)' };
                            //else if (SeasonalityIndicator == 2)
                            //    serise.marker = { symbol: 'square', fillColor: 'rgba(255,0,0,.75)' };
                            //else if (SeasonalityIndicator == 3)
                            //    serise.marker = { symbol: 'circle', fillColor: 'rgba(255,0,0,.25)' };

                            chartDataAll.push(serise);
                        }

                        var PrevDate = "";
                        var options = {
                            chart: {
                                height: scope.chartHeight,
                                type: 'line',
                                renderTo: scope.divID,
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
                                    },
                                    rotation: -45
                                },
                                tickInterval: 336 * 3600 * 1000,
                                minTickInterval: 336 * 3600 * 1000,
                                title: {
                                    text: 'Historical Traffic Seasonality for ' + scope.seasonalityParams.DestinationairportName.airport_CityName
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

                                    return '<span style="color:#87ceeb">Year Week :</span> <b> [#' + this.point.YearWeekNumber + ' of ' + Highcharts.dateFormat('%Y', new Date(this.point.startdate)) + '], [ ' + Highcharts.dateFormat('%m-%e-%Y', new Date(this.x)) + ' / ' + Highcharts.dateFormat(TrippismConstants.HighChartDateFormat, new Date(this.point.enddate)) + ' ] </b><br>' +
                                        '<span style="color:#87ceeb">Volume :</span> <b> ' + yresult + '</b>';

                                }
                            },
                            series: [{
                                name: "Low Seasonality",
                                data: chartDataAll,
                                pointStart: startdate,
                                color: '#adff2f',
                            },
                            //{
                            //    name: "Medium Seasonality",
                            //    data: chartDataMedium,
                            //    pointStart: startdate,
                            //    color: '#2e8b57',
                            //},
                            //{
                            //    name: "High Seasonality",
                            //    data: chartDataHigh,
                            //    pointStart: startdate,
                            //    color: '#87ceeb',
                            //}
                            ]
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
