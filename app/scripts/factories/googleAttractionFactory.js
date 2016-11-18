(function () {
    'use strict';
    var serviceId = 'GoogleAttractionFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'dataConstant', 'urlConstant', '$filter', '$q', GoogleAttractionFactory]);

    function GoogleAttractionFactory($http, dataConstant, urlConstant, $filter, $q) {
        // Define the functions and properties to reveal.
       
        var googleAttractions = {
            collection: [],
            save: function (key, attractionData) {
                if (!googleAttractions.collection[key]) {
                    googleAttractions.collection[key] = attractionData;
                }
            }
        };
        var service = {
            googleAttraction: googleAttraction,
            getAttractionList: getAttractionList,
        };
        return service;

        function googleAttraction(paramdata) {
            var Criteria = paramdata.Latitude + paramdata.Longitude + paramdata.Types + paramdata.radius;
            if (googleAttractions.collection[Criteria]) {
                var d = $q.defer();
                var data = googleAttractions.collection[Criteria].data;
                d.resolve(googleAttractions.collection[Criteria].data);
                return d.promise;
            }

            var dataURL = 'locationsearch?' + serialize(paramdata);
            var url = urlConstant.apiURLForGoogleAttraction + dataURL;
            return $http.get(url)
                .then(function (data) {
                    var result = { data: data.data };
                    googleAttractions.save(Criteria, result);
                    return data.data;
                }, function (e) {
                    return e;
                });
        }

        function getAttractionList() {
            return dataConstant.attractionList;
        }
    }
})();
