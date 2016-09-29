(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', 'UtilFactory', 'urlConstant', 'dataConstant', 'LocalStorageFactory', 'baseFactory', BaseController]);

    function BaseController($scope, $modal, $rootScope, UtilFactory, urlConstant, dataConstant, LocalStorageFactory, baseFactory) {
        $rootScope.isShowAlerityMessage = true;

        init();
        function init() {
            UtilFactory.ReadAirportJson();
            UtilFactory.GetCurrencySymbols();
            UtilFactory.ReadHighRankedAirportsJson();
            setauthenticationLabel();
        }

        $scope.aboutUs = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'aboutUsPartial.html',
                controller: 'FeedbackController',
            });
        };
        $scope.feedback = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'feedbackDetailFormPartial.html',
                controller: 'FeedbackController',
                scope: $scope,
            });
        }

        function setauthenticationLabel() {
            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            $scope.authenticationLabel = (userInfo) ? ((userInfo.IsLogin && userInfo.IsLogin == 1) ? "Sign out" : "Sign in") : "Sign in";
        }

        // also used to stop image slider [HomeController]
        $scope.$on('bodyClass', function (event, args) {
            $scope.bodyClass = args;
        });

        // Create and store Guid into Localstorage
        function storeGuid() {
            var guid = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            var exits = (guid) ? ((!guid.Guid) ? true: false):true;
            if (exits) {
                baseFactory.storeAnonymousData().then(function (data) {
                    LocalStorageFactory.save(dataConstant.GuidLocalstorage, { Guid: data + "" });
                });
            }
        }
        storeGuid();

        $rootScope.loginPoupup = function () {
            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            if (userInfo && userInfo.IsLogin && userInfo.IsLogin == 1) {
                LocalStorageFactory.update(dataConstant.GuidLocalstorage, { IsLogin: 0 });
                $scope.authenticationLabel = "Sign in";
                return;
            }

            var GetEmailDetPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'loginPopUp.html',
                controller: 'loginController'
            });
            GetEmailDetPopupInstance.result.finally(function () {
                setauthenticationLabel();
            })
        }
    }
})();


