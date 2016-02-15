(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$location', '$anchorScroll', 'UtilFactory', BaseController]);

    function BaseController($scope, $modal, $rootScope, $location, $anchorScroll, UtilFactory) {
        if (angular.lowercase($location.host()) == "localhost") {
            //devlopment url
            $rootScope.apiURL = 'http://localhost:14606/api/Sabre/';
            $rootScope.apiURLForEmail = 'http://localhost:14606/api/Email/SendEmailtoUser';
            $rootScope.apiURLForGoogleAttraction = 'http://localhost:14606/api/googleplace/';
            $rootScope.apiURLForYouTube = 'http://localhost:14606/api/youtube/';
            $rootScope.apiURLForWeather = 'http://localhost:14606/api/weather/international/history';
            $rootScope.apiURLForUSWeather = 'http://localhost:14606/api/weather/history';
            $rootScope.apiURLForGoogleGeoReverseLookup = 'http://localhost:14606/api/googlegeocode/reverselookup/';
            $rootScope.apiURLForFeedback = 'http://localhost:14606/api/Email/SendFeedback';
            $rootScope.apiURLForInstaFlightSearch = 'http://localhost:14606/api/instaflight';
            $rootScope.apiURLForConstant = 'http://localhost:14606/api/Constants/';
        }
        else {
            //live url
            $rootScope.apiURL = 'http://' + $location.host() + '/api/';
            $rootScope.apiURLForEmail = 'http://' + $location.host() + '/api/Email/SendEmailtoUser';
            $rootScope.apiURLForWeather = 'http://' + $location.host() + '/api/weather/international/history';
            $rootScope.apiURLForGoogleAttraction = 'http://' + $location.host() + '/api/googleplace/';
            $rootScope.apiURLForYouTube = 'http://' + $location.host() + '/api/youtube/';
            $rootScope.apiURLForUSWeather = 'http://' + $location.host() + '/api/weather/history';
            $rootScope.apiURLForGoogleGeoReverseLookup = 'http://' + $location.host() + '/api/googlegeocode/reverselookup/';
            $rootScope.apiURLForFeedback = 'http://' + $location.host() + '/api/Email/SendFeedback';
            $rootScope.apiURLForInstaFlightSearch = 'http://' + $location.host() + '/api/instaflight';
            $rootScope.apiURLForConstant = 'http://' + $location.host() + '/api/Constants/';
        }


        
        $scope.ViewDestinations = function () {
            var result = UtilFactory.GetLastSearch()
            $location.path('destinations/f=' + result.Origin.toUpperCase() + ';d=' + ConvertToRequiredDate(result.FromDate, 'API') + ';r=' + ConvertToRequiredDate(result.ToDate, 'API'));
        }
        $scope.getClass = function (path) {
            if ($location.path().substr(0, path.length) == path) {
                return "active"
            } else {
                return ""
            }
        }
        $scope.GoToTop = function () {
            var old = $location.hash();
            $location.hash('top');
            $anchorScroll();
            $location.hash(old);
        }
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
    }
})();


