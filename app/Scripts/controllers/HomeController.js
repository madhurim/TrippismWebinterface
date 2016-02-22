(function () {
    'use strict';
    var controllerId = 'HomeController';
    angular.module('TrippismUIApp').controller(controllerId,
         ['$scope',
            '$window',
             HomeController]);
    function HomeController(
       $scope,
       $window
       ) {
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
        // --- Ends----
    }
})();