(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('LoginFactory', ['$http', 'urlConstant', LoginFactory]);

    function LoginFactory($http, urlConstant) {
        // Define the functions and properties to reveal.
        var service = {
            CreateAccount: CreateAccount,
            LoginUser: LoginUser,
        };
        return service;

        function CreateAccount(data) {
            debugger;
            var url = urlConstant.apiURLforProfileAuthentication + "/signup";
            return $http({
                method: 'POST',
                url: url,
                data: serialize(data),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then(function (data) {
                return data;
            }, function (e) {
                return e;
            });
        }

        function LoginUser(data)
        {
            var url = urlConstant.apiURLforProfileAuthentication + "/signin";
            return $http({
                method: 'POST',
                url: url,
                data: serialize(data),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }).then(function (data) {
                return data;
            }, function (e) {
                return e;
            });
        }        
    }
})();