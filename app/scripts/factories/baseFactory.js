(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('BaseFactory', ['$http', '$q', 'LocalStorageFactory', 'dataConstant','urlConstant', BaseFactory]);
    function BaseFactory($http, $q, LocalStorageFactory, dataConstant, urlConstant) {
        var localPromise;
        return {
            getLocale: getLocale,
            getExchangeRate: getExchangeRate
        }
        function getLocale() {
            //"{"ip":"43.243.38.6","hostname":"No Hostname","city":"Sarkhej","region":"Gujarat","country":"IN","loc":"22.9833,72.5000"
            //,"org":"AS133226 VISION SMARTLINK NETWORKING PRIVATE LIMITED"}"

            // if already in local storage then return data
            var localData = LocalStorageFactory.get(dataConstant.userLocaleLocalStorage);
            if (localData) {
                return $q(function (resolve) { resolve(localData); });
            }

            // if already requested sent then wait for result and return data
            if (localPromise) {
                return $q.when(localPromise).then(function (data) { return data });
            }
            return localPromise = $http.get('http://ipinfo.io').then(function (data) {
                if (data.status == 200) {
                    data = data.data;
                    data = {
                        ip: data.ip,
                        hostName: data.hostname,
                        city: data.city,
                        region: data.region,
                        country: data.country,
                        location: data.loc ? {
                            lat: data.loc.split(',')[0],
                            lng: data.loc.split(',')[1]
                        } : null
                    };
                    LocalStorageFactory.save(dataConstant.userLocaleLocalStorage, data);
                    return data;
                }
                else
                    return null;
            }, function () { return null; });
        }

        function getExchangeRate(fromCurrency, toCurrency) {

            //Free API call 
            ///var url = "https://openexchangerates.org/api/latest.json?app_id=abf70ba2e328428c9cef7e4f058ffc21";

            //premium API call
            //var url = "https://openexchangerates.org/api/latest.json?app_id=abf70ba2e328428c9cef7e4f058ffc21&base=" + existCurrency + "&symbols=" + convertCurrency;

            var url = urlConstant.apiURLForCurrencyConversion + "?CurrencyCode=" + fromCurrency + "&ExchangeCurrencyCode=" + toCurrency;
            return $http.get(url)
                    .then(function (data) {
                        return data;
                    },
                    function (e) {
                        return e;
                    });
        }
    }
})();