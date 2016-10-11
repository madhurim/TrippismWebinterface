(function () {
    'use strict';
    angular.module('TrippismUIApp').controller('forgotPasswordController', ['$scope', '$modal', 'accountFactory', ForgotPasswordController]);

    function ForgotPasswordController($scope, $modal, AccountFactory) {
        $scope.submitEmailid = function () {
            validate();

            if ($scope.hasError)
                return;

            var Emailid = { UserName: $scope.emailid }
            $scope.forgotPasswordPromise = AccountFactory.ForgotPassword(Emailid).then(function (data) {
                if (data.status == 200) {
                    $scope.dismiss();
                    alertify.alert("Success", "");
                    alertify.alert('Setup your password from your email account.').set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Alert", "");
                    alertify.alert(data.statusText + ".Try again!").set('onok', function (closeEvent) { });
                }
            });
        }
        $scope.dismiss = function () {
            $scope.$dismiss('cancel');
            return 1;
        };
        function validate() {
            $scope.hasError = false;
            if ($scope.emailid && $scope.emailid.length > 0 && !checkEmail($scope.emailid)) {
                $scope.hasError = true;
                $scope.isValidFromEmail = false;
                return
            }
            else
                $scope.isValidFromEmail = true;
        }
    }
})();