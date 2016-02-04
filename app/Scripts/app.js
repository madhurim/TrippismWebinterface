var TrippismUIApp = angular.module('TrippismUIApp',
[
  'ui.router',
  'ui.bootstrap',
  'ui.map',
  'ui.event',
  //'blockUI',
  'cgBusy',
  'ngRoute',
  'ui-rangeSlider'
]);

TrippismUIApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/home').otherwise('/home');
    $stateProvider
        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/home',
            templateUrl:'Views/Home.html'
        })
        .state('destinations', {
            url: '/destinations',
            templateUrl: 'Views/destination.html'
        })
        .state('destination', {
             url: '/destination/*path',
             templateUrl: 'Views/destination.html'
         })
}]);

TrippismUIApp.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}]);

TrippismUIApp.directive("reportMyHeight", ['$timeout', '$window', function ($timeout, $window) {
    return {
        restrict: 'A',
        scope: {
            param: '=',
            paramtab: '=',
            isShowSearchIcon: '='
        },
        link: function (scope, element, attr) {
            scope.$watchCollection('param', function (newValue, oldValue) {
                return $timeout(function () {
                    var mapid = angular.element(document.getElementById('mainmap'));
                    mapid.css({
                        top: element[0].offsetHeight > 1000 ? 0 + 'px' : element[0].offsetHeight + 'px',
                    });
                    scope.isShowSearchIcon = false;
                    scope.isShowSearchIcon = true;
                    console.log('offsetHeight = ' + element[0].offsetHeight);
                }, false);
            });
            scope.$watchCollection('paramtab.tabItems', function (newValue, oldValue) {
                return $timeout(function () {
                    var mapid = angular.element(document.getElementById('mainmap'));
                    mapid.css({
                        top: newValue.length > oldValue.length ? 0 + 'px' : element[0].offsetHeight + 'px',
                    });
                    console.log('offsetHeight = ' + element[0].offsetHeight);
                }, false);
            });

            var w = angular.element($window);
            w.bind('resize', function () {
                setMapPosition();
                setIwCloseButtonPositionFn();
            });

            scope.$watchGroup(['refineSearchValues.Theme', 'refineSearchValues.Region', 'refineSearchValues.Maxfare', 'refineSearchValues.Minfare'], function () {
                setMapPosition();
            });

            function setMapPosition() {
                return $timeout(function () {
                    var mapid = angular.element(document.getElementById('mainmap'));
                    var top = mapid.css('top');
                    if (top != element[0].offsetHeight + 'px') {
                        mapid.css({
                            top: element[0].offsetHeight + 'px',
                        });
                    }
                }, false);
            }

            // set position of infowindow close button
            function setIwCloseButtonPositionFn() {
                return $timeout(function () {
                    var iwOuter = angular.element(document.getElementsByClassName('gm-style-iw'));
                    iwOuter.parent().css({ width: iwOuter.css('width'), maxWidth: iwOuter.css('width') });
                }, 100, false);
            }
        }
    };
}]);
TrippismUIApp.directive("scroll", function ($window) {
    return function (scope, element, attrs) {
        angular.element($window).bind("scroll", function () {
            if (this.pageYOffset >= 5) {
                scope.EnableScroll = true;
            } else {
                scope.EnableScroll = false;
            }
            scope.$apply();
        });
    };
});

TrippismUIApp.filter('limit', function () {
    return function (input, value) {
        return input.substr(0, value);
    }
});
// filter for getting floor value
TrippismUIApp.filter('floor', function () {
    return function (input) {
        return Math.floor(input);
    };
});
// pad 0 if 1 digit number
TrippismUIApp.filter('twoDigit', function () {
    return function (input) {
        return input < 10 ? '0' + input : input;
    };
});
TrippismUIApp.directive('infowindow', function () {
    return {
        restrict: 'E',
        templateUrl: 'Views/Partials/infowindowpartial.html',
        scope: {
            markerData: '='
        },
        link: function (scope) {
        }
    }
});

TrippismUIApp.directive('onCarouselChange', function ($parse) {
    return {
        require: 'carousel',
        link: function (scope, element, attrs, carouselCtrl) {
            var fn = $parse(attrs.onCarouselChange);
            var origSelect = carouselCtrl.select;
            carouselCtrl.select = function (nextSlide, direction) {
                if (nextSlide !== this.currentSlide) {
                    fn(scope, {
                        nextSlide: nextSlide,
                        direction: direction,
                    });
                }
                return origSelect.apply(this, arguments);
            };
        }
    }
});




var constants = {
    googlePlacesApiKey: "AIzaSyC0CVNlXkejEzLzGCMVMj8PZ7gBzj8ewuQ",
    DefaultLenghtOfStay: 4,
    YouTubeEmbedUrl: "//www.youtube.com/embed/",
    HighChartDateFormat: '%m-%e-%Y',
    HighChartTwoDecimalCurrencyFormat: '{point.y:.2f}',


    attractionTabMapStyle: [{ "featureType": "landscape", "stylers": [{ "hue": "#FFBB00" }, { "saturation": 43.400000000000006 }, { "lightness": 37.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.highway", "stylers": [{ "hue": "#FFC200" }, { "saturation": -61.8 }, { "lightness": 45.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.arterial", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 51.19999999999999 }, { "gamma": 1 }] }, { "featureType": "road.local", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 52 }, { "gamma": 1 }] }, { "featureType": "water", "stylers": [{ "hue": "#0078FF" }, { "saturation": -13.200000000000003 }, { "lightness": 2.4000000000000057 }, { "gamma": 1 }] }, { "featureType": "poi", "stylers": [{ "hue": "#00FF6A" }, { "saturation": -1.0989010989011234 }, { "lightness": 11.200000000000017 }, { "gamma": 1 }] }],
    destinationSearchMapSyle: [{ "featureType": "landscape", "stylers": [{ "hue": "#FFBB00" }, { "saturation": 43.400000000000006 }, { "lightness": 37.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.highway", "stylers": [{ "hue": "#FFC200" }, { "saturation": -61.8 }, { "lightness": 45.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.arterial", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 51.19999999999999 }, { "gamma": 1 }] }, { "featureType": "road.local", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 52 }, { "gamma": 1 }] }, { "featureType": "water", "stylers": [{ "hue": "#0078FF" }, { "saturation": -13.200000000000003 }, { "lightness": 2.4000000000000057 }, { "gamma": 1 }] }, { "featureType": "poi", "stylers": [{ "hue": "#00FF6A" }, { "saturation": -1.0989010989011234 }, { "lightness": 11.200000000000017 }, { "gamma": 1 }] }],
    destSearchURL: "/destinations"
};

TrippismUIApp.constant('TrippismConstants', constants);
