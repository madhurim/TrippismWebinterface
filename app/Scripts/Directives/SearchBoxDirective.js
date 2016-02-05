angular.module('TrippismUIApp').directive('searchBox', [
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
function($location,$modal,$rootScope,$timeout,$filter,$window,DestinationFactory,UtilFactory,FareforecastFactory,SeasonalityFactory,TrippismConstants)
{
    return {
        restrict: 'E',
        templateUrl: '/Views/Partials/SearchBox.html',
        link: function ($scope, elem, attrs) {
            debugger;
            $scope.selectedform = 'SuggestDestination';
            $scope.SearchbuttonText = "Suggest Destinations";
            $scope.KnowSearchbuttonText = 'Get Destination Details';
            $scope.SearchbuttonIsLoading = true;
            $scope.KnowSearchbuttonIsLoading = false;
            $scope.Origin = '';
            $scope.Destination = '';
            $scope.FromDate;
            $scope.ToDate;
            $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
            $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
            $scope.minTodayDate = new Date();
            $scope.minFromDate = new Date();
            $scope.minFromDate = $scope.minFromDate.setDate($scope.minFromDate.getDate() + 1);
            debugger;
            $scope.$watch(function () { return UtilFactory.AirportData() }, function (newVal, oldVal) {
                if (typeof newVal !== 'undefined') {
                    $scope.AvailableAirports = newVal;
                }
            });
            
            function LoadJsonFileData() {
                UtilFactory.ReadAirportJson().then(function (data) {
                    $scope.AvailableAirports = data;

                });
            }
            LoadJsonFileData();
            
            $scope.openFromDate = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.openedFromDate = true;
                $scope.SetFromDate();
                document.getElementById('txtFromDate').select();
            };
            $scope.openToDate = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = true;
                document.getElementById('txtToDate').select();
            };
            $scope.SetFromDate = function () {
                if ($scope.FromDate == "" || $scope.FromDate == undefined || $scope.FromDate == null) {
                    $scope.FromDate = ConvertToRequiredDate(GetFromDate(), 'UI');
                    $scope.FromDateDisplay = GetDateDisplay($scope.FromDate);
                }
            };
            $scope.SetToDate = function () {
                if (($scope.ToDate == "" || $scope.ToDate == undefined || $scope.ToDate == null) && $scope.FromDate != null) {
                    $scope.ToDate = ConvertToRequiredDate(GetToDate($scope.FromDate), 'UI');
                    $scope.ToDateDisplay = GetDateDisplay($scope.ToDate);
                }
            }
        }
    }
}]);

    
    