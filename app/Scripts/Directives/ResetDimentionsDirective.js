angular.module('TrippismUIApp').directive('resetDimentions', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
    return {
        restrict: 'EA',
         
        link: function (scope, elem, attrs) {
          console.log("calling reset directive"+ new Date());
            scope.$on("columnLayoutChanged", function(e,d){
                console.log(d.columnData);
                var seasonalityfarerangewidgetInfo = d.columnData.seasonalityfarerangewidgetInfo;
                var farerangeInfo = d.columnData.farerangeInfo;
                var WeatherData = d.columnData.WeatherData;
                var weatherwidgetInfo = d.columnData.weatherwidgetInfo;
                
                var isCol2Visible = (seasonalityfarerangewidgetInfo.isVisible || farerangeInfo.isVisible);
                var isCol1Visible = (weatherwidgetInfo.isVisible || WeatherData.isVisible);
              //  console.log("isCol2Visible  " + isCol2Visible);
              //  console.log("isCol1Visible  " + isCol1Visible);
                var delay = 2000;
                 $(elem).show();
                 var totalWidth = $(elem).width();
                 var windowWidth = $(window).width();
               
                if(!isCol2Visible && isCol1Visible){
                    $timeout(function(){
                         $(elem).find(".column-2").hide();
                          $(elem).addClass('newouterDiv');
                         if (windowWidth > 600) {
                             $(elem).css({ width: "47%" }); //"545px"
                              $(elem).find(".column-1").removeClass("col-md-5 col-sm-5").addClass("col-md-12 col-sm-12");
                              $(elem).find('.popup-box').css({ width: "95%" });
                         }
                    },delay,true);
                }
                else if (isCol2Visible && !isCol1Visible) {
                    $(elem).find(".column-1").hide();
                    $(elem).addClass('newouterDiv');
                    $timeout(function () {
                        if (windowWidth >= 600) {
                            $(elem).css({ width: "62%" }); //766px
                            $(elem).find(".column-2").removeClass("col-md-7 col-sm-7").addClass("col-md-12 col-sm-12");
                            $(elem).find('.popup-box').css({ width: "95%" });
                            console.log("isCol1Visible  " + isCol1Visible + "  width > 1360");
                        }
                        //else if (windowWidth > 600 && windowWidth < 1360) {
                        //    $(elem).css({ width: "600px" });
                        //    $(elem).find(".column-2").removeClass("col-md-7 col-sm-7").addClass("col-md-12 col-sm-12");
                        //    $(elem).find('.popup-box').css({ width: "525px" });
                        //    console.log("isCol1Visible  " + isCol1Visible + "  between width 600 and 1360 ");
                        //}
                    }, 0, true);
                }
                else if(isCol2Visible && isCol1Visible){
                    $timeout(function(){
                        $(elem).addClass('newouterDiv');
                    },delay);
                }
                else if(!isCol2Visible && !isCol1Visible){
                    $timeout(function(){
                         $(elem).hide();
                    },delay);
                }
            });
        }
    };
}]);
