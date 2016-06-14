(function () {
    'use strict';
    angular.module('TrippismUIApp').directive('destinationsCard', destinationsCard);
    function destinationsCard() {
        return {
            restrict: 'E',
            scope: {
                Origin: '=origin',
                Destination: '=destination'
            },
            templateUrl: '../views/partials/DestinationsCard.html',
            controller: ['$scope', 'UtilFactory', 'TrippismConstants', function ($scope, UtilFactory, TrippismConstants) {
                $scope.DestinationImagePath = TrippismConstants.DestinationSmallImagePath;
                $scope.GetLowFare = GetLowFare;
                $scope.GetCurrencySymbol = GetCurrencySymbol;

                function GetLowFare(item) {
                    return Math.ceil(UtilFactory.GetLowFareForMap(item));
                }

                function GetCurrencySymbol(code) {
                    return UtilFactory.GetCurrencySymbol(code);
                }
            }],
            link: function (scope, elem, attrs) {
                scope.gotoMap = function ($event, data) {
                    $event.preventDefault();
                    scope.$emit('displayOnMap', { DestinationLocation: data.DestinationLocation, lat: data.lat, lng: data.lng });
                }

                scope.getlink = function (data) {
                    return '/#/destination/f=' + scope.Origin.toUpperCase() + ';t=' + data.DestinationLocation + ';d=' + ConvertToRequiredDate(data.DepartureDateTime, 'API') + ';r=' + ConvertToRequiredDate(data.ReturnDateTime, 'API');
                };
            }
        }
    }
})();