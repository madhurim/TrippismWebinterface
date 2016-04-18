(function () {
    'use strict';
    var serviceId = 'UtilFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$location', '$anchorScroll', '$rootScope', '$filter', '$q', 'TrippismConstants', UtilFactory]);

    function UtilFactory($http, $location, $anchorScroll, $rootScope, $filter, $q, TrippismConstants) {
        // Define the functions and properties to reveal.
        var AirportJsonData = [];
        var highRankedAirports = [];
        //var airlinesList = [];
        var LastSearch;
        var service = {
            ReadAirportJson: ReadAirportJson,
            getIpinfo: getIpinfo,
            MapscrollTo: MapscrollTo,
            ReadStateJson: ReadStateJson,
            //ReadAirlinesJson: ReadAirlinesJson,
            GetCurrencySymbols: GetCurrencySymbols,
            GetCurrencySymbol: GetCurrencySymbol,
            AirportCodeLog: AirportCodeLog,
            currencySymbol: { currencySymbolsList: [], currencySymbolsListCache: [] },
            GetLowFareForMap: GetLowFareForMap,
            updateQueryStringParameter: updateQueryStringParameter,
            ReadHighRankedAirportsJson: ReadHighRankedAirportsJson,
            GetValidDates: GetValidDates,
            ReadLocationPairJson: ReadLocationPairJson
        };
        return service;

        function ReadStateJson() {
            var States = [];
            return $http.get('scripts/Constants/State.json').then(function (_states) {
                return _states.data;
            });
        }
        function updateQueryStringParameter(uri, key, value) {
            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";
            if (uri.match(re)) {
                return uri.replace(re, '$1' + key + "=" + value + '$2');
            }
            else {
                return uri + separator + key + "=" + value;
            }
        }
        function ReadAirportJson(url) {
            if (AirportJsonData.length > 0) {
                var d = $q.defer();
                d.resolve(AirportJsonData);
                return d.promise;
            }
            else
                return getAirportJson($rootScope.apiURLForConstant + '/GetAirports').then(function (data) {
                    AirportJsonData = data;
                    return data;
                });
        }

        function ReadHighRankedAirportsJson(url) {
            if (highRankedAirports.length > 0) {
                var d = $q.defer();
                d.resolve(highRankedAirports);
                return d.promise;
            }
            else
                return getAirportJson($rootScope.apiURLForConstant + '/GetHighRankedAirports').then(function (data) {
                    highRankedAirports = data;
                    return data;
                });
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

        function getIpinfo(AvailableCodes) {
            var url = "http://ipinfo.io?callback=JSON_CALLBACK";
            return $http.jsonp(url)
            .then(function (data) {
                data = data.data;
                var originairport = _.find(AvailableCodes, function (airport) { return airport.airport_CityName == data.city && airport.airport_CountryCode == data.country });
                if (originairport != null) {
                    return originairport;
                }
            });

        }

        function MapscrollTo(id) {
            var old = $location.hash();
            $location.hash(id);
            $anchorScroll();
            $location.hash(old);
            return;
        }

        function GetCurrencySymbols() {
            $http.get($rootScope.apiURLForConstant + '/GetCurrencySymbols').then(function (data) {
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

            if (toDate <= fromDate)
                obj.ToDate = SetToDate(fromDate);
            else if (toDate > addDays(fromDate, TrippismConstants.MaxLOS)) {
                obj.ToDate = SetToDate(fromDate);
            }

            return obj;
        }

        function ReadLocationPairJson() {
            return $http.get('scripts/Constants/locationsPair.json').then(function (data) {
                return data.data;
            });
        }
    }
})();
