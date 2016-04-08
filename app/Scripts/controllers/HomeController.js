(function () {
    'use strict';
    var controllerId = 'HomeController';
    angular.module('TrippismUIApp').controller(controllerId,
         ['$scope',
            '$window',
            '$timeout',
            'LocalStorageFactory',
            'TrippismConstants',
             HomeController]);
    function HomeController(
       $scope,
       $window,
       $timeout,
       LocalStorageFactory,
       TrippismConstants
       ) {
        alertify.dismissAll();
        $scope.Name = "Home Page";
        $scope.$emit('bodyClass', 'homepage');

        LocalStorageFactory.clear(TrippismConstants.refineSearchLocalStorage);

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
            resizeSlider();
        });
        // --- Ends----

        function resizeSlider() {
            var boxwrap = angular.element("#destination-boxwrap");
            var height = boxwrap.css('height');
            if (w.width() <= 767)
                height = "365px"
            angular.element('#slideshow, #slideshow div').css({ height: height, width: boxwrap.css('width') });
            var width = parseInt(boxwrap.css('width').replace("px", ''));
            var height = parseInt(height.replace("px", ''));
            return { width: width, height: height };
        }

        var size = resizeSlider();
        angular.element('#slideshow').fadeSlideShow({
            speed: 3000,
            interval: 5000,
            width: size.width,
            height: size.height,
            PlayPauseElement: false,
            NextElement: false,
            PrevElement: false,
            ListElement: false,
        });
        //window.setTimeout(function () { angular.element('#slideshow li').css({ display: 'list-item' }) }, 2000);
    }
})();