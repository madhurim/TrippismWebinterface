(function () {
    angular.module('TrippismUIApp').directive('destinationCardDirective', [DestinationMaterialCardsDirective]);
    function DestinationMaterialCardsDirective($scope) {
        return {
            restrict: 'E',
            scope: {
                requestData: '=?requestData'
            },
            templateUrl: '/Views/partials/DestinationCard.html',
            controller: ['$scope', 'UtilFactory', 'InstaFlightSearchFactory', function ($scope, UtilFactory, InstaFlightSearchFactory) {
                init();
                function init() {
                    var request = {
                        origin: $scope.requestData.origin,
                        destination: $scope.requestData.destination,
                        departureDate: $scope.requestData.departureDate,
                        returnDate: $scope.requestData.returnDate,
                        pointOfSaleCountry: $scope.requestData.pointOfSaleCountry,
                        limit: 1
                    };
                    getDestinationFare(request).then(function (data) {
                        if (data && data.PricedItineraries && data.PricedItineraries.length) {
                            $scope.destinationData = {
                                origin: request.origin,
                                destination: request.destination,
                                departureDate: data.DepartureDateTime,
                                returnDate: data.ReturnDateTime,
                                lowestFare: getLowestFare(data.PricedItineraries[0]),
                                currencyCode: getCurrencyCode(data.PricedItineraries[0])
                            }                            
                        }
                    });
                }

                function getDestinationFare(request) {
                    return InstaFlightSearchFactory.GetData(request).then(function (data) {
                        return data;
                    })
                }

                var getLowestFare = function (pricedItinerary) {
                    if (pricedItinerary == undefined)
                        return undefined;
                    return pricedItinerary.AirItineraryPricingInfo[0].TotalFare.Amount;
                }
                var getCurrencyCode = function (pricedItinerary) {
                    var pricingInfo = pricedItinerary.AirItineraryPricingInfo[0];
                    if (pricingInfo && pricingInfo.TotalFare && pricingInfo.TotalFare.CurrencyCode)
                        return pricingInfo.TotalFare.CurrencyCode;
                    else
                        return $scope.$parent.fareParams.mapOptions.CurrencyCode;
                }
            }],
            link: function (scope, elem, attrs) {

            }
        }
    }
})();