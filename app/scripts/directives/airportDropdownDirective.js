(function () {
    'use strict';
    angular.module('TrippismUIApp').directive('airportDropdown', ['$filter', 'urlConstant', function ($filter, urlConstant) {
        return {
            restrict: 'C',
            templateUrl: urlConstant.partialViewsPath + 'airportDropdownPartial.html',
            controller: function ($scope) {
                var orderby = ['rank', 'airport_Code'];
                $scope.airportsAutocomplete = function (keyedinValue) {
                    var matchingAirports = [];
                    if (!$scope.AvailableAirports)
                        return matchingAirports;

                    keyedinValue = keyedinValue.toLowerCase();
                    var displayCount = 10;  // airports to be displayed in list
                    if (keyedinValue.length == 2) {   // match with airport code only
                        $scope.AvailableAirports.forEach(function (airport) {
                            if (airport.airport_Code.substr(0, 2).toLowerCase() == keyedinValue) {
                                if (matchingAirports.indexOf(airport) == -1) {
                                    airport.searchby = "C"; //added searchby flag for highlight the text when search by airport code                                    
                                    matchingAirports.push(airport);
                                }
                            }
                        });
                        matchingAirports = $filter('orderBy')(matchingAirports, orderby);
                        matchingAirports = _.first(matchingAirports, displayCount);
                        return matchingAirports;
                    }
                    else if (keyedinValue.length == 3) {  // match with airport code then city name
                        var matchingCityAirports = [];
                        for (var i = 0; i < $scope.AvailableAirports.length; i++) {
                            var airport = $scope.AvailableAirports[i];
                            if (airport.airport_Code.toLowerCase() == keyedinValue) {
                                if (matchingAirports.indexOf(airport) == -1) {
                                    airport.searchby = "C"; //added searchby flag for highlight the text when search by airport code                                    
                                    matchingAirports.push(airport);
                                }
                                // if it is MAC then get all the airports of it.
                                if (airport.airport_IsMAC == true) {
                                    var multiAirports = $filter('filter')($scope.AvailableAirports, { airport_IsMAC: false, airport_CityCode: airport.airport_CityCode }, true);
                                    multiAirports.forEach(function (item) {
                                        item.searchby = "CN"; //added searchby flag for highlight the text when search by airport code                                        
                                        matchingAirports.push(item);
                                    });
                                }
                            }
                            else if (airport.airport_CityName.substr(0, 3).toLowerCase() == keyedinValue) {
                                airport.searchby = "CN"; //added searchby flag for highlight the text when search by airport city name                                
                                matchingCityAirports.push(airport);
                            }
                        }

                        // add city name matched airports into matchingAirports if not exist in matchingAirports
                        matchingCityAirports.forEach(function (item) {
                            var existAirport = $filter('filter')(matchingAirports, { airport_Code: item.airport_Code }, true)[0];
                            if (!existAirport) {
                                item.searchby = "CN"; //added searchby flag for highlight the text when search by airport city name                                
                                matchingAirports.push(item);
                            }
                        });
                        matchingAirports = getFilteredAirportList(matchingAirports, displayCount, keyedinValue);
                        return matchingAirports;
                    }
                    else {  // match with cityname then airport full name, alternate names, country name                
                        var length = keyedinValue.length;
                        $scope.AvailableAirports.forEach(function (airport) {
                            if (airport.airport_CityName.substr(0, length).toLowerCase() == keyedinValue) {
                                if (matchingAirports.indexOf(airport) == -1) {
                                    airport.searchby = "CN"; //added searchby flag for highlight the text when search by airport city name                                    
                                    matchingAirports.push(airport);
                                }
                                // if it is MAC then get all the airports of it.
                                if (airport.airport_IsMAC == true) {
                                    var multiAirports = $filter('filter')($scope.AvailableAirports, { airport_IsMAC: false, airport_CityCode: airport.airport_CityCode }, true);
                                    multiAirports.forEach(function (item) {
                                        item.searchby = "CN"; //added searchby flag for highlight the text when search by airport city name                                        
                                        matchingAirports.push(item);
                                    });
                                }
                            }
                            else {
                                if (airport.airport_FullName.substr(0, length).toLowerCase() == keyedinValue
                                    || isExistInAlternateNameArray(airport.alternatenames == null ? [] : airport.alternatenames.split(','), keyedinValue)
                                    || airport.airport_CountryName.substr(0, length).toLowerCase() == keyedinValue) {
                                    if (matchingAirports.indexOf(airport) == -1) {
                                        airport.searchby = "ALL"; //added searchby flag for highlight the text when search                                        
                                        matchingAirports.push(airport);
                                    }
                                    // if it is MAC then get all the airports of it.
                                    if (airport.airport_IsMAC == true) {
                                        var multiAirports = $filter('filter')($scope.AvailableAirports, { airport_IsMAC: false, airport_CityCode: airport.airport_CityCode }, true);
                                        multiAirports.forEach(function (item) {
                                            item.searchby = "ALL"; //added searchby flag for highlight the text when search                                            
                                            matchingAirports.push(item);
                                        });
                                    }
                                }
                            }
                        });
                        if (matchingAirports.length > displayCount) {
                            matchingAirports = getFilteredAirportList(matchingAirports, displayCount);
                        }
                        return matchingAirports;
                    }
                }

                var isExistInAlternateNameArray = function (list, name) {
                    var isExist = false;
                    angular.forEach(list, function (item) {
                        if (item.substr(0, name.length).toLowerCase() == name.toLowerCase()) {
                            isExist = true; return;
                        }
                    });
                    return isExist;
                }

                /* if multi airport city found then returns top N multi airport city with it's airports orderby rank and airport_Code
                   else return top N airports orderby rank and airport_Code */
                // priorityAirportCode : if there is no MAC airports then airport code passed into this parameter will be placed at top of the list
                function getFilteredAirportList(matchingAirports, displayCount, priorityAirportCode) {
                    var multiAirportCityList = $filter('orderBy')($filter('filter')(matchingAirports, { airport_IsMAC: true }, true), orderby);
                    if (multiAirportCityList.length > 0) {
                        if (priorityAirportCode)
                            multiAirportCityList = getAirportObjectBasedOnPriority(multiAirportCityList, priorityAirportCode);;

                        var airports = matchingAirports;
                        matchingAirports = [];
                        _(multiAirportCityList).each(function (item) {
                            matchingAirports.push(item);
                            var MACAirports = [];
                            _(($filter('filter')(airports, { airport_IsMAC: false, airport_CityCode: item.airport_CityCode }, true)))
                                .each(function (item) {
                                    MACAirports.push(item);
                                });
                            matchingAirports = matchingAirports.concat($filter('orderBy')(MACAirports, orderby));
                        });

                        matchingAirports = _.first(matchingAirports, displayCount);
                    }
                    else {
                        if (priorityAirportCode) {
                            var airportList = getAirportObjectBasedOnPriority(matchingAirports, priorityAirportCode);
                            matchingAirports = _.first(airportList, displayCount);
                        }
                        else {
                            matchingAirports = $filter('orderBy')(matchingAirports, orderby);
                            matchingAirports = _.first(matchingAirports, displayCount);
                        }
                    }
                    return matchingAirports;
                }

                // This will return airport list by giving priority to that airports which have perfect match to airport code.
                function getAirportObjectBasedOnPriority(airportList, priorityAirportCode) {
                    var airportCodeMatched = [];
                    var airportCodeNotMatched = [];
                    _(airportList).each(function (item) {
                        if (item.airport_Code.toLowerCase() == priorityAirportCode)
                            airportCodeMatched.push(item);
                        else
                            airportCodeNotMatched.push(item);
                    });
                    airportCodeMatched = $filter('orderBy')(airportCodeMatched, orderby);
                    airportCodeNotMatched = $filter('orderBy')(airportCodeNotMatched, orderby);
                    return airportCodeMatched.concat(airportCodeNotMatched);
                }
            }
        }
    }]);
})();