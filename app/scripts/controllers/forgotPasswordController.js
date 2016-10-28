(function () {
    'use strict';
    angular.module('TrippismUIApp').controller('forgotPasswordController', ['$scope', '$modal', 'accountFactory', '$rootScope', ForgotPasswordController]);

    function ForgotPasswordController($scope, $modal, AccountFactory, $rootScope) {
        $scope.submitEmailid = function () {
            validate();
            if ($scope.hasError)
                return;

            var Emailid = $scope.emailid;
            var url = window.location.host;
            $scope.forgotPasswordPromise = AccountFactory.ForgotPassword(Emailid, url).then(function (data) {
                if (data.status == 200) {
                    $scope.dismiss();
                    alertify.alert("Success", "");
                    alertify.alert('Link to reset your password has been emailed to you.').set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Alert", "");
                    alertify.alert("Incorrect email address.Try again!").set('onok', function (closeEvent) { });
                }
            });
        }
        $scope.dismiss = function () {
            $scope.$dismiss('cancel');
            return 1;
        };
        function validate() {
            $scope.hasError = false;
            if ($scope.emailid && $scope.emailid.length > 0) {
                if (!checkEmail($scope.emailid)) {
                    $scope.hasError = true;
                    $scope.isValidFromEmail = false;
                    return;
                }
            }
            else
                $scope.hasError = true;
        }
        $scope.alreadyAccount = function () {
            $scope.dismiss();
            $rootScope.loginPoupup();
        };
    }
})();