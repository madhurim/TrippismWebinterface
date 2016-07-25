(function () {
    'use strict';
    var serviceId = 'SeasonalityFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', '$filter', '$q', SeasonalityFactory]);

    function SeasonalityFactory($http, urlConstant, $filter, $q) {
        // Define the functions and properties to reveal.
        var SeasonalityData = [];
        var service = {
            Seasonality: Seasonality,
        };
        return service;


        function Seasonality(data) {
            var resultdata = $filter('filter')(SeasonalityData, { Criteria: data.Destination })[0];
            if (resultdata != undefined && resultdata != "") {
                var d = $q.defer();
                d.resolve(angular.copy(resultdata.data));//angular.copy used because at directive side we manipulate into data so second time when we call data method then return original result which was return from api
                return d.promise;
            }
            else {
                var result = {
                    Criteria: data.Destination,
                    data: null
                }
                var dataURL = 'Seasonality?' + serialize(data);
                var url = urlConstant.apiURL + dataURL;
                return $http.get(url)
                    .then(function (data) {
                        result.data = angular.copy(data.data);
                        SeasonalityData.push(result);
                        return data.data;
                    }, function (e) {
                        return e;
                    });
            }
        }
    }
})();