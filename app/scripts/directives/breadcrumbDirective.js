(function () {
    'use strict';
    angular.module('TrippismUIApp').directive('breadcrumbDirective', [BreadcrumbDirective]);
    function BreadcrumbDirective() {
        return {
            restrict: 'E',
            scope: {
                model: '=ngModel',
            },
            template: '<ol class="breadcrumb breadcrumb-custom">' +
                            '<li class="{{item.className}}" ng-repeat="item in model">' +
                                '<a ng-if="!item.active" ui-sref="{{item.state}}">{{item.name}}</a>' +
                                '<span ng-if="item.active">{{item.name}}</span>' +
                            '</li>' +
                    '</ol>'
        }
    }
})();