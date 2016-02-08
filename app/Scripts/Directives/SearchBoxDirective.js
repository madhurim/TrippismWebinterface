angular.module('TrippismUIApp').directive('searchBox', [
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
function($location,$modal,$rootScope,$timeout,$filter,$window,DestinationFactory,UtilFactory,FareforecastFactory,SeasonalityFactory,TrippismConstants)
{
    return {
        restrict: 'E',
        templateUrl: '/Views/Partials/SearchBox.html',
        controller: function ($scope) {
            $scope.selectedform = 'SuggestDestination';
            $scope.SearchbuttonText = "Suggest Destinations";
            $scope.KnowSearchbuttonText = 'Get Destination Details';
            $scope.SearchbuttonIsLoading = false;
            $scope.KnowSearchbuttonIsLoading = false;
            $scope.Origin = '';
            $scope.Destination = '';
            $scope.FromDate;
            $scope.ToDate;
            $scope.formats = Dateformat();
            $scope.format = $scope.formats[5];
            $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
            $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
            $scope.minTodayDate = new Date();
            $scope.minFromDate = new Date();
            $scope.minFromDate = $scope.minFromDate.setDate($scope.minFromDate.getDate() + 1);
        },
        link: function ($scope, elem, attrs) {
           
            $scope.$watch(function () { return UtilFactory.AirportData() }, function (newVal, oldVal) {
                if (typeof newVal !== 'undefined') {
                    $scope.AvailableAirports = newVal;
                }
            });
         
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
            // used to reset all the search criteria instead of Orign if origin is changed.
            $scope.setSearchCriteria = function () {
                if ($scope.Origin && $scope.Origin.length > 2 && $scope.Origin != $scope.LastSelectedOrigin) {
                    $scope.LastSelectedOrigin = $scope.Origin;
                    if ($scope.selectedform != "KnowMyDestination") {
                        $scope.KnownDestinationAirport = null;
                    }
                   // clearRefineSearchSelection();
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
                $scope.openedFromDate = true;
                $scope.SetFromDate();
                document.getElementById('txtFromDate').select();
            };
            $scope.openToDate = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = true;
                document.getElementById('txtToDate').select();
            };
            $scope.SetFromDate = function () {
                if ($scope.FromDate == "" || $scope.FromDate == undefined || $scope.FromDate == null) {
                    $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                }
            };
            $scope.SetToDate = function () {
                if (($scope.ToDate == "" || $scope.ToDate == undefined || $scope.ToDate == null) && $scope.FromDate != null) {
                    $scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
            };
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

            $scope.GetDestinationClick = function (path) {

                if ($scope.frmdestfinder.$invalid) {
                    $scope.hasError = true;
                    return;
                }
                if ($scope.invalidFromDate || $scope.invalidToDate) {
                    $scope.hasError = true;
                    return;
                }
                $scope.CallDestiantionsview(path);

            }
            $scope.CallDestiantionsview = function (path)
            {
                if ($scope.selectedform == "SuggestDestination")
                    $location.path(path + '/' + $scope.Origin + '/' + ConvertToRequiredDate($scope.FromDate, 'API') + '/' + ConvertToRequiredDate($scope.ToDate, 'API'));
                  else
                    $location.path(path + '/' + $scope.Origin + '/' + $scope.Destination + '/' + ConvertToRequiredDate($scope.FromDate, 'API') + '/' + ConvertToRequiredDate($scope.ToDate, 'API'));
            }
        }
    }
}]);

    
    