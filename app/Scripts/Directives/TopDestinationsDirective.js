//Not In used
angular.module('TrippismUIApp').directive('topdestinationPopup', ['$rootScope', '$compile', '$filter', 'UtilFactory', function ($rootScope, $compile, $filter, UtilFactory) {
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

            //scope.showallrecord = function () {
            //    scope.recordshow = scope.destinationsParams.length;
            //    scope.showAllDestinations = true;
            //    scope.topdestinationlist = scope.destinationsParams.slice(0, scope.recordshow);
            //};
            scope.topdestinationclick = function (item) {

                var OriginairportName = _.find(scope.airportlist, function (airport) {
                    return airport.airport_Code == scope.$parent.Origin.toUpperCase()
                });
                var DestinationairportName = _.find(scope.airportlist, function (airport) {
                    return airport.airport_Code == item.topdestinationFareInfo.DestinationLocation
                });

                var dataForecast = {
                    "Origin": scope.$parent.Origin.toUpperCase(),
                    "DepartureDate": $filter('date')(item.topdestinationFareInfo.DepartureDateTime, 'yyyy-MM-dd'),
                    "ReturnDate": $filter('date')(item.topdestinationFareInfo.ReturnDateTime, 'yyyy-MM-dd'),
                    "Destination": item.topdestinationFareInfo.DestinationLocation
                };

                $rootScope.$broadcast('EmptyFareForcastInfo', {
                    Origin: OriginairportName.airport_CityName,
                    Destinatrion: DestinationairportName.airport_Code,
                    Fareforecastdata: dataForecast,
                    mapOptions: item.topdestinationFareInfo,
                    OriginairportName: OriginairportName,
                    DestinationairportName: DestinationairportName,
                    DestinationList: scope.destinations,
                    AvailableAirports: scope.airportlist,
                    AvailableAirline: scope.airlineJsonData
                });
            };
            scope.GetCurrencySymbol = function (code) {
                return UtilFactory.GetCurrencySymbol(code);
            }
        }
    }
}]);
