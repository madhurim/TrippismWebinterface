(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$timeout', 'tmhDynamicLocale', 'UtilFactory', 'urlConstant', 'BaseFactory', BaseController]);

    function BaseController($scope, $modal, $rootScope, $timeout, tmhDynamicLocale, UtilFactory, urlConstant, BaseFactory) {
        $rootScope.isShowAlerityMessage = true;
        init();
        getLocale();
        function init() {
            UtilFactory.ReadAirportJson();
            UtilFactory.GetCurrencySymbols();
            UtilFactory.ReadHighRankedAirportsJson();
        }
        function getLocale() {
            BaseFactory.getLocale().then(function (data) {
                console.log(data);
            });
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

        $('#select-i18n').ddslick({
            onSelected: function (data) {
                $timeout(function () { tmhDynamicLocale.set(data.selectedData.value); }, 0, true);
            }
        });
    }
})();