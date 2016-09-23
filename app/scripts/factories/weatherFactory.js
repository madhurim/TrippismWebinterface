(function () {
    'use strict';
    var serviceId = 'WeatherFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$filter', '$q', 'urlConstant', WeatherFactory]);

    function WeatherFactory($http, $filter, $q, urlConstant) {
        var weatherStorage = [];
        var service = {
            GetData: GetData
        };
        return service;

        function GetData(paramdata) {
            var cache = $filter('filter')(weatherStorage, { WeatherFor: paramdata.WeatherFor })[0];
            if (cache != null) {
                var d = $q.defer();
                d.resolve(angular.copy(cache.data));//angular.copy used because at directive side we manipulate into data so second time when we call data method then return original result which was return from api
                return d.promise;
            }
            var dataURL = '?' + serialize(paramdata);
            var url = (paramdata.CountryCode == 'US' ? urlConstant.apiURLForUSWeather : urlConstant.apiURLForWeather) + dataURL;
            return $http.get(url)
                .then(function (data) {
                    var object = {
                        WeatherFor: paramdata.WeatherFor,
                        data: angular.copy(data)
                    }
                    var weatherData = $filter('filter')(weatherStorage, { WeatherFor: object.WeatherFor })[0];
                    if (weatherData == undefined)
                        weatherStorage.push(object);
                    return data;
                }, function (e) {
                    return e;
                });
        }
    }
})();