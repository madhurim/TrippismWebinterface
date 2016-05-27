(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$location', BaseController]);

    function BaseController($scope, $modal, $rootScope, $location) {
        var hostName = "http://api.trippism.com";
        //var hostName = 'http://' + $location.host();
        if (angular.lowercase($location.host()) == "localhost") {
            hostName = 'http://localhost:14606';
        }

        $rootScope.apiURL = hostName + '/api/Sabre/';
        $rootScope.apiURLForEmail = hostName + '/api/Email/SendEmailtoUser';
        $rootScope.apiURLForGoogleAttraction = hostName + '/api/googleplace/';
        $rootScope.apiURLForYouTube = hostName + '/api/youtube/';
        $rootScope.apiURLForWeather = hostName + '/api/weather/international/history';
        $rootScope.apiURLForUSWeather = hostName + '/api/weather/history';
        $rootScope.apiURLForGoogleGeoReverseLookup = hostName + '/api/googlegeocode/reverselookup/';
        $rootScope.apiURLForFeedback = hostName + '/api/Email/SendFeedback';
        $rootScope.apiURLForInstaFlightSearch = hostName + '/api/instaflight';
        $rootScope.apiURLForConstant = hostName + '/api/Constants/';
        $rootScope.apiURLForHotelRange = hostName + '/api/sabre/hotels';

        $rootScope.isShowAlerityMessage = true;

        $scope.aboutUs = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: '/Views/Partials/AboutUsPartial.html',
                controller: 'FeedbackController',
            });
        };
        $scope.feedback = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: '/Views/Partials/FeedbackDetailFormPartial.html',
                controller: 'FeedbackController',
                scope: $scope,
            });
        }

        // also used to stop image slider [HomeController]
        $scope.$on('bodyClass', function (event, args) {
            $scope.bodyClass = args;
        });
    }
})();


