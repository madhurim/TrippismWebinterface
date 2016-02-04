(function () {
    'use strict';
    var controllerId = 'DestinationController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
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
             DestinationController]);
    angular.module('TrippismUIApp').directive('allowOnlyDateInputs', function () {
        return {
            restrict: 'A',
            link: function (scope, elm, attrs, ctrl) {
                elm.on('keydown', function (event) {
                    if (event.which == 64 || event.which == 16) {
                        // to allow shift  
                        return false;
                    } else if (event.which >= 112 && event.which <= 123) {
                        // to Function Keys  
                        return true;
                    } else if (event.which >= 48 && event.which <= 57) {
                        // to allow numbers  
                        return true;
                    } else if (event.which >= 96 && event.which <= 105) {
                        // to allow numpad number  
                        return true;
                    } else if ([8, 9, 13, 17, 27, 35, 36, 37, 38, 39, 40, 44, 46, 109, 110, 111, 173, 189, 190, 191].indexOf(event.which) > -1) {
                        // to allow backspace,Tab, enter, cntrl, escape, Home, End, left, up, right, down, printscreen, delete, Numpad -, Numpad ., Numpad /, firfox -, all other -, ., /
                        return true;
                    } else {
                        event.preventDefault();
                        // to stop others  
                        return false;
                    }
                });
            }
        }
    });
    function DestinationController(
        $scope,
        $location,
        $modal,
        $rootScope,
        $timeout,
        $filter,
        $window,
        DestinationFactory,
        UtilFactory,
        FareforecastFactory,
        SeasonalityFactory,
        TrippismConstants
        ) {
        $scope.RemovedTabIndex = '';
        $scope.countRemovedTab = '0';

        var isIE = /*@cc_on!@*/false || !!document.documentMode;
        // And onhashchange for IE
        if (isIE) { $window.onhashchange = handledestinationsPage; }
        else { $window.onpopstate = handledestinationsPage; }
        function handledestinationsPage() {
            $rootScope.$broadcast('onBackButtonClicked', $scope);
        };
        function activate() {
            var search = $location.search();
            var orgdest = search.Origin;
            var org;
            var dest;
            if (orgdest != undefined && orgdest != "") {
                org = orgdest.split("-")[0].trim();
                dest = orgdest.split("-")[1].trim();
                if (dest != undefined && dest != "") {
                    $scope.selectedform = "KnowMyDestination";
                }
            }
            var _qFromDate = search.DepartureDate;
            var _qToDate = search.ReturnDate;
            $scope.IsairportJSONLoading = true;
            UtilFactory.ReadAirportJson().then(function (data) {
                $scope.IsairportJSONLoading = false;
                //  $scope.CalledOnPageLoad = false;
                $scope.AvailableAirports = data;
                if (org != undefined && org != "") {
                    $scope.Origin = org;
                    $scope.LastSelectedOrigin = org;
                    $scope.KnownDestinationAirport = dest;
                    if (_qFromDate != undefined && _qFromDate != '') {
                        $scope.FromDate = ConvertToRequiredDate(_qFromDate, 'UI');
                        $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                    }
                    if (_qToDate != undefined && _qToDate != '') {
                        $scope.ToDate = ConvertToRequiredDate(_qToDate, 'UI');;
                        $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                    }
                    //  $scope.CalledOnPageLoad = true;
                    updateSearchCriteria();
                    $scope.getDestinationDetails()
                }
            });
        }
        $scope.selectedform = 'SuggestDestination';
        $scope.ShowDestinationView = DestinationFactory.ShowDestinationView; // true;
        $scope.TabcontentView = true;
        $scope.TabCreatedCount = 0;
        $scope.tabManager = {};
        $scope.tabManager.tabItems = [];
        $scope.isSearching = true;
        $scope.MailMarkerSeasonalityInfo = {};
        $scope.MailFareRangeData = {};
        $scope.hasError = false;
        $scope.Location = "";
        $scope.formats = Dateformat();
        $scope.format = $scope.formats[5];
        $scope.activate = activate;
        $scope.findDestinations = findDestinations;
        $scope.Origin = '';
        $scope.LastSelectedOrigin = ''; // used for clearing refine search selected values if origin is changed.
        $scope.OriginCityName = '';
        $scope.Destination = '';
        $scope.buttontext = "All";
        $scope.AvailableAirports = [];
        var destinationlistOriginal = '';   // used for filtering data on refine search click
        $scope.destinationlist = "";
        $scope.topcheapestdestinationflg = true;
        $scope.AvailableThemes = AvailableTheme();
        $scope.AvailableRegions = AvailableRegions();
        //  $scope.IsHistoricalInfo = false;
        $scope.MaximumFromDate = ConvertToRequiredDate(addDays(new Date(), 192), 'UI');
        $scope.LoadingText = "Loading..";
        $scope.oneAtATime = true;
        $scope.SearchbuttonText = "Suggest Destinations";
        $scope.SearchbuttonTo10Text = "Top 10";
        $scope.SearchbuttonCheapestText = "Top 10 Cheapest";
        $scope.SearchbuttonIsLoading = false;
        $scope.SearchbuttonTop10IsLoading = false;
        $scope.isSearching = true;
        $scope.KnowSearchbuttonText = 'Get Destination Details';
        $scope.IscalledFromIknowMyDest = false;
        $scope.isPopDestCollapsed = true;
        $scope.invalidFromDate = false;
        $scope.invalidToDate = false;
        $scope.isShowSearchIcon = false;    // used for hiding main search slider icon first time
        $scope.PointOfsalesCountry;
        var iknowMyDestinationFlag = 'KnownDestination';
        activate();
        initFareSliderValues();
        $scope.isModified = false;

        function LoadAirlineJson() {
            UtilFactory.ReadAirlinesJson().then(function (data) {
                $scope.airlineJsonData = data;
            });
        }

        LoadAirlineJson();
        GetCurrencySymbols();

        function FilterDestinations(destinations) {
            var destinationstodisp = [];
            for (var x = 0; x < destinations.length; x++) {
                var LowestFarePrice = "N/A";
                var LowestNonStopeFare = "N/A";
                if (destinations[x].LowestNonStopFare != undefined && destinations[x].LowestNonStopFare.Fare != "N/A") {
                    LowestNonStopeFare = parseFloat(destinations[x].LowestNonStopFare.Fare).toFixed(2);
                    if (LowestNonStopeFare == 0)
                        LowestNonStopeFare = "N/A";
                }
                if (destinations[x].LowestFare != undefined && destinations[x].LowestFare.Fare != "N/A") {
                    LowestFarePrice = parseFloat(destinations[x].LowestFare.Fare).toFixed(2);
                    if (LowestFarePrice == 0)
                        LowestFarePrice = "N/A";
                }
                if (LowestNonStopeFare != "N/A" || LowestFarePrice != "N/A")
                    destinationstodisp.push(destinations[x]);
            }
            return destinationstodisp;
        }

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 0,
            showWeeks: false
        };

        $scope.status = {
            isFirstOpen: true,
            Seasonalitystatus: false
        };
        $scope.loadFareForecastInfo = loadFareForecastInfo;
        $scope.ISloader = false;
        $scope.btnSearchClick = btnSearchClick;
        //$scope.CreateTab = CreateTab;
        var dt = new Date();

        dt.setHours(0, 0, 0, 0);

        var Todt = new Date();
        Todt.setDate(Todt.getDate() + 5); // add default from 5 days
        Todt.setHours(0, 0, 0, 0)

        //$scope.ToDate = ConvertToRequiredDate(Todt, 'UI');
        //$scope.FromDate = ConvertToRequiredDate(dt, 'UI');
        $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
        $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
        $scope.minTodayDate = new Date();
        $scope.minFromDate = new Date();
        $scope.minFromDate = $scope.minFromDate.setDate($scope.minFromDate.getDate() + 1);
        $scope.Destinationfortab = "";

        $scope.ViewDestination = function () {

            $timeout(function () {
                $scope.isSearching = false;
                //$scope.ShowDestinationView = true;
                DestinationFactory.ShowDestinationView = true;
                $scope.isPopDestCollapsed = true;
                $scope.IscalledFromIknowMyDest = false;
                $scope.tabManager.resetSelected();
                $scope.TabcontentView = false;
                $rootScope.$broadcast('eventDestinationMapresize');
            }, 0, true);
            //$location.path('/destinations', false);
            $location.url('/destinations', false);

        };
        $scope.$watch(function () { return DestinationFactory.ShowDestinationView }, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                $scope.ShowDestinationView = newVal;
            }
        });
        $scope.$watch(function (scope) { return scope.Earliestdeparturedate },
           function (newValue, oldValue) {
               if (newValue == null)
                   return;

               /* If from date is greater than to date */
               var newDt = new Date(newValue);
               newDt.setHours(0, 0, 0, 0);
               var todate = ($scope.Latestdeparturedate == undefined || $scope.Latestdeparturedate == '') ? new Date() : new Date($scope.Latestdeparturedate);
               todate.setHours(0, 0, 0, 0);

               if (newDt >= todate) {
                   $scope.Latestdeparturedate = ConvertToRequiredDate(newDt.setDate(newDt.getDate() + 1), 'UI')
               }
               /**/

               // Calculate datediff
               var diff = daydiff(new Date(newValue).setHours(0, 0, 0, 0), new Date($scope.Latestdeparturedate).setHours(0, 0, 0, 0));
               if (diff > 30)
                   $scope.Latestdeparturedate = ConvertToRequiredDate(addDays(newDt, 30), 'UI');

               $scope.MaximumLatestdeparturedate = addDays(newDt, 30);
           }
        );
        $scope.$watch(function (scope) {
            var frmdate = scope.frmdestfinder.FromDate.$viewValue;
            if (frmdate != "" && frmdate != null && frmdate != undefined) {
                if (frmdate.length == 10) {
                    if (frmdate.indexOf("-") != -1 || frmdate.indexOf(".") != -1) {
                        var dtStr = frmdate;
                        var mm = dtStr.substring(0, 2);
                        var dd = dtStr.substring(3, 5);
                        var yyyy = dtStr.substring(6, 11);
                        var newDt = mm + "/" + dd + "/" + yyyy;
                        scope.FromDate = newDt;
                        scope.FromDateDisplay = GetDateDisplay(scope.FromDate);
                        if (scope.FromDateDisplay == "Invalid Date !!") {
                            scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                            scope.FromDateDisplay = GetDateDisplay(scope.FromDate);
                        }
                    }
                }
                if (!isNaN(frmdate)) {
                    if (frmdate.length == 8) {
                        var dtStr = frmdate;
                        var mm = dtStr.substring(0, 2);
                        var dd = dtStr.substring(2, 4);
                        var yyyy = dtStr.substring(4, 8);
                        var newDt = mm + "/" + dd + "/" + yyyy;
                        scope.FromDate = newDt;
                        scope.FromDateDisplay = GetDateDisplay(scope.FromDate);
                        if (scope.FromDateDisplay == "Invalid Date !!") {
                            scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                            scope.FromDateDisplay = GetDateDisplay(scope.FromDate);
                        }
                    }
                }
            }
            else {
                scope.FromDateDisplay = "";
            }
            return scope.FromDate
        },
              function (newValue, oldValue) {
                  if (newValue == null)
                      return;

                  var todayDt = new Date();
                  todayDt.setHours(0, 0, 0, 0);

                  /* If from date is greater than to date */
                  var newDt = new Date(newValue);
                  newDt.setHours(0, 0, 0, 0);
                  var todate = new Date($scope.ToDate);
                  if (todate == 'Invalid Date') {
                      $scope.SetToDate();
                      var todate = new Date($scope.ToDate);
                  }
                  todate.setHours(0, 0, 0, 0);

                  var maxFrmDate = new Date($scope.MaximumFromDate);
                  maxFrmDate.setHours(0, 0, 0, 0);

                  if (newDt < todayDt) {
                      //$scope.invalidFromDate = true;
                      $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');

                      $scope.ToDate = undefined;
                      $scope.SetToDate();
                      var todate = new Date($scope.ToDate);
                      todate.setHours(0, 0, 0, 0);

                      $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                      return;
                  }
                  else if (newDt > maxFrmDate) {
                      //$scope.invalidFromDate = true;
                      $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                      $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                      return;
                  }
                  else {
                      $scope.invalidFromDate = false;
                      $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                  }
                  /**/

                  //SET MINIMUN SELECTED DATE for TODATE
                  $scope.minFromDate = new Date(newValue);
                  $scope.MaximumToDate = addDays($scope.minFromDate, 16);
                  $scope.minFromDate = $scope.minFromDate.setDate($scope.minFromDate.getDate() + 1);

                  var maxToDate = new Date($scope.MaximumToDate);
                  maxToDate.setHours(0, 0, 0, 0);

                  if (newDt >= todate) {
                      $scope.ToDate = ConvertToRequiredDate(newDt.setDate(newDt.getDate() + 1), 'UI');
                      $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                  }
                  else if (todate > maxToDate) {
                      $scope.ToDate = ConvertToRequiredDate(newDt.setDate(newDt.getDate() + 1), 'UI');
                      $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                  }

              }
        );
        $scope.SetFromDate = function () {
            if ($scope.FromDate == "" || $scope.FromDate == undefined || $scope.FromDate == null) {
                $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
            }
        };

        $scope.$watch(function (scope) {
            var todate = scope.frmdestfinder.ToDate.$viewValue;
            if (todate != "" && todate != null && todate != undefined) {
                if (todate.length == 10) {
                    if (todate.indexOf("-") != -1 || todate.indexOf(".") != -1) {
                        var dtStr = todate;
                        var mm = dtStr.substring(0, 2);
                        var dd = dtStr.substring(3, 5);
                        var yyyy = dtStr.substring(6, 11);
                        var newDt = mm + "/" + dd + "/" + yyyy;
                        scope.ToDate = newDt;
                        scope.ToDateDisplay = GetDateDisplay(scope.ToDate);
                        if (scope.ToDateDisplay == "Invalid Date !!") {
                            scope.ToDate = ConvertToRequiredDate(GetToDate(scope.FromDate), 'UI');
                            scope.ToDateDisplay = GetDateDisplay(scope.ToDate);
                        }
                    }
                }
                if (!isNaN(todate)) {
                    if (todate.length == 8) {
                        var dtStr = todate;
                        var mm = dtStr.substring(0, 2);
                        var dd = dtStr.substring(2, 4);
                        var yyyy = dtStr.substring(4, 8);
                        var newDt = mm + "/" + dd + "/" + yyyy;
                        scope.ToDate = newDt;
                        scope.ToDateDisplay = GetDateDisplay(scope.ToDate);
                        if (scope.ToDateDisplay == "Invalid Date !!") {
                            scope.ToDate = ConvertToRequiredDate(GetToDate(scope.FromDate), 'UI');
                            scope.ToDateDisplay = GetDateDisplay(scope.ToDate);
                        }
                    }
                }
            }
            else {
                $scope.ToDateDisplay = "";
            }
            return scope.ToDate;
        },
            function (newValue, oldValue) {
                if (newValue == null)
                    return;

                var minToDt = new Date($scope.minFromDate);
                //toDt.setDate(toDt.getDate() + 1);
                minToDt.setHours(0, 0, 0, 0);

                /* If from date is greater than to date */
                var newDt = new Date(newValue);
                newDt.setHours(0, 0, 0, 0);

                var mxToDate = new Date($scope.MaximumToDate);
                mxToDate.setHours(0, 0, 0, 0);

                if (newDt < minToDt) {
                    $scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                    //$scope.invalidToDate = true;
                    return;
                }
                else if (newDt > mxToDate) {
                    $scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                    //$scope.invalidToDate = true;
                    return;
                }
                else {
                    $scope.invalidToDate = false;
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
            }
        );

        $scope.SetToDate = function () {
            if (($scope.ToDate == "" || $scope.ToDate == undefined || $scope.ToDate == null) && $scope.FromDate != null) {
                $scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
            }
        }

        $scope.feedbackcall = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: '/Views/Partials/FeedbackDetailFormPartial.html',
                controller: 'FeedbackController',
                scope: $scope,
            });
        }

        $scope.$on('CloseFareForcastInfo', function (event, args) {
            $scope.IsHistoricalInfo = false;
            $scope.ISloader = false;
            $scope.status = {
                isFirstOpen: true,
                Seasonalitystatus: false
            };
        });


        function btnSearchClick() {
            $scope.fareforecastdirectiveDisplay = false;
            if ($scope.isSearching == true)
                $scope.isSearching = false;
            else
                $scope.isSearching = true;
        }

        function loadFareForecastInfo() {
            $scope.MarkerInfo = "";
            $scope.status = {
                isFirstOpen: true,
                Seasonalitystatus: false
            };
            FareforecastFactory.fareforecast($scope.fareData).then(function (data) {
                $scope.MarkerInfo = data;
            });
        }

        $scope.loadSeasonalityInfo = function ($event) {
            if ($scope.MarkerSeasonalityInfo == "") {
                var Seasonalitydata = {
                    "Destination": $scope.Destinationfortab
                };
                $timeout(function () {
                    $scope.status = {
                        isFirstOpen: false,
                        Seasonalitystatus: true
                    };
                    SeasonalityFactory.Seasonality(Seasonalitydata).then(function (data) {
                        $scope.MarkerSeasonalityInfo = data;
                    });
                }, 0, false);
            }
        };

        $scope.$watch('Origin', function (newValue, oldval) {
            if (newValue != undefined && newValue != "") {
                var airportCode = newValue.split(',')[0];
                if (airportCode && oldval && oldval.toUpperCase().indexOf(airportCode.toUpperCase()) == 0) {
                    return;
                }
                newValue = newValue.toLowerCase();
                var completeName = newValue;
                if ((completeName.split(",").length - 1) < 1) { /// City Name compare and get values
                    var arprtCityName = completeName;
                    var matchingArray = GetArrayforCompareforCityName(arprtCityName);
                    if (matchingArray.length > 0) {
                        matchingArray.forEach(function (arprt) {
                            if (arprt.airport_FullName.toLowerCase().indexOf("all airport") != -1) {
                                var index = matchingArray.indexOf(arprt.airport_Code);
                                matchingArray[0] = arprt;
                            }
                        });
                        $scope.Origin = matchingArray[0].airport_Code;
                        $scope.OriginCityName = matchingArray[0].airport_CityName;
                    }
                }
                else if ((completeName.split(",").length - 1) > 2) { /// Copy-Paste Whole Name with Comma and get values by code
                    var arprtDetails = completeName.split(',');
                    var arprtCode = arprtDetails[0];
                    var matchingArray = GetArrayforCompareforFullName(arprtCode);
                    if (matchingArray.length > 0) {
                        $scope.Origin = matchingArray[0].airport_Code;
                        $scope.OriginCityName = matchingArray[0].airport_CityName;
                    }
                }
                else {
                    var originairportdata = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $scope.Origin.toUpperCase() });
                    if (originairportdata != undefined)
                        $scope.OriginCityName = originairportdata.airport_CityName;
                    else
                        $scope.OriginCityName = '';
                }
                $scope.OrigintoDisp = $scope.Origin.toUpperCase();
            }
            $scope.setSearchCriteria();
        });

        // used to reset all the search criteria instead of Orign if origin is changed.
        $scope.setSearchCriteria = function () {
            if ($scope.Origin && $scope.Origin.length > 2 && $scope.Origin != $scope.LastSelectedOrigin) {
                $scope.LastSelectedOrigin = $scope.Origin;
                if ($scope.selectedform != "KnowMyDestination") {
                    $scope.KnownDestinationAirport = null;
                }
                clearRefineSearchSelection();
                if ($scope.FromDate && $scope.ToDate)
                    resetDates();
                updateSearchCriteria();
            }
        }

        $scope.$watch('KnownDestinationAirport', function (newValue, oldval) {
            if (newValue != undefined && newValue != "") {
                var airportCode = newValue.split(',')[0];
                if (airportCode && oldval && oldval.toUpperCase().indexOf(airportCode.toUpperCase()) == 0) return;
                newValue = newValue.toLowerCase();
                var completeName = newValue;
                if ((completeName.split(",").length - 1) < 1) { /// City Name compare and get values
                    var arprtCityName = completeName;
                    var matchingArray = GetArrayforCompareforCityName(arprtCityName);
                    if (matchingArray.length > 0) {
                        matchingArray.forEach(function (arprt) {
                            if (arprt.airport_FullName.toLowerCase().indexOf("all airport") != -1) {
                                var index = matchingArray.indexOf(arprt.airport_Code);
                                matchingArray[0] = arprt;
                            }
                        });
                        $scope.KnownDestinationAirport = matchingArray[0].airport_Code;
                    }
                }
                else if ((completeName.split(",").length - 1) > 2) { /// Copy-Paste Whole Name with Comma and get values by code
                    var arprtDetails = completeName.split(',');
                    var arprtCode = arprtDetails[0];
                    var matchingArray = GetArrayforCompareforFullName(arprtCode);
                    if (matchingArray.length > 0) {
                        $scope.KnownDestinationAirport = matchingArray[0].airport_Code;
                    }
                }
            }
        });

        function GetArrayforCompareforCityName(txtCityName) {
            var matchingStuffs = [];
            $scope.AvailableAirports.forEach(function (airport) {
                if (airport.airport_CityName.toLowerCase() == txtCityName) {
                    if (matchingStuffs.indexOf(airport) == -1)
                        matchingStuffs.push(airport);
                    if (airport.airport_IsMAC == true) {
                        var multiAirports = $filter('filter')($scope.AvailableAirports, { airport_IsMAC: false, airport_CityName: airport.airport_CityName });
                        multiAirports.forEach(function (item) {
                            matchingStuffs.push(item);
                        });
                    }
                }
            });
            return matchingStuffs;
        }

        function GetArrayforCompareforFullName(txtFullName) {
            var matchingStuffs = [];
            $scope.AvailableAirports.forEach(function (airport) {
                if (airport.airport_Code.substr(0, 3).toLowerCase() == txtFullName) {
                    if (matchingStuffs.indexOf(airport) == -1)
                        matchingStuffs.push(airport);
                    if (airport.airport_IsMAC == true) {
                        var multiAirports = $filter('filter')($scope.AvailableAirports, { airport_IsMAC: false, airport_CityName: airport.airport_CityName });
                        multiAirports.forEach(function (item) {
                            matchingStuffs.push(item);
                        });
                    }
                }
            });
            return matchingStuffs;
        }

        $scope.onSelect = function ($item, $model, $label) {
            $scope.Origin = $item.airport_Code;
            $scope.OriginCityName = $item.airport_CityName;
        };

        $scope.onKnowDestinationSelect = function ($item, $model, $label) {
            $scope.KnownDestinationAirport = $item.airport_Code;
        };

        $scope.formatInput = function ($model) {
            if ($model == "" || $model == undefined) return "";
            var originairport = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $model });
            //var airportname = (originairport.airport_FullName.toLowerCase().indexOf("airport") > 0) ? originairport.airport_FullName : originairport.airport_FullName + " Airport";
            var CountryName = (originairport.airport_CountryName != undefined) ? originairport.airport_CountryName : "";
            //return originairport.airport_Code + ", " + airportname + ", " + originairport.airport_CityName + ", " + CountryName;
            return originairport.airport_Code + ", " + originairport.airport_CityName + ", " + CountryName;
        }

        $scope.openToDate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
            document.getElementById('txtToDate').select();
        };

        $scope.CloseDetailInfo = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            //     $scope.IsHistoricalInfo = false;
            $scope.ISloader = false;
            $scope.status = {
                isFirstOpen: true,
                Seasonalitystatus: false
            };
        };

        $scope.openEarliestdeparturedate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedEarliestdeparturedate = true;
        };

        $scope.openLatestdeparturedate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedLatestdeparturedate = true;
        };

        $scope.openFromDate = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.openedFromDate = true;
            $scope.SetFromDate();
            document.getElementById('txtFromDate').select();
        };

        $scope.getDestinationDetails = function (buttnText) {
            // for showing info message to wait until airport data fetched to dropdown
            $scope.isSearchbuttonClicked = true;
            if ($scope.IsairportJSONLoading)
                return;
            $scope.isSearchCollapsed = true;
            $scope.IsRefineSearchShow = true;
            $scope.isSearching = false;
            $scope.topdestinationlist = [];

            $scope.KnowSearchbuttonIsLoading = true;
            $scope.KnowSearchbuttonText = $scope.LoadingText;

            correctAirportNames();
            $scope.refineSearchValues.OrigintoDisp = $scope.Origin;
            var originairport = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $scope.refineSearchValues.OrigintoDisp.toUpperCase() });
            var data = CreateSearchCriteria();
            clearRefineSearchSelection();
            updateSearchCriteria();
            // for clearing all refine search selection            
            $scope.destinationmappromise = DestinationFactory.findInstFlightDestination(data).then(function (data) {
                $scope.KnowSearchbuttonText = 'Get Destination Details';
                $scope.KnowSearchbuttonIsLoading = false;
                if (data.FareInfo != null) {
                    $scope.destinationlist = FilterDestinations(data.FareInfo);
                    destinationlistOriginal = $scope.destinationlist;
                    var DestinationairportName = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $scope.KnownDestinationAirport.toUpperCase() });

                    var objDestinationairport = $scope.destinationlist[0];
                    if (objDestinationairport != undefined) {
                        var dataForecast = {
                            //"Origin": $scope.Origin.toUpperCase(),
                            "Origin": $scope.refineSearchValues.OrigintoDisp.toUpperCase(),
                            "DepartureDate": $filter('date')(objDestinationairport.DepartureDateTime, 'yyyy-MM-dd'),
                            "ReturnDate": $filter('date')(objDestinationairport.ReturnDateTime, 'yyyy-MM-dd'),
                            "Destination": $scope.KnownDestinationAirport.toUpperCase()
                        };
                        objDestinationairport.objDestinationairport = $scope.KnownDestinationAirport.toUpperCase();
                        $scope.destinationlist.forEach(function (item) { item.DestinationLocation = item.objDestinationairport; });
                        $rootScope.$broadcast('EmptyFareForcastInfo', {
                            Origin: originairport.airport_CityName,
                            Destinatrion: DestinationairportName.airport_Code,
                            Fareforecastdata: dataForecast,
                            mapOptions: objDestinationairport,
                            OriginairportName: originairport,
                            DestinationairportName: DestinationairportName,
                            DestinationList: $scope.destinationlist,
                            AvailableAirports: $scope.AvailableAirports,
                            AvailableAirline: $scope.airlineJsonData
                        });
                        $scope.KnownDestinationAirport = '';
                        UtilFactory.MapscrollTo('wrapper');
                        $scope.IscalledFromIknowMyDest = true;
                        //findDestinations(iknowMyDestinationFlag);  // parameter added to replace findDestination cgBuzyMessage with i know my destination cgBuzyMessage
                        findDestinations();
                        $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time                          
                    }
                    else {
                        $scope.KnownDestinationAirport = '';
                        alertify.alert("Destination Finder", "");
                        alertify.alert('We could not find details of the destination you are looking for, however we found other destinations that you can explore.').set('onok', function (closeEvent) { });
                        $scope.IscalledFromIknowMyDest = false;
                        $scope.Destinationfortab = '';  // for solving issue for last tab gets selected if user search for destination with same origin and get no result
                        //findDestinations(iknowMyDestinationFlag);   // parameter added to replace findDestination cgBuzyMessage with i know my destination cgBuzyMessage
                        findDestinations();
                        $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time
                    }
                }
                else if (data != null && typeof data == 'string') {
                    var POSCountriesList = [];
                    var CList = "Selected origin country is not among the countries we support. We currently support the below countries. We will continue to add support for more countries. <br/><br/><div class='pos_List'>";
                    var POSList = JSON.parse(data);
                    for (var i = 0; i < POSList.Countries.length; i++) {
                        POSCountriesList.push(POSList.Countries[i].CountryName.toString());
                    }
                    POSCountriesList.sort();
                    for (var i = 0; i < POSCountriesList.length; i++) {
                        if (i == POSCountriesList.length - 1) {
                            CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "." + "</span><br/>";
                        }
                        else {
                            CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "," + "</span><br/>";//+ "(" + POSList.Countries[i].CountryCode.toString() + ")"
                        }
                    }
                    CList += "</div>";
                    $scope.KnownDestinationAirport = '';
                    alertify.alert("Trippism", "");
                    alertify.alert(CList).set('onok', function (closeEvent) { });
                    $scope.IscalledFromIknowMyDest = false;
                    $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time
                }
                else {
                    $scope.KnownDestinationAirport = '';
                    alertify.alert("Destination Finder", "");
                    alertify.alert('No suggestions are available from your Origin. We recomend trying other nearby major airports.').set('onok', function (closeEvent) { });
                    $scope.IscalledFromIknowMyDest = false;
                    $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time                 
                }
                $scope.inProgress = false;
            });
        };

        $scope.handleUp = function () {
            if (destinationlistOriginal && destinationlistOriginal.length > 0) {
                var arr = [];
                for (var i = 0; i < destinationlistOriginal.length; i++) {
                    var destination = destinationlistOriginal[i];
                    var airport = $filter('filter')($scope.AvailableAirports, { airport_Code: destination.DestinationLocation });
                    if (airport.length > 1)
                        airport = _.find(airport, function (item) { return item.airport_IsMAC == false; });
                    else
                        airport = airport[0];
                    if (airport) {
                        var isFound = true;
                        // [S] theme                        
                        if ($scope.Theme) {
                            var themes = airport.themes.map(function (element) { return element.toLowerCase(); });
                            if (themes.indexOf($scope.Theme.toLowerCase()) > -1)
                                isFound = true;
                            else
                                isFound = false;
                        }
                        // [E] theme
                        // [S] region                 
                        if (isFound && $scope.Region) {
                            if ($scope.Region.toLowerCase() == airport.region.toLowerCase())
                                isFound = true;
                            else
                                isFound = false;
                        }
                        // [E] region
                        // [S] min-max fare
                        if (isFound && $scope.Minfare > 0 && $scope.Maxfare > 0) {
                            var fare = Math.ceil(UtilFactory.GetLowFareForMap(destination));
                            if (fare >= $scope.Minfare && fare <= $scope.Maxfare)
                                isFound = true;
                            else
                                isFound = false;
                        }
                        // [E] min-max fare
                        if (isFound)
                            arr.push(destination);
                    }
                }
                updateSearchCriteria();
                $timeout(function () { $scope.destinationlist = arr; }, 0, true);
            }
        }
        //function findDestinations(buttnText) {
        $scope.GetDestinationClick = function () {
            if ($scope.frmdestfinder.$invalid) {
                $scope.hasError = true;
                return;
            }
            if ($scope.invalidFromDate || $scope.invalidToDate) {
                $scope.hasError = true;
                return;
            }
            if ($scope.selectedform == "SuggestDestination")
                findDestinations()
            else
                $scope.getDestinationDetails();

        }

        function findDestinations() {
            // for showing info message to wait until airport data fetched to dropdown            
            $scope.isSearchbuttonClicked = true;
            if ($scope.IsairportJSONLoading)
                return;
            $scope.isModified = false;
            $scope.destinationlist = "";
            destinationlistOriginal = '';
            $scope.faresList = [];
            //  $scope.IsHistoricalInfo = false;
            $scope.isSearchCollapsed = true;
            $scope.isPopDestCollapsed = true;
            $scope.IsRefineSearchShow = true;
            $scope.isSearching = true;
            correctAirportNames();
            $scope.refineSearchValues.OrigintoDisp = $scope.Origin;

            // clearing all refine search values on suggest destination button click            
            clearRefineSearchSelection();
            updateSearchCriteria();
            var data = CreateSearchCriteria();
            $scope.inProgress = true;
            $scope.cgBuzyMessage = 'Please wait...';
            if ($scope.Destinationfortab != "") {
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "Origin", $scope.Origin.toUpperCase() + '-' + $scope.Destinationfortab.toUpperCase())
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "DepartureDate", data.DepartureDate);
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "ReturnDate", data.ReturnDate);
                $location.url($location.$$url, false);
            }
            else {
                $location.path('/destinations', false);
            }
            $scope.mappromise = DestinationFactory.findDestinations(data).then(function (data) {
                $scope.isSearching = false;
                $scope.SearchbuttonText = "Suggest Destinations";
                $scope.SearchbuttonCheapestText = "Top 10 Cheapest";
                $scope.SearchbuttonIsLoading = false;
                $scope.fareCurrencySymbol = undefined;
                if (data.FareInfo != null) {
                    $scope.destinationlist = FilterDestinations(data.FareInfo);
                    // getting currency symbol from currency code
                    var destination = _.find($scope.destinationlist, function (item) { return item.CurrencyCode && item.CurrencyCode != 'N/A'; });
                    if (destination)
                        $scope.fareCurrencySymbol = $scope.GetCurrencySymbol(destination.CurrencyCode);

                    destinationlistOriginal = $scope.destinationlist;
                    // for displaying default min/max fare values into refine search
                    var minMaxFare = getMinMaxFare($scope.destinationlist);
                    if (minMaxFare.MaxFare && minMaxFare.MaxFare != 0)
                        $scope.Maxfare = Math.ceil(minMaxFare.MaxFare);
                    if (minMaxFare.MinFare && minMaxFare.MinFare != 0)
                        $scope.Minfare = Math.floor(minMaxFare.MinFare);
                    setFareSliderValues();
                    UtilFactory.MapscrollTo('wrapper');
                    $scope.isRefineSeachCollapsed = true;
                    $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time                    
                }
                else if (data != null && typeof data == 'string') {
                    var POSCountriesList = [];
                    var CList = "Selected origin country is not among the countries we support. We currently support the below countries. We will continue to add support for more countries. <br/><br/><div class='pos_List'>";
                    var POSList = JSON.parse(data);
                    for (var i = 0; i < POSList.Countries.length; i++) {
                        POSCountriesList.push(POSList.Countries[i].CountryName.toString());
                    }
                    POSCountriesList.sort();
                    for (var i = 0; i < POSCountriesList.length; i++) {
                        if (i == POSCountriesList.length - 1) {
                            CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "." + "</span><br/>";
                        }
                        else {
                            CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "," + "</span><br/>";//+ "(" + POSList.Countries[i].CountryCode.toString() + ")"
                        }
                    }
                    CList += "</div>";
                    $scope.KnownDestinationAirport = '';
                    alertify.alert("Trippism", "");
                    alertify.alert(CList).set('onok', function (closeEvent) { });
                    $scope.IscalledFromIknowMyDest = false;
                    $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time
                }
                else {
                    alertify.alert("Destination Finder", "");
                    alertify.alert('Sorry , we do not have destinations to suggest for this search combination. This can also happen sometimes if the origin airport is not a popular airport. We suggest you try a different search combination or a more popular airport in your area to get destinations.').set('onok', function (closeEvent) { });
                    $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time
                }

                $scope.inProgress = false;
                loadScrollbars();
            });
            data.TopDestinations = 50;
            $scope.selectedform = 'SuggestDestination';
            $scope.hasError = false;    // for removing error from destination textbox
            loadScrollbars();
        }

        var correctAirportNames = function () {
            var origin;
            var knownDestination;
            if ($scope.Origin.split(',').length >= 1) {
                origin = $scope.Origin.split(',')[0].trim().toUpperCase();
                //$scope.Origin = $scope.Origin.split(',')[0].trim().toUpperCase();
                if (origin.length > 3) {
                    var matchingArray = GetArrayforCompareforCityName(origin.toLowerCase());
                    if (matchingArray.length > 0) {
                        matchingArray.forEach(function (arprt) {
                            if (arprt.airport_FullName.toLowerCase().indexOf("all airport") != -1) {
                                matchingArray[0] = arprt;
                            }
                        });
                        $scope.Origin = matchingArray[0].airport_Code;
                        $scope.OriginCityName = matchingArray[0].airport_CityName;
                    }
                }
                else
                    $scope.Origin = origin;
            }
            if ($scope.KnownDestinationAirport && $scope.KnownDestinationAirport.split(',').length >= 1) {
                knownDestination = $scope.KnownDestinationAirport.split(',')[0].trim().toUpperCase();
                //$scope.KnownDestinationAirport = $scope.KnownDestinationAirport.split(',')[0].trim().toUpperCase();
                if (knownDestination.length > 3) {
                    var matchingArray = GetArrayforCompareforCityName(knownDestination.toLowerCase());
                    if (matchingArray.length > 0) {
                        matchingArray.forEach(function (arprt) {
                            if (arprt.airport_FullName.toLowerCase().indexOf("all airport") != -1) {
                                matchingArray[0] = arprt;
                            }
                        });
                        $scope.KnownDestinationAirport = matchingArray[0].airport_Code;
                    }
                }
                else
                    $scope.KnownDestinationAirport = knownDestination;
            }
        }

        function clearRefineSearchSelection() {
            initFareSliderValues();
            $scope.Maxfare = null;
            $scope.Minfare = null;
            $scope.previousTheme = $scope.Theme = null;
            $scope.previousRegion = $scope.Region = null;
        }

        function resetDates() {
            $scope.FromDate = null;
            $scope.ToDate = null;
            $scope.SetFromDate();
            $scope.SetToDate();
        }

        // for updating 'You searched' block
        function updateSearchCriteria() {
            $scope.refineSearchValues = {
                OrigintoDisp: ($scope.refineSearchValues && $scope.refineSearchValues.OrigintoDisp) ? $scope.refineSearchValues.OrigintoDisp : undefined,
                Minfare: $scope.priceSliderValues.values.min,
                Maxfare: $scope.priceSliderValues.values.max,
                Region: $scope.Region,
                Theme: $scope.Theme,
                FromDate: (typeof $scope.FromDate == 'string') ? new Date($scope.FromDate) : $scope.FromDate,
                ToDate: (typeof $scope.ToDate == 'string') ? new Date($scope.ToDate) : $scope.ToDate
            };
        }

        function getMinMaxFare(destinationList) {
            var max = Math.max.apply(Math, destinationList.map(function (item) {
                var lowFare = UtilFactory.GetLowFareForMap(item);
                if (lowFare != 'N/A')
                    return UtilFactory.GetLowFareForMap(item);
                else
                    return 0;
            }));
            var min = Math.min.apply(Math, destinationList.map(function (item) {
                var lowFare = UtilFactory.GetLowFareForMap(item);
                if (lowFare != 'N/A')
                    return UtilFactory.GetLowFareForMap(item);
                else
                    return 0;
            }));
            return { MinFare: min, MaxFare: max };
        }

        function CreateSearchCriteria() {
            if ($scope.KnownDestinationAirport != "" || $scope.KnownDestinationAirport != undefined) {
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var secondDate = new Date($scope.ToDate);
                var firstDate = new Date($scope.FromDate);
                $scope.LenghtOfStay = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
            }
            var originairport = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $scope.Origin.toUpperCase() });
            if (originairport != undefined)
                $scope.PointOfsalesCountry = originairport.airport_CountryCode;
            else
                $scope.PointOfsalesCountry = undefined;
            var data = {
                "Origin": $scope.Origin,
                "DepartureDate": ($scope.FromDate == '' || $scope.FromDate == undefined) ? null : ConvertToRequiredDate($scope.FromDate, 'API'),
                "ReturnDate": ($scope.ToDate == '' || $scope.ToDate == undefined) ? null : ConvertToRequiredDate($scope.ToDate, 'API'),
                "Lengthofstay": $scope.LenghtOfStay,
                "Earliestdeparturedate": ($scope.Earliestdeparturedate == '' || $scope.Earliestdeparturedate == undefined) ? null : ConvertToRequiredDate($scope.Earliestdeparturedate, 'API'),
                "Latestdeparturedate": ($scope.Latestdeparturedate == '' || $scope.Latestdeparturedate == undefined) ? null : ConvertToRequiredDate($scope.Latestdeparturedate, 'API'),
                "Theme": $scope.Theme,
                "Location": $scope.Location,
                "Minfare": $scope.Minfare == 0 ? null : $scope.Minfare,
                "Maxfare": $scope.Maxfare == 0 ? null : $scope.Maxfare,
                "PointOfSaleCountry": $scope.PointOfsalesCountry,
                "Region": $scope.Region,
                "Destination": $scope.KnownDestinationAirport
            };
            return data;
        }

        function GetTopPopularDestinations(data) {
            $scope.topdestination = DestinationFactory.findDestinations(data).then(function (data) {
                $scope.topdestinationlist = [];
                if (data.FareInfo != null) {
                    for (var x = 0; x < data.FareInfo.length; x++) {
                        var airportdata = _.find($scope.AvailableAirports, function (airport) {
                            return airport.airport_Code == data.FareInfo[x].DestinationLocation
                        });
                        if (airportdata != undefined) {
                            var topdestination = {
                                "AirportCode": airportdata.airport_Code,
                                "Cityname": airportdata.airport_CityName,
                                "LowestNonStopFare": data.FareInfo[x].LowestNonStopFare,
                                "LowestFare": data.FareInfo[x].LowestFare,
                                "topdestinationFareInfo": data.FareInfo[x]
                            };
                            $scope.topdestinationlist.push(topdestination);
                        }
                        else {
                            //Missing Airport Details log 
                            UtilFactory.AirportCodeLog(data.FareInfo[x].DestinationLocation);
                        }
                    }
                }
                $scope.inProgress = false;
            });
        }
        function GetCurrencySymbols() {
            UtilFactory.GetCurrencySymbols();
        }
        $scope.displayTheme = function (name) {
            if ($scope.previousTheme != name) {
                $scope.previousTheme = name;
                $scope.Theme = name;
            }
            else
                $scope.previousTheme = $scope.Theme = undefined;
            $scope.handleUp();
        }
        $scope.displayRegion = function (name) {
            if ($scope.previousRegion != name) {
                $scope.previousRegion = name;
                $scope.Region = name;
            }
            else
                $scope.previousRegion = $scope.Region = undefined;
            $scope.handleUp();
        }

        // used for max/min refine search slider
        function initFareSliderValues() {
            $scope.priceSliderValues = {
                // show top labels of max, min fare
                originalRange: {
                    min: 0,
                    max: 0
                },
                // max and min values for slider
                range: {
                    min: 0,
                    max: 0
                },
                // min and max values selected by user
                values: {
                    min: 0,
                    max: 0
                }
            };
        }
        function setFareSliderValues() {
            $scope.priceSliderValues = {
                originalRange: {
                    min: ($scope.Origin == $scope.LastSelectedOrigin && $scope.priceSliderValues.originalRange.min != 0) ? $scope.priceSliderValues.originalRange.min : $scope.Minfare,
                    max: ($scope.Origin == $scope.LastSelectedOrigin && $scope.priceSliderValues.originalRange.max != 0) ? $scope.priceSliderValues.originalRange.max : $scope.Maxfare
                },
                range: {
                    min: ($scope.Origin == $scope.LastSelectedOrigin && $scope.priceSliderValues.originalRange.min != 0) ? $scope.priceSliderValues.range.min : $scope.Minfare,
                    max: ($scope.Origin == $scope.LastSelectedOrigin && $scope.priceSliderValues.originalRange.max != 0) ? $scope.priceSliderValues.range.max : $scope.Maxfare
                },
                values: {
                    min: $scope.Minfare,
                    max: $scope.Maxfare
                }
            };
        }
        // update Maxfare, Minfare values on price slider is changed.
        $scope.$watchCollection('priceSliderValues.values', function (newVal, oldVal) {
            if (newVal != oldVal) {
                $scope.Minfare = isNaN(newVal.min) ? 0 : newVal.min;
                $scope.Maxfare = isNaN(newVal.max) ? 0 : newVal.max;
            }
        });
        $scope.GetCurrencySymbol = function (code) {
            return UtilFactory.GetCurrencySymbol(code);
        }
    }
})();
