(function () {
    'use strict';
    angular.module('TrippismUIApp').controller('changePasswordController', ['$scope', '$modal', 'accountFactory', 'LocalStorageFactory','dataConstant', ChangePasswordController]);

    function ChangePasswordController($scope, $modal, AccountFactory, LocalStorageFactory, dataConstant) {

        $scope.dismiss = function () {
            $scope.$dismiss('cancel');
            return 1;
        };
        function validate() {
            $scope.hasError = false;
            $scope.isPasswordSame = true;
            if ($scope.oldpassword && $scope.newpassword && $scope.conformpassword) {

                if ($scope.newpassword != $scope.conformpassword) {
                    $scope.hasError = true;
                    $scope.isPasswordSame = false;
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
            debugger;
            var Guid = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            var details = {
                OldPassword: $scope.oldpassword,
                NewPassword: $scope.newpassword,
                ConfirmPassword: $scope.conformpassword
                //Guid : Guid.
            }
            $scope.updatePassword = AccountFactory.ChangePassword(details).then(function (data) {
                if (data.status == 200) {
                    $scope.dismiss();
                    alertify.alert("Success", "");
                    alertify.alert('Password change successfully!').set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Alert", "");
                    alertify.alert(data.statusText + ".Try again!").set('onok', function (closeEvent) { });
                }
            });
        }
    }
})();