(function () {
    'use strict';
    var controllerId = 'HomeController';
    angular.module('TrippismUIApp').controller(controllerId,
         ['$scope',
            '$window',
            'LocalStorageFactory',
            'TrippismConstants',
             HomeController]);
    function HomeController(
       $scope,
       $window,
       LocalStorageFactory,
       TrippismConstants
       ) {
        alertify.dismissAll();
        $scope.Name = "Home Page";
        $scope.$emit('bodyClass', 'homepage');

        // set page height based on window's height
        var w = angular.element($window);
        function setPageHeight() {
            var boxwrap = angular.element("#destination-boxwrap");
            var h50px = angular.element("#h50px");
            boxwrap.height(w.height() - h50px.height());
        }

        setPageHeight();
        w.bind('resize', function () {
            setPageHeight();
        });

        angular.element('#carousel').carousel({
            interval: 3000,
            pause: false
        })

        LocalStorageFactory.clear(TrippismConstants.refineSearchLocalStorage);        
        // --- Ends----
    }
})();