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

        // set page height based on window's height
        var w = angular.element($window);
        var pageHeight;
        var pageWidth;
        function setPageHeight() {
            var boxwrap = angular.element("#destination-boxwrap");
            var h50px = angular.element("#h50px");
            pageHeight = w.height() - h50px.height();
            pageWidth = boxwrap.width();
            boxwrap.height(pageHeight);
        }

        setPageHeight();
        w.bind('resize', function () {
            setPageHeight();
            setSliderSize();
            jssor_1_slider_init();
        });

        angular.element('#carousel').carousel({
            interval: 4000,
            pause: false
        })

        LocalStorageFactory.clear(TrippismConstants.refineSearchLocalStorage);
        // --- Ends----


        function setSliderSize() {
            angular.element('#jssor_slider, #jssor_1').css({ width: pageWidth + 'px', height: pageHeight + 'px' });
        }

        var jssor_1_slider_init = function () {
            var jssor_1_SlideshowTransitions = [
              { $Duration: 4000, $Opacity: 2 }
            ];

            var jssor_1_options = {
                $AutoPlay: true,
                $SlideshowOptions: {
                    $Class: $JssorSlideshowRunner$,
                    $Transitions: jssor_1_SlideshowTransitions,
                    $TransitionsOrder: 1
                }
            };

            var jssor_1_slider = new $JssorSlider$("jssor_slider", jssor_1_options);
        };

        setSliderSize();
        jssor_1_slider_init();
    }
})();