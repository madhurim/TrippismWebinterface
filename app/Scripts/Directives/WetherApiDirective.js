angular.module('TrippismUIApp').directive('weatherInfo', ['$compile', '$filter', '$timeout', '$rootScope', 'WeatherFactory', 'UtilFactory', 'TrippismConstants', 'GoogleGeoReverseLookupFactory',
    function ($compile, $filter, $timeout, $rootScope, WeatherFactory, UtilFactory, TrippismConstants, GoogleGeoReverseLookupFactory) {
        return {
            restrict: 'E',
            scope: {
                weatherParams: '=',
            },
            templateUrl: '/Views/Partials/WeatherPartial.html',
            link: function (scope, elem, attrs) {
                scope.WeatherDataGetFromCollection = false;
                scope.formats = Dateformat();
                scope.format = scope.formats[5];
                scope.WeatherInfoNoDataFound = true;
                scope.weatherParams.WeatherInfoNoDataFound = true;
                scope.chartHeight = 300;
                scope.$watchGroup(['weatherParams'], function (newValue, oldValue, scope) {
                        if (scope.weatherParams != undefined && scope.weatherParams.tabIndex != undefined) {
                            scope.DepartDate = $filter('date')(scope.weatherParams.Fareforecastdata.DepartureDate, scope.format, null);
                            scope.ReturnDate = $filter('date')(scope.weatherParams.Fareforecastdata.ReturnDate, scope.format, null);
                            scope.TabIndex = "weather" + scope.weatherParams.tabIndex;
                            var mapHTML = "<div style='float:left;width:100%;' id='" + scope.TabIndex + "' class='weatherDiv'></div>";
                            elem.append($compile(mapHTML)(scope));
                            scope.WeatherRangeInfo();

                        } else {
                            scope.WeatherData = "";
                        }
                });
                function removeElement(element) {
                    element && element.parentNode && element.parentNode.removeChild(element);
                }

                scope.WeatherRangeInfo = function () {
                    scope.WeatherInfoLoaded = false;
                    scope.HighTempratureC = "0";
                    scope.HighTempratureF = "0";
                    scope.LowTempratureC = "0";
                    scope.LowTempratureF = "0";
                    scope.TabName = scope.weatherParams.DestinationairportName.airport_CityName + "_" + $filter('date')(scope.weatherParams.Fareforecastdata.DepartureDate, scope.format, null);
                    if (scope.weatherParams != undefined) {
                        scope.WeatherData = "";
                        var data = {};
                        if (scope.weatherParams.DestinationairportName.airport_CountryCode == "US") {
                            data = {
                                "State": null,
                                "CountryCode": scope.weatherParams.DestinationairportName.airport_CountryCode,
                                "City": scope.weatherParams.DestinationairportName.airport_CityName,
                                "DepartDate": $filter('date')(scope.weatherParams.Fareforecastdata.DepartureDate, scope.format, null),
                                "ReturnDate": $filter('date')(scope.weatherParams.Fareforecastdata.ReturnDate, scope.format, null),
                                "Latitude": scope.weatherParams.DestinationairportName.airport_Lat,
                                "Longitude": scope.weatherParams.DestinationairportName.airport_Lng,
                                "tabindex": scope.TabName
                            };
                            scope.getWeatherInformation(data);
                        }
                        else {
                            data = {
                                "CityName": scope.weatherParams.DestinationairportName.airport_CityName,
                                "CountryCode": scope.weatherParams.DestinationairportName.airport_CountryCode,
                                "AirportCode": scope.weatherParams.DestinationairportName.airport_Code,//scope.weatherParams.DestinationairportName.airport_CityName,
                                "DepartDate": $filter('date')(scope.weatherParams.Fareforecastdata.DepartureDate, scope.format, null),
                                "ReturnDate": $filter('date')(scope.weatherParams.Fareforecastdata.ReturnDate, scope.format, null),
                                "tabindex": scope.TabName
                            };
                            scope.getWeatherInformation(data);
                        }
                    } 
                };

                scope.getWeatherInformation = function (data) {
                    if (scope.WeatherInfoLoaded == false) {                        
                        var weatherCollection = WeatherFactory.ResultData(scope.TabName);
                        if (weatherCollection != null && weatherCollection  != undefined)
                            scope.WeatherData = weatherCollection.data;
                        if (scope.WeatherData == "" || scope.WeatherData == undefined) {
                            scope.Weatherpromise = WeatherFactory.GetData(data).then(function (data) {
                                scope.WeatherInfoLoaded = false;
                                if (data == "" || data.status == 404  || data.WeatherChances == undefined ||  data.WeatherChances.length == 0) {
                                    scope.WeatherInfoNoDataFound = true;
                                    scope.weatherParams.WeatherInfoNoDataFound = true;
                                    scope.$emit('widgetLoaded', { name: "WeatherData", isVisible: scope.WeatherInfoLoaded });
                                    console.log("WeatherData data sent..");
                                    return;
                                }
                                scope.WeatherInfoNoDataFound = false;
                                scope.weatherParams.WeatherInfoNoDataFound = false;
                                scope.WeatherInfoLoaded = true;
                                scope.WeatherData = data;
                                //  scope.weatherParams.WeatherData = data;
                            });
                        }
                        else {
                            if (scope.WeatherData.WeatherChances.length != 0) {
                                scope.WeatherDataGetFromCollection = true;
                                scope.WeatherInfoNoDataFound = false;
                                scope.weatherParams.WeatherInfoNoDataFound = false;
                                scope.WeatherInfoLoaded = true;
                            }
                            else {
                                scope.$emit('widgetLoaded', { name: "WeatherData", isVisible: scope.WeatherInfoLoaded });
                            }
                        }
                    }
                } 
                scope.$watch('WeatherData', function (newValue, oldValue) {
                    if (newValue != oldValue ||scope.WeatherDataGetFromCollection == true ){
                        DisplayChart();
                        scope.$emit('widgetLoaded', { name: "WeatherData", isVisible: scope.WeatherInfoLoaded });
                        console.log("WeatherData data sent..");
                    }
//                    $rootScope.$emit('widgetLoaded', {name : "WeatherData", isVisible : scope.WeatherInfoNoDataFound });
//                    console.log("WeatherData data sent..");
                },true)
               //scope.$watch('weatherParams.WeatherInfoLoaded', function (newValue, oldValue,scope) {
               //    scope.WeatherData = WeatherFactory.ResultData(scope.TabName);
               //                 if (scope.WeatherData != null)
               //                 {
               //                     scope.WeatherInfoNoDataFound = false;
               //                  //   scope.weatherParams.WeatherInfoNoDataFound = false;
               //                     scope.WeatherInfoLoaded = true;
               //                 }
               //                 if (newValue != oldValue)
               //                     DisplayChart();
               //             })

                scope.Chart = [];
                function DisplayChart() {
                    var chartData = [];
                    if (scope.WeatherData != undefined && scope.WeatherData != "") {

                        if (scope.WeatherData.TempHighAvg != undefined) {
                            scope.HighTempratureF = scope.WeatherData.TempHighAvg.Avg.F;
                            scope.HighTempratureC = scope.WeatherData.TempHighAvg.Avg.C;
                        }

                        if (scope.WeatherData.TempLowAvg != undefined) {
                            scope.LowTempratureC = scope.WeatherData.TempLowAvg.Avg.C;
                            scope.LowTempratureF = scope.WeatherData.TempLowAvg.Avg.F;
                        }

                        for (i = 0; i < scope.WeatherData.WeatherChances.length; i++) {
                            var name = scope.WeatherData.WeatherChances[i].Name;
                            if (name == 'Sweltering')
                                name = 'Very Hot';
                            else if (name == 'Rain')
                                name = 'Rainy';
                            var datas = {

                                name: name,
                                y: scope.WeatherData.WeatherChances[i].Percentage
                            };
                            chartData.push(datas);
                        }
                        var options = {
                            chart: {
                                height: scope.chartHeight,
                                type: 'column',
                                renderTo: scope.TabIndex,
                            },
                            credits: {
                                enabled: false
                              },
                            exporting: { enabled: false } ,
                            title: {
                                text: ''
                            },
                            xAxis: {
                                type: 'category',
                                title: {
                                    text: 'Weather Type'
                                }
                            },
                            yAxis: {
                                tickInterval: 25,
                                min: 0,
                                max: 100,
                                title: {
                                    text: 'Percentage Likelihood'
                                }
                            },
                            legend: {
                                enabled: false
                            },
                            plotOptions: {
                                series: {
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: true,
                                        format: '{point.y:.1f}%'
                                    }
                                }
                            },
                            tooltip: {
                                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>' + TrippismConstants.HighChartTwoDecimalCurrencyFormat + '%</b><br/>'
                            },
                            series: [{
                                name: "Temprature",
                                colorByPoint: false,
                                data: chartData
                            }]
                        };

                        $timeout(function () {
                            scope.Chart = new Highcharts.Chart(options);
                        }, 0, false);
                    }
                }
            }
        }
    }]);