(function () {
    'use strict';
    var serviceId = 'YouTubeFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', YouTubeFactory]);

    function YouTubeFactory($http, urlConstant) {
        // Define the functions and properties to reveal.
        var service = {
            youTube: youTube,
        };
        return service;

        function youTube(data) {
            var dataURL = 'locationsearch?' + serialize(data);
            var url = urlConstant.apiURLForYouTube + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data;
                }, function (e) {
                    return e;
                });
        }
    }
})();