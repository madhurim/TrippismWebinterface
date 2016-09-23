(function () {
    'use strict';
    var serviceId = 'GoogleAttractionFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'dataConstant', 'urlConstant', GoogleAttractionFactory]);

    function GoogleAttractionFactory($http, dataConstant, urlConstant) {
        // Define the functions and properties to reveal.
        var service = {
            googleAttraction: googleAttraction,
            getAttractionList: getAttractionList,
        };
        return service;

        function googleAttraction(data) {
            var dataURL = 'locationsearch?' + serialize(data);
            var url = urlConstant.apiURLForGoogleAttraction + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }
        
        function getAttractionList() {
            return dataConstant.attractionList;
        }
    }
})();
