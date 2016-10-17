(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('BaseFactory', ['$http', '$filter', '$q', 'LocalStorageFactory', 'dataConstant', 'urlConstant', 'UtilFactory', 'tmhDynamicLocale', '$locale', BaseFactory]);

    function BaseFactory($http, $filter, $q, LocalStorageFactory, dataConstant, urlConstant, UtilFactory, tmhDynamicLocale, $locale) {
        var localPromise;
        var service = {
            storeAnonymousData: storeAnonymousData,
            storeSerachCriteria: storeSerachCriteria,
            getLocale: getLocale,
            getSerachCriteria: getSerachCriteria,
            storeDestinationsLikes: storeDestinationsLikes
        }
        return service;

        function storeAnonymousData(anonoymousdata) {
            var url = urlConstant.apiURLforProfileAnonymous;
            return $http({
                method: 'POST',
                url: url,
                data: serialize(anonoymousdata),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then(function (data) {
                return data.data;
            },
            function (e) {
                return e;
            });
        }

        function storeSerachCriteria(data) {
            var url = urlConstant.apiURLforProfileActivity + "/save";
            return $http({
                method: 'POST',
                url: url,
                data: serialize(data),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then(function (data) {
                return data.data;
            },
            function (e) {
                return e;
            });
        }

        function getSerachCriteria(guid) {
            var url = urlConstant.apiURLforProfileActivity + "/search/all?customerId=" + guid;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                },
            function (e) {
                return e;
            });
        }
        function getLocale() {
            // if already in local storage then return data
            var localData = LocalStorageFactory.get(dataConstant.userLocaleLocalStorage);
            if (localData) {
                var timestamp = new Date(localData.expireOn);
                var currentTime = (new Date());

                if (currentTime < timestamp) {
                    return $q(function (resolve) { resolve(localData); });
                }
            }

            // if already requested sent then wait for result and return data
            if (localPromise) {
                return $q.when(localPromise).then(function (data) { return data });
            }
            return localPromise = $http.get('http://ipinfo.io', { timeout: 2000 }).then(function (data) {
                if (data.status == 200) {
                    //var expireDate = new Date();
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
                        } : null,
                        expireOn: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
                    };
                    LocalStorageFactory.save(dataConstant.userLocaleLocalStorage, data);
                    return data;
                }
                else
                    return null;
            }, function () { return null; });
        }

        function storeDestinationsLikes(data) {
            var url = urlConstant.apiURLforProfileActivity + "/destinationLikes";
            return $http({
                method: 'POST',
                url: url,
                data: serialize(data),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then(function (data) {
                return data;
            },
            function (e) {
                return e;
            });
        }
    }
})();
