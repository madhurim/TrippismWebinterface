(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('BaseFactory', ['$http', '$q', 'LocalStorageFactory', 'dataConstant','urlConstant','UtilFactory', BaseFactory]);
    function BaseFactory($http, $q, LocalStorageFactory, dataConstant, urlConstant, UtilFactory) {
        var localPromise;
        return {            
            getExchangeRate: getExchangeRate,
            getCurrencyConversion: getCurrencyConversion,
            calculateRate: calculateRate
        }
        
        function getExchangeRate(fromCurrency, toCurrency) {

            //Free API call 
            ///var url = "https://openexchangerates.org/api/latest.json?app_id=abf70ba2e328428c9cef7e4f058ffc21";

            //premium API call
            //var url = "https://openexchangerates.org/api/latest.json?app_id=abf70ba2e328428c9cef7e4f058ffc21&base=" + existCurrency + "&symbols=" + convertCurrency;

            var url = urlConstant.apiURLForCurrencyConversion + "?Base=" + fromCurrency + "&Target=" + toCurrency;
            return $http.get(url)
                    .then(function (data) {
                        return data;
                    },
                    function (e) {
                        return e;
                    });
        }
        
        function getCurrencyConversion(currencyConversionDetail, rate) {
            var getLocalStorageCurrencyInfo = LocalStorageFactory.get(dataConstant.currencyConversion, { base: currencyConversionDetail.base, target: currencyConversionDetail.target});
            if (!getLocalStorageCurrencyInfo) {
                return saveRate(currencyConversionDetail).then(function (result) {
                    return calculateRate(result, rate);
                });
            }
            else {
                var timestamp = new Date(getLocalStorageCurrencyInfo.timestamp).getTime();
                var currentTime = (new Date()).getTime();
                var dateDiffInHours = (currentTime - timestamp) / 6000000;
                if (dateDiffInHours > 1) {
                    return saveRate(currencyConversionDetail).then(function (result) {
                        return calculateRate(result, rate);
                    });
                }
                else {
                    var defer = $q.defer();
                    defer.resolve(calculateRate(getLocalStorageCurrencyInfo, rate));
                    return defer.promise;
                }
            }            
        }

        function saveRate(currencyConversionDetail) {
            return getExchangeRate(currencyConversionDetail.base, currencyConversionDetail.target).then(function (data) {
                currencyConversionDetail = {
                    base: data.data.Base,
                    target: data.data.Target,
                    rate: data.data.Rate,
                    timestamp: new Date()
                };
                LocalStorageFactory.save(dataConstant.currencyConversion, currencyConversionDetail, { base: currencyConversionDetail.base, target: currencyConversionDetail.target });
                return currencyConversionDetail;
            });
        }
        function calculateRate(result, rate) {
            debugger;
            return {
                currencySymbol: UtilFactory.GetCurrencySymbol(result.target),
                rate: rate * result.rate
            }
        }
    }
})();