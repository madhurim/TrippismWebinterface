(function () {
    'use strict';
    var controllerId = 'YouTubeController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$sce', 'TrippismConstants', YouTubeController]);

    function YouTubeController($scope, $modal, $sce, TrippismConstants) {

        $scope.open = function (videoID) {

            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'YoutubePlayerPartial.html',
                controller: 'YouTubePlayerController',
                size: 'lg',
                resolve: {
                    videoID: function () {
                        return $scope.videoID = $sce.trustAsResourceUrl("//www.youtube.com/embed/" + videoID + "?autoplay=1");
                    }
                }
            });

            $scope.youtubeplayerpromise = modalInstance.result.then(function (selectedItem) {
                $scope.selected = selectedItem;
            });
        };

        $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
        };

    }
})();

(function () {
    'use strict';
    var controllerId = 'YouTubePlayerController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modalInstance', 'videoID', YouTubePlayerController]);

    function YouTubePlayerController($scope, $modalInstance, videoID) {
        $scope.videoID = videoID;
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }
})();