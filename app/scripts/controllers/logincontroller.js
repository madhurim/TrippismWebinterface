(function () {
    'use strict';
    var controllerId = 'loginController';
    angular.module('TrippismUIApp').controller(controllerId, ['$scope', '$modal', 'LoginFactory', 'LocalStorageFactory', 'dataConstant', '$rootScope', LoginController]);

    function LoginController($scope, $modal, LoginFactory, LocalStorageFactory, dataConstant, $rootScope) {
        $scope.IsUserlogin = false;
        $scope.submitModal = function () {
            validate();
            if ($scope.hasError)
                return;

            var emailId = $scope.emailid;
            var password = $scope.password;

            var signIn = {
                CustomerGuid: LocalStorageFactory.get(dataConstant.GuidLocalstorage),
                UserName: $scope.emailid,
                Password: $scope.password
            }
            $scope.createAccountPromise = LoginFactory.LoginUser(signIn).then(function (data) {
                if (data.status == 200) {
                    $scope.dismiss();
                    var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
                    LocalStorageFactory.update(dataConstant.GuidLocalstorage, { IsLogin: 1 });
                }
                else if (data.status == 403) {
                    $scope.emailid = null;
                    $scope.password = null;
                    alertify.alert("Alert", "");
                    alertify.alert('Incorrect UserName or Password').set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Error", "");
                    alertify.alert(data.e.status).set('onok', function (closeEvent) { });
                }
            });
        }
        function validate() {
            $scope.hasError = false;
            if ($scope.username && $scope.username.length > 0 && !checkEmail($scope.username)) {
                $scope.hasError = true;
                $scope.isValidFromEmail = false;
            }
            else
                $scope.isValidFromEmail = true;

            $scope.hasError = (!$scope.IsUserlogin) ? (($scope.password) ? false : true) : false;
        }

        $scope.createAccount = function () {
            validate();
            if ($scope.hasError)
                return;
            var emailId = $scope.emailid;

            var signUp = {
                CustomerGuid: LocalStorageFactory.get(dataConstant.GuidLocalstorage),
                UserName: emailId
            }
            $scope.createAccountPromise = LoginFactory.CreateAccount(signUp).then(function (data) {
                if (data.status == 200) {
                    $scope.dismiss();
                    alertify.alert("Success", "");
                    alertify.alert('Check your email for getting password.').set('onok', function (closeEvent) { });
                }
                else if (data.status == 302) {
                    $scope.dismiss();
                    alertify.alert("Success", "");
                    alertify.alert('Customer already exist on this email address.').set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Error", "");
                    alertify.alert(data.status).set('onok', function (closeEvent) { });
                }
            });
        }

        $scope.signUp = function () {
            $scope.IsUserlogin = true;
        }
        $scope.alreadyAccount = function () {
            $scope.IsUserlogin = false;
        }
        $scope.dismiss = function () {
            $scope.$dismiss('cancel');
            return 1;
        };
    }
})();