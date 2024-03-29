﻿(function () {
    'use strict';
    var serviceId = 'DestinationFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', '$filter', '$q', DestinationFactory]);

    function DestinationFactory($http, urlConstant, $filter, $q) {
        var DestinationsData = [];
        var DestinationData = [];
        var DestinationHotelData = [];
        var DestinationDataStorage = {
            fare: {
                get: function (key) { return $filter('filter')(DestinationData, { key: key }, true)[0]; },
                set: function (key, data) { DestinationData.push({ key: key, data: data }); },
                clear: function () { DestinationData = []; }
            },
            hotel: {
                get: function (key) { return $filter('filter')(DestinationHotelData, { key: key }, true)[0]; },
                set: function (key, data) { DestinationHotelData.push({ key: key, data: data }); },
                clear: function () { DestinationHotelData = []; }
            },
            currentPage: {
                fare: null,
                hotel: null,
                weather: null,
                fareForecast: null,
                details: null,
                clear: function () {
                    this.fare = null;
                    this.hotel = null;
                    this.weather = null;
                    this.fareForecast = null;
                    this.details = null;
                }
            }
        }


        var service = {
            findDestinations: findDestinations,
            findInstFlightDestination: findInstFlightDestination,
            GetDestinationFareInfo: GetDestinationFareInfo,
            DestinationDataStorage: DestinationDataStorage
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
                var RequestedURL = urlConstant.apiURL + dataURL;
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
            var RequestedURL = urlConstant.apiURLForInstaFlightSearch + '/GetDestination' + dataURL;
            return $http.get(RequestedURL)
           .then(function (data) {
               return data.data;
           }, function (e) {
               return e;
           });
        }
    }
})();