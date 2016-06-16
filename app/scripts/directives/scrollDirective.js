// Created for fetching new google attractions when user scroll scrollbar to the end.
// i.e. <div class="content" scroll scroll-callback="loadMoreAttractions()">
// scroll-callback : pass callback function when scrolled to end.
angular.module('TrippismUIApp').directive('scroll', function () {
    return {
        restrict: 'A',
        scope: {
            scrollCallback: "&"
        },
        controller: function () {

        },
        link: function (scope, element, attrs) {
            var raw = element[0];
            element.bind('scroll', function () {
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.scrollCallback();
                }
            });
        }
    };
});