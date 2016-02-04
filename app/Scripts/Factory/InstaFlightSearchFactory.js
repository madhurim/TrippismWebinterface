(function () {
    'user strict';
    var serviceId = 'InstaFlightSearchFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope',
    function ($http, $rootScope) {
        var service = {
            GetData: GetData
        };

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

        function GetData(data) {
            var dataURL = '?' + serialize(data);
            var url = $rootScope.apiURLForInstaFlightSearch + '/search' + dataURL;
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