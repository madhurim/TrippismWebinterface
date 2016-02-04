(function () {
    'use strict';
    var serviceId = 'SeasonalityFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', SeasonalityFactory]);

    function SeasonalityFactory($http, $rootScope) {
        // Define the functions and properties to reveal.
        var service = {
            Seasonality: Seasonality,
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

        function Seasonality(data) {
            var dataURL = 'Seasonality?' + serialize(data);
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