(function () {
    'use strict';
    var controllerId = 'DestinationController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
            '$location',
            '$modal',
            '$rootScope',
            '$timeout',
            '$filter',
            '$window', '$stateParams', '$state',
            '$q',
            'DestinationFactory',
            'UtilFactory',
            'FareforecastFactory',
            'SeasonalityFactory',
            'TrippismConstants',
            'BargainFinderMaxFactory',
             DestinationController]);
    function DestinationController(
        $scope,
        $location,
        $modal,
        $rootScope,
        $timeout,
        $filter,
        $window, $stateParams, $state,
        $q,
        DestinationFactory,
        UtilFactory,
        FareforecastFactory,
        SeasonalityFactory,
        TrippismConstants,
        BargainFinderMaxFactory
        ) {
        $scope.$emit('bodyClass', 'tabpage');
        init();
        function init() {
            UtilFactory.GetCurrencySymbols();
            $scope.mappromise = UtilFactory.ReadAirportJson().then(function (response) {
                $scope.AvailableAirports = response;

                if ($stateParams.path != undefined) {
                    var params = $stateParams.path.split(";");
                    // split destination and origin to compare with tab title
                    angular.forEach(params, function (item) {
                        var para = item.split("=");
                        if (para[0].trim() === "f")
                            $scope.Origin = para[1].trim().toUpperCase();
                        if (para[0].trim() === "t")
                            $scope.DestinationLocation = para[1].trim().toUpperCase();
                        if (para[0].trim() === "d") {
                            $scope.FromDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                            $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                        }
                        if (para[0].trim() === "r") {
                            $scope.ToDate = ConvertToRequiredDate(para[1].trim(), 'UI');;
                            $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                        }
                        if (para[0].trim() === "th")
                            $scope.Theme = para[1].trim();
                        if (para[0].trim() === "a")
                            $scope.Region = para[1].trim();
                        if (para[0].trim() === "lf")
                            $scope.Minfare = para[1].trim();
                        if (para[0].trim() === "hf")
                            $scope.Maxfare = para[1].trim();
                    });

                    $scope.OriginairportName = _.find($scope.AvailableAirports, function (airport) {
                        return airport.airport_Code == $scope.Origin.toUpperCase()
                    });
                    $scope.DestinationairportName = _.find($scope.AvailableAirports, function (airport) {
                        return airport.airport_Code == $scope.DestinationLocation
                    });

                    var paramdata = {
                        Origin: $scope.Origin,
                        DestinationLocation: $scope.KnownDestinationAirport,
                        FromDate: $scope.FromDate,
                        ToDate: $scope.ToDate,
                        Theme: $scope.Theme,
                        Region: $scope.Region,
                        Minfare: $scope.Minfare,
                        Maxfare: $scope.Maxfare
                    }

                    UtilFactory.SetLastSearchval(paramdata)
                    if ($scope.OriginairportName == undefined || $scope.DestinationairportName == undefined) {
                        alertify.alert("Destination Finder", "");
                        alertify.alert('No suggestions are available from your origin to destination. We recommend trying other nearby major airports.');
                        return false;
                    }

                    $scope.PointOfsalesCountry = $scope.OriginairportName.airport_CountryCode;
                }
                var param = {
                    "Origin": $scope.Origin,
                    "DepartureDate": ($scope.FromDate == '' || $scope.FromDate == undefined) ? null : ConvertToRequiredDate($scope.FromDate, 'API'),
                    "ReturnDate": ($scope.ToDate == '' || $scope.ToDate == undefined) ? null : ConvertToRequiredDate($scope.ToDate, 'API'),
                    "Destination": $scope.DestinationLocation
                };
                $scope.FareInfo = DestinationFactory.GetDestinationFareInfo(param);
                if ($scope.FareInfo == null) {
                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    var secondDate = new Date($scope.ToDate);
                    var firstDate = new Date($scope.FromDate);
                    $scope.LenghtOfStay = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                    var apiParam = {
                        Origin: $scope.Origin,
                        DepartureDate: ($scope.FromDate == '' || $scope.FromDate == undefined) ? null : ConvertToRequiredDate($scope.FromDate, 'API'),
                        ReturnDate: ($scope.ToDate == '' || $scope.ToDate == undefined) ? null : ConvertToRequiredDate($scope.ToDate, 'API'),
                        Lengthofstay: $scope.LenghtOfStay,
                        Minfare: $scope.Minfare == 0 ? null : $scope.Minfare,
                        Maxfare: $scope.Maxfare == 0 ? null : $scope.Maxfare,
                        Destination: $scope.DestinationLocation
                    }

                    //var requestObj = {
                    //    OTA_AirLowFareSearchRQ: {                            
                    //        //MaxResponses: "1",
                    //        //DirectFlightsOnly: true,                        
                    //        OriginDestinationInformation: [{
                    //            RPH: "1",
                    //            DepartureDateTime: apiParam.DepartureDate + "T00:00:00",
                    //            OriginLocation: {
                    //                LocationCode: apiParam.Origin
                    //            },
                    //            DestinationLocation: {
                    //                LocationCode: apiParam.Destination
                    //            }
                    //        },
                    //        {
                    //            RPH: "2",
                    //            DepartureDateTime: apiParam.ReturnDate + "T00:00:00",
                    //            OriginLocation: {
                    //                LocationCode: apiParam.Destination
                    //            },
                    //            DestinationLocation: {
                    //                LocationCode: apiParam.Origin
                    //            }
                    //        }],
                    //        TravelerInfoSummary: {
                    //            AirTravelerAvail: [{
                    //                PassengerTypeQuantity: [{
                    //                    Code: "ADT",
                    //                    Quantity: 1
                    //                }]
                    //            }],
                    //            //PriceRequestInformation: {
                    //            //    TPA_Extensions: {
                    //            //        PointOfSaleOverride: { Code: $scope.instaFlightSearch.PointOfSaleCountry }
                    //            //    }
                    //            //}
                    //        },
                    //        TPA_Extensions: {
                    //            IntelliSellTransaction: {
                    //                RequestType: {
                    //                    Name: "50ITINS"
                    //                }
                    //            }
                    //        }
                    //    }
                    //}

                    //var promises = [];
                    //promises[0] = BargainFinderMaxFactory.Post(requestObj);
                    //promises[1] = BargainFinderMaxFactory.Post(requestObj);

                    //$q.all(promises).then(function (data) {
                    //    var FareInfo = {};
                    //    if (data) {
                    //        var lowestFareRequest = data[0];
                    //        var lowsetNonStopFareRequest = data[1];
                    //        if (lowestFareRequest.data && lowestFareRequest.data.PricedItineraries.length > 0) {
                    //            var pricedItineraries = lowestFareRequest.data.PricedItineraries[0];

                    //            FareInfo.LowestFare = {};
                    //            debugger;
                    //            FareInfo.LowestFare.AirlineCodes = _.uniq(_(pricedItineraries.OriginDestinationOption[0].FlightSegment).map(function (item) {
                    //                return item.OperatingAirline.Code;
                    //            }));
                    //            FareInfo.LowestFare.Fare = pricedItineraries.AirItineraryPricingInfo[0].TotalFare.Amount;

                    //            FareInfo.CurrencyCode = pricedItineraries.AirItineraryPricingInfo[0].TotalFare.CurrencyCode;
                    //            FareInfo.DepartureDateTime = apiParam.DepartureDate;
                    //            FareInfo.ReturnDateTime = apiParam.ReturnDate;
                    //            FareInfo.DestinationLocation = apiParam.Destination;
                    //            FareInfo.OriginLocation = apiParam.Origin;
                    //        }

                    //        if (lowsetNonStopFareRequest.data && lowsetNonStopFareRequest.data.PricedItineraries.length > 0) {
                    //            var pricedItineraries = lowsetNonStopFareRequest.data.PricedItineraries[0];

                    //            FareInfo.LowestNonStopFare = {};

                    //            FareInfo.LowestNonStopFare.AirlineCodes = _.uniq(_(pricedItineraries.OriginDestinationOption[0].FlightSegment).map(function (item) {
                    //                return item.OperatingAirline.Code;
                    //            }));
                    //            FareInfo.LowestNonStopFare.Fare = pricedItineraries.AirItineraryPricingInfo[0].TotalFare.Amount;

                    //            FareInfo.CurrencyCode = FareInfo.CurrencyCode || pricedItineraries.AirItineraryPricingInfo[0].TotalFare.CurrencyCode;
                    //            FareInfo.DepartureDateTime = FareInfo.DepartureDateTime || apiParam.DepartureDate;
                    //            FareInfo.ReturnDateTime = FareInfo.ReturnDateTime || apiParam.ReturnDate;
                    //            FareInfo.DestinationLocation = FareInfo.DestinationLocation || apiParam.Destination;
                    //            FareInfo.OriginLocation = FareInfo.OriginLocation || apiParam.Origin;
                    //        }
                    //    }

                    //    if (FareInfo != {}) {
                    //        FareInfo = [FareInfo];
                    //        $scope.destinationlist = FilterDestinations(FareInfo);
                    //        var DestinationairportName = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $scope.DestinationLocation.toUpperCase() });

                    //        var objDestinationairport = $scope.destinationlist[0];
                    //        if (objDestinationairport != undefined) {
                    //            objDestinationairport.objDestinationairport = $scope.DestinationLocation.toUpperCase();
                    //            $scope.destinationlist.forEach(function (item) { item.DestinationLocation = item.objDestinationairport; });
                    //            $scope.FareInfo = FareInfo[0];

                    //            // commented for the time being
                    //            //UtilFactory.ReadAirlinesJson().then(function (data) {
                    //            //    $scope.airlineJsonData = data;
                    //            //    readyfareParams();
                    //            //});

                    //            $scope.airlineJsonData = [];
                    //            readyfareParams();

                    //            UtilFactory.MapscrollTo('wrapper');

                    //        }
                    //        else {
                    //            // commented for the time being
                    //            //UtilFactory.ReadAirlinesJson().then(function (data) {
                    //            //    $scope.airlineJsonData = data;
                    //            //    readyfareParams();
                    //            //});

                    //            $scope.airlineJsonData = [];
                    //            readyfareParams();
                    //        }
                    //    }
                    //        //else if (response != null && typeof response == 'string') {
                    //        //    var POSCountriesList = [];
                    //        //    var CList = "Selected origin country is not among the countries we support. We currently support the below countries. We will continue to add support for more countries. <br/><br/><div class='pos_List'>";
                    //        //    var POSList = JSON.parse(data);
                    //        //    for (var i = 0; i < POSList.Countries.length; i++) {
                    //        //        POSCountriesList.push(POSList.Countries[i].CountryName.toString());
                    //        //    }
                    //        //    POSCountriesList.sort();
                    //        //    for (var i = 0; i < POSCountriesList.length; i++) {
                    //        //        if (i == POSCountriesList.length - 1) {
                    //        //            CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "." + "</span><br/>";
                    //        //        }
                    //        //        else {
                    //        //            CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "," + "</span><br/>";//+ "(" + POSList.Countries[i].CountryCode.toString() + ")"
                    //        //        }
                    //        //    }
                    //        //    CList += "</div>";
                    //        //    alertify.alert("Trippism", "");
                    //        //    alertify.alert(CList).set('onok', function (closeEvent) { });
                    //        //}
                    //    else {
                    //        // commented for the time being
                    //        //UtilFactory.ReadAirlinesJson().then(function (data) {
                    //        //    $scope.airlineJsonData = data;
                    //        //    readyfareParams();
                    //        //});

                    //        $scope.airlineJsonData = [];
                    //        readyfareParams();

                    //        //alertify.alert("Destination Finder", "");
                    //        //alertify.alert('No suggestions are available from your Origin. We recommend trying other nearby major airports.').set('onok', function (closeEvent) { });
                    //    }

                    //}.bind(this));

                    DestinationFactory.findInstFlightDestination(apiParam).then(function (response) {
                        debugger;
                        if (response.FareInfo != null) {
                            $scope.destinationlist = FilterDestinations(response.FareInfo);
                            // destinationlistOriginal = $scope.destinationlist;
                            var DestinationairportName = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $scope.DestinationLocation.toUpperCase() });

                            var objDestinationairport = $scope.destinationlist[0];
                            if (objDestinationairport != undefined) {


                                objDestinationairport.objDestinationairport = $scope.DestinationLocation.toUpperCase();
                                $scope.destinationlist.forEach(function (item) { item.DestinationLocation = item.objDestinationairport; });
                                $scope.FareInfo = response.FareInfo[0];

                                // commented for the time being
                                //UtilFactory.ReadAirlinesJson().then(function (data) {
                                //    $scope.airlineJsonData = data;
                                //    readyfareParams();
                                //});

                                $scope.airlineJsonData = [];
                                readyfareParams();

                                //$rootScope.$broadcast('EmptyFareForcastInfo', {
                                //    Origin: originairport.airport_CityName,
                                //    Destinatrion: DestinationairportName.airport_Code,
                                //    Fareforecastdata: dataForecast,
                                //    mapOptions: objDestinationairport,
                                //    OriginairportName: originairport,
                                //    DestinationairportName: DestinationairportName,
                                //    DestinationList: $scope.destinationlist,
                                //    AvailableAirports: $scope.AvailableAirports,
                                //    AvailableAirline: $scope.airlineJsonData,
                                //    SearchCriteria: SearchCriteria
                                //});
                                UtilFactory.MapscrollTo('wrapper');

                            }
                            else {
                                // commented for the time being
                                //UtilFactory.ReadAirlinesJson().then(function (data) {
                                //    $scope.airlineJsonData = data;
                                //    readyfareParams();
                                //});

                                $scope.airlineJsonData = [];
                                readyfareParams();

                                //alertify.alert("Destination Finder", "");
                                //alertify.alert('We could not find details of the destination you are looking for, however we found other destinations that you can explore.').set('onok', function (closeEvent) { });
                            }
                        }
                        else if (response != null && typeof response == 'string') {
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
                                    CList += "<span class='lblpos'>" + POSCountriesList[i].toString() + "," + "</span><br/>";//+ "(" + POSList.Countries[i].CountryCode.toString() + ")"
                                }
                            }
                            CList += "</div>";
                            alertify.alert("Trippism", "");
                            alertify.alert(CList).set('onok', function (closeEvent) { });
                        }
                        else {
                            // commented for the time being
                            //UtilFactory.ReadAirlinesJson().then(function (data) {
                            //    $scope.airlineJsonData = data;
                            //    readyfareParams();
                            //});

                            $scope.airlineJsonData = [];
                            readyfareParams();

                            //alertify.alert("Destination Finder", "");
                            //alertify.alert('No suggestions are available from your Origin. We recommend trying other nearby major airports.').set('onok', function (closeEvent) { });
                        }
                    });
                }
                else {
                    // commented for the time being
                    //UtilFactory.ReadAirlinesJson().then(function (data) {
                    //    $scope.airlineJsonData = data;
                    //    readyfareParams();
                    //});


                    $scope.airlineJsonData = [];
                    readyfareParams();

                }

                function FilterDestinations(destinations) {
                    var destinationstodisp = [];
                    for (var x = 0; x < destinations.length; x++) {
                        var LowestFarePrice = "N/A";
                        var LowestNonStopeFare = "N/A";
                        if (destinations[x].LowestNonStopFare != undefined && destinations[x].LowestNonStopFare.Fare != "N/A") {
                            LowestNonStopeFare = parseFloat(destinations[x].LowestNonStopFare.Fare).toFixed(2);
                            if (LowestNonStopeFare == 0)
                                LowestNonStopeFare = "N/A";
                        }
                        if (destinations[x].LowestFare != undefined && destinations[x].LowestFare.Fare != "N/A") {
                            LowestFarePrice = parseFloat(destinations[x].LowestFare.Fare).toFixed(2);
                            if (LowestFarePrice == 0)
                                LowestFarePrice = "N/A";
                        }
                        if (LowestNonStopeFare != "N/A" || LowestFarePrice != "N/A")
                            destinationstodisp.push(destinations[x]);
                    }
                    return destinationstodisp;
                }

                function readyfareParams() {
                    $scope.fareParams = {
                        OriginairportName: $scope.OriginairportName,
                        DestinationairportName: $scope.DestinationairportName,
                        FareInfo: $scope.FareInfo,
                        Fareforecastdata: param,
                        AvailableAirports: $scope.AvailableAirports,
                        SearchCriteria: {
                            Origin: $scope.Origin,
                            DestinationLocation: $scope.DestinationLocation,
                            FromDate: (typeof $scope.FromDate == 'string') ? new Date($scope.FromDate) : $scope.FromDate,
                            ToDate: (typeof $scope.ToDate == 'string') ? new Date($scope.ToDate) : $scope.ToDate,
                            Theme: $scope.Theme,
                            Region: $scope.Region,
                            Minfare: $scope.Minfare,
                            Maxfare: $scope.Maxfare
                        },
                        instaFlightSearchData: {
                            OriginAirportName: $scope.Origin,
                            DestinationaArportName: $scope.DestinationLocation,
                            FromDate: $scope.FromDate,
                            ToDate: $scope.ToDate,
                            Minfare: $scope.Minfare,
                            Maxfare: $scope.Maxfare,
                            PointOfSaleCountry: $scope.PointOfsalesCountry
                        },
                        AvailableAirline: $scope.airlineJsonData
                    }
                }


                var WeatherData, farerangeInfo, fareforcastinfo;//seasonalityfarerangewidgetInfo, ,weatherwidgetInfo;

                $scope.$on('widgetLoaded', function (event, data) {
                    //if (data.name === 'seasonalityfarerangewidgetInfo') {
                    //    seasonalityfarerangewidgetInfo = data;
                    //} else
                    if (data.name === 'WeatherData') {
                        WeatherData = data;
                    }
                    else if (data.name === 'farerangeInfo') {
                        farerangeInfo = data;
                    }
                    else if (data.name === 'fareforcastinfo') {
                        fareforcastinfo = data;
                    }



                    //else if (data.name === 'weatherwidgetInfo') {
                    //    weatherwidgetInfo = data;
                    //}
                    if (farerangeInfo && WeatherData && fareforcastinfo) //&& seasonalityfarerangewidgetInfo  && weatherwidgetInfo
                    {
                        var columnData = {
                            // seasonalityfarerangewidgetInfo: seasonalityfarerangewidgetInfo,
                            farerangeInfo: farerangeInfo,
                            fareforcastinfo: fareforcastinfo,
                            //weatherwidgetInfo: weatherwidgetInfo,
                            WeatherData: WeatherData
                        };
                        $scope.$broadcast("columnLayoutChanged", { columnData: columnData });
                    }
                });

            });
        }
        $scope.PageName = "Destination Page";
    }

})();