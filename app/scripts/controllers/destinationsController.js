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
        $scope.isSearching = true;
        $scope.activate = activate;
        $scope.findDestinations = findDestinations;
        var highRankedAirportlist = [], AvailableAirports = [];
        var OriginAirport;
        var destinationlistOriginal;   // used for filtering data on refine search click        
        $scope.AvailableThemes = AvailableTheme();
        $scope.AvailableRegions = AvailableRegions();
        var limitDestinationCards = 15;
        $scope.PointOfsalesCountry;
        var googleMapPassinglist = [];
        $scope.isModified = false;
        var sortByPrice = 'dsc';
        var destinationCardList = [];
        var stopEvent = false;  // flag for stopping refineDestinations call

        initFareSliderValues();
        LoadAirlineJson();
        GetCurrencySymbols();

        function activate() {

            if ($stateParams.path != undefined) {

                var params = $stateParams.path.split(";");
                // split destination and origin to compare with tab title

                var isSearched = false;
                angular.forEach(params, function (item) {
                    var para = item.split("=");
                    if (para[0].trim() === "f")
                        $scope.Origin = para[1].trim().toUpperCase();
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
                    f: $scope.Origin
                };
                $scope.lastselectedcurrency = $rootScope.currencyCode;

                var data = LocalStorageFactory.get(dataConstant.refineSearchLocalStorage, data);
                if (data) {
                    $scope.previousTheme = $scope.Theme = data.th;
                    $scope.previousRegion = $scope.Region = data.a;
                    $scope.lastselectedcurrency = (data.ncu) ? data.ncu : $scope.lastselectedcurrency;
                    if (data.pcu == data.ncu && data.lf && data.hf) {
                        $scope.Minfare = data.lf;
                        $scope.Maxfare = data.hf;
                    }
                    $rootScope.setdefaultcurrency($scope.lastselectedcurrency);
                }
                else {
                    data = {
                        f: $scope.Origin,
                        d: $scope.FromDate,
                        r: $scope.ToDate,
                    };
                    $scope.lastselectedcurrency = undefined;
                    LocalStorageFactory.save(dataConstant.refineSearchLocalStorage, data);
                    $rootScope.setdefaultcurrency($scope.lastselectedcurrency);
                }

                angular.element('#select-theme').val($scope.Theme);
                angular.element('#select-region').val($scope.Region);

                var highRankedAirportsJsonPromise = UtilFactory.ReadHighRankedAirportsJson();
                $scope.mappromise = UtilFactory.ReadAirportJson().then(function (data) {
                    AvailableAirports = data;
                    OriginAirport = _.find(data, function (airport) {
                        return airport.airport_Code == $scope.Origin
                    });
                    if (OriginAirport == undefined) {
                        alertify.alert("Destination Finder", "");
                        alertify.alert('Sorry, we do not have destinations to suggest for this search combination. This can also happen sometimes if the origin airport is not a popular airport. We suggest you try a different search combination or a more popular airport in your area to get destinations.');

                        // for displaying blank map and search popup
                        updateSearchCriteria();
                        $timeout(function () { $scope.$broadcast('setMarkerOnMap'); }, 0, false)
                        $scope.isModified = true;
                        setDestinationCards([]);
                        return false;
                    }

                    highRankedAirportsJsonPromise.then(function (data) {
                        highRankedAirportlist = data;
                        if ($scope.Origin != undefined && $scope.Origin != "") {
                            $scope.LastSelectedOrigin = $scope.Origin;
                            updateSearchCriteria();
                            findDestinations();
                        }
                    });
                });
            }
        }

        function LoadAirlineJson() {
            // commented for the time being
            //UtilFactory.ReadAirlinesJson().then(function (data) {
            //    $scope.airlineJsonData = data;
            //});

            $scope.airlineJsonData = [];
        }

        function filterDestinations(destinations) {
            var destinationsToDisp = [];
            var filterDestinationsList = [];
            for (var x = 0; x < destinations.length; x++) {
                var destination = destinations[x];
                var airport = _.find(highRankedAirportlist, function (airport) {
                    return airport.airport_Code == destination.DestinationLocation
                });

                if (airport != undefined) {
                    var LowRate = UtilFactory.GetLowFareForMap(destination);
                    if (LowRate != "N/A") {
                        destination.LowRate = parseFloat(UtilFactory.GetLowFareForMap(destination) * $rootScope.currencyInfo.rate).toFixed();
                        destination.lat = airport.airport_Lat;
                        destination.lng = airport.airport_Lng;
                        destination.rank = airport.rank;
                        destination.CityName = airport.airport_CityName;
                        destination.CityCode = airport.airport_CityCode;
                        destination.FullName = airport.airport_FullName;
                        destination.CurrencySymbol = $rootScope.currencyInfo.symbol;
                        filterDestinationsList.push(destination);
                    }
                }
            }

            // filter destinations for same city code on based their LowRate

            filterDestinationsList = _.groupBy(filterDestinationsList, function (destinations) { return destinations.CityCode });
            _.each(filterDestinationsList, function (dest) {
                destinationsToDisp.push(_.min(dest, function (d) { return d.LowRate; }))
            });

            return destinationsToDisp;
        }

        $scope.refineDestinations = function (isSelected, sortByPrice) {
            if (stopEvent) return;
            if (destinationlistOriginal && destinationlistOriginal.length > 0) {
                $scope.isReset = true;

                googleMapPassinglist = filter(destinationlistOriginal);
                updateSearchCriteria();
                if (isSelected) {
                    $timeout(function () { updaterefineSearch(); }, 0, true);
                }
                if (!googleMapPassinglist.length) setDestinationCards([]), $scope.isDestinations = false;
                setMapMarker('setMarkerOnMap', googleMapPassinglist, sortByPrice);
            }
        }

        function filter(destinationlistOriginal) {
            var arr = [];
            for (var i = 0; i < destinationlistOriginal.length; i++) {
                var destination = destinationlistOriginal[i];
                var airport = $filter('filter')(AvailableAirports, { airport_Code: destination.DestinationLocation });
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
                        var fare = Math.ceil(destination.LowRate);
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
            return arr;
        }

        function findDestinations() {
            $scope.isModified = false;
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
                    var destinationCurrencyCode = _.find(data.FareInfo, function (item) { return item.CurrencyCode && item.CurrencyCode != 'N/A'; });
                    $rootScope.changeRate(destinationCurrencyCode.CurrencyCode).then(function (currency) {
                        destinationlistOriginal = filterDestinations(data.FareInfo);
                        $scope.fareCurrencySymbol = $rootScope.currencyInfo.symbol;

                        // for displaying default min/max fare values into refine search
                        var minMaxFare = getMinMaxFare(destinationlistOriginal);
                        var Maxfare = 0, Minfare = 0;
                        if (minMaxFare.MaxFare && minMaxFare.MaxFare != 0)
                            Maxfare = Math.ceil(minMaxFare.MaxFare * $rootScope.currencyInfo.rate);
                        if (minMaxFare.MinFare && minMaxFare.MinFare != 0)
                            Minfare = Math.floor(minMaxFare.MinFare * $rootScope.currencyInfo.rate);

                        setFareSliderValues(Minfare, Maxfare, $scope.Minfare || Minfare, $scope.Maxfare || Maxfare);

                        UtilFactory.MapscrollTo('wrapper');
                        $scope.isRefineSeachCollapsed = true;
                        $scope.inProgress = false;
                        loadScrollbars();
                        $scope.refineDestinations(true);
                    });

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
                            CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "," + "</span><br/>";
                        }
                    }
                    CList += "</div>";
                    alertify.alert("Trippism", "");
                    alertify.alert(CList).set('onok', function (closeEvent) { });
                    $scope.IscalledFromIknowMyDest = false;
                    setDestinationCards([]);
                    $scope.isDestinations = false;

                    $scope.inProgress = false;
                    loadScrollbars();
                    $scope.refineDestinations();
                }
                else {
                    alertify.alert("Destination Finder", "");
                    alertify.alert('Sorry , we do not have destinations to suggest for this search combination. This can also happen sometimes if the origin airport is not a popular airport. We suggest you try a different search combination or a more popular airport in your area to get destinations.').set('onok', function (closeEvent) { });
                    setDestinationCards([]);
                    $scope.isDestinations = false;

                    $scope.inProgress = false;
                    loadScrollbars();
                    $scope.refineDestinations();
                }
            });
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

            var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
            var secondDate = new Date($scope.ToDate);
            var firstDate = new Date($scope.FromDate);
            $scope.LenghtOfStay = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));

            $scope.PointOfsalesCountry = OriginAirport.airport_CountryCode;

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
                "Region": null
            };
            return data;
        }
        function updaterefineSearch() {
            var data = {
                f: $scope.Origin,
                d: $scope.FromDate,
                r: $scope.ToDate,
                th: $scope.Theme,
                a: $scope.Region,
                lf: $scope.Minfare,
                hf: $scope.Maxfare,
                pcu: $scope.lastselectedcurrency,
                ncu: $scope.lastselectedcurrency
            };
            LocalStorageFactory.save(dataConstant.refineSearchLocalStorage, data, {
                f: $scope.Origin
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
            $scope.refineDestinations(true);
        }
        $scope.displayRegion = function (name) {
            if ($scope.previousRegion != name) {
                $scope.previousRegion = name;
                $scope.Region = name;
            }
            $scope.refineDestinations(true);
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
            if (limitDestinationCards >= destinationCardList.length) return;
            limitDestinationCards += 6;
            setDestinationCards(destinationCardList);
        }

        $('#select-theme').ddslick({
            onSelected: function (data) {
                $timeout(function () { $scope.displayTheme(data.selectedData.value); }, 0, true);
            }
        });

        $('#select-region').ddslick({
            onSelected: function (data) {
                $timeout(function () { $scope.displayRegion(data.selectedData.value); }, 0, true);
            }
        });

        $scope.$on('redrawMarkers', function (event, data) {
            $scope.isDestinations = data.isDestinations;
            data = _.map(data.markers, function (i) { return i.markerInfo; });
            setDestinationCards(data);
        });

        $scope.$on('displayOnMap', function (event, data) {
            $scope.$broadcast('gotoMap', data);
        });

        $scope.$on('sortCardsByPrice', function () {
            sortByPrice = sortByPrice == 'asc' ? 'dsc' : 'asc';
            $scope.refineDestinations(false, sortByPrice);
        });

        function setDestinationCards(data) {
            $timeout(function () {
                destinationCardList = data;
                $scope.destinationCardListDisp = $filter('limitTo')(data, limitDestinationCards);
            }, 0, true)
        }
        
        $scope.resetFilter = function () {
            stopEvent = true;
            $('#select-theme,#select-region').ddslick('select', { index: 0 });
            setFareSliderValues($scope.priceSliderValues.range.min, $scope.priceSliderValues.range.max, $scope.priceSliderValues.range.min, $scope.priceSliderValues.range.max);
            $timeout(function () { stopEvent = false; $scope.refineDestinations(true); }, 0, false);
        }

        function setMinMaxfare(destinationlistOriginal) {
            var minMaxFare = getMinMaxFare(destinationlistOriginal);
            var Maxfare = 0, Minfare = 0;
            if (minMaxFare.MaxFare && minMaxFare.MaxFare != 0)
                Maxfare = Math.ceil(minMaxFare.MaxFare * $rootScope.currencyInfo.rate);
            if (minMaxFare.MinFare && minMaxFare.MinFare != 0)
                Minfare = Math.floor(minMaxFare.MinFare * $rootScope.currencyInfo.rate);
            return {
                Minfare: Minfare,
                Maxfare: Maxfare
            }
        }

        function setMapMarker(handlerName, destinationlist, sortByPrice) {
            $rootScope.$broadcast(handlerName, {
                destinationlist: destinationlist,
                Region: $scope.Region,
                Theme: $scope.Theme,
                Price: $scope.priceSliderValues.values.max != $scope.priceSliderValues.range.max || $scope.priceSliderValues.values.min != $scope.priceSliderValues.range.min,
                sortByPrice: sortByPrice
            });
        }

        $scope.$on('setExchangeRate', function (event, args) {
            if (destinationlistOriginal) {
                for (var x = 0; x < destinationlistOriginal.length; x++) {
                    var destination = destinationlistOriginal[x];
                    destinationlistOriginal[x].LowRate = parseFloat(UtilFactory.GetLowFareForMap(destination) * $rootScope.currencyInfo.rate).toFixed();
                    destinationlistOriginal[x].CurrencySymbol = $rootScope.currencyInfo.symbol;
                }
                $scope.fareCurrencySymbol = $rootScope.currencyInfo.symbol;

                var Fare = setMinMaxfare(destinationlistOriginal);
                setFareSliderValues(Fare.Minfare, Fare.Maxfare, Fare.Minfare, Fare.Maxfare);

                $timeout(function () {
                    googleMapPassinglist = filter(destinationlistOriginal);
                    loadScrollbars();

                    setMapMarker('currencyChangeSetMarkerOnMap', googleMapPassinglist);

                    $scope.lastselectedcurrency = $rootScope.currencyCode;
                    $timeout(function () {
                        updateSearchCriteria(); updaterefineSearch();
                    }, 0, true);
                }, 0, true);
            }
        });
    }
})();
