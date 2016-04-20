(function () {
    'use strict';
    var serviceId = 'DestinationFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', '$filter', '$q', DestinationFactory]);

    function DestinationFactory($http, $rootScope, $filter, $q) {
        var DestinationsData = [];
        var service = {
            findDestinations: findDestinations,
            findInstFlightDestination: findInstFlightDestination,
            ShowDestinationView: true,
            GetDestinationFareInfo: GetDestinationFareInfo,
            setDestinationData: setDestinationData
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
        function findDestinations(paramdata) {
            var resultdata = $filter('filter')(DestinationsData, { Criteria: paramdata.Origin + paramdata.DepartureDate + paramdata.ReturnDate })[0];
            if (resultdata != undefined && resultdata != "") {
                var d = $q.defer();
                d.resolve(resultdata.data);
                return d.promise;
            }
            else {
                var result = {
                    Criteria: paramdata.Origin + paramdata.DepartureDate + paramdata.ReturnDate,
                    data: null
                }
                var dataURL = 'Destinations?' + serialize(paramdata);
                var RequestedURL = $rootScope.apiURL + dataURL;
                return $http.get(RequestedURL)
                .then(function (data) {
                    result.data = data.data;
                    if (typeof data.data != 'string')
                        DestinationsData.push(result);
                    return data.data;
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

        function findInstFlightDestination(paramdata) {
            var dataURL = '?' + serialize(paramdata);
            var RequestedURL = $rootScope.apiURLForInstaFlightSearch + '/GetDestination' + dataURL;
            return $http.get(RequestedURL)
           .then(function (data) {
               return data.data;
           }, function (e) {
               return e;
           });
        }
        function getDestinationInstFlightData(key) {
            return _.find(DestinationsData, { Criteria: key });

        }
        function setDestinationInstFlightData(key, data) {
            InstaflightData.push({ Criteria: Key, data: data });
        }
    }
})();