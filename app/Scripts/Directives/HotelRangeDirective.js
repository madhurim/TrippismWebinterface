(function () {
    'use strict';
         angular.module('TrippismUIApp').directive("hotelRange",['$compile','UtilFactory','HotelRangeFactory', function($compile,UtilFactory,HotelRangeFactory) {
    return {
        template : "<div style='float:right;border:Red'>" +
                       "<div ng-if='HotelRangeData.ThreeStar  && HotelRangeData.ThreeStar.MinimumPriceAvg != 0.0 '> <b> 3 CROWN Hotel </b> <br> {{ hotelCurrencySymbol }} {{HotelRangeData.ThreeStar.MinimumPriceAvg | number:2 }} - {{HotelRangeData.ThreeStar.MaximumPriceAvg | number:2 }} </div>" +
                        "<div ng-if='HotelRangeData.FourStar  && HotelRangeData.FourStar.MinimumPriceAvg != 0.0 '>  <b> 4 CROWN Hotel </b> <br> {{ hotelCurrencySymbol }}  {{HotelRangeData.FourStar.MinimumPriceAvg | number:2 }} - {{HotelRangeData.FourStar.MaximumPriceAvg | number:2 }} </div>" +
                       "<div ng-if='HotelRangeData.FiveStar  && HotelRangeData.FiveStar.MinimumPriceAvg != 0.0 '>  <b> 5 CROWN Hotel  </b> <br> {{ hotelCurrencySymbol }}  {{HotelRangeData.FiveStar.MinimumPriceAvg | number:2 }}  - {{HotelRangeData.FiveStar.MaximumPriceAvg | number:2 }} </div>" +
                    "</div>",
        controller: ['$scope','$stateParams', function ($scope,$stateParams) {
        if ($stateParams.path != undefined) {
                    var params = $stateParams.path.split(";");      
                    angular.forEach(params, function (item) {
                        var para = item.split("=");
                        if (para[0].trim() === "f")
                            $scope.Origin = para[1].trim().toUpperCase();
                        if (para[0].trim() === "t")
                            $scope.DestinationLocation = para[1].trim().toUpperCase();
                        if (para[0].trim() === "d") {
                            $scope.FromDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                        }
                        if (para[0].trim() === "r") {
                            $scope.ToDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                        }
                    });
                    $scope.HotelRangeData={
                                            "ThreeStar": {
                                                            "Star": null,
                                                            "MinimumPriceAvg": 0.0,
                                                            "MaximumPriceAvg": 0.0,
                                                            "CurrencyCode": null
                                                        },
                                            "FourStar": {
                                                            "Star": null,
                                                            "MinimumPriceAvg": 0.0,
                                                            "MaximumPriceAvg": 0.0,
                                                            "CurrencyCode": null
                                                        },
                                            "FiveStar": {
                                                            "Star": null,
                                                            "MinimumPriceAvg": 0.0,
                                                            "MaximumPriceAvg": 0.0,
                                                            "CurrencyCode": null
                                                        }
                                           };
                    
                    var dates = UtilFactory.GetValidDates($scope.FromDate, $scope.ToDate);
                    $scope.mappromise = UtilFactory.ReadAirportsCurrency().then(function (response) {
                    $scope.FromDate = dates.FromDate;
                    $scope.ToDate = dates.ToDate;            
                    $scope.hotelCurrency=UtilFactory.GetAirportCurrency($scope.Origin);
                   
                    $scope.hotelCurrencySymbol = UtilFactory.GetCurrencySymbol($scope.hotelCurrency)
                    $scope.hotelInputData={
                        "CorporateId": null,
                        "GuestCounts": 1,
                        "HotelCityCode":  $scope.DestinationLocation,
                        "StartDate":  $scope.FromDate,
                        "EndDate":  $scope.ToDate,
                        "SecurityToken": null,
                        "CurrencyCode": $scope.hotelCurrency
                        }                      
                        HotelRangeFactory.GetHotelRange($scope.hotelInputData).then(function (data) {                   
                            if (data != null && data.status == 200 ) {
                                  $scope.HotelRangeData=  data.data;         
                            }
                            else {
                                alertify.alert("Error", "");
                             
                            }
                       });
                      
});
                }
            }],
    };
}]);
})();