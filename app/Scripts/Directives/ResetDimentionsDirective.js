angular.module('TrippismUIApp').directive('resetDimentions', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        controller: function () {
        },
        link: function (scope, elem, attrs) {
            scope.$on("columnLayoutChanged", function (e, d) {
                switch (d) {
                    case "WeatherData": {
                        $(elem).find(".column-1").addClass('newouterDiv');
                        break;
                    };
                    case "farerangeInfo":
                    case "fareforcastinfo": {
                        $(elem).find(".column-2").addClass('newouterDiv');
                        break;
                    };
                }
            });
        }
    };
}]);
