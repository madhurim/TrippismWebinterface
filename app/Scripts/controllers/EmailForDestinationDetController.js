(function () {
    'use strict';
    var controllerId = 'EmailForDestinationDet';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
         'EmailForDestinationDetFactory',
         'eMailData',
         '$stateParams',
        EmailForDestinationDet]);

    function EmailForDestinationDet($scope,
        EmailForDestinationDetFactory,
        eMailData,
        $stateParams
        ) {
        $scope.fromEmail = '';
        $scope.toEmail = '';
        $scope.isValidFromEmail = true;
        $scope.isValidToEmail = true;
        $scope.SharedbuttonText = "Share";
        $scope.Defaultsubject = eMailData.DestinationairportName.airport_CityName;
        $scope.Subject = "How about a vacation to  " + $scope.Defaultsubject + "?";
        $scope.emailvalidate = true;
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
            $scope.formats = Dateformat();
            $scope.format = $scope.formats[5];
            var basicDetinationDetlist = $scope.eMailData.DestinationList;

            var basicDetinationDetlist = _.filter(basicDetinationDetlist, function (item) {
                return item.LowestNonStopFare && item.LowestNonStopFare.Fare !== 'N/A';
            });
            var basicDetinationDetlist = basicDetinationDetlist.sort(function (a, b) { return (parseFloat(a.LowestNonStopFare.Fare) < parseFloat(b.LowestNonStopFare.Fare)) ? 1 : -1; }).reverse().slice(0, 20);

            var airportlist = $scope.eMailData.AvailableAirports;

            var Origin = $scope.eMailData.SearchCriteria.Origin.toUpperCase();

            var OriginairportName = _.find(airportlist, function (airport) {
                return airport.airport_Code == Origin
            });
            var destinationfareinfo = _.find($scope.eMailData.DestinationList, function (Destination) {
                return Destination.DestinationLocation == $scope.eMailData.DestinationairportName.airport_Code.toUpperCase()
            });

            var sortedObjs = _.filter(basicDetinationDetlist, function (item) {
                return item.LowestFare && item.LowestFare.Fare !== 'N/A';
            });
            sortedObjs = _(sortedObjs).sortBy(function (obj) { return parseInt(obj.LowestFare.Fare, 10) });

            var FromDate = ConvertToRequiredDate($scope.eMailData.SearchCriteria.FromDate, 'API');
            var ToDate = ConvertToRequiredDate($scope.eMailData.SearchCriteria.ToDate, 'API');
            var OriginName = OriginairportName.airport_CityCode.toUpperCase();
            $scope.eMailData.Destinatrion

            var url = 'http://' + window.document.location.host;
            var tripissm_rdrURL = '<a href="' + url + '/#/destination/' + $stateParams.path + '">www.trippism.com</a>';
            var fblink = '<a href="' + "http://www.facebook.com/sharer/sharer.php?s=100&p[title]=vacation destination&p[url]=" + encodeURIComponent('http://dev.trippism.com/#/destination/' + $stateParams.path) + '">Facebook</a>';
            var twitterlink = '<a href="' + "http://twitter.com/share?text=vacation Destination&url=" + encodeURIComponent('http://dev.trippism.com/#/destination/' + $stateParams.path) + '">Twitter</a>';
            var gpluslink = '<a href="' + "https://plus.google.com/share?" + encodeURIComponent('http://dev.trippism.com/#/destination/' + $stateParams.path) + '">Google+</a>';
            var contentString = '<div style="font-family: arial,sans-serif;color: black;">' +
                           '<p>Hey there!</p><p> Check this out... I found a cool vacation destination going from ' + eMailData.OriginairportName.airport_CityName + '. Its ' + eMailData.DestinationairportName.airport_CityName + '! . What do you think ? Click here for more detail ' + tripissm_rdrURL + '</p>';

            // contentString += ' <p style="clear:both;padding-top:20px;">Please explore  <a href="' + url +'">www.trippism.com</a> for more details to plan vacation, trip.</p><p>Thanks,</p><p>via Trippism - new generation trip planner!</p>';
            contentString += ' <p style="clear:both;padding-top:20px;">Share on :  ' + fblink + ', ' + twitterlink + ', ' + gpluslink + ' </p></div>';

            var email = {
                From: $scope.fromEmail,
                To: $scope.toEmail,
                subject: $scope.Subject,
                body: contentString
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
    }
})();


