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
                        GuestCounts: 2,
                        HotelCityCode: $scope.destination,
                        StartDate: $scope.departureDate,
                        EndDate: $scope.returnDate,
                        CurrencyCode: $scope.hotelCurrency
                    }

                    HotelRangeFactory.GetAllHotelRange($scope.hotelInputData).then(function (data) {
                        $scope.hotelRequestComplete = true;
                        if (data.status == 200 && data.data != null) {
                            var hotelRange = _.chain(data.data.HotelAvailability).map(function (item) {
                                if (item.HotelDetail.RateRange)
                                    return item.HotelDetail;
                            }).compact().min(function (item) { return item ? item.RateRange.Min : Infinity; }).value();

                            if (hotelRange != Infinity) {
                                $scope.HotelRangeData = {
                                    Fare: hotelRange.RateRange.Min,
                                    Star: hotelRange.HotelRating ? hotelRange.HotelRating[0].RatingText.substring(0, 1) : null
                                };
                                DestinationFactory.DestinationDataStorage.hotel.set(key, $scope.HotelRangeData);
                                $scope.$emit('hotelDataFound', true);
                            }
                            else
                                $scope.$emit('hotelDataFound', false);
                        }
                        else
                            $scope.$emit('hotelDataFound', false);
                    });
                });
            }],
        };
    }]);
})();
