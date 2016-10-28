(function () {
    'use strict';
    angular.module('TrippismUIApp').directive('destinationsCard', ['urlConstant', '$rootScope', 'LocalStorageFactory', 'dataConstant', 'BaseFactory', destinationsCard]);
    function destinationsCard(urlConstant, $rootScope, LocalStorageFactory, dataConstant, BaseFactory) {
        return {
            restrict: 'E',
            scope: {
                Origin: '=origin',
                Destination: '=destination'
            },
            templateUrl: urlConstant.partialViewsPath + 'destinationsCard.html',
            controller: ['$scope', 'UtilFactory', 'urlConstant', function ($scope, UtilFactory, urlConstant) {
                $scope.destinationImagePath = urlConstant.destinationSmallImagePath;
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

                scope.sortCardsByPrice = function ($event) {
                    $event.preventDefault();
                    scope.$emit('sortCardsByPrice');
                }

                scope.getlink = function (data) {
                    return '/#/destination/f=' + scope.Origin.toUpperCase() + ';t=' + data.DestinationLocation + ';d=' + ConvertToRequiredDate(data.DepartureDateTime, 'API') + ';r=' + ConvertToRequiredDate(data.ReturnDateTime, 'API');
                };
                scope.addFevDestination = function ($event, Destination) {
                    $event.preventDefault();
                    $rootScope.loginPoupup("AddLike").then(function (data) {
                        if (data) {
                            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
                            var destinationsLikesDetail = {
                                CustomerGuid: userInfo.Guid,
                                Destination: Destination.CityCode,
                                LikeStatus: true
                            }
                            BaseFactory.storeDestinationsLikes(destinationsLikesDetail).then(function (data) {
                                Destination.like = (data.status == 200) ? data.data.LikeStatus : false;
                            })
                        }
                        else {
                            scope.$emit('setLogin', { IsLogin: false });
                        }
                    });
                }
            }
        }
    }
})();