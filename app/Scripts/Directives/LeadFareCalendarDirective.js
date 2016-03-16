(function () {
    'use strict';
    angular.module('TrippismUIApp').directive('leadFareCalendar', ['$modal', 'uiCalendarConfig', '$timeout', 'UtilFactory', leadFareCalendar]);
    function leadFareCalendar($modal, uiCalendarConfig, $timeout, UtilFactory) {
        return {
            restrict: 'E',
            templateUrl: '/Views/Partials/LeadFareCalendarPartial.html',
            scope: {
                leadFareParams: '='
            },
            controller: ['$scope', 'leadFareCalendarFactory', function ($scope, leadFareCalendarFactory) {
                // source object of calendar
                $scope.leadFareSources = [];
                var pointOfSaleCountry;

                // get lowest fare details for every month
                $scope.getLowestFareDetails = getLowestFareDetails;

                $scope.getFareData = getFareData;
                function getFareData() {
                    pointOfSaleCountry = $scope.leadFareParams.PointOfSaleCountry;
                    // save data from API
                    var leadFareData = [];
                    $scope.leadFareSources = [];
                    var request = {
                        Origin: $scope.leadFareParams.Fareforecastdata.Origin,
                        Destination: $scope.leadFareParams.Fareforecastdata.Destination,
                        PointOfSaleCountry: pointOfSaleCountry,
                        LengthOfStay: getDaysBetweenDates($scope.leadFareParams.SearchCriteria.FromDate, $scope.leadFareParams.SearchCriteria.ToDate)
                    };
                    $scope.LengthOfStay = request.LengthOfStay;
                    leadFareCalendarFactory.Get(request).then(function (data) {
                        if (data.status == 404 || data.status == 400) {
                            $scope.isShowCalendar = false;
                            return;
                        }
                        if (data && data.Price) {
                            $scope.monthYear = [];
                            _.each(data.Price, function (item) {
                                var lowestFare = UtilFactory.GetLowestFareObject(item);
                                if (lowestFare != null && lowestFare.Fare != 0) {
                                    var fareObject = {};
                                    var departureDate = new Date(item.DepartureDateTime);
                                    fareObject.title = Math.ceil(lowestFare.Fare);
                                    fareObject.start = departureDate;
                                    fareObject.destination =
                                        {
                                            AirlineCodes: lowestFare.AirlineCodes,
                                            Fare: Math.ceil(lowestFare.Fare),
                                            CurrencyCode: data.CurrencyCode,
                                            PointOfSaleCountry: pointOfSaleCountry,
                                            LengthOfStay: getDaysBetweenDates($scope.leadFareParams.SearchCriteria.FromDate, $scope.leadFareParams.SearchCriteria.ToDate),
                                            outboundflightstops: lowestFare.outboundflightstops,
                                            inboundflightstops: lowestFare.inboundflightstops
                                        };
                                    var monthObj = { monthIndex: departureDate.getMonth(), year: departureDate.getFullYear() };
                                    var foundObject = _.find($scope.monthYear, function (item) {
                                        return item.monthIndex == monthObj.monthIndex && item.year == monthObj.year
                                    });

                                    if (!foundObject)
                                        $scope.monthYear.push(monthObj);
                                    leadFareData.push(fareObject);
                                }
                            });

                            if (leadFareData.length > 0) {

                                // pushed leadFareData because UI-calendar takes first element of source object for date binding
                                // i.e. $scope.leadFareSources[0] as a datasource
                                $scope.leadFareSources.push(leadFareData);
                                getLowestFareDetails($scope.monthYear);
                                $scope.isShowCalendar = true;
                            }
                            else
                                $scope.isShowCalendar = false;
                        }
                    });
                }

                // used to get length of stay
                function getDaysBetweenDates(date1, date2) {
                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / (oneDay)));
                }

                function getLowestFareDetails(monthYearList) {
                    // set lowest fare object that is bind to view.
                    $scope.lowestFareList = [];
                    var lowestFareList = [];
                    $scope.totalMinFare = 0;
                    _.each(monthYearList, function (currentMonthYear) {
                        var currentMonthFareList = _.filter($scope.leadFareSources[0], function (item) {
                            return (item.start.getMonth() === currentMonthYear.monthIndex && item.start.getFullYear() === currentMonthYear.year)
                        });

                        var fareObj = _.min(currentMonthFareList, function (item) {
                            return item.destination.Fare;
                        });

                        fareObj.currencySymbol = UtilFactory.GetCurrencySymbol(fareObj.destination.CurrencyCode);
                        if ($scope.totalMinFare == 0 || $scope.totalMinFare > fareObj.destination.Fare)
                            $scope.totalMinFare = fareObj.destination.Fare;
                        lowestFareList.push(fareObj);
                    });
                    $scope.lowestFareList = lowestFareList;
                }
            }],
            link: function (scope, elem, attrs) {
                var monthList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

                scope.$watch('leadFareParams', function (newVal) {
                    if (newVal) {
                        scope.getFareData();
                    }
                });

                scope.$watch('isShowCalendar', function (newVal) {
                    if (newVal) {
                        createTabs(scope.monthYear);
                        renderCalendar();
                    }
                });

                // get current tab's lead fare calendar element
                var calendarElement = elem.find('.leadfare-calendar');

                scope.isShowCalendar = false;

                // rendar calendar into view
                scope.renderCalender = renderCalendar;

                // config object for calendar. Passed into directive
                scope.uiConfig = {
                    calendar: {
                        height: 300,
                        editable: false,
                        header: false,
                        eventClick: eventClick,
                        eventRender: eventRender
                    }
                };

                // update calendar based on month index and year
                scope.updateCalendar = updateCalendar;

                // instaflight call on click of any date.
                scope.instaFlightSearch = instaFlightSearch;

                // click on month section
                scope.monthClick = monthClick;

                // render calendar when tab page opens
                function renderCalendar() {
                    $timeout(function () {
                        uiCalendarConfig.calendars['leadFareCalendar'].fullCalendar('addEventSource', scope.leadFareSources[0]);
                        uiCalendarConfig.calendars["leadFareCalendar"].fullCalendar('render');
                    }, 0);
                };

                // create month tabs for calendar
                function createTabs(months) {
                    scope.tabs = [];
                    var isTabActive = true;
                    _.each(months, function (item) {
                        var tab = { title: monthList[item.monthIndex], isActive: isTabActive, month: monthList[item.monthIndex], year: item.year, monthIndex: item.monthIndex };
                        scope.tabs.push(tab);
                        isTabActive = false;
                    });
                }

                // click on calendar date
                function eventClick(sender, jsEvent, view) {
                    // get destination object that is bind into $scope.leadFareSources
                    var destination = sender.destination;
                    var instaFlightSearchData = {
                        OriginAirportName: scope.leadFareParams.Fareforecastdata.Origin,
                        DestinationAirportName: scope.leadFareParams.Fareforecastdata.Destination,
                        IncludedCarriers: destination.AirlineCodes,
                        FromDate: sender._start.toDate(),
                        ToDate: sender._start.clone().add(destination.LengthOfStay, 'day').toDate(),
                        outboundflightstops: destination.outboundflightstops,
                        inboundflightstops: destination.inboundflightstops,
                        PointOfSaleCountry: destination.PointOfSaleCountry,
                        AvailableAirline: scope.leadFareParams.AvailableAirline,
                        AvailableAirports: scope.leadFareParams.AvailableAirports
                    };
                    instaFlightSearch(instaFlightSearchData);
                }

                // calls on every event before it is render on calendar
                function eventRender(event, element, view) {
                    if (calendarElement) {
                        var eventDate = event._start.toDate();

                        // get lowest fare object for current event date's month
                        var currMonthFareObject = _.find(scope.lowestFareList, function (item) {
                            var itemDate = item.start;
                            return (itemDate.getMonth() === eventDate.getMonth() && itemDate.getFullYear() === eventDate.getFullYear())
                        });

                        var currMonthLowestFare = currMonthFareObject.destination.Fare;

                        // if current event has lowest fare then change it's background and font color
                        var eventStart = event._start.format('YYYY-MM-DD');
                        if (event.destination.Fare == currMonthLowestFare) {
                            // change background color of event date block
                            calendarElement.find("td.fc-widget-content[data-date=" + eventStart + "]").css({
                                backgroundColor: '#f0ddd9',
                            });
                            // change font color of date value
                            calendarElement.find("td.fc-day-number[data-date=" + eventStart + "]").css({
                                color: '#b90005'
                            });
                            // change fot color of fare value
                            element.css({
                                color: '#b90005'
                            });
                        }
                        else {
                            // change background color of event date block
                            calendarElement.find("td.fc-widget-content[data-date=" + eventStart + "]").css({
                                backgroundColor: '#f0ddd9',
                            });
                        }

                        // add title attrib to event
                        var title = (event.destination.AirlineCodes.length == 1 ? 'Airline: ' : 'Airlines: ') + event.destination.AirlineCodes.join(', ') + '\n'
                    + 'Fare: ' + UtilFactory.GetCurrencySymbol(event.destination.CurrencyCode) + ' ' + event.destination.Fare;
                        element.attr('title', title);

                    }
                }

                function updateCalendar(obj) {
                    // creating date with year and month having 1st date.
                    var date = moment((obj.monthIndex + 1) + '-01-' + obj.year, 'MM-dd-yyyy');
                    uiCalendarConfig.calendars["leadFareCalendar"].fullCalendar('gotoDate', date);
                }

                // open instaflight popup
                function instaFlightSearch(instaFlightSearchData) {
                    var InstaFlightSearchPopupInstance = $modal.open({
                        templateUrl: 'Views/Partials/InstaFlightSearchPartial.html',
                        controller: 'InstaFlightSearchController',
                        scope: scope,
                        size: 'lg',
                        resolve: {
                            instaFlightSearchData: function () { return instaFlightSearchData; }
                        }
                    });
                };

                function monthClick(lowestFareObj) {
                    var tabIndex = _(scope.tabs).findIndex({ monthIndex: lowestFareObj.start.getMonth() });
                    scope.tabs[tabIndex].isActive = true;
                    updateCalendar({ monthIndex: lowestFareObj.start.getMonth(), year: lowestFareObj.start.getFullYear() });
                }
            }
        }
    }
})();