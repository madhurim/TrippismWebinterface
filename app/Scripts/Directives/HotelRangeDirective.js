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
                    HotelRangeFactory.GetAllHotelRange($scope.hotelInputData).then(function (data) {
                        $scope.hotelRequestComplete = true;
                        if (data.status == 200 && data.data != null) {
                            try {
                                var hotelRange = _.chain(data.data.HotelAvailability).map(function (item) {
                                    if (item.HotelDetail.RateRange)
                                        return item.HotelDetail;
                                }).compact().min(function (item) { return item ? item.RateRange.Min : Infinity; }).value();

                                if (hotelRange != Infinity) {
                                    $scope.HotelRangeData = {
                                        Fare: hotelRange.RateRange.Min,
                                        Star: hotelRange.HotelRating ? hotelRange.HotelRating[0].RatingText.substring(0, 1) : null
                                    };
                                    $scope.$emit('hotelDataFound', true);
                                }
                                else
                                    $scope.$emit('hotelDataFound', false);
                                console.log(hotelRange);


                            } catch (e) {
                                debugger;
                            }
                        }
                        else
                            $scope.$emit('hotelDataFound', false);
                    });
                });
            }],
        };
    }]);
})();