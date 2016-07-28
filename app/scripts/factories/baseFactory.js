(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('BaseFactory', ['$http', '$q', 'LocalStorageFactory', 'dataConstant', BaseFactory]);
    function BaseFactory($http, $q, LocalStorageFactory, dataConstant) {
        var localPromise;
        return {
            getLocale: getLocale
        }
        function getLocale() {
            //"{"ip":"43.243.38.6","hostname":"No Hostname","city":"Sarkhej","region":"Gujarat","country":"IN","loc":"22.9833,72.5000"
            //,"org":"AS133226 VISION SMARTLINK NETWORKING PRIVATE LIMITED"}"
            var localData = LocalStorageFactory.get(dataConstant.userLocaleLocalStorage);
            if (localData) {
                return localData;
            }

            if (localPromise) {
                $q.when(localPromise).then(function (data) { return data });
            }
            return localPromise = $http.get('http://ipinfo.io').then(function (data) {
                if (data.status == 200) {
                    data = {
                        ip: data.ip,
                        hostName: data.hostname,
                        city: data.city,
                        region: data.region,
                        country: data.country,
                        location: {
                            lat: data.loc ? data.loc.split(',')[0] : null,
                            lng: data.loc ? data.loc.split(',')[1] : null
                        }
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