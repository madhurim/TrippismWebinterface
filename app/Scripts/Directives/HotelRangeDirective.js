(function () {
    'use strict';
    angular.module('TrippismUIApp').directive("hotelRange", ['UtilFactory', 'HotelRangeFactory', function (UtilFactory, HotelRangeFactory) {
        return {
            restrict: 'E',
            scope: {
                origin: '=',
                destination: '=',
                departureDate: '=',
                returnDate: '=',
                showTitle: '=?'
            },
            templateUrl: '/Views/Partials/HotelRangePartial.html',
            controller: ['$scope', function ($scope) {
                $scope.hotelRequestComplete = false;
                UtilFactory.ReadAirportsCurrency().then(function (response) {
                    $scope.hotelCurrency = UtilFactory.GetAirportCurrency($scope.origin);
                    $scope.hotelCurrencySymbol = UtilFactory.GetCurrencySymbol($scope.hotelCurrency)
                    $scope.hotelInputData = {
                        "CorporateId": null,
                        "GuestCounts": 1,
                        "HotelCityCode": $scope.destination,
                        "StartDate": $scope.departureDate,
                        "EndDate": $scope.returnDate,
                        "CurrencyCode": $scope.hotelCurrency
                    }
                    HotelRangeFactory.GetHotelRange($scope.hotelInputData).then(function (data) {
                        $scope.hotelRequestComplete = true;
                        if (data != null && data.status == 200) {
                            $scope.HotelRangeData = data.data;
                            var isHasPrice = _.some(_.pluck(data.data, 'MinimumPriceAvg'), function (item) { return item > 0; });
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