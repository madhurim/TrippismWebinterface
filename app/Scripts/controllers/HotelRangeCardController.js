(function () {
    'use strict';
    angular.module('TrippismUIApp').controller('HotelRangeCardController', ['$scope', HotelRangeCardController]);
    function HotelRangeCardController($scope) {
        $scope.getMinHotelAvgPrice = getMinHotelAvgPrice;
        function getMinHotelAvgPrice(hotelList) {
            if (hotelList.ThreeStar || hotelList.FourStar || hotelList.FiveStar) {
                var minHotel = _.min(hotelList, function (item) { return item.MinimumPriceAvg || Infinity; });
                if (minHotel.MinimumPriceAvg != 0.0)
                    $scope.HotelAvg = minHotel;
            }
        }
        getMinHotelAvgPrice($scope.HotelRangeData);
    }
})();