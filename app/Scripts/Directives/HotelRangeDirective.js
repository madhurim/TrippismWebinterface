(function () {
    'use strict';
    angular.module('TrippismUIApp').directive("hotelRange", ['UtilFactory', 'HotelRangeFactory', function (UtilFactory, HotelRangeFactory) {
        return {
            restrict: 'E',
            scope: {
                origin: '=',
                destination: '=',
                departureDate: '=',
                returnDate: '='
            },
            templateUrl: '/Views/Partials/HotelRangePartial.html',
            controller: ['$scope', function ($scope) {
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
                    $scope.hotelPromise = HotelRangeFactory.GetHotelRange($scope.hotelInputData).then(function (data) {
                        if (data != null && data.status == 200) {
                            $scope.HotelRangeData = data.data;
                        }
                    });
                });
            }],
        };
    }]);
})();