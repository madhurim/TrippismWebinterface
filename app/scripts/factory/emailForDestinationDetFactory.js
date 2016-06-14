(function () {
    'use strict';
    var serviceId = 'EmailForDestinationDetFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', EmailForDestinationDetFactory]);

    function EmailForDestinationDetFactory($http, $rootScope) {
        // Define the functions and properties to reveal.
        var service = {
            SendEmail: SendEmail,
        };
        return service;

        function SendEmail(data) {           
          var url = $rootScope.apiURLForEmail
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