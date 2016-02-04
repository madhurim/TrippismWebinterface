(function () {
    'use strict';
    var serviceId = 'GoogleAttractionFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', '$rootScope', GoogleAttractionFactory]);

    function GoogleAttractionFactory($http, $rootScope) {
        // Define the functions and properties to reveal.
        var service = {
            googleAttraction: googleAttraction,
            getAttractionList: getAttractionList,
        };
        return service;

        function serialize(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    var propval = encodeURIComponent(obj[p]);
                    if (propval != "undefined" && propval != "null" && propval != '')
                        str.push(encodeURIComponent(p) + "=" + propval);
                }
            return str.join("&");
        }

        function googleAttraction(data) {
            var dataURL = 'locationsearch?' + serialize(data);
            var url = $rootScope.apiURLForGoogleAttraction + dataURL;
            return $http.get(url)
                .then(function (data) {
                    return data.data;
                }, function (e) {
                    return e;
                });
        }

        // if you want to remove or add new attraction tab just change into this object.
        // need to add class name into 'htmlClass' element and create css
        function getAttractionList() {

            // (isDefault: true) used for setting attraction as default active and fetch it's data first when destination tab page is opened.
            var attractionList = [
                //{ name: 'Attractions', Types: &types=restaurant|cafe, ExcludeTypes: null, Keywords: null, attractionText: 'Attractions', isSetMapCenter: true, markerImage: 'images/mapicon-small.png' },
                {
                    name: 'Restaurants',
                    attractionText: 'Food',
                    Types: '&types=restaurant|cafe',
                    ExcludeTypes: ["lodging"],
                    Keywords: null,
                    isSetMapCenter: true,
                    markerImage: 'images/attraction-marker/mapicon-restaurant.png',
                    isDefault: true,
                    htmlClass: 'attr-foods'
                },
                {
                    name: 'beaches',
                    attractionText: 'Beaches',
                    Types: '&keyword=beach',
                    ExcludeTypes: ["store"],
                    Keywords: null,
                    isSetMapCenter: false,
                    markerImage: 'images/attraction-marker/palm-tree-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-beaches'
                },
                {
                    name: 'casinos',
                    attractionText: 'Casinos',
                    Types: '&types=casino',
                    ExcludeTypes: ["store"],
                    Keywords: null,
                    isSetMapCenter: false,
                    markerImage: 'images/attraction-marker/dice-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-casinos'
                },
                {
                    name: 'outdoors',
                    attractionText: 'Outdoors',
                    Types: '&types=park|zoo|campground',
                    ExcludeTypes: ["store"],
                    Keywords: null,
                    isSetMapCenter: false,
                    markerImage: 'images/attraction-marker/climbing-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-outdoors'
                },
                {
                    name: 'shopping',
                    attractionText: 'Shops and Spas',
                    Types: '&types=spa|shopping_mall',
                    ExcludeTypes: null,
                    Keywords: null,
                    isSetMapCenter: false,
                    markerImage: 'images/attraction-marker/full-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-shops'
                },
                {
                    name: 'themeparks',
                    attractionText: 'Theme Parks',
                    Types: '&types=amusement_park',
                    ExcludeTypes: ["store"],
                    Keywords: null,
                    isSetMapCenter: false,
                    markerImage: 'images/attraction-marker/cruise-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-theme-parks'
                },
                {
                    name: 'historical',
                    attractionText: 'History and Culture',
                    Types: '&types=art_gallery|church|mosque|hindu_temple|synagogue|museum',
                    ExcludeTypes: ["store"],
                    Keywords: null,
                    isSetMapCenter: false,
                    markerImage: 'images/attraction-marker/bank-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-history'
                }
            ];
            return attractionList;
        }
    }
})();
