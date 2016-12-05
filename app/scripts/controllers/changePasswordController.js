(function () {
    'use strict';
    angular.module('TrippismUIApp').controller('changePasswordController', ['$scope', '$modal', 'accountFactory', 'LocalStorageFactory', 'dataConstant', '$stateParams', '$location', ChangePasswordController]);

    function ChangePasswordController($scope, $modal, AccountFactory, LocalStorageFactory, dataConstant, $stateParams, $location) {
        $scope.$emit('bodyClass', 'changepassword');
        $scope.dismiss = function () {
            $scope.$dismiss('cancel');
            return 1;
        };
        function validate() {
            $scope.hasError = false;
            $scope.isPasswordSame = true;
            if ($scope.oldpassword && $scope.newpassword && $scope.confirmpassword) {

                if ($scope.newpassword != $scope.confirmpassword) {
                    $scope.hasError = true;
                    $scope.isPasswordSame = false;
                }

                if ($scope.newpassword.length < 6) {
                    $scope.hasError = true;
                    $scope.PasswordLength = false;
                }
            }
            else {
                $scope.hasError = true;
            }
        }

        $scope.submitModal = function () {
            validate();
            if ($scope.hasError)
                return;
            var CustomerGuid = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            var details = {
                OldPassword: $scope.oldpassword,
                NewPassword: $scope.newpassword,
                CustomerGuid: CustomerGuid.Guid
            }
            $scope.updatePassword = AccountFactory.ChangePassword(details).then(function (data) {
                if (data.status == 200) {
                    $scope.dismiss();
                    alertify.alert("Change Password", "");
                    alertify.alert('Your password has been changed successfully!').set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Alert", "");
                    alertify.alert("Incorrect old password.Try again!").set('onok', function (closeEvent) { });
                }
            });
        }

        $scope.resetPassword = function () {
            $scope.hasError = false;
            $scope.PasswordLength = true;

            if ($scope.newpassword && $scope.confirmpassword) {

                if ($scope.newpassword.length < 6) {
                    $scope.hasError = true;
                    $scope.PasswordLength = false;
                    return;
                }

                if ($scope.newpassword != $scope.confirmpassword) {
                    $scope.hasError = true;
                    $scope.isPasswordSame = false;
                    return;
                }
                else
                    $scope.isPasswordSame = true;

                if ($stateParams.path != undefined) {

                    var params = $stateParams.path.split(";");
                    // split destination and origin to compare with tab title

                    var isSearched = false;
                    angular.forEach(params, function (item) {
                        var para = item.split("=");
                        if (para[0].trim() === "T")
                            $scope.Token = para[1].trim();
                        if (para[0].trim() === "G") {
                            $scope.Guid = para[1].trim();
                        }
                    });
                }
                if ($scope.Token && $scope.Guid) {
                    var details = {
                        Token: $scope.Token,
                        Password: $scope.newpassword,
                        CustomerGuid: $scope.Guid
                    }

                    $scope.updatePassword = AccountFactory.ResetPassword(details).then(function (data) {
                        if (data.status == 200) {
                            alertify.alert("Forgot Password", "");
                            alertify.alert('Your password has been changed successfully!').set('onok', function () { });
                            $location.path('/home');
                        }
                        else {
                            alertify.alert("Alert", "");
                            alertify.alert("Token expire Or Customer does not exist!").set('onok', function () { });
                            $location.path('/home');
                        }
                    });
                }
            }
            else {
                $scope.hasError = true;
            }
        }
    }
})();