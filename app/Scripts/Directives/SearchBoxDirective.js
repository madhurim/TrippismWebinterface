angular.module('TrippismUIAPP').directive('searchBox',[
            '$location',
            '$modal',
            '$rootScope',
            '$timeout',
            '$filter',
            '$window',
            'DestinationFactory',
            'UtilFactory',
            'FareforecastFactory',
            'SeasonalityFactory',
            'TrippismConstants',
             DestinationController],
function($location,$modal,$rootScope,$timeout,$filter,$window,DestinationFactory,UtilFactory,FareforecastFactory,SeasonalityFactory,TrippismConstants)
{
    return {
        restrict: 'E',
        scope: {
          
        },
        templateUrl: '/Views/Partials/WeatherPartial.html',
        link: function (scope, elem, attrs) {
            $scope.selectedform = 'SuggestDestination';
            $scope.Origin = '';
            $scope.Destination = '';
            $scope.FromDate;
            $scope.ToDate;
        }
    }
});
    
    