(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('accountFactory', ['$http', 'urlConstant', AccountFactory]);

    function AccountFactory($http, urlConstant) {
        // Define the functions and properties to reveal.
        var service = {
            CreateAccount: CreateAccount,
            LoginUser: LoginUser,
            ForgotPassword: ForgotPassword,
            ChangePassword: ChangePassword,
            ResetPassword: ResetPassword
        };
        return service;

        function CreateAccount(data) {
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

        function LoginUser(data) {
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

        function ForgotPassword(emailid, url) {
            var url = urlConstant.apiURLforProfileAccount + "/forgotpassword?Emailid=" + emailid + "&Url=" + url;
            return $http.get(url)
                .then(function (data) {
                    return data;
                },
            function (e) {
                return e;
            });
        }

        function ChangePassword(data) {
            var url = urlConstant.apiURLforProfileAccount + "/changepassword";
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
        function ResetPassword(data) {
            var url = urlConstant.apiURLforProfileAccount + "/resetPassword";
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