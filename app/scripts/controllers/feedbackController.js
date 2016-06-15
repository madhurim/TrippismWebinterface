(function () {
    'use strict';
    var controllerId = 'FeedbackController';
    angular.module('TrippismUIApp').controller(controllerId,
       ['$scope', 'FeedbackFactory', FeedbackController]);

    function FeedbackController($scope, FeedbackFactory) {
        $scope.feedbackType = '0';
        $scope.whatBroughtYou = '0';
        $scope.tellFriend = '0';
        $scope.hasError = false;
        $scope.charactersRemaining = 1000;
        $scope.feedbackDetail = '';

        $scope.dismiss = function () {
            $scope.$dismiss('cancel')
        };

        $scope.submitModal = function () {
            if ($scope.FormFeedback.$invalid) {
                $scope.hasError = true;
                return;
            }
            else {
                $scope.hasError = false;
                var subject = "User feedback";
                var contentString = "<p>Hello, you have got one new user feedback!</p>"
                    + "<p>What kind of website feedback do you have? :<b> " + ($scope.feedbackType == "0" ? '' : $scope.feedbackType) + "</b></p>"
                + "<p>Feedback Detail:</b> " + $scope.feedbackDetail + "</p>"
                + "<p>What brought you to Trippism today? : <b>" + ($scope.whatBroughtYou == "0" ? '' : $scope.whatBroughtYou) + "</b></p>"
                + "<p>Would you tell your friends to use Trippism? :<b> " + ($scope.tellFriend == "0" ? '' : $scope.tellFriend) + "</b></p>";

                var email = {
                    From: 'noreply@trippism.com',
                    To: 'madhuri.mittal@gmail.com',
                    subject: subject,
                    body: contentString
                };
                $scope.sendFeedbackPromise = FeedbackFactory.SendEmail(email).then(function (data) {
                    if (data.Data.status == "ok") {
                        $scope.dismiss();
                        alertify.alert("Success", "");
                        alertify.alert('Feedback sent successfully.').set('onok', function (closeEvent) { });
                    }
                    else {
                        alertify.alert("Error", "");
                        alertify.alert(data.Data.status).set('onok', function (closeEvent) { });
                    }
                });
            }
        }

        $scope.getCharactersRemaining = function () {
            var total = 1000;
            if ($scope.feedbackDetail == undefined) {
                $scope.charactersRemaining = total;
                return;
            }
            var newLines = $scope.feedbackDetail.match(/(\r\n|\n|\r)/g);
            var addition = 0;
            if (newLines != null) {
                addition = newLines.length;
            }
            var charRemaining = total - $scope.feedbackDetail.length - addition;
            $scope.charactersRemaining = charRemaining < 0 ? 0 : charRemaining;
        }
    }
})();