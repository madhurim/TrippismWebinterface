(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$timeout', 'tmhDynamicLocale', 'UtilFactory', 'urlConstant', '$locale', 'dataConstant','BaseFactory', BaseController]);

    function BaseController($scope, $modal, $rootScope, $timeout, tmhDynamicLocale, UtilFactory, urlConstant, $locale, dataConstant,BaseFactory) {
        $rootScope.isShowAlerityMessage = true;
        $scope.currencyList;
        init();
        function init() {
            UtilFactory.ReadAirportJson();
            UtilFactory.GetCurrencySymbols();
            UtilFactory.ReadHighRankedAirportsJson();

            UtilFactory.GetCurrencySymbols().then(function (data) {
                getfilterCurrencyInfo(data);
                getLocale();
            });
        }
        // filter Currecncy data on based Currency List

        function getLocale() {
            BaseFactory.getLocale().then(function (data) {
                if (data) {
                    tmhDynamicLocale.set("en-" + (data.country).toLowerCase());
                }
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

        $rootScope.base;
        $scope.currencyCodeChange = function () {
            $rootScope.currencypromise = '';
            $rootScope.currencypromise = $rootScope.changeRate($rootScope.base).then(function (data) {
                $scope.$broadcast('setExchangeRate');
            });
        }

        $scope.$on('currencyChange', function (event, args) {
            $rootScope.base = args.currencyCode;
            $rootScope.changeRate($rootScope.base);
        });

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
        $rootScope.changeRate = function (baseCode) {
            $rootScope.base = baseCode;
            var target = $scope.currencyCode;
            return getConversionRate($rootScope.base, target).then(function (data) {
                var currencyConversionRate = data;
                $rootScope.currencyInfo = {
                    rate: currencyConversionRate.rate,
                    symbol: currencyConversionRate.currencySymbol,
                    currencyCode: currencyConversionRate.currencyCode
                }                
                return currencyConversionRate;
            });
        };
        $scope.$on('$localeChangeSuccess', function () {
            $rootScope.format = $locale.DATETIME_FORMATS.mediumDate;
            var code = UtilFactory.GetCurrecyCode($locale.NUMBER_FORMATS.CURRENCY_SYM);
            $scope.currencyCode = code;
            $scope.$emit('currencyChange', { currencyCode: code });
        });
    }
})();