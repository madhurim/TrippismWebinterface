(function () {
    'use strict';
    var serviceId = 'FareforecastFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', '$filter', '$q', FareforecastFactory]);

    function FareforecastFactory($http, urlConstant, $filter, $q) {
        var FareForecastData = [];
        // Define the functions and properties to reveal.
        var service = {
            fareforecast: fareforecast,
        };
        return service;

        function fareforecast(data) {
            var criteria = data.Origin + data.DepartureDate + data.ReturnDate + data.Destination;
            var resultdata = $filter('filter')(FareForecastData, { Criteria: criteria })[0];
            if (resultdata != undefined && resultdata != "") {
                var d = $q.defer();
                d.resolve(angular.copy(resultdata.data));//angular.copy used because at directive side we manipulate into data so second time when we call method for data then return original result which was return from api
                return d.promise;
            }
            else {
                var dataURL = 'FareForecast?' + serialize(data);
                var url = urlConstant.apiURL + dataURL;
                return $http.get(url)
                 .then(function (data) {
                     var result = {
                         Criteria: criteria,
                         data: null
                     }
                     var resultdata = $filter('filter')(FareForecastData, { Criteria: criteria })[0];
                     if (resultdata == undefined || resultdata == "") {
                         result.data = angular.copy(data.data);
                         FareForecastData.push(result);
                     }
                     return data.data;
                 }, function (e) {
                     return e;
                 });
            }
        }
    }
})();