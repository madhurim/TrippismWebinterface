(function () {
    'use strict';
    var serviceId = 'FeedbackFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', FeedbackFactory]);

    function FeedbackFactory($http, $rootScope) {
        // Define the functions and properties to reveal.
        var service = {
            SendEmail: SendEmail,
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

        function SendEmail(data) {
            var url = $rootScope.apiURLForFeedback
            return $http({
                method: 'POST',
                url: url,
                data: serialize(data),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then(function (data) {
                return data.data;
            }, function (e) {
                return e;
            });
        }
    }
})();