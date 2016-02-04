(function () {
    'use strict';
    var serviceId = 'DestinationFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', DestinationFactory]);

    function DestinationFactory($http, $rootScope) {

        // Define the functions and properties to reveal.
        var service = {
            findDestinations: findDestinations,
            findTopDestinations: findTopDestinations,
            findDestinationsDetails: findDestinationsDetails,
            findInstFlightDestination: findInstFlightDestination,
            ShowDestinationView : true
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
        function findDestinations(data) {
            var dataURL = 'Destinations?' + serialize(data);
            var RequestedURL = $rootScope.apiURL + dataURL;
            return $http.get(RequestedURL)
            .then(function (data) {
                return data.data;
            }, function (e) {
                return e;
            });
        }

        function findInstFlightDestination(data) {
            var dataURL = '?' + serialize(data);
            var RequestedURL = $rootScope.apiURLForInstaFlightSearch + '/GetDestination' + dataURL;
            return $http.get(RequestedURL)
            .then(function (data) {
                return data.data;
            }, function (e) {
                return e;
            });
        }

        function findDestinationsDetails(data) {
            var dataURL = 'instaflight/search?' + serialize(data);
            var RequestedURL = $rootScope.apiURL + dataURL;
            return $http.get(RequestedURL)
            .then(function (data) {
                return data.data;
            }, function (e) {
                return e;
            });
        }

        function findTopDestinations(data) {
            var dataURL = 'TopDestinations?' + serialize(data);
            var RequestedURL = $rootScope.apiURL + dataURL;
            return $http.get(RequestedURL)
            .then(function (data) {
                return data.data;
            }, function (e) {
                return e;
            });
        }
    }
})();