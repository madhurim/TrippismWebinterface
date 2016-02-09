(function () {
    'use strict';
    var controllerId = 'DestinationsController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
            '$location',
            '$modal',
            '$rootScope',
            '$timeout',
            '$filter',
            '$window','$stateParams','$state',
            'DestinationFactory',
            'UtilFactory',
            'FareforecastFactory',
            'SeasonalityFactory',
            'TrippismConstants',
             DestinationsController]);
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
    function DestinationsController(
        $scope,
        $location,
        $modal,
        $rootScope,
        $timeout,
        $filter,
        $window,$stateParams,$state,
        DestinationFactory,
        UtilFactory,
        FareforecastFactory,
        SeasonalityFactory,
        TrippismConstants
        ) {

        function activate() {
            debugger;
            if ($stateParams.path != undefined) {
                var params = $stateParams.path.split(";");
                // split destination and origin to compare with tab title
                angular.forEach(params, function (item) {
                    var para = item.split("=");
                    if (para[0].trim() === "f")
                        $scope.Origin = para[1].trim();
                    if (para[0].trim() === "t")
                        $scope.KnownDestinationAirport = para[1].trim();
                    if (para[0].trim() === "d")
                    {
                        $scope.FromDate = ConvertToRequiredDate(params[1].trim(), 'UI');
                        $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                    }
                    if (para[0].trim() === "r")
                    {
                        $scope.ToDate = ConvertToRequiredDate(params[1].trim(), 'UI');;
                        $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                    }

                })
              
                $scope.IsairportJSONLoading = true;
                UtilFactory.ReadAirportJson(function (callback) {
                    $scope.IsairportJSONLoading = false;
                    $scope.AvailableAirports = callback;
                    if ($scope.Origin != undefined && $scope.Origin != "") {
                        $scope.LastSelectedOrigin = $scope.Origin;
                        //$scope.KnownDestinationAirport = dest;
                        updateSearchCriteria();
                        findDestinations();
                        //$scope.getDestinationDetails()
                    }
                });
            }
        }
    $scope.ShowDestinationView = DestinationFactory.ShowDestinationView; // true;
    $scope.isSearching = true;
    $scope.MailMarkerSeasonalityInfo = {};
    $scope.MailFareRangeData = {};
    $scope.hasError = false;
    $scope.formats = Dateformat();
    $scope.format = $scope.formats[5];
    $scope.activate = activate;
    $scope.findDestinations = findDestinations;
    $scope.OriginCityName = '';
    $scope.Destination = '';
    $scope.AvailableAirports = [];
    var destinationlistOriginal = '';   // used for filtering data on refine search click
    $scope.destinationlist = "";
    $scope.AvailableThemes = AvailableTheme();
    $scope.AvailableRegions = AvailableRegions();
    $scope.LoadingText = "Loading..";
    $scope.oneAtATime = true;
    $scope.isPopDestCollapsed = true;
    $scope.PointOfsalesCountry;
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
    initFareSliderValues();
            
           
            $scope.isModified = false;

            function LoadAirlineJson() {
                UtilFactory.ReadAirlinesJson().then(function (data) {
                    $scope.airlineJsonData = data;
                });
            }
            LoadAirlineJson();
            GetCurrencySymbols();
            function CallOnLoad() {
                if ($scope.Origin != undefined && $scope.Origin != "") {
                    $scope.LastSelectedOrigin = $scope.Origin;
                    //$scope.KnownDestinationAirport = dest;
                    updateSearchCriteria();
                    findDestinations();
                    //$scope.getDestinationDetails()
                }
            }

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

        //$scope.loadFareForecastInfo = loadFareForecastInfo;
        $scope.ISloader = false;
        $scope.btnSearchClick = btnSearchClick;
        
        $scope.Destinationfortab = "";

        $scope.ViewDestination = function () {

            $timeout(function () {
                $scope.isSearching = false;
                //$scope.ShowDestinationView = true;
                DestinationFactory.ShowDestinationView = true;
                //$scope.isPopDestCollapsed = true;
                //$scope.IscalledFromIknowMyDest = false;
               // $scope.tabManager.resetSelected();
               // $scope.TabcontentView = false;
                $rootScope.$broadcast('eventDestinationMapresize');
            }, 0, true);
            //$location.url('/destinations', false);

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
      
      
       //$scope.$on('CloseFareForcastInfo', function (event, args) {
       //     $scope.IsHistoricalInfo = false;
       //     $scope.ISloader = false;
       //     $scope.status = {
       //         isFirstOpen: true,
       //         Seasonalitystatus: false
       //     };
       // });


        function btnSearchClick() {
            $scope.fareforecastdirectiveDisplay = false;
            if ($scope.isSearching == true)
                $scope.isSearching = false;
            else
                $scope.isSearching = true;
        }

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
            //$scope.refineSearchValues.OrigintoDisp = $scope.Origin;
            updateSearchCriteria();
            var data = CreateSearchCriteria();
            $scope.inProgress = true;
            $scope.cgBuzyMessage = 'Please wait...';
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

        function updateSearchCriteria() {
            $scope.refineSearchValues = {
                OrigintoDisp: $scope.Origin,
                Minfare: $scope.priceSliderValues.values.min,
                Maxfare: $scope.priceSliderValues.values.max,
                Region: $scope.Region,
                Theme: $scope.Theme,
                FromDate: (typeof $scope.FromDate == 'string') ? new Date($scope.FromDate) : $scope.FromDate,
                ToDate: (typeof $scope.ToDate == 'string') ? new Date($scope.ToDate) : $scope.ToDate
            };
        }

        function clearRefineSearchSelection() {
            initFareSliderValues();
            $scope.Maxfare = null;
            $scope.Minfare = null;
            $scope.previousTheme = $scope.Theme = null;
            $scope.previousRegion = $scope.Region = null;
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
        activate();
    }
})();
