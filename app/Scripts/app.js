var TrippismUIApp = angular.module('TrippismUIApp',
[
  'ui.router',
  'ui.bootstrap',
  'ui.map',
  'cgBusy',
  'ngRoute',
  'ui-rangeSlider'
]);

TrippismUIApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/home').otherwise('/home');
    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'Views/Home.html'
        })
        .state('destinations', {
            url: '/destinations/*path',
            templateUrl: 'Views/destinations.html'
        })
        .state('destination', {
            url: '/destination/*path',
            templateUrl: 'Views/destination.html'
        })
        .state('FAQs', {
            url: '/FAQs',
            templateUrl: 'Views/FAQs.html'
        });
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

angular.module('TrippismUIApp').directive('allowOnlyDateInputs', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs, ctrl) {
            elm.on('keydown', function (event) {
                if (event.which == 64 || event.which == 16) {
                    // to allow shift  
                    return false;
                } else if (event.which >= 112 && event.which <= 123) {
                    // to Function Keys  
                    return true;
                } else if (event.which >= 48 && event.which <= 57) {
                    // to allow numbers  
                    return true;
                } else if (event.which >= 96 && event.which <= 105) {
                    // to allow numpad number  
                    return true;
                } else if ([8, 9, 13, 17, 27, 35, 36, 37, 38, 39, 40, 44, 46, 109, 110, 111, 173, 189, 190, 191].indexOf(event.which) > -1) {
                    // to allow backspace,Tab, enter, cntrl, escape, Home, End, left, up, right, down, printscreen, delete, Numpad -, Numpad ., Numpad /, firfox -, all other -, ., /
                    return true;
                } else {
                    event.preventDefault();
                    // to stop others  
                    return false;
                }
            });
        }
    }
});

angular.module('TrippismUIApp').directive('srcError', function () {
    return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
            elm.bind('error', function () {
                angular.element(this).attr("src", attrs.srcError);
            });
        }
    }
});

// for refreshing the datepicker when needed
angular.module('ui.bootstrap.datepicker')
    .config(function ($provide) {
        $provide.decorator('datepickerDirective', ['$delegate', function ($delegate) {
            var directive = $delegate[0];
            var link = directive.link;
            directive.compile = function () {
                return function (scope, element, attrs, ctrls) {
                    link.apply(this, arguments);
                    var datepickerCtrl = ctrls[0];
                    var ngModelCtrl = ctrls[1];
                    if (ngModelCtrl) {
                        // brodcast refreshDatepickers to refresh datepicker
                        scope.$on('refreshDatepickers', function refreshView(event, args) {
                            datepickerCtrl.activeDate = args;   // setting date of datepicker
                            datepickerCtrl.refreshView();
                        });
                    }
                }
            };
            return $delegate;
        }]);
    });


var constants = {
    HighChartDateFormat: '%m-%e-%Y',
    HighChartTwoDecimalCurrencyFormat: '{point.y:.2f}',
    MaxLOS: 16,

    attractionTabMapStyle: [{ "featureType": "landscape", "stylers": [{ "hue": "#FFBB00" }, { "saturation": 43.400000000000006 }, { "lightness": 37.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.highway", "stylers": [{ "hue": "#FFC200" }, { "saturation": -61.8 }, { "lightness": 45.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.arterial", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 51.19999999999999 }, { "gamma": 1 }] }, { "featureType": "road.local", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 52 }, { "gamma": 1 }] }, { "featureType": "water", "stylers": [{ "hue": "#0078FF" }, { "saturation": -13.200000000000003 }, { "lightness": 2.4000000000000057 }, { "gamma": 1 }] }, { "featureType": "poi", "stylers": [{ "hue": "#00FF6A" }, { "saturation": -1.0989010989011234 }, { "lightness": 11.200000000000017 }, { "gamma": 1 }] }],
    //destinationSearchMapSyle: [{ "featureType": "landscape", "stylers": [{ "hue": "#FFBB00" }, { "saturation": 43.400000000000006 }, { "lightness": 37.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.highway", "stylers": [{ "hue": "#FFC200" }, { "saturation": -61.8 }, { "lightness": 45.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.arterial", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 51.19999999999999 }, { "gamma": 1 }] }, { "featureType": "road.local", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 52 }, { "gamma": 1 }] }, { "featureType": "water", "stylers": [{ "hue": "#0078FF" }, { "saturation": -13.200000000000003 }, { "lightness": 2.4000000000000057 }, { "gamma": 1 }] }, { "featureType": "poi", "stylers": [{ "hue": "#00FF6A" }, { "saturation": -1.0989010989011234 }, { "lightness": 11.200000000000017 }, { "gamma": 1 }] }],
    destinationSearchMapSyle: [{ "featureType": "all", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative.country", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "lightness": "1" }, { "visibility": "on" }, { "color": "#bbbbbb" }] }, { "featureType": "administrative.country", "elementType": "labels", "stylers": [{ "lightness": "65" }, { "visibility": "on" }] }, { "featureType": "administrative.country", "elementType": "labels.text", "stylers": [{ "weight": "1" }, { "visibility": "simplified" }, { "saturation": "0" }, { "lightness": "40" }] }, { "featureType": "administrative.province", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative.locality", "elementType": "all", "stylers": [{ "hue": "#0049ff" }, { "saturation": 7 }, { "lightness": "0" }, { "visibility": "off" }] }, { "featureType": "administrative.locality", "elementType": "geometry", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative.neighborhood", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative.land_parcel", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": "100" }, { "visibility": "off" }, { "color": "#fcfcfc" }, { "weight": "1" }] }, { "featureType": "landscape.man_made", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape.natural", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "hue": "#ff0000" }, { "saturation": -100 }, { "lightness": 100 }, { "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "hue": "#bbc0c4" }, { "saturation": -93 }, { "lightness": 31 }, { "visibility": "simplified" }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "hue": "#bbc0c4" }, { "saturation": -93 }, { "lightness": 31 }, { "visibility": "on" }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "labels", "stylers": [{ "hue": "#bbc0c4" }, { "saturation": -93 }, { "lightness": -2 }, { "visibility": "simplified" }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "hue": "#e9ebed" }, { "saturation": -90 }, { "lightness": -8 }, { "visibility": "simplified" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "hue": "#007fff" }, { "saturation": 10 }, { "lightness": 69 }, { "visibility": "off" }] }, { "featureType": "transit.line", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.station", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.station.airport", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "transit.station.bus", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "transit.station.rail", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "saturation": -78 }, { "lightness": 67 }, { "visibility": "simplified" }, { "color": "#91B7CF" }] }],
    refineSearchLocalStorage: 'refineSearchStorage',
    //DestinationImagePath: 'http://content.trippism.com/images/destinations/',
    DestinationImagePath: '../images/destination/'
};

TrippismUIApp.constant('TrippismConstants', constants);
