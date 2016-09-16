(function () {
    angular.module('TrippismUIApp').directive('destinationCardDirective', ['urlConstant', '$rootScope',DestinationMaterialCardsDirective]);
    function DestinationMaterialCardsDirective(urlConstant, $rootScope) {
        return {
            restrict: 'E',
            scope: {
                origin: '=',
                destination: '=',
                departureDate: '=',
                returnDate: '=',
            },
            templateUrl: urlConstant.partialViewsPath + 'destinationCard.html',
            controller: ['$scope', '$parse', '$filter', 'UtilFactory', 'InstaFlightSearchFactory', 'DestinationFactory', 'urlConstant', function ($scope, $parse, $filter, UtilFactory, InstaFlightSearchFactory, DestinationFactory, urlConstant) {
                UtilFactory.GetCurrencySymbols();
                
                init();

                function init() {
                    $scope.url = 'f=' + $scope.origin + ';t=' + $scope.destination + ';d=' + $scope.departureDate + ';r=' + $scope.returnDate;
                    DestinationFactory.DestinationDataStorage.fare.clear();
                    DestinationFactory.DestinationDataStorage.hotel.clear();
                    UtilFactory.ReadHighRankedAirportsJson().then(function (airports) {
                        var originAirport = _.findWhere(airports, { airport_Code: $scope.origin });
                        var destinationAirport = _.findWhere(airports, { airport_Code: $scope.destination });
                        $scope.destinationImagePath = urlConstant.destinationMediumImagePath;
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
                            destinationName: destinationAirport.airport_CityName,
                            cityCode: destinationAirport.airport_CityCode
                        }

                        $scope.imageUrl = $scope.destinationImagePath + $scope.destinationData.cityCode + '.jpg';

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
                                $scope.destinationData.departureDate = data.DepartureDateTime,
                                $scope.destinationData.returnDate = data.ReturnDateTime,
                                $scope.destinationData.currencyCode = getCurrencyCode(data.PricedItineraries[0])
                                $scope.destinationData.currencySymbol = UtilFactory.GetCurrencySymbol($scope.destinationData.currencyCode);
                                DestinationFactory.DestinationDataStorage.fare.set(
                                   {
                                       Origin: $scope.origin,
                                       Destination: $scope.destination,
                                       DepartureDate: $scope.departureDate,
                                       ReturnDate: $scope.returnDate,
                                   }, data);                                
                            }
                            else
                            {
                                $scope.isDataFound = true;
                            }
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

                scope.$on('hotelDataFound', function (event, data) {
                    if (!data)
                        elem.find('.mdhotel').remove();
                });
            }
        }
    }
})();