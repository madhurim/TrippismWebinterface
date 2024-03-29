﻿(function () {
    'use strict';
    var controllerId = 'DestinationController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
            '$stateParams',
            'DestinationFactory',
            'UtilFactory',
            'InstaFlightSearchFactory',
            '$window',
            'urlConstant',
            '$rootScope',
            'LocalStorageFactory',
            'dataConstant',
             DestinationController]);
    function DestinationController(
        $scope,
        $stateParams,
        DestinationFactory,
        UtilFactory,
        InstaFlightSearchFactory,
        $window,
        urlConstant,
        $rootScope,
        LocalStorageFactory,
        dataConstant) {

        $scope.$emit('bodyClass', 'otherpage destination-page');
        DestinationFactory.DestinationDataStorage.currentPage.clear();

        var w = angular.element($window);
        w.bind('resize', setImageHeight);

        setImageHeight();

        function setImageHeight() {
            var boxwrap = angular.element("#destination-imgwrap");
            if (!boxwrap.length) { w.unbind("resize", setImageHeight); return; };
            if (w.width() < 480)
                boxwrap.height((w.height() * 40) / 100);    // make image height 40% of the screen height
            else
                boxwrap.height((w.height() * 70) / 100);    // make image height 70% of the screen height
        }

        $scope.Origin = $scope.DestinationLocation = undefined;
        $scope.destinationImagePath = urlConstant.destinationImagePath;
        init();

        function init() {
            window.scrollTo(0, 0);
            alertify.dismissAll();
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
                        }
                        if (para[0].trim() === "r") {
                            $scope.ToDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                        }
                    });

                    storeSearchData();
                    $scope.OriginAirport = _.find($scope.AvailableAirports, function (airport) {
                        return airport.airport_Code == $scope.Origin.toUpperCase()
                    });
                    $scope.DestinationAirport = _.find($scope.AvailableAirports, function (airport) {
                        return airport.airport_Code == $scope.DestinationLocation
                    });

                    $scope.DestinationCity = $scope.DestinationAirport ? $scope.DestinationAirport.airport_CityCode : 'default.jpg';
                    var dates = UtilFactory.GetValidDates($scope.FromDate, $scope.ToDate);
                    $scope.FromDate = dates.FromDate;
                    $scope.ToDate = dates.ToDate;

                    if ($scope.OriginAirport == undefined || $scope.DestinationAirport == undefined) {
                        alertify.alert("Destination Finder", "");
                        alertify.alert('We could not find any destination that matches your request. Please make sure you have entered valid airport codes and dates.');
                        $scope.fareParams = readyfareParams();
                        return false;
                    }
                }
                var param = {
                    "Origin": $scope.Origin,
                    "DepartureDate": ($scope.FromDate == '' || $scope.FromDate == undefined) ? null : ConvertToRequiredDate($scope.FromDate, 'API'),
                    "ReturnDate": ($scope.ToDate == '' || $scope.ToDate == undefined) ? null : ConvertToRequiredDate($scope.ToDate, 'API'),
                    "Destination": $scope.DestinationLocation
                };

                $scope.params = readyfareParams();

                function readyfareParams() {
                    return {
                        OriginAirport: $scope.OriginAirport,
                        DestinationAirport: $scope.DestinationAirport,
                        FareInfo: $scope.FareInfo,
                        Fareforecastdata: param,
                        AvailableAirports: $scope.AvailableAirports,
                        SearchCriteria: {
                            Origin: $scope.Origin,
                            DestinationLocation: $scope.DestinationLocation,
                            FromDate: (typeof $scope.FromDate == 'string') ? new Date($scope.FromDate) : $scope.FromDate,
                            ToDate: (typeof $scope.ToDate == 'string') ? new Date($scope.ToDate) : $scope.ToDate,
                        },
                        instaFlightSearchData: {
                            OriginAirportName: $scope.Origin,
                            DestinationaArportName: $scope.DestinationLocation,
                            FromDate: $scope.FromDate,
                            ToDate: $scope.ToDate,
                            PointOfSaleCountry: $scope.OriginAirport.airport_CountryCode
                        },
                        AvailableAirline: $scope.airlineJsonData
                    }
                }

                $scope.$on('widgetLoaded', function (event, data) {
                    if (data.isVisible)
                        $scope.$broadcast("columnLayoutChanged", data.name);
                });

                // broadcast from destiantionFareForecast.
                // broadcast to farerangeWidget.
                // we are not displaying farerangeWidget if no destination fare found.
                $scope.$on('destinationFare', function (event, data) {
                    $scope.$broadcast('destinationFareInfo', data);
                });
            });
        }

        $scope.attractionProviders = dataConstant.attractionProviders;
        $scope.attractionTabs = [{ title: 'Hotels', isActive: false }, { title: $scope.attractionProviders.Google, isActive: true },
                                { title: $scope.attractionProviders.TripAdvisor, isActive: false }];

        function storeSearchData(currencyCode) {
            $scope.lastselectedcurrency = $rootScope.currencyCode;

            var data = {
                f: $scope.Origin
            };

            var data = LocalStorageFactory.get(dataConstant.refineSearchLocalStorage, data);
            if (data) {
                $scope.lastselectedcurrency = (data.ncu) ? data.ncu : $scope.lastselectedcurrency;
                $rootScope.setdefaultcurrency($scope.lastselectedcurrency);
            }
            else {
                data = {
                    f: $scope.Origin,
                    d: $scope.FromDate,
                    r: $scope.ToDate,
                    ncu: currencyCode
                };
                $scope.lastselectedcurrency = undefined;
                LocalStorageFactory.save(dataConstant.refineSearchLocalStorage, data);
                $rootScope.setdefaultcurrency($scope.lastselectedcurrency);
            }
        }
        $scope.PageName = "Destination Page";

        $scope.$on('showHotelDetails', function () {
            _.each($scope.attractionTabs, function (i) {
                if (i.title == "Hotels")
                    i.isActive = true;
            });
        });

        $scope.$on('hotelDataFound', function (event, data) {
            if (!data)
                angular.element('#divhotel').remove();
            else {
                $scope.isHotelFound = true;
                $scope.$broadcast('HotelData', data);
            }
        });
        $scope.$on('setExchangeRate', function (event, args) {

            var data = LocalStorageFactory.get(dataConstant.refineSearchLocalStorage, { f: $scope.Origin });
            if (data) {
                var updateData = {
                    f: data.f,
                    d: data.d,
                    r: data.r,
                    th: data.th,
                    a: data.a,
                    lf: data.lf,
                    hf: data.hf,
                    pcu: data.pcu,
                    ncu: $rootScope.currencyCode
                };
                LocalStorageFactory.save(dataConstant.refineSearchLocalStorage, updateData, {
                    f: $scope.Origin
                });
            }
            else {
                storeSearchData($rootScope.currencyCode);
            }
        });
    }

})();
