﻿(function () {
    'use strict';
    var serviceId = 'FareRangeFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', '$filter', '$q', FareRangeFactory]);

    function FareRangeFactory($http, $rootScope, $filter, $q) {
        // Define the functions and properties to reveal.
        var FareRangeData = [];
        var service = {
            fareRange: fareRange,
        };
        return service;

        function serialize(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    var propval = encodeURIComponent(obj[p]);
                    if (propval != "undefined" && propval != "null" && propval != '')
                        str.push(encodeURIComponent(p) + "=" + propval);
                }
            return str.join("&");
        }

        function fareRange(data) {
            var resultdata = $filter('filter')(FareRangeData, { Criteria:data.Origin + data.EarliestDepartureDate + data.LatestDepartureDate + data.Destination +data.Lengthofstay})[0];
            if (resultdata != undefined && resultdata != "") {
                var d = $q.defer();
                d.resolve(angular.copy(resultdata.data));//angular.copy used because at directive side we manipulate into data so second time when we call method for data then return original result which was return from api
                return d.promise;
            }
            else {
                var result = {
                    Criteria: data.Origin + data.EarliestDepartureDate + data.LatestDepartureDate + data.Destination + data.Lengthofstay,
                    data: null
                }
                var dataURL = 'FareRange?' + serialize(data);
                var url = $rootScope.apiURL + dataURL;
                return $http.get(url)
                    .then(function (data) {
                        result.data = angular.copy(data.data);
                        FareRangeData.push(result);
                        return data.data;
                    }, function (e) {
                        return e;
                    });
            }
        }
    }
})();