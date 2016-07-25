(function () {
    'use strict';
    var serviceId = 'FeedbackFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', FeedbackFactory]);

    function FeedbackFactory($http, urlConstant) {
        // Define the functions and properties to reveal.
        var service = {
            SendEmail: SendEmail,
        };
        return service;

        function SendEmail(data) {
            var url = urlConstant.apiURLForFeedback
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