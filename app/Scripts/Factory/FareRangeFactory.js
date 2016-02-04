(function () {
    'use strict';
    var serviceId = 'FareRangeFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', FareRangeFactory]);

    function FareRangeFactory($http, $rootScope) {
        // Define the functions and properties to reveal.
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
            var dataURL = 'FareRange?' + serialize(data);
            var url = $rootScope.apiURL + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
    }
})();