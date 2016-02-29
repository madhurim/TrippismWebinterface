(function () {
    'use strict';
    var controllerId = 'InstaFlightSearchController';
    angular.module('TrippismUIApp').controller(controllerId, ['$scope', '$filter', '$modal', 'InstaFlightSearchFactory', 'UtilFactory', 'instaFlightSearchData', InstaFlightSearchController]);
    function InstaFlightSearchController($scope, $filter, $modal, InstaFlightSearchFactory, UtilFactory, instaFlightSearchData) {
        $scope.isInstaFlightDataFound = null;
        $scope.instaFlightSearchData = instaFlightSearchData;
        var airportNameCache = [];
        var airlinesNameCache = [];
        function active() {
            if ($scope.instaFlightSearchData != undefined) {
                $scope.isSearchingFlights = true;
                var departureDate = $filter('date')(angular.isString($scope.instaFlightSearchData.FromDate) ? new Date($scope.instaFlightSearchData.FromDate.split('T')[0].replace(/-/g, "/")) : $scope.instaFlightSearchData.FromDate, 'yyyy-MM-dd');
                var returnDate = $filter('date')(angular.isString($scope.instaFlightSearchData.ToDate) ? new Date($scope.instaFlightSearchData.ToDate.split('T')[0].replace(/-/g, "/")) : $scope.instaFlightSearchData.ToDate, 'yyyy-MM-dd');
                var lowestFare = instaFlightSearchData.LowestFare;
                $scope.instaFlightSearch = {
                    Origin: $scope.instaFlightSearchData.OriginAirportName,
                    Destination: $scope.instaFlightSearchData.DestinationaArportName,
                    DepartureDate: departureDate,
                    ReturnDate: returnDate,
                    //Minfare: $scope.instaFlightSearchData.Minfare,
                    //Maxfare: $scope.instaFlightSearchData.Maxfare,
                    IncludedCarriers: $scope.instaFlightSearchData.IncludedCarriers,
                    PointOfSaleCountry: $scope.instaFlightSearchData.PointOfSaleCountry,
                    outboundflightstops: $scope.instaFlightSearchData.outboundflightstops,
                    inboundflightstops: $scope.instaFlightSearchData.inboundflightstops,
                    //LowestFare: instaFlightSearchData.LowestFare
                };
                $scope.includedCarriers = $scope.instaFlightSearch.IncludedCarriers;
                $scope.DepartureDate = $scope.instaFlightSearch.DepartureDate;
                $scope.ReturnDate = $scope.instaFlightSearch.ReturnDate;
                if ($scope.instaFlightSearch.IncludedCarriers != '' && $scope.instaFlightSearch.IncludedCarriers.length > 0)
                    $scope.instaFlightSearch.IncludedCarriers = $scope.instaFlightSearch.IncludedCarriers.join(',');
                InstaFlightSearchFactory.GetData($scope.instaFlightSearch).then(function (data) {
                    if (data.status != 404 && data.status != 400 && data != "" && data.PricedItineraries.length > 0) {
                        $scope.isInstaFlightDataFound = true;
                        $scope.isSearchingFlights = false;
                        $scope.instaFlightSearchResult = data;
                        $scope.DepartureDate = $scope.instaFlightSearchResult.DepartureDateTime;
                        $scope.ReturnDate = $scope.instaFlightSearchResult.ReturnDateTime;
                        $scope.instaFlightSearchLimit = 10;
                        $scope.currencyCode = getCurrencyCode($scope.instaFlightSearchResult.PricedItineraries[0]);
                        $scope.lowestFare = getLowestFare($scope.instaFlightSearchResult.PricedItineraries[0]);
                    }
                    else {
                        $scope.isInstaFlightDataFound = false;
                    }
                })
            }
        }
        active();

        $scope.dismiss = function () {
            $scope.$dismiss('cancel');
        };
        $scope.increaseLimit = function () {
            $scope.instaFlightSearchLimit = $scope.instaFlightSearchLimit + 10;
        }
        $scope.getStopsFromFlightSegment = function (flightSegment) {
            var arrivalAirportList = [];
            for (i = 0; i < flightSegment.length - 1; i++) {
                var locationCode = flightSegment[i].ArrivalAirport.LocationCode;
                arrivalAirportList.push({ locationCode: locationCode, title: getAirportNameFromCode(locationCode) });
            }
            return arrivalAirportList;
        };
        $scope.airportConnectionData = function (flightSegmentList, flightSegment) {
            var result = { waitingTime: '', isAirportChanged: false, isConnectInAirport: false, isLongWait: false };
            var arrivalDate = new Date(flightSegment.ArrivalDateTime.replace('T', ' ').replace(/-/g, "/")).getTime();
            var arrivalAirport = flightSegment.ArrivalAirport.LocationCode;
            var index = flightSegmentList.indexOf(flightSegment);
            var nextFlightSegment = flightSegmentList[index + 1];
            if (nextFlightSegment != undefined) {
                //waitingTime
                var departureDate = new Date(nextFlightSegment.DepartureDateTime.replace('T', ' ').replace(/-/g, "/")).getTime();
                var dateDiffInMinute = (departureDate - arrivalDate) / 60000;
                var hours = $filter('floor')(dateDiffInMinute / 60);
                result.waitingTime = $filter('twoDigit')(hours) + ' h ' + $filter('twoDigit')(dateDiffInMinute % 60) + ' min';
                //isAirportChanged
                var departureAirport = nextFlightSegment.DepartureAirport.LocationCode;
                result.isAirportChanged = !(arrivalAirport == departureAirport);
                //isConnectInAirport
                result.isConnectInAirport = result.isAirportChanged == false && dateDiffInMinute > 0;
                //isLongWait
                result.isLongWait = hours > 2;
            }
            return result;
        }
        $scope.amountBifercation = function (TotalfareAmount) {
            var afterDec = (TotalfareAmount + "").split(".")[1];
            if (afterDec == undefined)
                afterDec = '00';
            var result = {
                BeforeDecimal: Math.floor(TotalfareAmount),
                AfterDecimal: "." + (afterDec.length == 1 ? afterDec + '0' : afterDec)
            };
            return result;
        }
        var getAirportNameFromCode = function (airportCode) {
            var airportName = airportCode;
            var cacheValue = $filter('filter')(airportNameCache, { airport_Code: airportCode })[0];
            if (cacheValue)
                return cacheValue.airportName;

            var airportData = $filter('filter')($scope.$parent.fareParams.AvailableAirports, { airport_Code: airportCode });
            if (airportData) {
                if (angular.isArray(airportData)) {
                    var airportDataFiltered = $filter('filter')(airportData, { airport_IsMAC: false })[0];
                    if (!airportDataFiltered)
                        airportData = airportData[0];
                    else
                        airportData = airportDataFiltered;
                }
                if (airportData) {
                    airportName = airportData.airport_FullName + ', ' + airportData.airport_CityName + ', ' + airportData.airport_CountryName;
                    airportNameCache.push({ airport_Code: airportCode, airportName: airportName });
                }
            }
            return airportName;
        }
        $scope.getHTMLTooltip = function (airportCode, a) {
            var airportName = getAirportNameFromCode(airportCode);
            return airportName;
        }
        $scope.getAirlineQueryString = function () {
            var query = '';
            if ($scope.includedCarriers != undefined) {
                for (var i = 0; i < ($scope.includedCarriers.length) ; i++) {
                    query += '&ar.rt.carriers%5B' + i + '%5D=' + $scope.includedCarriers[i];
                }
            }
            return query;
        }
        $scope.getStopArray = function (length) {
            return new Array(length);
        }
        $scope.getAirlineName = function (airlineCode) {
            var result = airlineCode;
            var cacheValue = $filter('filter')(airlinesNameCache, { code: airlineCode })[0];
            if (cacheValue)
                return cacheValue.name;
            if ($scope.$parent.fareParams.AvailableAirline) {
                var data = $filter('filter')($scope.$parent.fareParams.AvailableAirline, { code: airlineCode });
                if (data.length == 1) {
                    airlinesNameCache.push({ code: airlineCode, name: data[0].name });
                    return data[0].name;
                }
            }
            return result;
        }
        var getLowestFare = function (pricedItinerary) {
            if (pricedItinerary == undefined)
                return undefined;
            return pricedItinerary.AirItineraryPricingInfo[0].TotalFare.Amount;
        }
        var getCurrencyCode = function (pricedItinerary) {
            var pricingInfo = $scope.instaFlightSearchResult.PricedItineraries[0].AirItineraryPricingInfo[0];
            if (pricingInfo && pricingInfo.TotalFare && pricingInfo.TotalFare.CurrencyCode)
                return pricingInfo.TotalFare.CurrencyCode;
            else
                return $scope.$parent.fareParams.mapOptions.CurrencyCode;
        }
        $scope.GetCurrencySymbol = function (code) {
            return UtilFactory.GetCurrencySymbol(code);
        }
    }
})();