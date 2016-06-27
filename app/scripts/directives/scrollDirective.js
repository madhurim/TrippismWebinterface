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
                //console.table([{ scrollTop: raw.scrollTop, offsetHeight: raw.offsetHeight, 'raw.scrollTop + raw.offsetHeight': raw.scrollTop + raw.offsetHeight, scrollHeight: raw.scrollHeight, 'raw.scrollTop + raw.offsetHeight >= raw.scrollHeight': raw.scrollTop + raw.offsetHeight >= raw.scrollHeight }]);
                if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                    scope.scrollCallback();
                }
            });
        }
    };
});