'use strict';

angular.module('TrippismUIApp')
.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('main', {    
            url: '/main',
            templateUrl: 'views/partials/EmailDetFormPartial.html',
            controller: 'EmailForDestinationDet'
        });
}]);
