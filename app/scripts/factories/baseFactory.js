(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('baseFactory', ['$http', 'urlConstant', '$filter', baseFactory]);

    function baseFactory($http, urlConstant, $filter) {
        var service = {
            storeAnonymousData: storeAnonymousData,
            storeSerachCriteria: storeSerachCriteria,
            //getGuid: getGuid,
            getSerachCriteria: getSerachCriteria
        }
        return service;

        //function getGuid()
        //{
        //    var url = urlConstant.apiURLforProfileAnonymous + "/GetGuid";
        //    return $http.get(url)
        //        .then(function (data) {
        //        return data.data;
        //    },
        //    function (e) {
        //        return e;
        //    });
        //}
        
        function storeAnonymousData(data)
        {            
            var url = urlConstant.apiURLforProfileAnonymous;
            return $http({
                method: 'POST',
                url: url,
                data: data,
                header: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
                data: data,
                header: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
    }
})();