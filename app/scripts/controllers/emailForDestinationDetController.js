(function () {
    'use strict';
    var controllerId = 'EmailForDestinationDet';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
         'EmailForDestinationDetFactory',
         'eMailData',
         '$stateParams',
         '$filter',
         'DestinationFactory',
        EmailForDestinationDet]);

    function EmailForDestinationDet($scope,
        EmailForDestinationDetFactory,
        eMailData,
        $stateParams,
        $filter,
        DestinationFactory
        ) {
        $scope.fromEmail = '';
        $scope.toEmail = '';
        $scope.isValidFromEmail = true;
        $scope.isValidToEmail = true;
        $scope.Subject = "How about a vacation to  " + eMailData.DestinationAirport.airport_CityName + "?";
        $scope.eMailData = eMailData;

        $scope.submitModal = function () {
            $scope.hasError = false;
            if ($scope.fromEmail && $scope.fromEmail.length > 0 && !checkEmail($scope.fromEmail)) {
                $scope.hasError = true;
                $scope.isValidFromEmail = false;
            }
            else
                $scope.isValidFromEmail = true;

            if ($scope.toEmail) {
                if ($scope.toEmail.length < 1) {
                    $scope.hasError = true;
                    return;
                }
                else {
                    var emails = $scope.toEmail.split(',');
                    for (var i = 0; i < emails.length; i++) {
                        if (emails[i].trim().length == 0) continue;
                        if (!checkEmail(emails[i].trim())) {
                            $scope.isValidToEmail = false;
                            $scope.hasError = true;
                            return;
                        }
                        else
                            $scope.isValidToEmail = true;
                    }
                }
            }

            if ($scope.FormGetEmailDet.$valid && $scope.hasError == false)
                activate();
            else
                $scope.hasError = true;
        }

        $scope.dismiss = function () {
            $scope.$dismiss('cancel')
        };

        function activate() {
            var email = {
                From: $scope.fromEmail,
                To: $scope.toEmail,
                subject: $scope.Subject,
                body: angular.element('#email-template').html()
            };

            $scope.sendmailPromise = EmailForDestinationDetFactory.SendEmail(email).then(function (data) {
                if (data.Data.status == "ok") {
                    $scope.dismiss();
                    alertify.alert("Success", "");
                    alertify.alert('Shared via email successfully.').set('onok', function (closeEvent) { });
                }
                else {
                    alertify.alert("Error", "");
                    alertify.alert(data.Data.status).set('onok', function (closeEvent) { });
                }
            });
        }

        $scope.setEmailTemplateData = function () {
            $scope.emailTemplateInfo = {
                weather: DestinationFactory.DestinationDataStorage.currentPage.weather,
                fareForecast: DestinationFactory.DestinationDataStorage.currentPage.fareForecast,
                hotel: DestinationFactory.DestinationDataStorage.currentPage.hotel,
                fare: DestinationFactory.DestinationDataStorage.currentPage.fare,
                details: DestinationFactory.DestinationDataStorage.currentPage.details,
                dateString: $filter('date')($scope.eMailData.SearchCriteria.FromDate, 'MMM-dd-yyyy') + ' To ' + $filter('date')($scope.eMailData.SearchCriteria.ToDate, 'MMM-dd-yyyy'),
                href: window.location.href,
                destination: $scope.eMailData.DestinationAirport.airport_CityCode.toUpperCase()
            }
        }
        $scope.setEmailTemplateData();
    }
})();


