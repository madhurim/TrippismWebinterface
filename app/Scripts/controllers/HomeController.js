(function () {
    'use strict';
    var controllerId = 'HomeController';
    angular.module('TrippismUIApp').controller(controllerId,
         ['$scope',
            '$window',
            '$timeout',
            'LocalStorageFactory',
            'TrippismConstants',
            '$interval',
             HomeController]);
    function HomeController(
       $scope,
       $window,
       $timeout,
       LocalStorageFactory,
       TrippismConstants,
       $interval
       ) {
        alertify.dismissAll();
        $scope.Name = "Home Page";
        $scope.$emit('bodyClass', 'homepage'); // also used to stop image slider

        LocalStorageFactory.clear(TrippismConstants.refineSearchLocalStorage);

        // set page height based on window's height
        var w = angular.element($window);
        function setPageHeight() {
            var boxwrap = angular.element("#destination-boxwrap");
            var h50px = angular.element("#h50px");
            boxwrap.height(w.height() - h50px.height());
        }

        setPageHeight();

        w.bind('resize', setPageHeight);
        w.bind('resize', resizeSlider);

        // --- Ends----

        function resizeSlider() {
            var boxwrap = angular.element("#destination-boxwrap");
            if (!boxwrap.length) { w.unbind("resize", resizeSlider); return; };
            var height = boxwrap.css('height');
            if (w.width() <= 767)
                height = "365px"
            angular.element('#slideshow, #slideshow div').css({ height: height, width: boxwrap.css('width') });
            var width = parseInt(boxwrap.css('width').replace("px", ''));
            var height = parseInt(height.replace("px", ''));
            return { width: width, height: height };
        }

        function startSlider() {
            var size = resizeSlider();
            var element = angular.element('#slideshow');
            var settings = {
                speed: 3000,
                interval: 5000,
                width: size.width,
                height: size.height
            }

            angular.element(element).css({
                width: settings.width,
                height: settings.height,
                position: 'relative',
                overflow: 'hidden'
            });

            angular.element('> *', element).css({
                position: 'absolute',
                width: settings.width,
                height: settings.height
            });

            var Slides = angular.element('> *', element).length;
            Slides = Slides - 1;
            var ActSlide = Slides;

            var jQslide = angular.element('> *', element);

            $interval.cancel($scope.intval);        // clear interval
            $scope.intval = $interval(function () {
                window.setTimeout(function () {
                    // clear interval if current page is not home page
                    if ($scope.bodyClass != 'homepage') { $interval.cancel($scope.intval); return; };
                    jQslide.eq(ActSlide).fadeOut(settings.speed);

                    if (ActSlide <= 0) {
                        ActSlide = Slides;
                        jQslide.eq(ActSlide).fadeIn(settings.speed, function () { jQslide.fadeIn(); });
                    } else {
                        ActSlide = ActSlide - 1;
                        jQslide.eq(ActSlide).css({ opacity: 1 });
                    }
                }, 0);
            }, settings.interval, 0, false);
        }

        startSlider();
    }
})();