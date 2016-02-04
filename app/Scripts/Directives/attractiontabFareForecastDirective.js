angular.module('TrippismUIApp').directive('attractiontabFareForecast', ['$compile', '$modal', 'FareforecastFactory', 'UtilFactory',
    function ($compile, $modal, FareforecastFactory, UtilFactory) {
        return {
            restrict: 'E',
            scope: {
                attractionParams: '=',
                homeFn: '&'
            },
            templateUrl: '/Views/Partials/AttractiontabFareForecastPartial.html',
            link: function (scope, elem, attrs) {

                scope.SendEmailToUser = SendEmailToUser;
                function SendEmailToUser() {
                    var GetEmailDetPopupInstance = $modal.open({
                        templateUrl: '/Views/Partials/EmailDetFormPartial.html',
                        controller: 'EmailForDestinationDet',
                        scope: scope,
                        resolve: {
                            eMailData: function () { return scope.attractionParams; },
                            eMailDataFareForeCast: function () { return scope.attractionParams.dataforEmail.FareForecastDataForEmail }
                        }
                    });
                }

                function activate() {
                    scope.FareNoDataFound = true;
                    scope.FareforecastData = "";
                    scope.IsRequestCompleted = false;
                    scope.fareinfopromise = FareforecastFactory.fareforecast(scope.attractionParams.Fareforecastdata).then(function (data) {
                        scope.IsRequestCompleted = true;
                        scope.inProgressFareinfo = false;
                        //400 for "Parameter 'departuredate' exceeds the maximum days allowed" api limit Valid dates are a maximum of 60 future dates.
                        if (data.status == 404 || data.status == 400) {
                            scope.FareApiLoaded = true;
                            scope.FareNoDataFound = true;
                            return;
                        }
                        scope.FareNoDataFound = false;
                        scope.FareforecastData = data;
                        // Setting up fare data for email
                        scope.attractionParams.dataforEmail.FareForecastDataForEmail = {};
                        scope.attractionParams.dataforEmail.FareForecastDataForEmail = data;

                    });
                };

                scope.$watch('attractionParams',
                 function (newValue, oldValue) {
                     activate();
                 });

                scope.InstaFlightSearch = function (airlines, lowestFare, outboundflightstops, inboundflightstops) {
                    scope.attractionParams.instaFlightSearchData.IncludedCarriers = airlines;
                    scope.attractionParams.instaFlightSearchData.LowestFare = lowestFare;
                    scope.attractionParams.instaFlightSearchData.outboundflightstops = outboundflightstops;
                    scope.attractionParams.instaFlightSearchData.inboundflightstops = inboundflightstops;
                    var InstaFlightSearchPopupInstance = $modal.open({
                        templateUrl: 'Views/Partials/InstaFlightSearchPartial.html',
                        controller: 'InstaFlightSearchController',
                        scope: scope,
                        size: 'lg',
                        resolve: {
                            instaFlightSearchData: function () { return scope.attractionParams.instaFlightSearchData; }
                        }
                    });
                };
                scope.GetCurrencySymbol = function (code) {
                    return UtilFactory.GetCurrencySymbol(code);
                }
            }
        }
    }]);
