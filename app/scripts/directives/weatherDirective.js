angular.module('TrippismUIApp').directive('weatherInfo', ['$filter', 'WeatherFactory', 'urlConstant',
    function ($filter, WeatherFactory, urlConstant) {
        return {
            restrict: 'E',
            scope: {
                weatherParams: '=',
            },
            templateUrl: urlConstant.partialViewsPath + 'weatherPartial.html',
            controller: ['$scope', function ($scope) {
                $scope.initWeatherSummary = function () {
                    $scope.WeatherDataFound = false;
                    $scope.formats = Dateformat();
                    $scope.format = $scope.formats[5];
                    $scope.DepartDate = new Date($scope.weatherParams.Fareforecastdata.DepartureDate);
                    $scope.ReturnDate = new Date($scope.weatherParams.Fareforecastdata.ReturnDate);
                    $scope.WeatherFor = $scope.weatherParams.DestinationAirport.airport_CityName + "_" + $filter('date')($scope.weatherParams.Fareforecastdata.DepartureDate, $scope.format, null);
                    $scope.getWeatherInformation = function (data) {
                        if ($scope.WeatherInfoLoaded == false) {
                            WeatherFactory.GetData(data).then(function (data) {
                                $scope.WeatherInfoLoaded = false;
                                if (data.status != 200) {
                                    data = data.data;
                                    if (data.WeatherChances == undefined || data.WeatherChances.length == 0) {
                                        $scope.WeatherInfoLoaded = false;
                                        $scope.$emit('widgetLoaded', { name: "WeatherData", isVisible: $scope.WeatherInfoLoaded });
                                        return;
                                    }
                                }
                                $scope.WeatherInfoLoaded = true;
                                $scope.WeatherData = data.data;
                            });
                        }
                    }
                    $scope.WeatherRangeInfo = function () {
                        $scope.HighTempratureC = "0";
                        $scope.HighTempratureF = "0";
                        $scope.LowTempratureC = "0";
                        $scope.LowTempratureF = "0";
                        $scope.WeatherInfoLoaded = false;

                        //New Code
                        if ($scope.weatherParams != undefined) {
                            $scope.WeatherData = "";
                            var data = {};
                            if ($scope.weatherParams.DestinationAirport.airport_CountryCode == "US") {
                                data = {
                                    "State": null,
                                    "CountryCode": $scope.weatherParams.DestinationAirport.airport_CountryCode,
                                    "City": $scope.weatherParams.DestinationAirport.airport_CityName,
                                    "DepartDate": $filter('date')($scope.weatherParams.Fareforecastdata.DepartureDate, $scope.format, null),
                                    "ReturnDate": $filter('date')($scope.weatherParams.Fareforecastdata.ReturnDate, $scope.format, null),
                                    "Latitude": $scope.weatherParams.DestinationAirport.airport_Lat,
                                    "Longitude": $scope.weatherParams.DestinationAirport.airport_Lng,
                                    "WeatherFor": $scope.WeatherFor

                                };
                                $scope.getWeatherInformation(data);
                            }
                            else {
                                data = {
                                    "CityName": $scope.weatherParams.DestinationAirport.airport_CityName,
                                    "CountryCode": $scope.weatherParams.DestinationAirport.airport_CountryCode,
                                    "AirportCode": $scope.weatherParams.DestinationAirport.airport_Code,
                                    "DepartDate": $filter('date')($scope.weatherParams.Fareforecastdata.DepartureDate, $scope.format, null),
                                    "ReturnDate": $filter('date')($scope.weatherParams.Fareforecastdata.ReturnDate, $scope.format, null),
                                    "WeatherFor": $scope.WeatherFor
                                };
                                $scope.getWeatherInformation(data);
                            }
                        }
                    }

                    $scope.WeatherRangeInfo();
                }
            }],
            link: function (scope, elem, attrs) {

                scope.$watch('weatherParams', function (newValue, oldValue) {
                    if (newValue != undefined && newValue.Fareforecastdata != undefined) {
                        scope.initWeatherSummary();
                    }
                });
                scope.$watch('WeatherData', function (newValue, oldValue) {
                    if (newValue != oldValue || scope.WeatherDataFound == true) {
                        if (scope.WeatherData.WeatherFor != undefined)
                            scope.WeatherwidgetData = scope.WeatherData.data
                        else
                            scope.WeatherwidgetData = scope.WeatherData;

                        if (scope.WeatherwidgetData != undefined && scope.WeatherwidgetData != "") {
                            scope.$emit('widgetLoaded', { name: "WeatherData", isVisible: scope.WeatherInfoLoaded });
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
                    }
                }, true)
            }
        }
    }
]);
