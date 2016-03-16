(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('leadFareCalendarFactory', ['$http', '$rootScope', leadFareCalendarFactory]);
    function leadFareCalendarFactory($http, $rootScope) {
        var service = {
            Get: Get
        };

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

        function Get(data) {
            var dataURL = '?' + serialize(data);
            var url = $rootScope.apiURLForLeadFareCalendar + 'Get' + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
        return service;
    }
})();