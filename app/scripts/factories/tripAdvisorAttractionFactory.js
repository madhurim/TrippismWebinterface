(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('TripAdvisorAttractionFactory', ['$http', 'dataConstant', 'urlConstant', '$q', TAAttractionFactory]);

    function TAAttractionFactory($http, dataConstant, urlConstant, $q) {
        // Define the functions and properties to reveal.
        var tripAdvisorAttractions = {
            collection: [],
            save: function (key, attractionData) {
                if (!tripAdvisorAttractions.collection[key]) {
                    tripAdvisorAttractions.collection[key] = attractionData;
                }
            }
        };

        var service = {
            getAttractions: getAttractions,
            getAttractionList: getAttractionList,
            getRestaurants: getRestaurants,
            getLocation: getLocation
        };
        return service;

        function getAttractions(paramdata) {
            var Criteria = "TripAdvisor." + paramdata.Latitude + paramdata.Longitude + paramdata.subCategory;
            var dataURL = 'attractions?' + serialize(paramdata);
            var url = urlConstant.apiURLForTripAdvisor + dataURL;
            return getData(url, Criteria);
        }
        //
        function getRestaurants(paramdata) {
            var Criteria = "TripAdvisor." + paramdata.Latitude + paramdata.Longitude;
            var dataURL = 'restaurants?' + serialize(paramdata);
            var url = urlConstant.apiURLForTripAdvisor + dataURL;
            return getData(url, Criteria);
        }

        function getLocation(paramdata) {
            var Criteria = "TripAdvisor." + paramdata.Latitude + paramdata.Longitude;
            var dataURL = 'location?' + serialize(paramdata);
            var url = urlConstant.apiURLForTripAdvisor + dataURL;
            return getData(url, Criteria);
        }

        function getData(url, key) {
            if (tripAdvisorAttractions.collection[key]) {
                var d = $q.defer();
                var data = tripAdvisorAttractions.collection[key].data;
                d.resolve(tripAdvisorAttractions.collection[key].data);
                return d.promise;
            }
            return $http.get(url)
                .then(function (data) {
                    var result = { data: data.data };
                    tripAdvisorAttractions.save(key, result);
                    return data.data;
                }, function (e) {
                    return e;
                });
        }

        function getAttractionList() {
            var list = angular.copy(dataConstant.attractionList);
            list = _(list).reject(function (i) { return (i.name == 'casinos' || i.name == 'beaches') });
            var tours = {
                rank: 8,
                name: 'Tours',
                attractionText: 'Tours',
                subCategory: 'sightseeing_tours',
                markerImage: 'images/attraction-marker/camera-icon-1.png',
                isDefault: false,
                htmlClass: 'attr-tours'
            };
            list.push(tours);
            return list;
        }
    }
})();
