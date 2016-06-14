(function () {
    'use strict';
    var controllerId = 'DestinationsController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
            '$rootScope',
            '$timeout',
            '$filter',
            '$stateParams',
            'DestinationFactory',
            'UtilFactory',
            'dataConstant',
            'LocalStorageFactory',
            '$location',
             DestinationsController]);
    function DestinationsController(
        $scope,
        $rootScope,
        $timeout,
        $filter,
        $stateParams,
        DestinationFactory,
        UtilFactory,
        dataConstant,
        LocalStorageFactory,
        $location
        ) {
        $scope.$emit('bodyClass', 'mappage');   // for changing <body> class        
        function activate() {
            if ($stateParams.path != undefined) {

                var params = $stateParams.path.split(";");
                // split destination and origin to compare with tab title

                var isSearched = false;
                angular.forEach(params, function (item) {
                    var para = item.split("=");
                    if (para[0].trim() === "f")
                        $scope.Origin = para[1].trim().toUpperCase();
                    if (para[0].trim() === "t")
                        $scope.KnownDestinationAirport = para[1].trim().toUpperCase();
                    if (para[0].trim() === "d") {
                        $scope.FromDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                    }
                    if (para[0].trim() === "r") {
                        $scope.ToDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                    }
                });

                // correct dates
                var dates = UtilFactory.GetValidDates($scope.FromDate, $scope.ToDate);
                $scope.FromDate = dates.FromDate;
                $scope.ToDate = dates.ToDate;

                // store into local storage
                var data = {
                    f: $scope.Origin,
                    d: $scope.FromDate,
                    r: $scope.ToDate
                };


                var data = LocalStorageFactory.get(dataConstant.refineSearchLocalStorage, data);
                if (data) {
                    $scope.previousTheme = $scope.Theme = data.th;
                    $scope.previousRegion = $scope.Region = data.a;
                    $scope.Minfare = data.lf;
                    $scope.Maxfare = data.hf;
                }

                angular.element('#select-theme').val($scope.Theme);
                angular.element('#select-region').val($scope.Region);

                $scope.mappromise = UtilFactory.ReadAirportJson().then(function (data) {
                    $scope.AvailableAirports = data;

                    var OriginAirport = _.find($scope.AvailableAirports, function (airport) {
                        return airport.airport_Code == $scope.Origin
                    });

                    if (OriginAirport == undefined) {
                        alertify.alert("Destination Finder", "");
                        alertify.alert('Sorry , we do not have destinations to suggest for this search combination. This can also happen sometimes if the origin airport is not a popular airport. We suggest you try a different search combination or a more popular airport in your area to get destinations.');

                        // for displaying blank map and search popup
                        $scope.isShowSearchIcon = true;
                        updateSearchCriteria();
                        $timeout(function () { $scope.$broadcast('setMarkeronMap'); }, 0, false)
                        $scope.isModified = true;
                        return false;
                    }

                    if ($scope.Origin != undefined && $scope.Origin != "") {
                        $scope.LastSelectedOrigin = $scope.Origin;
                        updateSearchCriteria();
                        findDestinations();
                    }
                });
            }
        }
        $scope.ShowDestinationView = DestinationFactory.ShowDestinationView; // true;
        $scope.isSearching = true;
        $scope.activate = activate;
        $scope.findDestinations = findDestinations;
        $scope.AvailableAirports = [];
        var destinationlistOriginal;   // used for filtering data on refine search click
        $scope.destinationlist;
        $scope.AvailableThemes = AvailableTheme();
        $scope.AvailableRegions = AvailableRegions();
        $scope.limitDestinationCards = 9;
        $scope.PointOfsalesCountry;
        initFareSliderValues();
        $scope.isModified = false;
        function LoadAirlineJson() {
            // commented for the time being
            //UtilFactory.ReadAirlinesJson().then(function (data) {
            //    $scope.airlineJsonData = data;
            //});

            $scope.airlineJsonData = [];

        }
        LoadAirlineJson();
        GetCurrencySymbols();
        function FilterDestinations(destinations) {
            var destinationstodisp = [];
            for (var x = 0; x < destinations.length; x++) {
                var LowestFarePrice = "N/A";
                var LowestNonStopFare = "N/A";
                if (destinations[x].LowestNonStopFare != undefined && destinations[x].LowestNonStopFare.Fare != "N/A") {
                    LowestNonStopFare = parseFloat(destinations[x].LowestNonStopFare.Fare).toFixed(2);
                    if (LowestNonStopFare == 0)
                        LowestNonStopFare = "N/A";
                }
                if (destinations[x].LowestFare != undefined && destinations[x].LowestFare.Fare != "N/A") {
                    LowestFarePrice = parseFloat(destinations[x].LowestFare.Fare).toFixed(2);
                    if (LowestFarePrice == 0)
                        LowestFarePrice = "N/A";
                }
                if (LowestNonStopFare != "N/A" || LowestFarePrice != "N/A")
                    destinationstodisp.push(destinations[x]);
            }
            return destinationstodisp;
        }

        $scope.$watch(function () { return DestinationFactory.ShowDestinationView }, function (newVal, oldVal) {
            if (typeof newVal !== 'undefined') {
                $scope.ShowDestinationView = newVal;
            }
        });

        $scope.handleUp = function (isSelected) {
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
                if (isSelected) {
                    var data = {
                        f: $scope.Origin,
                        d: $scope.FromDate,
                        r: $scope.ToDate,
                        th: $scope.Theme,
                        a: $scope.Region,
                        lf: $scope.Minfare,
                        hf: $scope.Maxfare
                    };
                    LocalStorageFactory.save(dataConstant.refineSearchLocalStorage, data, {
                        f: $scope.Origin,
                        d: $scope.FromDate,
                        r: $scope.ToDate
                    });
                }

                $timeout(function () {
                    $scope.destinationlist = arr;
                    $scope.mappromise = UtilFactory.ReadHighRankedAirportsJson().then(function (data) {
                        $rootScope.$broadcast('setMarkeronMap', {
                            destinationlist: $scope.destinationlist,
                            Region: $scope.Region,
                            Theme: $scope.Theme,
                            highRankedAirportlist: data
                        });
                    });

                }, 0, true);
            }
        }

        function findDestinations() {
            $scope.isModified = false;
            $scope.destinationlist = null;
            destinationlistOriginal = null;
            $scope.faresList = [];
            $scope.IsRefineSearchShow = true;
            $scope.isSearching = true;
            updateSearchCriteria();
            var paramdata = CreateSearchCriteria();
            $scope.inProgress = true;
            $scope.mappromise = DestinationFactory.findDestinations(paramdata).then(function (data) {
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
                    var Maxfare = 0, Minfare = 0;
                    if (minMaxFare.MaxFare && minMaxFare.MaxFare != 0)
                        Maxfare = Math.ceil(minMaxFare.MaxFare);
                    if (minMaxFare.MinFare && minMaxFare.MinFare != 0)
                        Minfare = Math.floor(minMaxFare.MinFare);

                    setFareSliderValues(Minfare, Maxfare, $scope.Minfare || Minfare, $scope.Maxfare || Maxfare);

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
                    $scope.destinationCardList = [];
                }
                else {
                    alertify.alert("Destination Finder", "");
                    alertify.alert('Sorry , we do not have destinations to suggest for this search combination. This can also happen sometimes if the origin airport is not a popular airport. We suggest you try a different search combination or a more popular airport in your area to get destinations.').set('onok', function (closeEvent) { });
                    $scope.isShowSearchIcon = true;     // used for showing main search slider icon when user search first time
                    $scope.destinationCardList = [];
                }

                $scope.inProgress = false;
                loadScrollbars();
                $scope.handleUp();
            });

            paramdata.TopDestinations = 50;
            $scope.selectedform = 'SuggestDestination';
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
            var max = 0, min = 0;
            if (destinationList.length) {
                max = Math.max.apply(Math, destinationList.map(function (item) {
                    var lowFare = UtilFactory.GetLowFareForMap(item);
                    if (lowFare != 'N/A')
                        return UtilFactory.GetLowFareForMap(item);
                    else
                        return 0;
                }));
                min = Math.min.apply(Math, destinationList.map(function (item) {
                    var lowFare = UtilFactory.GetLowFareForMap(item);
                    if (lowFare != 'N/A')
                        return UtilFactory.GetLowFareForMap(item);
                    else
                        return 0;
                }));
            }
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
                "Theme": null,
                "Location": $scope.Location,
                "Minfare": null,
                "Maxfare": null,
                "PointOfSaleCountry": $scope.PointOfsalesCountry,
                "Region": null,
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
            //else
            //$scope.previousTheme = $scope.Theme = undefined;
            $scope.handleUp(true);
        }
        $scope.displayRegion = function (name) {
            if ($scope.previousRegion != name) {
                $scope.previousRegion = name;
                $scope.Region = name;
            }
            //else
            //$scope.previousRegion = $scope.Region = undefined;
            $scope.handleUp(true);
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
        function setFareSliderValues(rangeMin, rangeMax, selectedMin, selectedMax) {
            $scope.priceSliderValues = {
                originalRange: {
                    min: rangeMin,
                    max: rangeMax
                },
                range: {
                    min: rangeMin,
                    max: rangeMax
                },
                values: {
                    min: parseInt(selectedMin),
                    max: parseInt(selectedMax)
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

        activate();

        function SetFromDate() {
            $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
        };
        function SetToDate(fromDate) {
            $scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
        };

        $scope.GetCurrencySymbol = function (code) {
            return UtilFactory.GetCurrencySymbol(code);
        }

        $scope.loadMoreDestinations = function () {
            if ($scope.limitDestinationCards >= $scope.destinationCardList.length) return;
            $scope.$apply(function () { $scope.limitDestinationCards += 6; });
        }

        $('#select-theme').ddslick({
            onSelected: function (data) {
                $scope.displayTheme(data.selectedData.value);
            }
        });

        $('#select-region').ddslick({
            onSelected: function (data) {
                $scope.displayRegion(data.selectedData.value);
            }
        });

        $scope.$on('RenderMap', function (event, data) {
            $timeout(function () { $scope.destinationCardList = data; }, 0, true);
        })

        $scope.$on('displayOnMap', function (event, data) {
            $scope.$broadcast('gotoMap', data);
        });
    }
})();
