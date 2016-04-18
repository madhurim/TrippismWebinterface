(function () {
    angular.module('TrippismUIApp').directive('destinationMaterialCardsDirective', [DestinationMaterialCardsDirective]);
    function DestinationMaterialCardsDirective($scope) {
        return {
            restrict: 'E',
            templateUrl: '/Views/partials/DestinationMaterialCards.html',
            controller: ['$scope', 'UtilFactory', 'InstaFlightSearchFactory', function ($scope, UtilFactory, InstaFlightSearchFactory) {
                $scope.destinationsData = [];
                var currDate = new Date();
                var departureDate = new Date(currDate.setMonth(currDate.getMonth() + 1));
                var returnDate = new Date(departureDate);
                returnDate = new Date(returnDate.setDate(returnDate.getDate() + 5));

                init();
                function init() {
                    UtilFactory.ReadAirportJson().then(function (airports) {
                        UtilFactory.ReadLocationPairJson().then(function (data) {
                            if (data && data.length) {
                                var random = _.sample(data, 3);
                                _.each(random, function (item) {
                                    var originAirport = _.findWhere(airports, { airport_Code: item.origin });
                                    if (originAirport) {
                                        var request = {
                                            Origin: item.origin,
                                            Destination: item.destination,
                                            DepartureDate: ConvertToRequiredDate(departureDate, 'API'),
                                            ReturnDate: ConvertToRequiredDate(returnDate, 'API'),
                                            PointOfSaleCountry: originAirport.airport_CountryCode,
                                            limit: 1
                                        };
                                        getDestinationFare(request).then(function (data) {
                                            if (data && data.PricedItineraries && data.PricedItineraries.length) {
                                                var obj = {
                                                    origin: item.origin,
                                                    destination: item.destination,
                                                    departureDate: data.DepartureDateTime,
                                                    returnDate: data.ReturnDateTime,
                                                    lowestFare: getLowestFare(data.PricedItineraries[0]),
                                                    currencyCode: getCurrencyCode(data.PricedItineraries[0])
                                                }
                                                $scope.destinationsData.push(obj);
                                            }
                                        });
                                    }
                                });
                            }
                        });
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