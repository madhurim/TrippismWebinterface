(function () {
    'use strict';
    var serviceId = 'UtilFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$location', '$anchorScroll', '$rootScope', '$q', 'TrippismConstants', '$sce', UtilFactory]);

    function UtilFactory($http, $location, $anchorScroll, $rootScope, $q, TrippismConstants, $sce) {
        var LastSearch;
        var highRankedAirportsPromise;
        var CurrencySymbolsPromise;
        var airportJsonPromise;
        var airportsCurrency = [];
        var service = {
            ReadAirportJson: ReadAirportJson,
            MapscrollTo: MapscrollTo,
            GetCurrencySymbols: GetCurrencySymbols,
            GetCurrencySymbol: GetCurrencySymbol,
            AirportCodeLog: AirportCodeLog,
            currencySymbol: { currencySymbolsList: [], currencySymbolsListCache: [] },
            GetLowFareForMap: GetLowFareForMap,
            ReadHighRankedAirportsJson: ReadHighRankedAirportsJson,
            GetValidDates: GetValidDates,
            ReadLocationPairJson: ReadLocationPairJson,
            ReadAirportsCurrency: ReadAirportsCurrency,
            GetAirportCurrency: GetAirportCurrency
        };
        return service;

        function ReadAirportJson(url) {
            if (airportJsonPromise) {
                return $q.when(airportJsonPromise).then(function (value) {
                    return value;
                });
            }
            else
                return airportJsonPromise = getAirportJson($rootScope.apiURLForConstant + 'GetAirports').then(function (data) {
                    return data;
                });
        }

        function ReadHighRankedAirportsJson(url) {
            if (highRankedAirportsPromise) {
                return $q.when(highRankedAirportsPromise).then(function (value) {
                    return value;
                });
            }
            else {
                return highRankedAirportsPromise = getAirportJson($rootScope.apiURLForConstant + 'GetHighRankedAirports').then(function (data) {
                    return data;
                });
            }
        }

        function getAirportJson(url) {
            return $http.get(url).then(function (_arrairports) {
                var AvailableCodes = [];
                if (_arrairports.status == 200) {
                    _arrairports = _arrairports.data;
                    for (var i = 0; i < _arrairports.length; i++) {
                        if (_arrairports[i].isMAC == true) {
                            var objtopush = {};
                            objtopush['airport_CityCode'] = _arrairports[i].cCode;
                            objtopush['airport_CityName'] = _arrairports[i].cName;
                            objtopush['airport_CountryCode'] = _arrairports[i].coCode;
                            objtopush['airport_CountryName'] = _arrairports[i].coName;

                            objtopush['airport_Code'] = _arrairports[i].cCode;
                            objtopush['airport_FullName'] = _arrairports[i].cName + ", All Airports";
                            objtopush['airport_Lat'] = _arrairports[i].Airports[0].lat;
                            objtopush['airport_Lng'] = _arrairports[i].Airports[0].lng;
                            objtopush['region'] = _arrairports[i].region;
                            objtopush['airport_IsMAC'] = true;
                            objtopush['themes'] = [];
                            objtopush['rank'] = _arrairports[i].rank;
                            AvailableCodes.push(objtopush);
                        }
                        if (_arrairports[i].Airports != undefined) {
                            for (var cntAirport = 0; cntAirport < _arrairports[i].Airports.length ; cntAirport++) {
                                var objtopush = {};
                                objtopush['airport_CityCode'] = _arrairports[i].cCode;
                                objtopush['airport_CityName'] = _arrairports[i].cName;
                                objtopush['airport_CountryCode'] = _arrairports[i].coCode;
                                objtopush['airport_CountryName'] = _arrairports[i].coName;

                                objtopush['airport_Code'] = _arrairports[i].Airports[cntAirport].code;
                                objtopush['airport_FullName'] = _arrairports[i].Airports[cntAirport].name;
                                objtopush['airport_Lat'] = _arrairports[i].Airports[cntAirport].lat;
                                objtopush['airport_Lng'] = _arrairports[i].Airports[cntAirport].lng;
                                objtopush['region'] = _arrairports[i].region;
                                objtopush['airport_IsMAC'] = false;
                                objtopush['alternatenames'] = _arrairports[i].Airports[cntAirport].names;
                                objtopush['themes'] = _arrairports[i].Airports[cntAirport].themes;
                                objtopush['rank'] = _arrairports[i].Airports[cntAirport].rank;
                                AvailableCodes.push(objtopush);
                            }
                        }
                    }
                }
                return AvailableCodes;
            });
        }

        function AirportCodeLog(AirportCode) {
            var dataURL = 'MissingAirportLog?Airportcode=' + AirportCode;
            var url = $rootScope.apiURLForConstant + dataURL;
            $http.jsonp(url);
        }

        function MapscrollTo(id) {
            var old = $location.hash();
            $location.hash(id);
            $anchorScroll();
            $location.hash(old);
            return;
        }

        function GetCurrencySymbols() {
            if (CurrencySymbolsPromise)
                return;
            CurrencySymbolsPromise = $http.get($rootScope.apiURLForConstant + 'GetCurrencySymbols').then(function (data) {
                if (data.status == 200)
                    service.currencySymbol.currencySymbolsList = data.data.Currency;
            });
        }
        function GetCurrencySymbol(currencyCode) {
            var cacheResult = _.findWhere(service.currencySymbol.currencySymbolsListCache, { code: currencyCode });
            if (cacheResult)
                return cacheResult.symbol;

            var result = _.findWhere(service.currencySymbol.currencySymbolsList, { code: currencyCode });
            if (result) {
                service.currencySymbol.currencySymbolsListCache.push({ symbol: result.symbol, code: result.code });
                return result.symbol;
            }
            else {
                service.currencySymbol.currencySymbolsListCache.push({ symbol: currencyCode, code: currencyCode });
                return currencyCode;
            }
        }
        function GetLowFareForMap(destination) {
            var LowestFarePrice = "N/A";
            var LowestNonStopeFare = "N/A";
            var LowRate = 'N/A';
            if (destination.LowestNonStopFare != null && destination.LowestNonStopFare.Fare != "N/A") {
                LowestNonStopeFare = parseFloat(destination.LowestNonStopFare.Fare).toFixed(2);
                if (LowestNonStopeFare == 0)
                    LowestNonStopeFare = "N/A";
            }

            // Riversing the logic. Show LowestFare on markers as opposed to LowestNonStopFare
            // LowRate = LowestNonStopeFare; // MAM : New logic                      
            if (destination.LowestFare != null && destination.LowestFare.Fare != "N/A") {
                LowestFarePrice = parseFloat(destination.LowestFare.Fare).toFixed(2);
                if (LowestFarePrice == 0)
                    LowestFarePrice = "N/A";
            }
            // MAM: New logic
            LowRate = LowestFarePrice;
            if (LowRate == "N/A")
                LowRate = LowestNonStopeFare; // MAM : New logic
            return LowRate;
        }

        function SetFromDate() {
            return ConvertToRequiredDate(GetFromDate(), 'UI');
        };
        function SetToDate(fromDate) {
            return ConvertToRequiredDate(GetToDate(fromDate), 'UI');
        };

        function GetValidDates(fromDate, toDate) {
            var obj = { FromDate: fromDate, ToDate: toDate };
            if (fromDate == null) {
                obj.FromDate = SetFromDate();
                obj.ToDate = SetToDate(obj.FromDate);
            }
            else if (toDate == null) {
                obj.ToDate = SetToDate(fromDate);
            }

            var fromDate = ConvertToDateObject(obj.FromDate);
            var toDate = ConvertToDateObject(obj.ToDate);

            if (fromDate <= new Date(new Date().setHours(0, 0, 0))) {
                obj.FromDate = SetFromDate();
                obj.ToDate = SetToDate(obj.FromDate);
            }
            else if (toDate <= fromDate)
                obj.ToDate = SetToDate(fromDate);
            else if (toDate > addDays(fromDate, TrippismConstants.MaxLOS)) {
                obj.ToDate = SetToDate(fromDate);
            }

            return obj;
        }
        function ReadLocationPairJson() {
            return $http.get('scripts/Constants/locationsPair_live.json').then(function (data) {
                return data.data;
            });
        }
        function ReadAirportsCurrency(url) {
            if (airportsCurrency.length > 0) {
                var d = $q.defer();
                d.resolve(airportsCurrency);
                return d.promise;
            }
            else
                return getAirportCurrencyJson($rootScope.apiURLForConstant + '/GetAirportsCurrency').then(function (data) {
                    airportsCurrency = data;
                    return data;
                });
        }
        function getAirportCurrencyJson(url) {
            return $http.get(url).then(function (_arrairportscurrency) {
                var AvailableAirportCurrencyCodes = [];
                if (_arrairportscurrency.status == 200) {
                    AvailableAirportCurrencyCodes = _arrairportscurrency.data.AirportCurrencies;
                }
                return AvailableAirportCurrencyCodes;
            });
        }

        function GetAirportCurrency(airportCode) {
            var cacheResult = _.findWhere(airportsCurrency, { aCode: airportCode });
            if (cacheResult) {
                return cacheResult.cCode;
            }
            else {
                return '';
            }
        }
    }
})();
