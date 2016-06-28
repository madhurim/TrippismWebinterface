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
            return dataConstant.attractionList;
        }
    }
})();
