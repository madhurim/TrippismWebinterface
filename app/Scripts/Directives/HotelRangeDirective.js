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
                    var hotelCurrency = UtilFactory.GetAirportCurrency($scope.origin);
                    var key = {
                        Origin: $scope.origin,
                        Destination: $scope.destination,
                        StartDate: ConvertToRequiredDate($scope.departureDate, 'API'),
                        EndDate: ConvertToRequiredDate($scope.returnDate, 'API'),
                    };

                    var cacheData = DestinationFactory.DestinationDataStorage.hotel.get(key);
                    if (cacheData) {
                        $scope.hotelRequestComplete = true;
                        setHotelData(cacheData.data);
                        return;
                    }

                    $scope.hotelInputData = {
                        CorporateId: null,
                        GuestCounts: 1,
                        HotelCityCode: $scope.destination,
                        StartDate: $scope.departureDate,
                        EndDate: $scope.returnDate,
                        CurrencyCode: hotelCurrency
                    }

                    HotelRangeFactory.GetAllHotelRange($scope.hotelInputData).then(function (data) {
                        $scope.hotelRequestComplete = true;
                        if (data.status == 200 && data.data != null) {
                            DestinationFactory.DestinationDataStorage.hotel.set(key, data.data.HotelAvailability);
                            setHotelData(data.data.HotelAvailability);
                        }
                        else
                            $scope.$emit('hotelDataFound', false);
                    });
                });
                $scope.amountBifurcation = function (value) { return UtilFactory.amountBifurcation(value); };
                function setHotelData(data) {
                    var hotelRange = _.chain(data).map(function (item) {
                        if (item.HotelDetail.RateRange)
                            return item.HotelDetail;
                    }).compact().min(function (item) { return item ? parseFloat(item.RateRange.Min) : Infinity; }).value();

                    if (hotelRange != Infinity) {
                        $scope.HotelRangeData = {
                            CurrencyCode: hotelRange.RateRange.CurrencyCode,
                            CurrencySymbol: UtilFactory.GetCurrencySymbol(hotelRange.RateRange.CurrencyCode),
                            Fare: hotelRange.RateRange.Min,
                            Star: hotelRange.HotelRating ? hotelRange.HotelRating[0].RatingText.substring(0, 1) : null
                        };
                        $scope.$emit('hotelDataFound', $scope.HotelRangeData);
                    }
                    else
                        $scope.$emit('hotelDataFound', false);
                }
            }],
            link: function ($scope, elem, attrs) {
                $scope.showHotelDetails = showHotelDetails;
                function showHotelDetails() {
                    $scope.$emit('showHotelDetails');
                    angular.element('body,html').animate({ scrollTop: angular.element('#attrmapwrapper').offset().top - 100 }, "slow");
                }
            }
        };
    }]);
})();
