﻿(function () {
    'use strict';
    var controllerId = 'loginController';
    angular.module('TrippismUIApp').controller(controllerId, ['$scope', '$modal', '$modalInstance', 'accountFactory', 'LocalStorageFactory', 'dataConstant', '$rootScope', 'urlConstant', 'AddLike', LoginController]);

    function LoginController($scope, $modal, $modalInstance, AccountFactory, LocalStorageFactory, dataConstant, $rootScope, urlConstant, AddLike) {
        $scope.IsUserlogin = false;
        $scope.IsForAddLike = AddLike;
        $scope.submitModal = function () {
            validate();
            if ($scope.hasError)
                return;

            var emailId = ($scope.emailid).toLowerCase();
            var password = $scope.password;
            var signIn = {
                Email: emailId,
                Password: $scope.password
            }
            $scope.createAccountPromise = AccountFactory.LoginUser(signIn).then(function (data) {
                if (data.status == 200) {
                    var userInfo = data.data.AuthDetailsViewModel.CustomerGuid;
                    var username = emailId.substring(0, emailId.lastIndexOf("@"));
                    LocalStorageFactory.update(dataConstant.GuidLocalstorage, { Guid: userInfo, IsLogin: 1, Username: username });
                    $modalInstance.close(userInfo);
                }
                else if (data.status == 403) {
                    $scope.password = null;
                    alertify.alert("Incorrect Credentials", "");
                    alertify.alert("Incorrect UserName or Password. You can use forgot password feature if you don't remember.").set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Error", "");
                    alertify.alert("Something went wrong. Please try again!").set('onok', function (closeEvent) { });
                }
            });
        }
        function validate() {
            $scope.hasError = false;
            if ($scope.emailid && !checkEmail($scope.emailid)) {
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
            var emailId = ($scope.emailid).toLowerCase();
            var CustomerGuid = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            var signUp = {
                CustomerGuid: CustomerGuid.Guid,
                Email: emailId
            }
            $scope.createAccountPromise = AccountFactory.CreateAccount(signUp).then(function (data) {
                if (data.status == 200) {
                    LocalStorageFactory.update(dataConstant.GuidLocalstorage, { Guid: data.data.CustomerGuid, IsLogin: 0 });
                    $scope.dismiss();
                    alertify.alert("Sign Up", "");
                    alertify.alert('A verification email has been sent to you. Please get the password from the email.').set('onok', function (closeEvent) { });
                }
                else if (data.status == 302) {
                    alertify.alert("User Already Exists", "");
                    alertify.alert("We already have a user by this email address. Try Signing in.<br />You can use forgot password feature if you don't remember.").set('onok', function (closeEvent) { });                    
                }
                else {
                    alertify.alert("Error", "");
                    alertify.alert("Something went wrong. Please try again!").set('onok', function (closeEvent) { });
                }
            });
        }
        $scope.forgotpassword = function () {
            $scope.dismiss();
            var GetEmailDetPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'forgotPasswordPartial.html',
                controller: 'forgotPasswordController',
                windowClass: 'width-modal'
            });
        }
        $scope.signUp = function () {
            $scope.IsUserlogin = true;
        }
        $scope.alreadyAccount = function () {
            $scope.IsUserlogin = false;
        }
        $scope.dismiss = function () {
            $modalInstance.dismiss('cancel');
            return 1;
        };
    }
})();