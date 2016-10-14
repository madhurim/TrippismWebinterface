(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('baseFactory', ['$http', 'urlConstant', '$filter', baseFactory]);

    function baseFactory($http, urlConstant, $filter) {
        var service = {
            storeAnonymousData: storeAnonymousData,
            storeSerachCriteria: storeSerachCriteria,
            //getGuid: getGuid,
            getSerachCriteria: getSerachCriteria,
            storeDestinationsLikes: storeDestinationsLikes
        }
        return service;

        function storeAnonymousData() {
            var url = urlConstant.apiURLforProfileAnonymous;
            return $http({
                method: 'POST',
                url: url,
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

        function storeDestinationsLikes(data)
        {
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