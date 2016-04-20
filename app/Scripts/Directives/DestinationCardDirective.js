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
                $scope.GetCurrencySymbol = GetCurrencySymbol;
                GetCurrencySymbols();
                init();
                function init() {
                    UtilFactory.ReadAirportJson().then(function (airports) {
                        var originAirport = _.findWhere(airports, { airport_Code: $scope.requestData.origin });
                        if (!originAirport) return;

                        var destinationAirport = _.findWhere(airports, { airport_Code: $scope.requestData.destination });
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
                                    originName: originAirport.airport_CityName,
                                    destinationName: destinationAirport.airport_CityName,
                                    departureDate: ConvertToRequiredDate(data.DepartureDateTime, 'UI'),
                                    returnDate: ConvertToRequiredDate(data.ReturnDateTime, 'UI'),
                                    lowestFare: getLowestFare(data.PricedItineraries[0]),
                                    currencyCode: getCurrencyCode(data.PricedItineraries[0]),
                                    themes: originAirport.themes
                                }
                                $scope.destinationData.currencySymbol = GetCurrencySymbol($scope.destinationData.currencyCode);
                                $scope.url = 'f=' + $scope.destinationData.origin + ';t=' + $scope.destinationData.destination + ';d=' + data.DepartureDateTime + ';r=' + data.ReturnDateTime;
                            }
                        });
                    });
                }

                function getDestinationFare(request) {
                    return InstaFlightSearchFactory.GetData(request).then(function (data) {
                        return data;
                    })
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

                function GetCurrencySymbols() {
                    UtilFactory.GetCurrencySymbols();
                }

                function GetCurrencySymbol(code) {
                    return UtilFactory.GetCurrencySymbol(code);
                }

            }],
            link: function (scope, elem, attrs) {
                scope.amountBifercation = function (TotalfareAmount) {
                    var afterDec = (TotalfareAmount + "").split(".")[1];
                    if (afterDec == undefined)
                        afterDec = '00';
                    var result = {
                        BeforeDecimal: Math.floor(TotalfareAmount),
                        AfterDecimal: "." + (afterDec.length == 1 ? afterDec + '0' : afterDec)
                    };
                    return result;
                }
            }
        }
    }
})();