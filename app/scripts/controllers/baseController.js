(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', '$timeout', 'tmhDynamicLocale', 'UtilFactory', 'urlConstant', 'BaseFactory', '$locale',BaseController]);

    function BaseController($scope, $modal, $rootScope, $timeout, tmhDynamicLocale, UtilFactory, urlConstant, BaseFactory, $locale) {
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
                
                $rootScope.PointOfSaleCountry = data.country;
                tmhDynamicLocale.set("en-" + data.country);
            });
        }

        // Get currency Exchange Rate

        function getCurrencyExchangeRate() {
            var curremcy = "USD";
            var Convert = "INR";
            BaseFactory.getExchangeRate(curremcy,Convert).then(function (data) {

                debugger
                
                var rates = data;
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
                tmhDynamicLocale.set(data.selectedData.value);
            }
        });
        $scope.$on('$localeChangeError', function () {
            $timeout(function () {
                tmhDynamicLocale.set("en-us");
                $('#select-i18n').ddslick('select', { index: 0 });
            }, 0, true);
        });
        $rootScope.format = $locale.DATETIME_FORMATS.mediumDate;
        $scope.$on('$localeChangeSuccess', function () {
            $timeout(function () {
                $rootScope.format = $locale.DATETIME_FORMATS.mediumDate;
            }, 0, true);
        });

    }
})();