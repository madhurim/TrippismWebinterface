﻿angular.module('TrippismUIApp').directive('resetDimentions', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        controller: function () {
        },
        link: function (scope, elem, attrs) {
            // console.log("calling reset directive" + new Date());
            scope.$on("columnLayoutChanged", function (e, d) {
                //console.log(d.columnData);
                //var seasonalityfarerangewidgetInfo = d.columnData.seasonalityfarerangewidgetInfo;
                var fareforcastinfo = d.columnData.fareforcastinfo;
                var farerangeInfo = d.columnData.farerangeInfo;
                var WeatherData = d.columnData.WeatherData;
                //var weatherwidgetInfo = d.columnData.weatherwidgetInfo;

                var isCol2Visible = (farerangeInfo.isVisible || fareforcastinfo.isVisible); // (seasonalityfarerangewidgetInfo.isVisible); //||
                var isCol1Visible = (WeatherData.isVisible); //weatherwidgetInfo.isVisible || 
                var delay = 2000;
                $(elem).show();
                var totalWidth = $(elem).width();
                var windowWidth = $(window).width();

                if (!isCol2Visible && isCol1Visible) {
                    $timeout(function () {
                        $(elem).find(".column-2").hide();
                        $(elem).find(".column-1").addClass('padding-0');
                        $(elem).addClass('newouterDiv');
                        //if (windowWidth > 600) {
                        //    $(elem).css({ width: "47%" }); //"545px"
                        //     $(elem).find(".column-1").removeClass("col-md-5 col-sm-5").addClass("col-md-12 col-sm-12");
                        //     $(elem).find('.popup-box').css({ width: "95%" });
                        //}
                    }, delay, true);
                }
                else if (isCol2Visible && !isCol1Visible) {
                    $(elem).find(".column-1").hide();
                    $(elem).find(".column-2").addClass('padding-0');
                    $(elem).addClass('newouterDiv');
                    //$timeout(function () {
                    //    if (windowWidth >= 600) {
                    //        $(elem).css({ width: "62%" }); //766px
                    //        $(elem).find(".column-2").removeClass("col-md-7 col-sm-7").addClass("col-md-12 col-sm-12");
                    //        $(elem).find('.popup-box').css({ width: "95%" });
                    //        console.log("isCol1Visible  " + isCol1Visible + "  width > 1360");
                    //    }
                    //}, 0, true);
                }
                else if (isCol2Visible && isCol1Visible) {
                    $timeout(function () {
                        $(elem).find(".column-1").addClass('newouterDiv');
                        $(elem).find(".column-2").addClass('newouterDiv');
                        //$(elem).addClass('newouterDiv');
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
