(function () {
    'use strict';
    var serviceId = 'HotelRangeFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', HotelRangeFactory]);

    function HotelRangeFactory($http, $rootScope) {
        var service = {
            GetHotelRange: GetHotelRange,
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

        function GetHotelRange(data) {
                var dataURL =  serialize(data);
                var RequestedURL = $rootScope.apiURLForHotelRange +'?' + dataURL;
                return $http.get(RequestedURL)
                .then(function (data) {
                    //result.data = data.data;
                    return data;
                }, function (e) {
                    return e;
                });
        }
    }
})();