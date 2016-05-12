(function () {
    angular.module('TrippismUIApp').directive('destinationCardDirective', [DestinationMaterialCardsDirective]);
    function DestinationMaterialCardsDirective() {
        return {
            restrict: 'E',
            scope: {
                origin: '=',
                destination: '=',
                departureDate: '=',
                returnDate: '=',
                imageUrl: '@'
            },
            templateUrl: '/Views/partials/DestinationCard.html',
            controller: ['$scope', '$parse', '$filter', 'UtilFactory', 'InstaFlightSearchFactory', 'DestinationFactory', function ($scope, $parse, $filter, UtilFactory, InstaFlightSearchFactory, DestinationFactory) {
                UtilFactory.GetCurrencySymbols();
                init();
                function init() {
                    DestinationFactory.clearDestinationData();
                    UtilFactory.ReadHighRankedAirportsJson().then(function (airports) {
                        var originAirport = _.findWhere(airports, { airport_Code: $scope.origin });
                        var destinationAirport = _.findWhere(airports, { airport_Code: $scope.destination });
                        if (!originAirport && !destinationAirport) return;
                        var request = {
                            origin: $scope.origin,
                            destination: $scope.destination,
                            departureDate: $scope.departureDate,
                            returnDate: $scope.returnDate,
                            pointOfSaleCountry: originAirport.airport_CountryCode,
                            limit: 1
                        };
                        $scope.destinationData = {
                            origin: request.origin,
                            destination: request.destination,
                            originName: originAirport.airport_CityName,
                            destinationName: destinationAirport.airport_CityName
                        }
                        if (destinationAirport.airport_IsMAC) {
                            var multiAirports = $filter('filter')(airports, { airport_IsMAC: false, airport_CityCode: destinationAirport.airport_CityCode }, true);
                            destinationAirport.themes = _.unique(_.flatten(_.map(multiAirports, function (i) { if (i.themes.length) return i.themes; }), true));
                        }
                        // creating $scope element from theme name (for displaying theme icon on page)
                        _.each(destinationAirport.themes, function (item) {
                            if (item) {
                                var model = $parse(item.replace('-', ''));
                                model.assign($scope, true);
                            }
                        });
                        InstaFlightSearchFactory.GetData(request).then(function (data) {
                            $scope.isDataFound = true;
                            if (data && data.PricedItineraries && data.PricedItineraries.length) {
                                $scope.destinationData.lowestFare = getLowestFare(data.PricedItineraries[0]);
                                $scope.destinationData.departureDate = ConvertToRequiredDate(data.DepartureDateTime, 'UI'),
                                $scope.destinationData.returnDate = ConvertToRequiredDate(data.ReturnDateTime, 'UI'),
                                $scope.destinationData.currencyCode = getCurrencyCode(data.PricedItineraries[0])
                                $scope.destinationData.currencySymbol = UtilFactory.GetCurrencySymbol($scope.destinationData.currencyCode);
                                DestinationFactory.setDestinationData(
                                   {
                                       Origin: $scope.origin,
                                       Destination: $scope.destination,
                                       DepartureDate: $scope.departureDate,
                                       ReturnDate: $scope.returnDate
                                   }, data);
                            }
                            $scope.url = 'f=' + $scope.destinationData.origin + ';t=' + $scope.destinationData.destination + ';d=' + $scope.departureDate + ';r=' + $scope.returnDate;
                        });
                    });
                }

                function getLowestFare(pricedItinerary) {
                    if (pricedItinerary == undefined)
                        return undefined;
                    return pricedItinerary.AirItineraryPricingInfo[0].TotalFare.Amount;
                }
                function getCurrencyCode(pricedItinerary) {
                    var pricingInfo = pricedItinerary.AirItineraryPricingInfo[0];
                    if (pricingInfo && pricingInfo.TotalFare && pricingInfo.TotalFare.CurrencyCode)
                        return pricingInfo.TotalFare.CurrencyCode;
                }
                $scope.amountBifurcation = function (value) { return UtilFactory.amountBifurcation(value); };
            }],
            link: function (scope, elem, attrs) {
            }
        }
    }
})();