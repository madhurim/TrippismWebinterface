(function () {
    'use strict';
    angular.module('TrippismUIApp').directive("hotelRange", ['UtilFactory', 'HotelRangeFactory', 'DestinationFactory', function (UtilFactory, HotelRangeFactory, DestinationFactory) {
        return {
            restrict: 'E',
            scope: {
                origin: '=',
                destination: '=',
                departureDate: '=',
                returnDate: '=',
                templateUrl: '@?'
            },
            template: '<ng-include src="getsrc();" />',
            controller: ['$scope', function ($scope) {
                $scope.getsrc = function () {
                    return $scope.templateUrl || 'Views/Partials/HotelRangePartial.html';
                }
                $scope.hotelRequestComplete = false;
                UtilFactory.ReadAirportsCurrency().then(function (response) {
                    $scope.hotelCurrency = UtilFactory.GetAirportCurrency($scope.origin);
                    $scope.hotelCurrencySymbol = UtilFactory.GetCurrencySymbol($scope.hotelCurrency);
                    var key = {
                        Origin: $scope.origin,
                        Destination: $scope.destination,
                        StartDate: ConvertToRequiredDate($scope.departureDate, 'API'),
                        EndDate: ConvertToRequiredDate($scope.returnDate, 'API'),
                    };
                    var cacheData = DestinationFactory.DestinationDataStorage.hotel.get(key);
                    if (cacheData) {
                        $scope.hotelRequestComplete = true;
                        $scope.HotelRangeData = cacheData.data;
                        $scope.$emit('hotelDataFound', true);
                        return;
                    }

                    $scope.hotelInputData = {
                        CorporateId: null,
                        GuestCounts: 1,
                        HotelCityCode: $scope.destination,
                        StartDate: $scope.departureDate,
                        EndDate: $scope.returnDate,
                        CurrencyCode: $scope.hotelCurrency
                    }
                    HotelRangeFactory.GetHotelRange($scope.hotelInputData).then(function (data) {
                        $scope.hotelRequestComplete = true;
                        if (data != null && data.status == 200) {
                            $scope.HotelRangeData = data.data;
                            var isHasPrice = _.some(_.pluck(data.data, 'MinimumPriceAvg'), function (item) { return item > 0; });
                            if (isHasPrice)
                                DestinationFactory.DestinationDataStorage.hotel.set(key, $scope.HotelRangeData);
                            $scope.$emit('hotelDataFound', isHasPrice);
                        }
                        else
                            $scope.$emit('hotelDataFound', false);
                    });
                });
            }],
        };
    }]);
})();