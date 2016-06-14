(function () {
    'user strict';
    var serviceId = 'InstaFlightSearchFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant',
    function ($http, urlConstant) {
        var service = {
            GetData: GetData
        };


        function GetData(data) {
            var dataURL = '?' + serialize(data);
            var url = urlConstant.apiURLForInstaFlightSearch + '/search' + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
        return service;
    }]);
})();