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

        // also used to stop image slider [HomeController]
        $scope.$on('bodyClass', function (event, args) {
            $scope.bodyClass = args;
        });

        // Create and store Guid into Localstorage
        function storeGuid() {
            var guid = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            if (!guid) {
                baseFactory.storeAnonymousData().then(function (data) {
                    LocalStorageFactory.save(dataConstant.GuidLocalstorage, data + "");
                    
                });
            }
        }
        storeGuid();       
    }
})();


