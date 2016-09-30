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
            getLocale();
        }

        function buidCurrencyDropDown()
        {
            UtilFactory.GetCurrencySymbols().then(function (data) {
                getfilterCurrencyInfo(data);                
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
            // Get Base CurrencyCode
            var currencyCode = $rootScope.base;

            var currencyList = dataConstant.currencyList;
            $scope.currencyList = [];

            // Check currency into CurrencyList exits or not 
            var exitsCurrency = _.find(currencyList, function (i) { return i.CurrencyCode == currencyCode });

            //iF New currencyCode Find then set or Add into drop down as a Default
            if (!exitsCurrency) {
                // Find currencuCode from CurrencyData
                var currency = _.find(currencyData, function (i) { return i.code == currencyCode; });
                var symbol = (currency) ? (currency.code + " - " + currency.symbol) : currencyCode;
                $scope.currencyList.push({
                    code: 'Default',
                    symbol: symbol
                })                
            }

            // Bind CurrencyList into CurrencyCode DropDown
            _.each(currencyList, function (item) {
                var currencycode = (item.CurrencyCode == $rootScope.base) ? "Default" : item.CurrencyCode;
                $scope.currencyList.push({
                    code: currencycode,
                    symbol: item.CurrencyCode + " - " + item.CurrencySymbol
                });
            });

            // Set Selected CurrencyCode
            $scope.currencyCode = (currencyCode == $rootScope.currencyInfo.currencyCode) ? "Default" : $rootScope.currencyInfo.currencyCode;
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
        $scope.currencyCodeChange = function (code) {
            $rootScope.currencypromise = '';
            $scope.currencyCode = code;

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
                buidCurrencyDropDown();
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