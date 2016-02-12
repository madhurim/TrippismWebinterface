(function () {
    'use strict';
    var serviceId = 'DestinationFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', '$filter', '$timeout', DestinationFactory]);

    function DestinationFactory($http, $rootScope, $filter,$timeout) {
        var DestinationsData = [];
        // Define the functions and properties to reveal.
        var service = {
            findDestinations: findDestinations,
            findTopDestinations: findTopDestinations,
            findDestinationsDetails: findDestinationsDetails,
            findInstFlightDestination: findInstFlightDestination,
            ShowDestinationView: true,
            GetDestinationFareInfo: GetDestinationFareInfo
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
        function findDestinations(paramdata, callBack) {
            var resultdata = $filter('filter')(DestinationsData, { Criteria: paramdata.Origin + paramdata.DepartureDate + paramdata.ReturnDate })[0];
            if (resultdata != undefined && resultdata != "") {
                $timeout(function () { callBack(resultdata.data); }, 0);
            }
            else {
                var result = {
                    Criteria: paramdata.Origin + paramdata.DepartureDate + paramdata.ReturnDate,
                    data: null
                }
                var dataURL = 'Destinations?' + serialize(paramdata);
                var RequestedURL = $rootScope.apiURL + dataURL;
                $http.get(RequestedURL)
                .then(function (data) {
                    result.data = data.data;
                    DestinationsData.push(result);
                    callBack(data.data);
                    //return data.data;
                }, function (e) {
                    return e;
                });
            }
        }
        function GetDestinationFareInfo(paramdata) {
            if (DestinationsData == undefined)
                return null;
                var result = $filter('filter')(DestinationsData, { Criteria: paramdata.Origin + paramdata.DepartureDate + paramdata.ReturnDate })[0];
                if (result == undefined)
                    return null;
                var fareInfo = $filter('filter')(result.data.FareInfo, { DestinationLocation: paramdata.Destination })[0];
                return fareInfo;
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