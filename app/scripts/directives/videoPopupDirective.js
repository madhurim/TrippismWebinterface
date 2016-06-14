(function () {
    angular.module('TrippismUIApp').directive('videoPopupDirective', ['$modal', 'urlConstant', VideoPopupDirective]);
    function VideoPopupDirective($modal, urlConstant) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind("click", function (e) {
                    scope.videoModel();
                });
                scope.videoModel = function () {
                    scope.videoModelInstance = $modal.open({
                        templateUrl: urlConstant.partialViewsPath + 'videoPopupPartial.html',
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