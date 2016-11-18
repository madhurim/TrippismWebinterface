(function () {
    'use strict';
    var serviceId = 'YouTubeFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', '$q', YouTubeFactory]);

    function YouTubeFactory($http, urlConstant, $q) {
        // Define the functions and properties to reveal.
        var mediaDetail = {
            collection: [],
            save: function (key, mediaData) {
                if (!mediaDetail.collection[key]) {
                    mediaDetail.collection[key] = mediaData;
                }
            }
        };
        var service = {
            youTube: youTube,
        };
        return service;

        function youTube(paramdata) {
            var Criteria = paramdata.location;
            if (mediaDetail.collection[Criteria]) {
                var d = $q.defer();
                d.resolve(mediaDetail.collection[Criteria].data);
                return d.promise;
            }
            var dataURL = 'locationsearch?' + serialize(paramdata);
            var url = urlConstant.apiURLForYouTube + dataURL;
            return $http.get(url)
                .then(function (data) {
                    var result = { data: data };
                    mediaDetail.save(Criteria, result);
                    return data;
                }, function (e) {
                    return e;
                });
        }
    }
})();