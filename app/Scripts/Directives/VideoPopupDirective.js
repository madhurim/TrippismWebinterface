(function () {
    angular.module('TrippismUIApp').directive('videoPopupDirective', ['$modal', VideoPopupDirective]);
    function VideoPopupDirective($modal) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind("click", function (e) {
                    scope.videoModel();
                });
                scope.videoModel = function () {
                    scope.videoModelInstance = $modal.open({
                        templateUrl: '/Views/Partials/VideoPopupPartial.html',
                        scope: scope,
                    });
                }

                scope.dismiss = function (modelInstance) {
                    modelInstance.dismiss('cancel');
                };
            }
        }
    }
})();