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
            'UtilFactory',
             HomeController]);
    function HomeController(
       $scope,
       $window,
       $timeout,
       LocalStorageFactory,
       TrippismConstants,
       $interval,
       UtilFactory
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

        function loadDestinationCard() {
            UtilFactory.ReadLocationPairJson().then(function (data) {
                if (data && data.length) {
                    var display = 6;
                    var displayNonUS = display / 3;
                    var displayUs = display - (display / 3);
                    $scope.destinationRequestList = [];
                    var random;
                    var arr = _.partition(data, function (item) { return item.nonUS == true; });    // arr[0] = nonUS list, arr[1] = US list
                    if (arr[0].length)
                        random = _.shuffle(_.sample(arr[0], displayNonUS).concat(_.sample(arr[1], displayUs)));    // get 1 nonUS, 2 US and shuffle result
                    else
                        random = _.sample(data, 3);
                    _.each(random, function (item) {
                        var currDate = new Date();
                        var departureDate = new Date(currDate.setMonth(currDate.getMonth() + 1));   // minimun departure date 1 month from current date
                        departureDate = new Date(departureDate.setDate(departureDate.getDate() + (data.indexOf(item) + _.random(1, 9)))); // add random days to departure date
                        var returnDate = new Date(departureDate);
                        returnDate = new Date(returnDate.setDate(returnDate.getDate() + 5));    // set return date 5 days from departure date

                        var request = {
                            origin: item.origin,
                            destination: item.destination,
                            departureDate: ConvertToRequiredDate(departureDate, 'API'),
                            returnDate: ConvertToRequiredDate(returnDate, 'API')
                        };
                        $scope.destinationRequestList.push(request);
                    });
                }
            });
        }

        startSlider();
        loadDestinationCard();
    }
})();