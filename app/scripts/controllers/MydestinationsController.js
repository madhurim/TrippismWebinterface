(function () {
    'use strict';
    var controllerId = 'MyDestinationController';
    angular.module('TrippismUIApp').controller(controllerId, ['$scope', '$modal', '$modalInstance', '$filter', '$timeout', 'UtilFactory', 'BaseFactory', 'LocalStorageFactory', 'dataConstant', LoginController]);

    function LoginController($scope, $modal, $modalInstance, $filter, $timeout, UtilFactory, BaseFactory, LocalStorageFactory, dataConstant) {

        var likeDestinationsList = [];
        var limitDestinationCards = 12;
        var highRankedAirportlist = [];
        function activate() {
            UtilFactory.ReadHighRankedAirportsJson().then(function (data) {
                highRankedAirportlist = data;
                var userDetail = getUserDetail();
                if (userDetail) {
                    BaseFactory.getDestinationLikes(userDetail).then(function (likesDetail) {
                        likeDestinationsList = likesDetail;
                        $scope.likeDestinationsToDisp = $filter('limitTo')(getDestinationLikeList(likeDestinationsList), limitDestinationCards);
                    })
                };
            });
        }
        function getUserDetail() {
            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            var destinationsLikesDetail = {
                CustomerGuid: userInfo.Guid
            }
            $scope.IsUserLogin = true;
            return destinationsLikesDetail;
        }

        activate();

        function getDestinationLikeList(destinationLikes) {
            var likeDestinations = [];
            if (destinationLikes) {
                for (var x = 0; x < destinationLikes.length; x++) {
                    var destination = destinationLikes[x];
                    var destinationExist = _.find(highRankedAirportlist, function (airport) {
                        return airport.airport_CityCode == destination.Destination
                    });
                    if (destinationExist != undefined) {
                        destination.DestinationLocation = destinationExist.airport_Code;
                        destination.DepartureDateTime = $scope.FromDate;
                        destination.ReturnDateTime = $scope.ToDate;
                        destination.CityName = destinationExist.airport_CityName;
                        destination.CityCode = destinationExist.airport_CityCode;
                        destination.FullName = destinationExist.airport_FullName;
                        likeDestinations.push(destination);
                    }
                }
                likeDestinationsList = likeDestinations;
                $scope.likeDestinationsToDisp = $filter('limitTo')(likeDestinationsList, limitDestinationCards);
                loadScrollbars();
            }
            return likeDestinationsList;
        }

        $scope.dismiss = function () {
            var IsAnyChange = _.some($scope.likeDestinationsToDisp, function (item) { return item.LikeStatus == false; });
            if (IsAnyChange)
                $modalInstance.close($scope.likeDestinationsToDisp);
            else
                $modalInstance.dismiss('cancel');
        };
        $scope.loadMoreDestinations = function () {
            if (limitDestinationCards >= likeDestinationsList.length) return;
            limitDestinationCards += 6;
            setDestinationCards(likeDestinationsList);
        }
        function setDestinationCards(data) {
            $timeout(function () {
                likeDestinationsList = data;
                $scope.likeDestinationsToDisp = $filter('limitTo')(data, limitDestinationCards);
            }, 0, true)
        }
    }
})();