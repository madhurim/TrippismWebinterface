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
            interval: 4000,
            pause: false
        })

        LocalStorageFactory.clear(TrippismConstants.refineSearchLocalStorage);
        // --- Ends----


        // [S] Jssor slider
        function setJssorSliderSize() {
            var boxwrap = angular.element("#destination-boxwrap");
            angular.element('#jssor_slider, #jssor_slider div').css({ width: boxwrap.css('width'), height: boxwrap.css('height') });
        }

        var initJassorSlider = function () {
            var slideshowTransitions = [
              { $Duration: 4000, $Opacity: 2 }
            ];

            var jssorOptions = {
                $AutoPlay: true,
                $SlideshowOptions: {
                    $Class: $JssorSlideshowRunner$,
                    $Transitions: slideshowTransitions,
                    $TransitionsOrder: 1
                }
            };

            var JassorSlider = new $JssorSlider$("jssor_slider", jssorOptions);

            function ScaleSlider() {
                var refSize = JassorSlider.$Elmt.parentNode.clientWidth;
                if (refSize) {
                    refSize = Math.min(refSize, 600);
                    JassorSlider.$ScaleWidth(refSize);
                }
                else {
                    window.setTimeout(ScaleSlider, 30);
                }
            }
            $Jssor$.$AddEvent(window, "resize", setJssorSliderSize);
        };

        setJssorSliderSize();
        initJassorSlider();
        // [E] Jssor slider
    }
})();