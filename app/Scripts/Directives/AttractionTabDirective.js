//Not in Use -Create separat Directive for same DestinationAttractionDirective
angular.module('TrippismUIApp').directive('attractionTab', ['$compile', '$filter', 'WeatherFactory', function ($compile, $filter, WeatherFactory) {
    return {
        restrict: 'E',
        scope: {
            attractionParams: '=',
            homeFn:'&'
        },
        templateUrl: '/Views/Partials/AttractionTabPartial.html',
        link: function (scope, elem, attrs) {
            var seasonalityfarerangewidgetInfo,
            farerangeInfo,
            WeatherData,
            weatherwidgetInfo;

            scope.$on('widgetLoaded', function (event, data) {
                if (data.name === 'seasonalityfarerangewidgetInfo') {
                    seasonalityfarerangewidgetInfo = data;
                } else if (data.name === 'farerangeInfo') {
                    farerangeInfo = data;
                } else if (data.name === 'WeatherData') {
                    WeatherData = data;
                } else if (data.name === 'weatherwidgetInfo') {
                    weatherwidgetInfo = data;
                }
                
                if (seasonalityfarerangewidgetInfo && farerangeInfo && WeatherData && weatherwidgetInfo) {
                    var columnData = {
                        seasonalityfarerangewidgetInfo: seasonalityfarerangewidgetInfo,
                        farerangeInfo: farerangeInfo,
                        weatherwidgetInfo: weatherwidgetInfo,
                        WeatherData: WeatherData
                    };
                    scope.$broadcast("columnLayoutChanged", { columnData: columnData });
                }
            });
        }
    }
}]);
