(function () {
    'use strict';
    var serviceId = 'GoogleGeoReverseLookupFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', GoogleGeoReverseLookupFactory]);

    function GoogleGeoReverseLookupFactory($http, urlConstant) {
        var service = {
            googleGeoReverseLookup: googleGeoReverseLookup,
        };
        return service;

        function googleGeoReverseLookup(data) {
            var dataURL = '?' + serialize(data);
            var url = urlConstant.apiURLForGoogleGeoReverseLookup + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
    }
})();
