﻿(function () {
    'use strict';
    var controllerId = 'DestinationController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope',
            '$stateParams',
            'DestinationFactory',
            'UtilFactory',
            'InstaFlightSearchFactory',
             DestinationController]);
    function DestinationController(
        $scope,
        $stateParams,
        DestinationFactory,
        UtilFactory,
        InstaFlightSearchFactory) {

        $scope.$emit('bodyClass', 'otherpage');
        $scope.Origin = $scope.DestinationLocation = '';
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

                    $scope.OriginairportName = _.find($scope.AvailableAirports, function (airport) {
                        return airport.airport_Code == $scope.Origin.toUpperCase()
                    });
                    $scope.DestinationairportName = _.find($scope.AvailableAirports, function (airport) {
                        return airport.airport_Code == $scope.DestinationLocation
                    });

                    var dates = UtilFactory.GetValidDates($scope.FromDate, $scope.ToDate);
                    $scope.FromDate = dates.FromDate;
                    $scope.ToDate = dates.ToDate;

                    if ($scope.OriginairportName == undefined || $scope.DestinationairportName == undefined) {
                        alertify.alert("Destination Finder", "");
                        alertify.alert('We could not find any destination that matches your request. Please make sure you have entered valid airport codes and dates.');
                        $scope.fareParams = readyfareParams();
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

                $scope.params = readyfareParams();

                function readyfareParams() {
                    return {
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

                var WeatherData, farerangeInfo, fareforcastinfo;

                $scope.$on('widgetLoaded', function (event, data) {
                    if (data.name === 'WeatherData') {
                        WeatherData = data;
                    }
                    else if (data.name === 'farerangeInfo') {
                        farerangeInfo = data;
                    }
                    else if (data.name === 'fareforcastinfo') {
                        fareforcastinfo = data;
                    }

                    if (farerangeInfo && WeatherData && fareforcastinfo) {
                        var columnData = {
                            farerangeInfo: farerangeInfo,
                            fareforcastinfo: fareforcastinfo,
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
