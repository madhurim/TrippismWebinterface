//Not In used
angular.module('TrippismUIApp').directive('topdestinationPopup', [ 'UtilFactory', function ( UtilFactory) {
    return {
        restrict: 'E',
        scope: {
            destinationsParams: '=',
            destinations: "=destinations",
            airportlist: "=airportlist",
            airlineJsonData: "=airlinejsondata",
        },
        templateUrl: '/Views/Partials/TopDestinationsPartial.html',
        link: function (scope, elem, attrs) {
            scope.topdestinationflg = true;
            scope.showAllDestinations = false;
            scope.topdestinationlist = [];
            scope.recordshow = 5;
            scope.$watch('destinationsParams',
             function (newValue, oldValue) {
                 if (newValue != oldValue && scope.destinationsParams.length > 0)
                     scope.topdestinationlist = scope.destinationsParams;
                     //scope.topdestinationlist = scope.destinationsParams.slice(0, scope.recordshow);
                 loadScrollbars();
             }
           );
            scope.topdestinationclick = function (item) {

               
            };
            scope.GetCurrencySymbol = function (code) {
                return UtilFactory.GetCurrencySymbol(code);
            }
        }
    }
}]);
