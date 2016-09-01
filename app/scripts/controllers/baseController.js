(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$timeout', 'tmhDynamicLocale', 'UtilFactory', 'urlConstant', '$locale', 'dataConstant','BaseFactory', BaseController]);

    function BaseController($scope, $modal, $rootScope, $timeout, tmhDynamicLocale, UtilFactory, urlConstant, $locale, dataConstant,BaseFactory) {
        $rootScope.isShowAlerityMessage = true;
        $scope.currencyList;
        $scope.currencyCode = "USD";
        $rootScope.rate = 1;
        $rootScope.currencyCode = $scope.currencyCode;
        init();
        getLocale();
        function init() {
            UtilFactory.ReadAirportJson();
            UtilFactory.GetCurrencySymbols();
            UtilFactory.ReadHighRankedAirportsJson();

            UtilFactory.GetCurrencySymbols().then(function (data) {
                getfilterCurrencyInfo(data);
                $rootScope.symbol = UtilFactory.GetCurrencySymbol($scope.currencyCode);
            });            
        }
        // filter Currecncy data on based Currency List

        function getLocale() {
            BaseFactory.getLocale().then(function (data) {
                tmhDynamicLocale.set("en-" + (data.country).toLowerCase());
            });
        }


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

        var base;
        $scope.hasChange = function () {
            base = base;
            var target = $scope.currencyCode;
            changeCurrency(base, target);
        }

        $scope.$on('currencyChange', function (event, args) {
            base = args.currencyCode;
            var target = $scope.currencyCode;
            changeCurrency(base, target);
        })

        function changeCurrency(base, target) {
            $scope.currencyConversionRate = getConversionRate(base, target).then(function (data) {
                var currencyConversionRate = data;
                $rootScope.rate = currencyConversionRate.rate;
                $rootScope.symbol = currencyConversionRate.currencySymbol;
                $rootScope.currencyCode = currencyConversionRate.currencyCode;
                $scope.$broadcast('setExchangeRate');
            });
        }

        // also used to stop image slider [HomeController]
        $scope.$on('bodyClass', function (event, args) {
            $scope.bodyClass = args;
        });                    

        function getConversionRate(currentCurrencyCode, exchangeCurrencyCode) {            
            var currencyConversionDetail = {
                base: currentCurrencyCode,
                target: exchangeCurrencyCode,
                timestamp: new Date()
            };
            return UtilFactory.getCurrencyConversion(currencyConversionDetail).then(function (data) {
                return data;
                });
        }
        
        $scope.$on('$localeChangeSuccess', function () {
            $rootScope.format = $locale.DATETIME_FORMATS.mediumDate;
            var symbol = UtilFactory.GetCurrencySymbol($locale.NUMBER_FORMATS.CURRENCY_SYM);
            return symbol;
        });
    }
})();