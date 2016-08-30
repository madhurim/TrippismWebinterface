(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$timeout', 'tmhDynamicLocale', 'UtilFactory', 'urlConstant', 'BaseFactory', '$locale', 'dataConstant', 'LocalStorageFactory', BaseController]);

    function BaseController($scope, $modal, $rootScope, $timeout, tmhDynamicLocale, UtilFactory, urlConstant, BaseFactory, $locale, dataConstant, LocalStorageFactory) {
        $rootScope.isShowAlerityMessage = true;
        $scope.currencyList;
        $scope.currencyCode = "USD";
        init();
        function init() {
            UtilFactory.ReadAirportJson();
            UtilFactory.GetCurrencySymbols();
            UtilFactory.ReadHighRankedAirportsJson();

            UtilFactory.GetCurrencySymbols().then(function (data) {
                getfilterCurrencyInfo(data);                
            });            
        }
        // filter Currecncy data on based Currency List

        function getfilterCurrencyInfo(currencyData) {
            var currencyList = dataConstant.currencyList;
            $scope.currencyList = [];
            _.each(currencyList, function (item) {
                var currency = _.find(currencyData, function (i) { return i.code == item; });
                if (currency)
                    $scope.currencyList.push({
                        code: item,
                        symbol: item + " - " + currency.symbol
                    });
            });
        }

        $scope.aboutUs = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'aboutUsPartial.html',
                controller: 'FeedbackController',
            });
        };
        $scope.feedback = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'feedbackDetailFormPartial.html',
                controller: 'FeedbackController',
                scope: $scope,
            });
        }

        // also used to stop image slider [HomeController]
        $scope.$on('bodyClass', function (event, args) {
            $scope.bodyClass = args;
        });            

        $rootScope.format = $locale.DATETIME_FORMATS.mediumDate;        

        function getConversionRate(currentCurrencyCode, exchangeCurrencyCode, fareRate) {            
            var currencyConversionDetail = {
                base: currentCurrencyCode,
                target: exchangeCurrencyCode,
                rate: fareRate,
                timestamp: new Date()
            };
            return BaseFactory.getCurrencyConversion(currencyConversionDetail, fareRate).then(function (data) {
                return data;
                });
        }        
    }
})();