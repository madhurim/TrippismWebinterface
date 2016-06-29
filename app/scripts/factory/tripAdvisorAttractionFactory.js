(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('TripAdvisorAttractionFactory', ['$http', 'dataConstant', 'urlConstant', TAAttractionFactory]);

    function TAAttractionFactory($http, dataConstant, urlConstant) {
        // Define the functions and properties to reveal.
        var service = {
            getAttractions: getAttractions,
            getAttractionList: getAttractionList,
            getRestaurants: getRestaurants,
            getLocation: getLocation
        };
        return service;

        function getAttractions(data) {
            var dataURL = 'attractions?' + serialize(data);
            var url = urlConstant.apiURLForTripAdvisor + dataURL;
            return getData(url);
        }
        //
        function getRestaurants(data) {
            var dataURL = 'restaurants?' + serialize(data);
            var url = urlConstant.apiURLForTripAdvisor + dataURL;
            return getData(url);
        }

        function getLocation(data) {
            var dataURL = 'location?' + serialize(data);
            var url = urlConstant.apiURLForTripAdvisor + dataURL;
            return getData(url);
        }

        function getData(url) {
            return $http.get(url)
                .then(function (data) {
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
