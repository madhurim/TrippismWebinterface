angular.module('TrippismUIApp').directive('weatherwidgetInfo', ['$compile', '$filter', '$timeout', '$rootScope', 'WeatherFactory', 'UtilFactory', 'TrippismConstants',
    function ($compile, $filter, $timeout, $rootScope, WeatherFactory, UtilFactory, TrippismConstants) {
        return {
            restrict: 'E',
            scope: {
                weatherParams: '=',
            },
            templateUrl: '/Views/Partials/WeatherWidgetPartial.html',
            link: function (scope, elem, attrs) {
                scope.WeatherDataFound = false;
                scope.formats = Dateformat();
                scope.format = scope.formats[5];
                scope.TabName = scope.weatherParams.DestinationairportName.airport_CityName + "_" + $filter('date')(scope.weatherParams.Fareforecastdata.DepartureDate, scope.format, null);
              //  scope.WeatherInfoNoDataFound = true;
                scope.$watchGroup(['weatherParams'], function (newValue, oldValue, scope) {
                    scope.WeatherData = undefined;
                    if (scope.weatherParams != undefined && scope.weatherParams.tabIndex != undefined) {
                        scope.DepartDate = $filter('date')(scope.weatherParams.Fareforecastdata.DepartureDate, scope.format, null);
                        scope.ReturnDate = $filter('date')(scope.weatherParams.Fareforecastdata.ReturnDate, scope.format, null);
                        scope.TabIndex = "weatherwidget" + scope.weatherParams.tabIndex;
                        var mapHTML = "<div id='" + scope.TabIndex + "'></div>";
                        elem.append($compile(mapHTML)(scope));
                        scope.WeatherRangeInfo();

                    } else {
                        scope.WeatherwidgetData = "";
                    }
                });
                scope.WeatherRangeInfo = function () {
                    scope.HighTempratureC = "0";
                    scope.HighTempratureF = "0";
                    scope.LowTempratureC = "0";
                    scope.LowTempratureF = "0";
                    scope.WeatherInfoLoaded = false;
                    //scope.WeatherInfoNoDataFound = true;

                    //New Code
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
                                "Latitude" : scope.weatherParams.DestinationairportName.airport_Lat,
                                "Longitude" : scope.weatherParams.DestinationairportName.airport_Lng,
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
                }
                //scope.$watch('weatherParams.WeatherInfoLoaded', function (newValue, oldValue, scope) {
                ////scope.$watch('weatherParams.WeatherData', function (newValue, oldValue, scope) {   
                //    scope.WeatherwidgetData = WeatherFactory.ResultData();                 
                //    if (newValue == undefined) return;
                //    scope.getWeatherInformation();
                //});
                function removeElement(element) {
                    element && element.parentNode && element.parentNode.removeChild(element);
                }
                scope.getWeatherInformation = function (data) {
                    if (scope.WeatherInfoLoaded == false) {
                        

                        scope.WeatherData = angular.copy(WeatherFactory.ResultData(scope.TabName));
                      
                        if (scope.WeatherData == "" || scope.WeatherData == undefined) {
                            scope.Weatherpromise = WeatherFactory.GetData(data).then(function (data) {
                                scope.WeatherInfoLoaded = false;
                                if (data == "" || data.status == 404 || data.WeatherChances == undefined || data.WeatherChances.length == 0) {
                                    // scope.WeatherInfoNoDataFound = true;
                                    scope.WeatherInfoLoaded = false;
                                    scope.$emit('widgetLoaded', { name: "weatherwidgetInfo", isVisible: scope.WeatherInfoLoaded });
                                    return;
                                }
                               // scope.WeatherInfoNoDataFound = false;
                                //scope.weatherParams.WeatherInfoNoDataFound = false;
                                scope.WeatherInfoLoaded = true;
                                scope.WeatherData =  angular.copy(data);
                               
                                // scope.weatherParams.WeatherData = data;
                            });
                        }
                        else {
                            if (scope.WeatherData.length != 0) {
                                scope.WeatherDataFound = true;
                                scope.WeatherInfoLoaded = true;
                            }
                            else {
                                scope.$emit('widgetLoaded', { name: "weatherwidgetInfo", isVisible: scope.WeatherInfoLoaded });
                            }
                          //  scope.WeatherInfoNoDataFound = false;
                        }  
                    }
                    
                   
                }
                scope.$watch('WeatherData', function (newValue, oldValue) {
                    if (newValue != oldValue || scope.WeatherDataFound == true) {
                        if (scope.WeatherData.tabindex != undefined)
                            scope.WeatherwidgetData = scope.WeatherData.data
                        else
                            scope.WeatherwidgetData = scope.WeatherData;
                        
                        if (scope.WeatherwidgetData != undefined && scope.WeatherwidgetData != "") {
                             scope.$emit('widgetLoaded', {name : "weatherwidgetInfo", isVisible : scope.WeatherInfoLoaded });
                             console.log("weatherwidgetInfo data sent..");
                            // console.log({name : "weatherwidgetInfo", isVisible : scope.WeatherInfoLoaded });
                       
                            angular.element("#outerDiv").addClass("outerDiv");
                            //  scope.WeatherInfoNoDataFound = false;
                            scope.WeatherInfoLoaded = true;
                            
                            var participation = _.find(scope.WeatherwidgetData.WeatherChances, function (chances) { return chances.Name == 'Precipitation' });
                            var rain = _.find(scope.WeatherwidgetData.WeatherChances, function (chances) { return chances.Name == 'Rain' });
                            if (participation != undefined && rain != undefined) {
                                if (participation.Percentage >= 60 && rain.Percentage >= 60)
                                    scope.IsparticipationDisplay = false;
                                else
                                    scope.IsparticipationDisplay = true;
                            }
                            else {
                                scope.IsparticipationDisplay = true;
                            }

                            if (scope.WeatherwidgetData.TempHighAvg != undefined) {
                                scope.HighTempratureF = scope.WeatherwidgetData.TempHighAvg.Avg.F;
                                scope.HighTempratureC = scope.WeatherwidgetData.TempHighAvg.Avg.C;
                            }

                            if (scope.WeatherwidgetData.TempLowAvg != undefined) {
                                scope.LowTempratureC = scope.WeatherwidgetData.TempLowAvg.Avg.C;
                                scope.LowTempratureF = scope.WeatherwidgetData.TempLowAvg.Avg.F;
                            }
                        }
                        
//                       $rootScope.$emit('widgetLoaded', {name : "weatherwidgetInfo", isVisible : scope.WeatherInfoLoaded });
//                       console.log("weatherwidgetInfo data sent..");
//                       console.log({name : "weatherwidgetInfo", isVisible : scope.WeatherInfoLoaded });
                  }
                 
                },true)
              
            }
        }
    }
]);
