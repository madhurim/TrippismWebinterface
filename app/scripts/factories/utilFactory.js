(function () {
    'use strict';
    var serviceId = 'UtilFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$location', '$anchorScroll', 'urlConstant', '$q', 'dataConstant', '$sce', '$rootScope', 'LocalStorageFactory', UtilFactory]);

    function UtilFactory($http, $location, $anchorScroll, urlConstant, $q, dataConstant, $sce, $rootScope, LocalStorageFactory) {
        var LastSearch;
        var highRankedAirportsPromise;
        var CurrencySymbolsPromise;
        var airportJsonPromise;
        var airportsCurrencyPromise;
        var airportsCurrency = [];

        var w = angular.element(window);
        var Device = {
            small: function () { return w.width() <= 991; },
            medium: function () { return w.width() > 991; }
        }

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
            Device: Device,
            getExchangeRate: getExchangeRate,
            getCurrencyConversion: getCurrencyConversion,
            GetCurrecyCode: GetCurrecyCode
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
            if (CurrencySymbolsPromise) {
                return $q.when(CurrencySymbolsPromise).then(function (value) {
                    return value;
                });
            }
            else {
                return CurrencySymbolsPromise = $http.get(urlConstant.apiURLForConstant + 'GetCurrencySymbols').then(function (data) {
                    if (data.status == 200)
                        return service.currencySymbol.currencySymbolsList = data.data.Currency;
                });
            }
        }
        function GetCurrencySymbol(currencyCode) {
            var cacheResult = _.findWhere(service.currencySymbol.currencySymbolsListCache, { code: currencyCode });
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
        function GetCurrecyCode(currencySymbol) {
            var cacheResult = _.findWhere(service.currencySymbol.currencySymbolsListCache, { symbol: currencySymbol });
            if (cacheResult)
                return cacheResult.code;

            var result = _.findWhere(service.currencySymbol.currencySymbolsList, { symbol: currencySymbol });
            if (result) {
                service.currencySymbol.currencySymbolsListCache.push({ symbol: result.symbol, code: result.code });
                return result.code;
            }
            else {
                service.currencySymbol.currencySymbolsListCache.push({ symbol: currencySymbol, code: currencySymbol });
                return currencySymbol;
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

            if (fromDate.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
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

        // start Code Getting currency Exchange Rate
        function getExchangeRate(fromCurrency, toCurrency) {

            //Free API call 
            ///var url = "https://openexchangerates.org/api/latest.json?app_id=abf70ba2e328428c9cef7e4f058ffc21";

            //premium API call
            //var url = "https://openexchangerates.org/api/latest.json?app_id=abf70ba2e328428c9cef7e4f058ffc21&base=" + existCurrency + "&symbols=" + convertCurrency;

            var url = urlConstant.apiURLForCurrencyConversion + "?Base=" + fromCurrency + "&Target=" + toCurrency;
            return $http.get(url)
                    .then(function (data) {
                        return data;
                    },
                    function (e) {
                        return e;
                    });
        }

        function getCurrencyConversion(currencyConversionDetail) {
            if ((currencyConversionDetail.base == currencyConversionDetail.target) || currencyConversionDetail.base == undefined || currencyConversionDetail.target == undefined || currencyConversionDetail.target == "Default") {
                var defer = $q.defer();
                defer.resolve({
                    currencyCode: currencyConversionDetail.base,
                    currencySymbol: GetCurrencySymbol(currencyConversionDetail.base),
                    rate: 1
                });
                return defer.promise;
            }

            var getLocalStorageCurrencyInfo = LocalStorageFactory.get(dataConstant.currencyConversion, { base: currencyConversionDetail.base, target: currencyConversionDetail.target });
            if (!getLocalStorageCurrencyInfo) {
                return saveRate(currencyConversionDetail).then(function (result) {
                    return {
                        currencyCode: result.target,
                        currencySymbol: GetCurrencySymbol(result.target),
                        rate: result.rate
                    };
                });
            }
            else {
                var timestamp = new Date(getLocalStorageCurrencyInfo.timestamp).getTime();
                var currentTime = (new Date()).getTime();
                var dateDiffInHours = (currentTime - timestamp) / 6000000;
                if (dateDiffInHours > 1) {
                    return saveRate(currencyConversionDetail).then(function (result) {
                        return {
                            currencyCode: result.target,
                            currencySymbol: GetCurrencySymbol(result.target),
                            rate: result.rate
                        };
                    });
                }
                else {
                    var defer = $q.defer();
                    defer.resolve({
                        currencyCode: getLocalStorageCurrencyInfo.target,
                        currencySymbol: GetCurrencySymbol(getLocalStorageCurrencyInfo.target),
                        rate: getLocalStorageCurrencyInfo.rate
                    });
                    return defer.promise;
                }
            }
        }

        function saveRate(currencyConversionDetail) {
            return getExchangeRate(currencyConversionDetail.base, currencyConversionDetail.target).then(function (data) {
                currencyConversionDetail = {
                    base: data.data.Base,
                    target: data.data.Target,
                    rate: data.data.Rate,
                    timestamp: new Date()
                };
                LocalStorageFactory.save(dataConstant.currencyConversion, currencyConversionDetail, { base: currencyConversionDetail.base, target: currencyConversionDetail.target });
                return currencyConversionDetail;
            });
        }
        
        // End Code Getting currency Exchange Rate        
    }
})();
