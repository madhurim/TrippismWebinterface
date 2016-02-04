(function () {
    'use strict';
    var serviceId = 'GoogleGeoReverseLookupFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', GoogleGeoReverseLookupFactory]);

    function GoogleGeoReverseLookupFactory($http, $rootScope) {
        var service = {
            googleGeoReverseLookup: googleGeoReverseLookup,
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


        function googleGeoReverseLookup(data) {            
            var dataURL = '?' + serialize(data);
            var url = $rootScope.apiURLForGoogleGeoReverseLookup + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
    }
})();
