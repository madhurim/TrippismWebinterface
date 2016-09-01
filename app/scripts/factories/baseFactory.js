(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('BaseFactory', ['$http', '$q', 'LocalStorageFactory', 'dataConstant', 'urlConstant', 'UtilFactory', 'tmhDynamicLocale', '$locale', BaseFactory]);
    function BaseFactory($http, $q, LocalStorageFactory, dataConstant, urlConstant, UtilFactory, tmhDynamicLocale,$locale) {
        var localPromise;
        return {            
            getLocale: getLocale
        }

        function getLocale() {

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

    }
})();