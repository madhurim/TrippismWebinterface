angular.module('TrippismUIApp').directive('destinationFareForecast', ['$rootScope', '$compile', '$modal', 'DestinationFactory', 'UtilFactory', '$stateParams', '$state', '$timeout', 'InstaFlightSearchFactory',
    function ($rootScope, $compile, $modal, DestinationFactory, UtilFactory, $stateParams, $state, $timeout, InstaFlightSearchFactory) {
        return {
            restrict: 'E',
            scope: {
                fareParams: '='
            },
            templateUrl: '/Views/Partials/DestinationFareForecastPartial.html',
            controller: function ($scope) {
                $scope.GetCurrencySymbol = function (code) {
                    return UtilFactory.GetCurrencySymbol(code);
                }
                $scope.formats = Dateformat();
                $scope.format = $scope.formats[5];
                $scope.$on('hotelDataFound', function (event, data) {
                    if (!data)
                        angular.element('#divhotel').remove();
                    else
                        $scope.HotelData = data;
                });
                $scope.amountBifurcation = function (value) { return UtilFactory.amountBifurcation(value); };
            },
            link: function ($scope, elem, attrs) {
                $scope.$watch('fareParams', function (newValue, oldValue) {
                    if (newValue != undefined) {
                        if (newValue.Fareforecastdata != undefined) {
                            $scope.fareParams.dataforEmail = {};
                            activate();
                        }
                        $scope.initBreadcrumb();
                    }
                });
                $scope.SendEmailToUser = SendEmailToUser;
                function SendEmailToUser() {
                    if (!$scope.fareParams) return;
                    var GetEmailDetPopupInstance = $modal.open({
                        templateUrl: '/Views/Partials/EmailDetFormPartial.html',
                        controller: 'EmailForDestinationDet',
                        scope: $scope,
                        resolve: {
                            eMailData: function () { return $scope.fareParams; }
                        }
                    });
                }

                function activate() {
                    var param = $scope.fareParams.Fareforecastdata;
                    $scope.FareInfo = DestinationFactory.GetDestinationFareInfo(param);

                    $scope.Origin = $scope.fareParams.SearchCriteria.Origin;
                    $scope.DestinationLocation = $scope.fareParams.SearchCriteria.DestinationLocation;
                    $scope.FromDate = $scope.fareParams.SearchCriteria.FromDate;
                    $scope.ToDate = $scope.fareParams.SearchCriteria.ToDate;
                    $scope.Theme = $scope.fareParams.SearchCriteria.Theme;
                    $scope.Region = $scope.fareParams.SearchCriteria.Region;
                    $scope.Minfare = $scope.fareParams.SearchCriteria.Minfare;
                    $scope.Maxfare = $scope.fareParams.SearchCriteria.Maxfare;
                    var PointOfsalesCountry = $scope.fareParams.OriginAirport.airport_CountryCode;

                    if ($scope.FareInfo == null) {
                        var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                        var secondDate = new Date($scope.ToDate);
                        var firstDate = new Date($scope.FromDate);
                        $scope.LenghtOfStay = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
                        var apiparam = {
                            "Origin": $scope.Origin,
                            "DepartureDate": ($scope.FromDate == '' || $scope.FromDate == undefined) ? null : ConvertToRequiredDate($scope.FromDate, 'API'),
                            "ReturnDate": ($scope.ToDate == '' || $scope.ToDate == undefined) ? null : ConvertToRequiredDate($scope.ToDate, 'API'),
                            "Lengthofstay": $scope.LenghtOfStay,
                            "Minfare": $scope.Minfare == 0 ? null : $scope.Minfare,
                            "Maxfare": $scope.Maxfare == 0 ? null : $scope.Maxfare,
                            "Destination": $scope.DestinationLocation,
                            "PointOfSaleCountry": PointOfsalesCountry
                        }

                        var destinationData = DestinationFactory.DestinationDataStorage.fare.get(param);
                        if (destinationData) {
                            var FareInfo =
                              {
                                  OriginLocation: destinationData.data.OriginLocation,
                                  LowestFare: {
                                      AirlineCodes: _.map(destinationData.data.PricedItineraries[0].OriginDestinationOption[0].FlightSegment, function (item) { return item.OperatingAirline.Code; }),
                                      Fare: destinationData.data.PricedItineraries[0].AirItineraryPricingInfo[0].TotalFare.Amount
                                  },
                                  CurrencyCode: destinationData.data.PricedItineraries[0].AirItineraryPricingInfo[0].TotalFare.CurrencyCode,
                                  DepartureDateTime: destinationData.data.DepartureDateTime,
                                  ReturnDateTime: destinationData.data.ReturnDateTime,
                                  DestinationLocation: destinationData.data.DestinationLocation,
                              };

                            var isStop = _.some(destinationData.data.PricedItineraries[0].OriginDestinationOption, function (item) { return item.FlightSegment.length > 1; });
                            if (isStop) {
                                apiparam.limit = 1;
                                apiparam.outboundflightstops = 0;
                                apiparam.inboundflightstops = 0;
                                InstaFlightSearchFactory.GetData(apiparam).then(function (response) {
                                    if (response && response.PricedItineraries) {
                                        FareInfo.LowestNonStopFare = {
                                            AirlineCodes: _.map(response.PricedItineraries[0].OriginDestinationOption[0].FlightSegment, function (item) { return item.OperatingAirline.Code; }),
                                            Fare: response.PricedItineraries[0].AirItineraryPricingInfo[0].TotalFare.Amount
                                        };
                                    }

                                    $scope.fareParams.FareInfo = FareInfo;
                                    $scope.FareInfo = FareInfo;
                                    $scope.fareCurrencySymbol = $scope.GetCurrencySymbol($scope.fareParams.FareInfo.CurrencyCode);
                                    initFares($scope.FareInfo);
                                    $scope.airlineJsonData = [];
                                    $scope.$emit('destinationFare', $scope.FareInfo);
                                });
                            }
                            else {
                                FareInfo.LowestNonStopFare = FareInfo.LowestFare;
                                $scope.fareParams.FareInfo = FareInfo;
                                $scope.FareInfo = FareInfo;
                                $scope.fareCurrencySymbol = $scope.GetCurrencySymbol($scope.fareParams.FareInfo.CurrencyCode);
                                initFares($scope.FareInfo);
                                $scope.airlineJsonData = [];
                                $timeout(function () { $scope.$emit('destinationFare', $scope.FareInfo) }, 0, false);
                            }
                        }
                        else {
                            DestinationFactory.findInstFlightDestination(apiparam).then(function (response) {
                                if (response.FareInfo != null) {
                                    $scope.destinationlist = FilterDestinations(response.FareInfo);
                                    var DestinationairportName = _.find($scope.AvailableAirports, function (airport) { return airport.airport_Code == $scope.DestinationLocation.toUpperCase() });

                                    var objDestinationairport = $scope.destinationlist[0];
                                    if (objDestinationairport != undefined) {
                                        objDestinationairport.objDestinationairport = $scope.DestinationLocation.toUpperCase();
                                        $scope.destinationlist.forEach(function (item) { item.DestinationLocation = item.objDestinationairport; });
                                        $scope.FareInfo = response.FareInfo[0];
                                        $scope.airlineJsonData = [];
                                        $scope.fareParams.FareInfo = $scope.FareInfo;
                                        $scope.fareCurrencySymbol = $scope.GetCurrencySymbol($scope.fareParams.FareInfo.CurrencyCode);
                                        initFares($scope.FareInfo);
                                        UtilFactory.MapscrollTo('wrapper');
                                        $scope.$emit('destinationFare', $scope.FareInfo);
                                    }
                                    else {
                                        $scope.airlineJsonData = [];
                                    }
                                }
                                else if (typeof response == 'string') {
                                    var POSCountriesList = [];
                                    var CList = "Selected origin country is not among the countries we support. We currently support the below countries. We will continue to add support for more countries. <br/><br/><div class='pos_List'>";
                                    var POSList = JSON.parse(response);
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
                                    $scope.airlineJsonData = [];
                                }
                            });
                        }
                    }
                    else {
                        $scope.airlineJsonData = [];
                        $scope.fareParams.FareInfo = $scope.FareInfo;
                        $scope.fareCurrencySymbol = $scope.GetCurrencySymbol($scope.fareParams.FareInfo.CurrencyCode);
                        initFares($scope.FareInfo);
                        $timeout(function () { $scope.$emit('destinationFare', $scope.FareInfo) }, 0, false);
                    }
                    $scope.airportDetail = $scope.fareParams.DestinationAirport.airport_FullName + ', ' + $scope.fareParams.DestinationAirport.airport_CityName + ', ' + $scope.fareParams.DestinationAirport.airport_CountryName;
                };

                function initFares(FareInfo) {
                    if (FareInfo.LowestNonStopFare && FareInfo.LowestNonStopFare.Fare != 'N/A' && FareInfo.LowestNonStopFare.Fare != 0) {
                        $scope.LowestNonStopFare = FareInfo.LowestNonStopFare;
                        $scope.LowestNonStopFare.outboundflightstops = 0;
                        $scope.LowestNonStopFare.inboundflightstops = 0;
                    }
                    else if (FareInfo.LowestFare && FareInfo.LowestFare.Fare != 'N/A' && FareInfo.LowestFare.Fare != 0)
                        $scope.LowestNonStopFare = FareInfo.LowestFare;

                    if (FareInfo.LowestFare && FareInfo.LowestFare.Fare != 'N/A' && FareInfo.LowestFare.Fare != 0)
                        $scope.LowestFare = FareInfo.LowestFare;

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

                $scope.InstaFlightSearch = function (airlines, lowestFare, outboundflightstops, inboundflightstops) {
                    $scope.fareParams.instaFlightSearchData.IncludedCarriers = airlines;
                    $scope.fareParams.instaFlightSearchData.LowestFare = lowestFare;
                    $scope.fareParams.instaFlightSearchData.outboundflightstops = outboundflightstops;
                    $scope.fareParams.instaFlightSearchData.inboundflightstops = inboundflightstops;
                    var InstaFlightSearchPopupInstance = $modal.open({
                        templateUrl: 'Views/Partials/InstaFlightSearchPartial.html',
                        controller: 'InstaFlightSearchController',
                        scope: $scope,
                        size: 'lg',
                        resolve: {
                            instaFlightSearchData: function () { return $scope.fareParams.instaFlightSearchData; }
                        }
                    });
                };

                $scope.initBreadcrumb = function () {
                    var search = $scope.fareParams.SearchCriteria;
                    var destinationsPath = "f=" + search.Origin + ";d=" + ConvertToRequiredDate(search.FromDate, 'API') + ";r=" + ConvertToRequiredDate(search.ToDate, 'API');
                    $scope.breadcrumb = [
                        { state: 'home', name: 'Home' },
                        { state: 'destinations({path:"' + destinationsPath + '"})', name: 'Destinations' },
                        { state: 'destination', name: 'Destination', active: true, className: "active" }
                    ];
                }
                $scope.totalFare = function () {
                    return 2 * parseFloat($scope.LowestFare.Fare) + parseFloat($scope.HotelData.Fare);
                }
            }
        }
    }]);
