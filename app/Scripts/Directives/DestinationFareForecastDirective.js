angular.module('TrippismUIApp').directive('destinationFareForecast', ['$rootScope', '$compile', '$modal', 'FareforecastFactory', 'UtilFactory', '$stateParams', '$state',
    function ($rootScope, $compile, $modal, FareforecastFactory, UtilFactory, $stateParams, $state) {
        return {
            restrict: 'E',
            scope: {
                //homeFn: '&'
                fareParams: '='
            },
            templateUrl: '/Views/Partials/DestinationFareForecastPartial.html',
            controller: function ($scope) {
                $scope.GetCurrencySymbol = function (code) {
                    return UtilFactory.GetCurrencySymbol(code);
                }
            },
            link: function ($scope, elem, attrs) {
                $scope.$watch('fareParams', function (newValue, oldValue) {
                    if (newValue != undefined) {
                        $scope.fareParams.dataforEmail = {};
                        activate();
                    }
                });

                $scope.SendEmailToUser = SendEmailToUser;
                function SendEmailToUser() {
                    if (!$scope.fareParams) return;
                    var GetEmailDetPopupInstance = $modal.open({
                        templateUrl: '/Views/Partials/EmailDetFormPartial.html',
                        controller: 'EmailForDestinationDet',
                        scope: $scope,
                        resolve: {
                            eMailData: function () { return $scope.fareParams; },
                            eMailDataFareForeCast: function () { return $scope.fareParams.dataforEmail.FareForecastDataForEmail }
                        }
                    });
                }

                function activate() {
                    $scope.FareNoDataFound = true;
                    $scope.FareforecastData = "";
                    $scope.IsRequestCompleted = false;
                    if ($scope.fareParams.FareInfo)
                        $scope.fareCurrencySymbol = $scope.GetCurrencySymbol($scope.fareParams.FareInfo.CurrencyCode);
                    
                    $scope.airportDetail = $scope.fareParams.DestinationairportName.airport_FullName + ', ' + $scope.fareParams.DestinationairportName.airport_CityName + ', ' + $scope.fareParams.DestinationairportName.airport_CountryName;
                    $scope.fareinfopromise = FareforecastFactory.fareforecast($scope.fareParams.Fareforecastdata).then(function (data) {
                        $scope.IsRequestCompleted = true;
                        $scope.inProgressFareinfo = false;
                        //400 for "Parameter 'departuredate' exceeds the maximum days allowed" api limit Valid dates are a maximum of 60 future dates.
                        if (data.status == 404 || data.status == 400) {
                            $scope.FareApiLoaded = true;
                            $scope.FareNoDataFound = true;
                            return;
                        }
                        $scope.FareNoDataFound = false;
                        $scope.FareforecastData = data;
                        // Setting up fare data for email
                        $scope.fareParams.dataforEmail.FareForecastDataForEmail = {};
                        $scope.fareParams.dataforEmail.FareForecastDataForEmail = data;

                    });
                };
                $scope.InstaFlightSearch = function (airlines, lowestFare, outboundflightstops, inboundflightstops) {
                    $scope.fareParams.instaFlightSearchData.IncludedCarriers = airlines;
                    $scope.fareParams.instaFlightSearchData.LowestFare = lowestFare;
                    $scope.fareParams.instaFlightSearchData.outboundflightstops = outboundflightstops;
                    $scope.fareParams.instaFlightSearchData.inboundflightstops = inboundflightstops;
                    var InstaFlightSearchPopupInstance = $modal.open({
                        templateUrl: 'Views/Partials/InstaFlightSearchPartial.html',
                        controller: 'InstaFlightSearchController',
                        scope: $scope,
                        size: 'lg',
                        resolve: {
                            instaFlightSearchData: function () { return $scope.fareParams.instaFlightSearchData; }
                        }
                    });
                };
            }
        }
    }]);
