(function () {
    'use strict';
    var serviceId = 'DestinationFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', '$filter', '$q', DestinationFactory]);

    function DestinationFactory($http, $rootScope, $filter, $q) {
        var DestinationsData = [];
        var DestinationData = [];
        var service = {
            findDestinations: findDestinations,
            findInstFlightDestination: findInstFlightDestination,
            ShowDestinationView: true,
            GetDestinationFareInfo: GetDestinationFareInfo,
            getDestinationData: getDestinationData,
            setDestinationData: setDestinationData,
            clearDestinationData: clearDestinationData
        };
        return service;
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
            var result = _.findWhere(DestinationsData, { Criteria: paramdata.Origin + paramdata.DepartureDate + paramdata.ReturnDate });
            if (result == undefined)
                return null;
            var fareInfo = _.findWhere(result.data.FareInfo, { DestinationLocation: paramdata.Destination });
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
        function getDestinationData(key) {
            return $filter('filter')(DestinationData, { key: key }, true)[0];

        }
        function setDestinationData(key, data) {
            DestinationData.push({ key: key, data: data });
        }
        function clearDestinationData() {
            DestinationData = [];
        }
    }
})();