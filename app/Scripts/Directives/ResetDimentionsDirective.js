angular.module('TrippismUIApp').directive('resetDimentions', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        controller: function () {
        },
        link: function (scope, elem, attrs) {
            scope.$on("columnLayoutChanged", function (e, d) {
                var fareforcastinfo = d.columnData.fareforcastinfo;
                var farerangeInfo = d.columnData.farerangeInfo;
                var WeatherData = d.columnData.WeatherData;

                var isCol2Visible = (farerangeInfo.isVisible || fareforcastinfo.isVisible);
                var isCol1Visible = (WeatherData.isVisible);
                var delay = 2000;
                $(elem).show();
                var totalWidth = $(elem).width();
                var windowWidth = $(window).width();

                if (!isCol2Visible && isCol1Visible) {
                    $timeout(function () {
                        $(elem).find(".column-2").hide();
                        $(elem).find(".column-1").addClass('padding-0');
                        $(elem).addClass('newouterDiv');
                    }, delay, true);
                }
                else if (isCol2Visible && !isCol1Visible) {
                    $(elem).find(".column-1").hide();
                    $(elem).find(".column-2").addClass('padding-0');
                    $(elem).addClass('newouterDiv');
                }
                else if (isCol2Visible && isCol1Visible) {
                    $timeout(function () {
                        $(elem).find(".column-1").addClass('newouterDiv');
                        $(elem).find(".column-2").addClass('newouterDiv');
                    }, delay);
                }
                else if (!isCol2Visible && !isCol1Visible) {
                    $timeout(function () {
                        $(elem).hide();
                    }, delay);
                }
            });
        }
    };
}]);
