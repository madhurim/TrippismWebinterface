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
                        "Destination": $scope.DestinationLocation
                    }
                    DestinationFactory.findInstFlightDestination(apiparam,function(response){
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
                                alertify.alert("Destination Finder", "");
                                alertify.alert('We could not find details of the destination you are looking for, however we found other destinations that you can explore.').set('onok', function (closeEvent) { });
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
                            alertify.alert("Destination Finder", "");
                            alertify.alert('No suggestions are available from your Origin. We recomend trying other nearby major airports.').set('onok', function (closeEvent) { });
                        }
                    });

                    
                }
                else {

                    readyfareParams()
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

               function readyfareParams()
                {
                    $scope.fareParams = {
                        OriginairportName: $scope.OriginairportName,
                        DestinationairportName: $scope.DestinationairportName,
                        FareInfo: $scope.FareInfo,
                        Fareforecastdata: param,
                        AvailableAirports: $scope.AvailableAirports,
                        SearchCriteria: {
                            Origin: $scope.Origin,
                            DestinationLocation: $scope.DestinationLocation,
                            FromDate: $scope.FromDate,
                            ToDate: $scope.ToDate,
                            Theme: $scope.Theme,
                            Region: $scope.Region,
                            Minfare: $scope.Minfare,
                            Maxfare: $scope.Maxfare
                        }
                    }
                }
                

                var seasonalityfarerangewidgetInfo, WeatherData; //farerangeInfo,weatherwidgetInfo;
    
                $scope.$on('widgetLoaded', function (event, data) {
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