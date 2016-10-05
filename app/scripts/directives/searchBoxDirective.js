angular.module('TrippismUIApp').directive('searchBox', [
            '$location',
            '$timeout',
            '$filter',
            '$locale',
            '$stateParams',
            'UtilFactory',
            'dataConstant',
            'urlConstant',
            'LocalStorageFactory',
function ($location, $timeout, $filter, $locale, $stateParams, UtilFactory, dataConstant, urlConstant, LocalStorageFactory) {
    return {
        restrict: 'E',
        scope: {
            isPopup: '=?isPopup'
        },
        templateUrl: urlConstant.partialViewsPath + 'searchBox.html',
        controller: function ($scope) {
            $scope.selectedform = 'SuggestDestination';
            $scope.SearchbuttonText = "Suggest Destinations";
            $scope.KnowSearchbuttonText = 'Get Destination Details';
            $scope.SearchbuttonIsLoading = false;
            $scope.KnowSearchbuttonIsLoading = false;
            $scope.Origin;
            $scope.Destination;
            $scope.FromDate;
            $scope.ToDate;
            $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
            $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 0,
                showWeeks: false
            };

            $scope.SetFromDate = SetFromDate;
            $scope.SetToDate = SetToDate;

            $scope.urlParam = {};
            function activate() {
                UtilFactory.ReadAirportJson().then(function (data) {
                    $scope.AvailableAirports = data;
                    setDefaultAirport(data);
                });

                if ($stateParams.path != undefined) {
                    var params = $stateParams.path.split(";");
                    angular.forEach(params, function (item) {
                        var para = item.split("=");
                        if (para[0].trim() === "f") {
                            $scope.Origin = para[1].trim().toUpperCase();
                            $scope.urlParam.Origin = $scope.Origin;
                        }
                        if (para[0].trim() === "t") {
                            $scope.KnownDestinationAirport = para[1].trim().toUpperCase();
                            $scope.urlParam.KnownDestinationAirport = $scope.KnownDestinationAirport;
                        }
                        if (para[0].trim() === "d") {
                            $scope.FromDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                        }
                        if (para[0].trim() === "r") {
                            $scope.ToDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                        }
                    });

                    var dates = UtilFactory.GetValidDates($scope.FromDate, $scope.ToDate);
                    $scope.FromDate = new Date(dates.FromDate);
                    $scope.ToDate = new Date(dates.ToDate);

                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                    $scope.urlParam.FromDate = $scope.FromDate;

                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                    $scope.urlParam.ToDate = $scope.ToDate;
                }
                else {
                    var lastSearch = UtilFactory.LastSearch;
                    if (lastSearch) {
                        $scope.Origin = lastSearch.origin;
                        if (lastSearch.destination) {
                            $scope.KnownDestinationAirport = lastSearch.destination;
                            $scope.selectedform = "KnowMyDestination";
                        }
                        $scope.FromDate = lastSearch.fromDate;
                        $scope.ToDate = lastSearch.toDate;
                    }
                }

            }
            activate();

            function setDefaultAirport(airportList) {
                // get user locale detail
                var userlocale = LocalStorageFactory.get(dataConstant.userLocaleLocalStorage);

                if (userlocale && userlocale.city && !$scope.Origin) {

                    $scope.FromDate = GetFromDate();
                    $scope.ToDate = GetToDate($scope.FromDate);

                    if (userlocale.nearestAirport && userlocale.airportCityName) {
                        $scope.Origin = userlocale.nearestAirport;
                        $scope.OriginCityName = userlocale.airportCityName;
                    }
                    else {
                        var nearestAirport = _.where(airportList, { airport_CityName: userlocale.city });    // get Airport list on based  CityName

                        if (nearestAirport.length) { // For multiple Airport get nearest Airport
                            if (nearestAirport.length > 1) {
                                var userPosition = new google.maps.LatLng(userlocale.location.lat, userlocale.location.lng);
                                var distance = [];
                                for (var i = 0; i < nearestAirport.length; i++) {
                                    var airportDetail = nearestAirport[i];
                                    var airportPosition = new google.maps.LatLng(airportDetail.airport_Lat, airportDetail.airport_Lng);
                                    var countDistance = google.maps.geometry.spherical.computeDistanceBetween(userPosition, airportPosition);
                                    nearestAirport[i].distanceFromOrigin = countDistance;
                                    distance.push(nearestAirport[i]);
                                }
                                nearestAirport[0] = _.min(distance, function (d) { return d.distanceFromOrigin; });
                            }
                            // set selected Airport into Origin Textbox
                            LocalStorageFactory.update(dataConstant.userLocaleLocalStorage, { nearestAirport: nearestAirport[0].airport_Code, airportCityName: nearestAirport[0].airport_CityName });
                            $scope.Origin = nearestAirport[0].airport_Code;
                            $scope.OriginCityName = nearestAirport[0].airport_CityName;
                        }
                    }
                }
            }

            function SetFromDate() {
                if ($scope.FromDate == "" || $scope.FromDate == undefined || $scope.FromDate == null) {
                    //$scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                    $scope.FromDate = GetFromDate();
                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                }
            };
            function SetToDate() {
                if (($scope.ToDate == "" || $scope.ToDate == undefined || $scope.ToDate == null) && $scope.FromDate != null) {
                    //$scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                    $scope.ToDate = GetToDate($scope.FromDate);
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
            };

        },
        link: function ($scope, elem, attrs) {
            var minFromDate = new Date();
            minFromDate = minFromDate.setDate(minFromDate.getDate() + 1);

            $scope.onSelect = function ($item) {
                $scope.Origin = $item.airport_Code;
                $scope.OriginCityName = $item.airport_CityName;
            };

            $scope.onKnowDestinationSelect = function ($item) {
                $scope.KnownDestinationAirport = $item.airport_Code;
            };

            $scope.formatInput = function ($model) {
                if ($model == "" || $model == undefined) return '';
                if (!$scope.AvailableAirports) return $model.toUpperCase();
                var originairport = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $model.toUpperCase() });
                if (!originairport) return '';
                var CountryName = (originairport.airport_CountryName != undefined) ? originairport.airport_CountryName : "";
                return originairport.airport_Code + ", " + originairport.airport_CityName + ", " + CountryName;
            }

            $scope.$watch('KnownDestinationAirport', function (newValue, oldval) {
                if (newValue != undefined && newValue != "") {

                    if (!$scope.AvailableAirports) {
                        $scope.KnownDestinationAirport = newValue;
                        return;
                    }

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
                    else if ((completeName.split(",").length - 1) >= 2) { /// Copy-Paste Whole Name with Comma and get values by code
                        var arprtDetails = completeName.split(',');
                        var arprtCode = arprtDetails[0];
                        var matchingArray = GetArrayforCompareforFullName(arprtCode);
                        if (matchingArray.length > 0) {
                            $scope.KnownDestinationAirport = matchingArray[0].airport_Code;
                        }
                    }
                }
            });

            $scope.$watch('Origin', function (newValue, oldval) {
                // return if new value same as url's origin.
                // fix for FromDate and ToDate do not get null value because of $scope.setSearchCriteria()
                if (oldval == '' && newValue == $scope.urlParam.Origin)
                    return;

                if (newValue != undefined && newValue != "") {

                    if (!$scope.AvailableAirports) {
                        $scope.Origin = newValue;
                        $scope.OriginCityName = newValue;
                        return;
                    }

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
                    else if ((completeName.split(",").length - 1) >= 2) { /// Copy-Paste Whole Name with Comma and get values by code
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

            function GetArrayforCompareforCityName(txtCityName) {
                var matchingStuffs = [];
                $scope.AvailableAirports.forEach(function (airport) {
                    if (airport.airport_CityName.toLowerCase() == txtCityName) {
                        if (matchingStuffs.indexOf(airport) == -1)
                            matchingStuffs.push(airport);
                        if (airport.airport_IsMAC == true) {
                            var multiAirports = $filter('filter')($scope.AvailableAirports, { airport_IsMAC: false, airport_CityName: airport.airport_CityName }, true);
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
                            var multiAirports = $filter('filter')($scope.AvailableAirports, { airport_IsMAC: false, airport_CityName: airport.airport_CityName }, true);
                            multiAirports.forEach(function (item) {
                                matchingStuffs.push(item);
                            });
                        }
                    }
                });
                return matchingStuffs;
            }

            // used to reset all the search criteria instead of Orign if origin is changed.
            $scope.setSearchCriteria = function () {
                if ($scope.Origin && $scope.Origin.length > 2 && $scope.Origin != $scope.LastSelectedOrigin) {
                    $scope.LastSelectedOrigin = $scope.Origin;
                    if ($scope.selectedform != "KnowMyDestination") {
                        $scope.KnownDestinationAirport = null;
                    }

                    if ($scope.FromDate && $scope.ToDate)
                        resetDates();
                    updateSearchCriteria();
                }
            }

            // for updating 'You searched' block
            function updateSearchCriteria() {
                $scope.refineSearchValues = {
                    OrigintoDisp: ($scope.refineSearchValues && $scope.refineSearchValues.OrigintoDisp) ? $scope.refineSearchValues.OrigintoDisp : undefined,
                    Minfare: null,
                    Maxfare: null,
                    Region: null,
                    Theme: null,
                    FromDate: (typeof $scope.FromDate == 'string') ? new Date($scope.FromDate) : $scope.FromDate,
                    ToDate: (typeof $scope.ToDate == 'string') ? new Date($scope.ToDate) : $scope.ToDate
                };
            }

            function resetDates() {
                $scope.FromDate = null;
                $scope.ToDate = null;
                $scope.SetFromDate();
                $scope.SetToDate();
            }

            $scope.openFromDate = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.openedToDate = false;
                $scope.openedFromDate = true;
                $scope.SetFromDate();
                document.getElementById('txtFromDate').select();

                if ($scope.isPopup && $scope.FromDate)
                    $timeout(function () { $scope.$broadcast('refreshDatepickers', new Date($scope.FromDate)); }, 0, false);
            };

            $scope.openToDate = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.openedFromDate = false;
                $scope.openedToDate = true;
                document.getElementById('txtToDate').select();
            };


            //// for solving ToDate datepicker render issue
            //$scope.$watch('openedToDate', function (newVal, oldVal) {
            //    if (newVal && !oldVal && $scope.ToDate)
            //        $timeout(function () { $scope.$broadcast('refreshDatepickers', new Date($scope.ToDate)); }, 0, false);
            //});

            // watch FromDate textbox value
            $scope.$watch('frmdestfinder.FromDate.$viewValue', function (newVal, OldVal) {
                $scope.FromDate = $scope.frmdestfinder.FromDate.$modelValue;
                if (angular.isDate($scope.FromDate)) {
                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                }
                else {
                    var frmdate = newVal;
                    if (frmdate != "" && frmdate != null && frmdate != undefined) {
                        if (frmdate.length == 10) {
                            if (frmdate.indexOf("-") != -1 || frmdate.indexOf(".") != -1) {
                                var dtStr = frmdate;
                                var mm = dtStr.substring(0, 2);
                                var dd = dtStr.substring(3, 5);
                                var yyyy = dtStr.substring(6, 11);
                                $scope.FromDate = new Date(yyyy, mm, dd);
                                $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                                if ($scope.FromDateDisplay == "Invalid Date !!") {
                                    $scope.FromDate = GetFromDate();
                                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                                }
                            }
                        }
                        if (!isNaN(frmdate)) {
                            if (frmdate.length == 8) {
                                var dtStr = frmdate;
                                var mm = parseInt(dtStr.substring(0, 2));
                                var dd = parseInt(dtStr.substring(2, 4));
                                var yyyy = parseInt(dtStr.substring(4, 8));
                                $scope.FromDate = new Date(yyyy, mm, dd);
                                $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                                if ($scope.FromDateDisplay == "Invalid Date !!") {
                                    $scope.FromDate = GetFromDate();
                                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                                }
                            }
                        }
                    }
                    else {
                        $scope.FromDateDisplay = "";
                    }
                }

                var newValue = $scope.FromDate;
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
                    $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');

                    $scope.ToDate = undefined;
                    $scope.SetToDate();
                    var todate = new Date($scope.ToDate);
                    todate.setHours(0, 0, 0, 0);

                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                    return;
                }
                else if (newDt > maxFrmDate) {
                    $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                    return;
                }
                else {
                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                }
                /**/

                //SET MINIMUN SELECTED DATE for TODATE
                minFromDate = new Date(newValue);
                $scope.MaximumToDate = addDays(minFromDate, dataConstant.maxLOS);
                minFromDate = minFromDate.setDate(minFromDate.getDate() + 1);

                var maxToDate = new Date($scope.MaximumToDate);
                maxToDate.setHours(0, 0, 0, 0);

                if (newDt >= todate) {
                    //$scope.ToDate = ConvertToRequiredDate(GetToDate(newDt), 'UI');
                    $scope.ToDate = GetToDate(newDt);
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
                else if (todate > maxToDate) {
                    //$scope.ToDate = ConvertToRequiredDate(GetToDate(newDt), 'UI');
                    $scope.ToDate = GetToDate(newDt);
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
            })

            // watch ToDate textbox value
            $scope.$watch('frmdestfinder.ToDate.$viewValue', function (newVal) {
                $scope.ToDate = $scope.frmdestfinder.ToDate.$modelValue;
                if (angular.isDate($scope.ToDate)) {
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
                else {
                    var todate = newVal;
                    if (todate != "" && todate != null && todate != undefined) {
                        if (todate.length == 10) {
                            if (todate.indexOf("-") != -1 || todate.indexOf(".") != -1) {
                                var dtStr = todate;
                                var mm = dtStr.substring(0, 2);
                                var dd = dtStr.substring(3, 5);
                                var yyyy = dtStr.substring(6, 11);
                                $scope.ToDate = new Date(yyyy, mm, dd);
                                $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                                if ($scope.ToDateDisplay == "Invalid Date !!") {
                                    //$scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                                    $scope.ToDate = GetToDate($scope.FromDate);
                                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                                }
                            }
                        }
                        if (!isNaN(todate)) {
                            if (todate.length == 8) {
                                var dtStr = todate;
                                var mm = parseInt(dtStr.substring(0, 2));
                                var dd = parseInt(dtStr.substring(2, 4));
                                var yyyy = parseInt(dtStr.substring(4, 8));
                                $scope.ToDate = new Date(yyyy, mm, dd);
                                $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                                if ($scope.ToDateDisplay == "Invalid Date !!") {
                                    //$scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                                    $scope.ToDate = GetToDate($scope.FromDate);
                                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                                }
                            }
                        }
                    }
                    else {
                        $scope.ToDateDisplay = "";
                    }
                }

                var newValue = $scope.ToDate;
                if (newValue == null)
                    return;

                var minToDt = new Date(minFromDate);
                minToDt.setHours(0, 0, 0, 0);

                /* If from date is greater than to date */
                var newDt = new Date(newValue);
                newDt.setHours(0, 0, 0, 0);

                var mxToDate = new Date($scope.MaximumToDate);
                mxToDate.setHours(0, 0, 0, 0);

                if (newDt < minToDt || newDt > mxToDate) {
                    $scope.ToDate = GetToDate(newDt);
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                    return;
                }
                else {
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
            })

            $scope.GetDestinationClick = function (path) {
                if ($scope.frmdestfinder.$invalid) {
                    $scope.hasError = true;
                    return;
                }

                var KnownDestinationAirport = $scope.KnownDestinationAirport;
                var Origin = $scope.Origin;

                if ($scope.AvailableAirports) {
                    $scope.hasError = false;
                    if ($scope.selectedform == "KnowMyDestination" && $scope.KnownDestinationAirport) {
                        KnownDestinationAirport = $scope.KnownDestinationAirport.split(',')[0].toUpperCase().trim();
                        var isDestination = _.findWhere($scope.AvailableAirports, { airport_Code: KnownDestinationAirport });
                        if (!isDestination) {
                            $scope.hasError = true;
                            $scope.frmdestfinder.$invalid = true;
                            $scope.frmdestfinder.KnownDestinationAirport.$invalid = true;
                            document.getElementById("KnownDestinationAirport").focus();
                        }
                    }
                    if ($scope.Origin) {
                        Origin = $scope.Origin.split(',')[0].toUpperCase().trim();
                        var isOrigin = _.findWhere($scope.AvailableAirports, { airport_Code: Origin });
                        if (!isOrigin) {
                            $scope.hasError = true;
                            $scope.frmdestfinder.$invalid = true;
                            $scope.frmdestfinder.Origin.$invalid = true;
                            document.getElementById("Origin").focus();
                        }
                    }
                    if ($scope.hasError) return;
                }

                $scope.CallDestiantionsview(path, Origin, $scope.FromDate, $scope.ToDate, KnownDestinationAirport);

            }

            $scope.CallDestiantionsview = function (path, origin, fromDate, toDate, destination) {

                if ($scope.selectedform == "SuggestDestination") {
                    if (!$scope.isPopup) {
                        LocalStorageFactory.clear(dataConstant.refineSearchLocalStorage);
                    }
                    $location.path(path + '/f=' + origin + ';d=' + ConvertToRequiredDate(fromDate, 'API') + ';r=' + ConvertToRequiredDate(toDate, 'API'));
                    destination = null;
                }
                else {
                    if (!$scope.isPopup) {
                        LocalStorageFactory.clear(dataConstant.refineSearchLocalStorage);
                    }
                    $location.path(path + '/f=' + origin + ';t=' + destination + ';d=' + ConvertToRequiredDate(fromDate, 'API') + ';r=' + ConvertToRequiredDate(toDate, 'API'));
                }
                UtilFactory.LastSearch = { origin: origin, fromDate: fromDate, toDate: toDate, destination: destination };
                $scope.isPopup = false;
            }
        }
    }
}]);


