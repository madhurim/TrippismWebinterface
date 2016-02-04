(function () {
    'use strict';
    var controllerId = 'HomeController';
    angular.module('TrippismUIApp').controller(controllerId,
         ['$scope',
            '$location',
            '$modal',
            '$rootScope',
            '$timeout',
            '$filter',
            '$window',
            'TrippismConstants',
             HomeController]);
    function HomeController(
       $scope,
       $location,
       $modal,
       $rootScope,
       $timeout,
       $filter,
       $window,
       TrippismConstants
       ) {
        $scope.Name = "Home Page";
    }
})();