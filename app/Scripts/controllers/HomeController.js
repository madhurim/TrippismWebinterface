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
            //function ScaleSlider() {
            //    debugger;
            //    var refSize = JassorSlider.$Elmt.parentNode.clientWidth;
            //    if (refSize) {
            //        //refSize = Math.min(refSize, 600);
            //        JassorSlider.$ScaleWidth(refSize);

            //        var boxwrap = angular.element("#destination-boxwrap");
            //        var height = boxwrap.css('height');
            //        if (w.width() <= 767)
            //            height = "365px"
            //        angular.element('#jssor_slider, #jssor_slider div').css({ height: height });
            //    }
            //    else {
            //        window.setTimeout(ScaleSlider, 30);
            //    }
            //}
            //var width;
            function setJssorSliderSize() {
                var boxwrap = angular.element("#destination-boxwrap");
                var height = boxwrap.css('height');
                if (w.width() <= 767)
                    height = "365px"
                //width = parseInt(boxwrap.css('width').replace("px", ''));
                angular.element('#jssor_slider, #jssor_slider div').css({ width: boxwrap.css('width'), height: height });
                //JassorSlider.$ScaleWidth(parseInt(boxwrap.css('width').replace("px", ''), parseInt(height.replace("px", ''))));                
                //_.each(angular.element('#jssor_slider div.item'), function (item) {
                //    debugger;
                //    if (angular.element(item).css('transform') != "none") {
                //        var css = eval(angular.element(item).css('transform'));
                //        angular.element(item).css({ transform: css })
                //    }
                //});
            }

            function matrix(a, b, c, d, e, f) {
                //var arr = [a, b, c, d, e < 0 ? -width : width, f];
                //return ('matrix(' + arr.join(',') + ')');
                var arr = [0 + 'px', e < 0 ? -width + 'px' : width + 'px', 0 + 'px'];
                return 'translate3d(' + arr.join(',') + ')';
            }

            setJssorSliderSize();
            $Jssor$.$AddEvent(window, "resize", setJssorSliderSize);
            $Jssor$.$AddEvent(window, "orientationchange", setJssorSliderSize);
        };
        initJassorSlider();
        // [E] Jssor slider
    }
})();