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
            templateUrl: 'views/home.html'
        })
        .state('destinations', {
            url: '/destinations/*path',
            templateUrl: 'views/destinations.html'
        })
        .state('destination', {
            url: '/destination/*path',
            templateUrl: 'views/destination.html'
        })
        .state('FAQs', {
            url: '/FAQs',
            templateUrl: 'views/faqs.html'
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