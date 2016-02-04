(function () {
    'use strict';
    var controllerId = 'ShareDestinationInformation';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', ShareDestinationInformation]);

    function ShareDestinationInformation($scope) {
        $scope.SharedbuttonText = "Share";
        $scope.GetDestinations = GetDestinations;
        function GetDestinations() {
            var i = $scope.$parent.destinationlist;

            // TO Do
            //for send email we need to make api
        }
    }
})();