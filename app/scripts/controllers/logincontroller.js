(function () {
    'use strict';
    var controllerId = 'loginController';
    angular.module('TrippismUIApp').controller(controllerId, ['$scope', '$modal', 'accountFactory', 'LocalStorageFactory', 'dataConstant', '$rootScope', 'urlConstant', LoginController]);

    function LoginController($scope, $modal, AccountFactory, LocalStorageFactory, dataConstant, $rootScope, urlConstant) {
        $scope.IsUserlogin = false;
        $scope.submitModal = function () {
            validate();
            if ($scope.hasError)
                return;

            var emailId = $scope.emailid;
            var password = $scope.password;

            var signIn = {
                Email: $scope.emailid,
                Password: $scope.password
            }
            $scope.createAccountPromise = AccountFactory.LoginUser(signIn).then(function (data) {
                if (data.status == 200) {
                    var userInfo = data.data.AuthDetailsViewModel.CustomerGuid;
                    LocalStorageFactory.update(dataConstant.GuidLocalstorage, { Guid: userInfo, IsLogin: 1 });
                    $scope.dismiss();
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
            if ($scope.emailid && $scope.emailid.length > 0 && !checkEmail($scope.emailid)) {
                $scope.hasError = true;
                $scope.isValidFromEmail = false;
                return;
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
            var CustomerGuid = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            var signUp = {
                CustomerGuid: CustomerGuid.Guid,
                Email: emailId
            }
            $scope.createAccountPromise = AccountFactory.CreateAccount(signUp).then(function (data) {
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
        $scope.forgotpassword = function () {
            $scope.dismiss();
            var GetEmailDetPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'forgotPasswordPartial.html',
                controller: 'forgotPasswordController'
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