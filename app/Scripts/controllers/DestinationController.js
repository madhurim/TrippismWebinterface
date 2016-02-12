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
            'DestinationFactory',
            'UtilFactory',
            'FareforecastFactory',
            'SeasonalityFactory',
            'TrippismConstants',
             DestinationController]);
    function DestinationController(
        $scope,
        $location,
        $modal,
        $rootScope,
        $timeout,
        $filter,
        $window, $stateParams, $state,
        DestinationFactory,
        UtilFactory,
        FareforecastFactory,
        SeasonalityFactory,
        TrippismConstants) {
        
        init();

        function init()
        {
            UtilFactory.ReadAirportJson(function (response) {
                $scope.AvailableAirports = response;

                if ($stateParams.path != undefined) {
                    var params = $stateParams.path.split(";");
                    // split destination and origin to compare with tab title
                    angular.forEach(params, function (item) {
                        var para = item.split("=");
                        if (para[0].trim() === "f")
                            $scope.Origin = para[1].trim();
                        if (para[0].trim() === "t")
                            $scope.DestinationLocation = para[1].trim();
                        if (para[0].trim() === "d") {
                            $scope.FromDate = ConvertToRequiredDate(para[1].trim(), 'UI');
                            $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                        }
                        if (para[0].trim() === "r") {
                            $scope.ToDate = ConvertToRequiredDate(para[1].trim(), 'UI');;
                            $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                        }
                        if (para[0].trim() === "t")
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
                }
                var param = {
                    "Origin": $scope.Origin,
                    "DepartureDate": ($scope.FromDate == '' || $scope.FromDate == undefined) ? null : ConvertToRequiredDate($scope.FromDate, 'API'),
                    "ReturnDate": ($scope.ToDate == '' || $scope.ToDate == undefined) ? null : ConvertToRequiredDate($scope.ToDate, 'API'),
                    "Destination": $scope.DestinationLocation
                };
                $scope.FareInfo = DestinationFactory.GetDestinationFareInfo(param);

                $scope.fareParams = {
                    OriginairportName: $scope.OriginairportName,
                    DestinationairportName: $scope.DestinationairportName,
                    FareInfo: $scope.FareInfo,
                    Fareforecastdata: param,
                    AvailableAirports : $scope.AvailableAirports,
                    SearchCriteria: {
                        Origin: $scope.Origin,
                        DestinationLocation: $scope.DestinationLocation,
                        FromDate:$scope.FromDate,
                        ToDate : $scope.ToDate,
                        Theme :$scope.Theme ,
                        Region :$scope.Region,
                        Minfare :$scope.Minfare,
                        Maxfare :$scope.Maxfare
                    }
                }

                var seasonalityfarerangewidgetInfo, WeatherData; //farerangeInfo,weatherwidgetInfo;
    
                $scope.$on('widgetLoaded', function (event, data) {
                    debugger;
                    if (data.name === 'seasonalityfarerangewidgetInfo') {
                        seasonalityfarerangewidgetInfo = data;
                    }  else if (data.name === 'WeatherData') {
                        WeatherData = data;
                    }
                    //else if (data.name === 'farerangeInfo') {
                    //    farerangeInfo = data;
                    //} else if (data.name === 'weatherwidgetInfo') {
                    //    weatherwidgetInfo = data;
                    //}

                    if (seasonalityfarerangewidgetInfo && WeatherData ) //&& farerangeInfo && weatherwidgetInfo
                    {
                        var columnData = {
                            seasonalityfarerangewidgetInfo: seasonalityfarerangewidgetInfo,
                            //farerangeInfo: farerangeInfo,
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