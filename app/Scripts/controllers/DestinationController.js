(function () {
    'use strict';
    var controllerId = 'DestinationController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
            '$location',
            '$modal',
            '$rootScope',
            '$timeout',
            '$filter',
            '$window', '$stateParams', '$state',
            'DestinationFactory',
            'UtilFactory',
            'FareforecastFactory',
            'SeasonalityFactory',
            'TrippismConstants',
             DestinationController]);
    function DestinationController(
        $scope,
        $location,
        $modal,
        $rootScope,
        $timeout,
        $filter,
        $window, $stateParams, $state,
        DestinationFactory,
        UtilFactory,
        FareforecastFactory,
        SeasonalityFactory,
        TrippismConstants) {

        $scope.PageName = "Destination Page";
    }

})();