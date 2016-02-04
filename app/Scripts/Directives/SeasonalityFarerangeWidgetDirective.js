angular.module('TrippismUIApp').directive('seasonalityfarerangewidgetInfo',
                ['$compile', 'SeasonalityFactory', 'FareRangeFactory', '$filter', '$timeout', '$rootScope', 'UtilFactory', 'TrippismConstants',
    function ($compile, SeasonalityFactory, FareRangeFactory, $filter, $timeout, $rootScope, UtilFactory, TrippismConstants) {
        return {
            restrict: 'E',
            scope: {
                widgetParams: '=',
            },
            templateUrl: '/Views/Partials/SeasonalityFarerangeWidget.html',
            link: function (scope, elem, attrs) {
                
                var isVisible = false; // this determines the widget visibility according to different arameters
                var isVisibilityRecorded = false;
                scope.IsWidgetClosed = true;
                scope.formats = Dateformat();
                scope.format = scope.formats[5];
                scope.closeWidget = function () {
                    scope.IsWidgetClosed = false;
                }

                scope.SeasonalityWidgetData = undefined;
                scope.SeasonalityWidgetDataFound = false;

                scope.loadSeasonalityInfo = function () {
                    scope.SeasonalityWidgetDataFound = false;
                    if (scope.widgetParams != undefined) {
                        scope.SeasonalityData = scope.widgetParams.SeasonalityData;
                        if (scope.SeasonalityData != undefined && scope.SeasonalityData != "")
                            setSeasonalityData();
                    }
                };

                function setSeasonalityData() {
                    // replace(/-/g, "/") used because of safari date convert problem
                    var FrmDate = new Date(scope.widgetParams.Fareforecastdata.DepartureDate.split('T')[0].replace(/-/g, "/"));
                    var Todate = new Date(scope.widgetParams.Fareforecastdata.ReturnDate.split('T')[0].replace(/-/g, "/"))
                    var Frmmonth = FrmDate.getMonth() + 1;
                    var Tomonth = Todate.getMonth() + 1;
                    var Fromweeks = _.filter(scope.SeasonalityData, function (dt) {
                        return (new Date(dt.WeekStartDate.split('T')[0].replace(/-/g, "/")).getMonth() + 1) == Frmmonth;
                    });
                    Fromweeks = Fromweeks.concat(_.filter(scope.SeasonalityData, function (dt) {
                        return (new Date(dt.WeekStartDate.split('T')[0].replace(/-/g, "/")).getMonth() + 1) == (Frmmonth - 1) == 0 ? 12 : Frmmonth - 1;
                    }));

                    if (Frmmonth != Tomonth) {
                        var ToWeeks = _.filter(scope.SeasonalityData, function (dt) {
                            return (new Date(dt.WeekStartDate.split('T')[0].replace(/-/g, "/")).getMonth() + 1) == Tomonth;
                        });
                        Fromweeks = Fromweeks.concat(ToWeeks);
                    }
                    var chartrec = _.sortBy(Fromweeks, 'WeekStartDate');
                    for (i = 0; i < chartrec.length; i++) {
                        // replace(/-/g, "/") used because of safari date convert problem
                        var WeekStartDate = new Date(chartrec[i].WeekStartDate.split('T')[0].replace(/-/g, "/"));
                        var WeekEndDate = new Date(chartrec[i].WeekEndDate.split('T')[0].replace(/-/g, "/"));
                        //if (WeekStartDate.getMonth() + 1 >= FrmDate.getMonth() + 1) {
                            //if (WeekStartDate >= FrmDate && WeekStartDate <= Todate) // this condition commented becase sabre first week adjust like first week on 2016 is (29-12-2015 to 10-01-2016)
                        if (FrmDate >= WeekStartDate && FrmDate <= WeekEndDate)
                            //  if (FrmDate.getDate() >= WeekStartDate.getDate() && (FrmDate.getDate() <= WeekEndDate.getDate() || FrmDate.getMonth() + 1 < WeekEndDate.getMonth() + 1)) 
                        {
                            var SeasonalityIndicator = "";
                            if (chartrec[i].SeasonalityIndicator == "High")
                                NumberOfObervations = 3;
                            if (chartrec[i].SeasonalityIndicator == "Medium")
                                NumberOfObervations = 2;
                            if (chartrec[i].SeasonalityIndicator == "Low")
                                NumberOfObervations = 1;
                            scope.SeasonalityWidgetData = {
                                NoofIcons: NumberOfObervations
                            };
                            scope.SeasonalityWidgetDataFound = true;
                            return;
                        }
                    }
                }
                scope.FareRangeWidgetDataFound = false;
                scope.loadfareRangeInfo = function () {
                    scope.FareRangeWidgetDataFound = false;
                    if (scope.widgetParams != undefined) {
                        scope.fareRangeData = scope.widgetParams.FareRangeData;
                        if (scope.fareRangeData != undefined && scope.fareRangeData != "") {
                            // replace(/-/g, "/") used because of safari date convert problem
                            var FrmDate = new Date(scope.widgetParams.Fareforecastdata.DepartureDate.split('T')[0].replace(/-/g, "/"));
                            var Todate = new Date(scope.widgetParams.Fareforecastdata.ReturnDate.split('T')[0].replace(/-/g, "/"));
                            for (i = 0; i < scope.fareRangeData.FareData.length; i++) {
                                var WeekStartDate = new Date(scope.fareRangeData.FareData[i].DepartureDateTime.split('T')[0].replace(/-/g, "/"));
                                if (WeekStartDate >= FrmDate && WeekStartDate <= Todate) {
                                    scope.FareRangeWidgetData = {
                                        MinimumFare: scope.fareRangeData.FareData[i].MinimumFare,
                                        MaximumFare: scope.fareRangeData.FareData[i].MaximumFare,
                                        MedianFare: scope.fareRangeData.FareData[i].MedianFare,
                                        CurrencyCode: UtilFactory.GetCurrencySymbol(scope.fareRangeData.FareData[i].CurrencyCode)
                                    };
                                    scope.FareRangeWidgetDataFound = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (scope.FareRangeWidgetDataFound == false) {
                        angular.element('.fareDiv').addClass('fareDiv1');
                    } else {
                        angular.element('.fareDiv').removeClass('fareDiv1');
                    }
                };

                scope.$watch('widgetParams.FareRangeData', function (newValue, oldval) {
                    if (newValue != undefined) {
                        scope.loadfareRangeInfo();
                       
                    }
                });

                scope.$watch('widgetParams.SeasonalityData', function (newValue, oldval) {
                    if (newValue != undefined){
                      //  console.log('in season widget' + new Date());
                            scope.loadSeasonalityInfo();
//                            alert(scope.SeasonalityWidgetDataFound)
                            if(!isVisibilityRecorded){
                                isVisibilityRecorded = true;
                                isVisible = (scope.FareRangeWidgetDataFound || scope.SeasonalityWidgetDataFound ) && scope.IsWidgetClosed;
                                scope.$emit('widgetLoaded', {name : "seasonalityfarerangewidgetInfo", isVisible : isVisible });
                                console.log("seasonalityfarerangewidgetInfo data sent..");
                        }
                            
                    }
                    
                    
                });
                scope.$watchGroup(['widgetParams'], function (newValue, oldValue, scope) {
                    if (scope.widgetParams != undefined) {
                        scope.DepartDate = $filter('date')(scope.widgetParams.Fareforecastdata.DepartureDate, scope.format, null);
                        scope.ReturnDate = $filter('date')(scope.widgetParams.Fareforecastdata.ReturnDate, scope.format, null);
                    }
                });
            }
        }
    }]);