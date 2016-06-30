(function () {
    'use strict';
    var serviceId = 'FareRangeFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', '$filter', '$q', FareRangeFactory]);

    function FareRangeFactory($http, urlConstant, $filter, $q) {
        // Define the functions and properties to reveal.
        var FareRangeData = [];
        var service = {
            fareRange: fareRange,
        };
        return service;

        function fareRange(data) {
            var resultdata = $filter('filter')(FareRangeData, { Criteria: data.Origin + data.EarliestDepartureDate + data.LatestDepartureDate + data.Destination + data.Lengthofstay })[0];
            if (resultdata != undefined) {
                var d = $q.defer();
                d.resolve(angular.copy(resultdata.data));//angular.copy used because at directive side we manipulate into data so second time when we call method for data then return original result which was return from api
                return d.promise;
            }
            else {
                var result = {
                    Criteria: data.Origin + data.EarliestDepartureDate + data.LatestDepartureDate + data.Destination + data.Lengthofstay,
                    data: null
                }
                var dataURL = 'FareRange?' + serialize(data);
                var url = urlConstant.apiURL + dataURL;
                return $http.get(url)
                    .then(function (data) {
                        result.data = angular.copy(data);
                        FareRangeData.push(result);
                        return data;
                    }, function (e) {
                        return e;
                    });
            }
        }
    }
})();