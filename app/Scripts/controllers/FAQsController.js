(function () {
    angular.module('TrippismUIApp').controller('FAQsController', ['$scope', FAQsController]);
    function FAQsController($scope) {
        $scope.$emit('bodyClass', 'faqpage');
    };
})();