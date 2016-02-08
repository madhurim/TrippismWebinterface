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
        link: function ($scope, elem, attrs) {
            debugger;
            $scope.selectedform = 'SuggestDestination';
            $scope.SearchbuttonText = "Suggest Destinations";
            $scope.KnowSearchbuttonText = 'Get Destination Details';
            $scope.SearchbuttonIsLoading = true;
            $scope.KnowSearchbuttonIsLoading = false;
            $scope.Origin = '';
            $scope.Destination = '';
            $scope.FromDate;
            $scope.ToDate;
            $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
            $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
            $scope.minTodayDate = new Date();
            $scope.minFromDate = new Date();
            $scope.minFromDate = $scope.minFromDate.setDate($scope.minFromDate.getDate() + 1);
            debugger;
            $scope.$watch(function () { return UtilFactory.AirportData() }, function (newVal, oldVal) {
                if (typeof newVal !== 'undefined') {
                    $scope.AvailableAirports = newVal;
                }
            });
            

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
            }
        }
    }
}]);

    
    