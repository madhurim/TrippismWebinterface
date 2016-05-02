(function () {
    'use strict';
    var serviceId = 'WeatherFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope','$filter', WeatherFactory]);

    function WeatherFactory($http, $rootScope,$filter) {
        var storedata = [];
        var service = {
            GetData: GetData,
             ResultData: ResultData,
             WeatherData : {WeatherData : []}
        };
        return service;

        function GetData(paramdata) {
            var dataURL = '?' + serialize(paramdata);
            var url = (paramdata.CountryCode == 'US' ? $rootScope.apiURLForUSWeather : $rootScope.apiURLForWeather) + dataURL;
            return $http.get(url)
                .then(function (data) {
                    //If response with okay status but data not found then no required to save that data
                    if (data.data != "" && data.data.WeatherChances.length != 0) {
                        var finaldata = {
                            WeatherFor: paramdata.WeatherFor,
                            data: data.data
                        }
                        var finddata = $filter('filter')(storedata, { WeatherFor: paramdata.WeatherFor })[0];
                        if (finddata == undefined)
                            storedata.push(finaldata);

                        service.WeatherData = data.data;
                    }
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
        function ResultData(WeatherFor)
        {
            if (storedata == undefined)
                return null;
            var data = $filter('filter')(storedata, { WeatherFor: WeatherFor })[0];
            return data;
        }
    }
})();