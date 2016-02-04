(function () {
    'use strict';
    var serviceId = 'YouTubeFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', YouTubeFactory]);

    function YouTubeFactory($http, $rootScope) {
        // Define the functions and properties to reveal.
        var service = {
            youTube: youTube,
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
        function youTube(data) {
            var dataURL = 'locationsearch?' + serialize(data);
            var url = $rootScope.apiURLForYouTube + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
    }
})();