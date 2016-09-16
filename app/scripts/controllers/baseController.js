(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$timeout', 'tmhDynamicLocale', 'UtilFactory', 'urlConstant', '$locale', 'dataConstant', 'BaseFactory', 'LocalStorageFactory', BaseController]);

    function BaseController($scope, $modal, $rootScope, $timeout, tmhDynamicLocale, UtilFactory, urlConstant, $locale, dataConstant, BaseFactory, LocalStorageFactory) {
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
               // setCurrencyCode();
            });
        }

        // Gettinh user loacle
        function getLocale() {
            BaseFactory.getLocale().then(function (data) {
                if (data) {
                    tmhDynamicLocale.set("en-" + (data.country).toLowerCase());
                }
                else {
                    $rootScope.format = 'MM/dd/yyyy';
                }                
            });            
        }      
        

        // filter Currecncy data on based Currency List
        function getfilterCurrencyInfo(currencyData) {
            var currencyList = dataConstant.currencyList;
            $scope.currencyList = [];

            $scope.currencyList.push({
                code: 'Default',
                symbol: 'Default'
            })

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

            $rootScope.currencyCode = $scope.currencyCode;
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
        });

        $rootScope.setdefaultcurrency = function(target)
        {
            $scope.currencyCode = (target) ? target : "Default";
            $rootScope.currencyCode = $scope.currencyCode;
        }
    }
})();