(function () {
    'use strict';
    var serviceId = 'UtilFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$location', '$anchorScroll', 'urlConstant', '$q', 'dataConstant', '$sce', UtilFactory]);

    function UtilFactory($http, $location, $anchorScroll, urlConstant, $q, dataConstant, $sce) {
        var LastSearch;
        var highRankedAirportsPromise;
        var CurrencySymbolsPromise;
        var airportJsonPromise;
        var airportsCurrencyPromise;
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
            GetAirportCurrency: GetAirportCurrency,
            amountBifurcation: amountBifurcation,
            DistanceBetweenPoints: DistanceBetweenPoints
        };
        return service;

        function ReadAirportJson(url) {
            if (airportJsonPromise) {
                return $q.when(airportJsonPromise).then(function (value) {
                    return value;
                });
            }
            else
                return airportJsonPromise = getAirportJson(urlConstant.apiURLForConstant + 'GetAirports').then(function (data) {
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
                return highRankedAirportsPromise = getAirportJson(urlConstant.apiURLForConstant + 'GetHighRankedAirports').then(function (data) {
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
            var url = urlConstant.apiURLForConstant + dataURL;
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
            CurrencySymbolsPromise = $http.get(urlConstant.apiURLForConstant + 'GetCurrencySymbols').then(function (data) {
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
            else if (toDate > addDays(fromDate, dataConstant.maxLOS)) {
                obj.ToDate = SetToDate(fromDate);
            }

            return obj;
        }
        function ReadLocationPairJson() {
            return $http.get('scripts/Constants/locationsPair.json').then(function (data) {
                return data.data;
            });
        }
        function ReadAirportsCurrency() {
            if (airportsCurrencyPromise) {
                return $q.when(airportsCurrencyPromise).then(function (value) {
                    return value;
                });
            }
            else
                return airportsCurrencyPromise = getAirportCurrencyJson(urlConstant.apiURLForConstant + '/GetAirportsCurrency').then(function (data) {
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

        function amountBifurcation(TotalfareAmount) {
            var afterDec = (TotalfareAmount + "").split(".")[1] || '00';
            var result = {
                BeforeDecimal: Math.floor(TotalfareAmount),
                AfterDecimal: "." + (afterDec.length == 1 ? afterDec + '0' : afterDec)
            };
            return result;
        }

        function DistanceBetweenPoints(p1, p2) {
            if (!p1 || !p2) {
                return 0;
            }

            var R = 6371; // Radius of the Earth in km
            var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
            var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
        };
    }
})();
