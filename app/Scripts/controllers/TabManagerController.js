(function () {
    'use strict';
    var controllerId = "TabManagerController";
    angular.module('TrippismUIApp').controller(controllerId,
    ['$scope',
        '$location',
        '$modal',
        '$rootScope',
        '$timeout',
        '$filter',
        '$window',
        'DestinationFactory',
        'UtilFactory',
        'FareforecastFactory',
        'SeasonalityFactory',
        'TrippismConstants',
         TabManagerController]);
    function TabManagerController(
       $scope,
       $location,
       $modal,
       $rootScope,
       $timeout,
       $filter,
       $window,
       DestinationFactory,
       UtilFactory,
       FareforecastFactory,
       SeasonalityFactory,
       TrippismConstants
       ) {
        $scope.CreateTab = CreateTab;
        $scope.tabManager.getTitle = function (tabInfo) {
            tabInfo.title.substr(0, 10);
        };

        $scope.tabManager.resetSelected = function () {
            angular.forEach($scope.tabManager.tabItems, function (pane) {
                pane.TabcontentView = false; // Custom
                pane.selected = false;
            });
        };

        $scope.tabManager.selectPreviousTab = function (i, $event) {
            if (typeof $event != 'undefined') {
                $event.stopPropagation();
            }
            if (i > 0) {
                angular.forEach($scope.tabManager.tabItems, function (tabInfo) {
                    tabInfo.selected = false;
                });
                $scope.tabManager.tabItems[i - 1].selected = true;
            }
        }
        $scope.tabManager.removeTab = function (i, $event) {
            if (typeof $event != 'undefined') {
                $event.stopPropagation();
            }
            $scope.RemovedTabIndex = $scope.tabManager.tabItems[i].parametersData.tabIndex + ',' + $scope.RemovedTabIndex;
            if ($scope.tabManager.tabItems.length > 0)
                $scope.tabManager.selectPreviousTab(i);
            // remove from array
            $scope.tabManager.tabItems.splice(i, 1);
            $scope.ViewDestination();
            $scope.countRemovedTab = parseInt($scope.countRemovedTab) + 1;
        }
        $scope.tabManager.select = function (i) {
            //$scope.isModified = false;
            //$scope.ShowDestinationView = false;
            DestinationFactory.ShowDestinationView = false;
            angular.forEach($scope.tabManager.tabItems, function (tabInfo) {
                tabInfo.selected = false;
                tabInfo.TabcontentView = false;
            });
            $scope.tabManager.tabItems[i].selected = true;
            $scope.tabManager.tabItems[i].TabcontentView = true;
            $rootScope.$broadcast('ontabClicked', $scope.tabManager.tabItems[i].parametersData.tabIndex);
            if ($scope.tabManager.tabItems[i].title.indexOf("-") != -1) {
                var fullname = $scope.tabManager.tabItems[i].title.split("-");
                var orgName = $.trim(fullname[0]);
                var desName = $.trim(fullname[1]);
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "Origin", orgName.toUpperCase() + '-' + desName.toUpperCase())
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "DepartureDate", ConvertToRequiredDate($scope.tabManager.tabItems[i].parametersData.SearchCriteria.FromDate, 'API'));
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "ReturnDate", ConvertToRequiredDate($scope.tabManager.tabItems[i].parametersData.SearchCriteria.ToDate, 'API'));
                $location.url($location.$$url, false);
            }
        }
  
        
        $scope.$on('EmptyFareForcastInfo', function (event, args) {
            var createNewTab = true;
            if ($scope.tabManager.tabItems.length != 0) {
                var SearchCriteria = {
                    OrigintoDisp: $scope.refineSearchValues.OrigintoDisp,
                    Origin: $scope.refineSearchValues.OrigintoDisp,
                    FromDate: $scope.refineSearchValues.FromDate,
                    ToDate: $scope.refineSearchValues.ToDate
                };
                var filtertab = _.find($scope.tabManager.tabItems, function (item) {
                    return item.title == $scope.refineSearchValues.OrigintoDisp + ' - ' + args.Destinatrion &&
                           $filter('date')(item.parametersData.SearchCriteria.FromDate, 'yyyy-MM-dd') == $filter('date')(SearchCriteria.FromDate, 'yyyy-MM-dd') &&
                        $filter('date')(item.parametersData.SearchCriteria.ToDate, 'yyyy-MM-dd') == $filter('date')(SearchCriteria.ToDate, 'yyyy-MM-dd')
                });
                if (filtertab != undefined) {
                    createNewTab = false;
                    $scope.Destinationfortab = args.Destinatrion;
                    $scope.tabManager.select($scope.tabManager.tabItems.indexOf(filtertab))
                }
            }

            if (createNewTab == true) {
             //   $scope.IsHistoricalInfo = false;
                $scope.MarkerInfo = "";
                $scope.MarkerSeasonalityInfo = "";
                $scope.OriginFullName = args.Origin;
                $scope.DestinationFullName = args.Destinatrion;
                $scope.fareData = args.Fareforecastdata;
                $scope.Destinationfortab = args.Destinatrion;
                $scope.fareforecastdirective = $scope.fareData;
                $scope.seasonalitydirectiveData = args;
                CreateTab();
            }
        });

        function CreateTab() {
            $scope.tabManager.resetSelected();
            var i = ($scope.tabManager.tabItems.length + 1);
            $scope.TabCreatedCount = $scope.TabCreatedCount + 1;
            var _paramsdata = $scope.seasonalitydirectiveData;
            _paramsdata.tabIndex = $scope.TabCreatedCount;
            var SearchCriteria = {
                OrigintoDisp: $scope.refineSearchValues.OrigintoDisp,
                Origin: $scope.refineSearchValues.OrigintoDisp,
                Minfare: $scope.refineSearchValues.Minfare,
                Maxfare: $scope.refineSearchValues.Maxfare,
                Region: $scope.refineSearchValues.Region,
                Theme: $scope.refineSearchValues.Theme,
                FromDate: $scope.refineSearchValues.FromDate,
                ToDate: $scope.refineSearchValues.ToDate,
                fareCurrencySymbol: $scope.fareCurrencySymbol
            };

            _paramsdata.dataforEmail = {};
            _paramsdata.SearchCriteria = SearchCriteria;
            _paramsdata.instaFlightSearchData = {
                OriginAirportName: $scope.seasonalitydirectiveData.OriginairportName.airport_Code,
                DestinationaArportName: $scope.seasonalitydirectiveData.DestinationairportName.airport_Code,
                FromDate: $scope.refineSearchValues.FromDate,
                ToDate: $scope.refineSearchValues.ToDate,
                Minfare: $scope.refineSearchValues.Minfare,
                Maxfare: $scope.refineSearchValues.Maxfare,
                PointOfSaleCountry: $scope.PointOfsalesCountry
            };
            $scope.tabManager.tabItems.push({
                parametersData: _paramsdata,
                title: $scope.seasonalitydirectiveData.OriginairportName.airport_Code + ' - ' + $scope.seasonalitydirectiveData.DestinationairportName.airport_Code,
                content: "",
                selected: true,
                TabcontentView: true
            });
            // $scope.ShowDestinationView = false;
            DestinationFactory.ShowDestinationView = false;
            if ($scope.tabManager.tabItems[$scope.tabManager.tabItems.length - 1].title.indexOf("-") != -1) {
                var fullname = $scope.tabManager.tabItems[$scope.tabManager.tabItems.length - 1].title.split("-");
                var orgName = $.trim(fullname[0]);
                var desName = $.trim(fullname[1]);
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "Origin", orgName.toUpperCase() + '-' + desName.toUpperCase())
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "DepartureDate", ConvertToRequiredDate($scope.tabManager.tabItems[$scope.tabManager.tabItems.length - 1].parametersData.SearchCriteria.FromDate, 'API'));
                $location.$$url = UtilFactory.updateQueryStringParameter($location.$$url, "ReturnDate", ConvertToRequiredDate($scope.tabManager.tabItems[$scope.tabManager.tabItems.length - 1].parametersData.SearchCriteria.ToDate, 'API'));
                $location.url($location.$$url, false);
            }
        }

        $scope.$on('CreateTabForDestination', function () {
            $scope.tabManager.resetSelected();
            var i = ($scope.tabManager.tabItems.length + 1);
            $scope.TabCreatedCount = $scope.TabCreatedCount + 1;
            var _paramsdata = $scope.seasonalitydirectiveData;
            _paramsdata.tabIndex = $scope.TabCreatedCount;
            _paramsdata.dataforEmail = [];
            $scope.tabManager.tabItems.push({
                parametersData: _paramsdata,
                title: $scope.seasonalitydirectiveData.OriginairportName.airport_Code + ' - ' + $scope.seasonalitydirectiveData.DestinationairportName.airport_Code,
                content: "",
                selected: true,
                TabcontentView: true
            });
            DestinationFactory.ShowDestinationView = false;
           // $scope.ShowDestinationView = false;
        });

    }

})();