(function () {
    'use strict';
    var serviceId = 'TAAttractionFactory';
    angular.module('TrippismUIApp').factory(serviceId, ['$http', 'urlConstant', TAAttractionFactory]);

    function TAAttractionFactory($http, urlConstant) {
        // Define the functions and properties to reveal.
        var service = {
            googleAttraction: googleAttraction,
            getAttractionList: getAttractionList,
        };
        return service;

        function googleAttraction(data) {
            var dataURL = '?' + serialize(data);
            var url = urlConstant.apiURLForTAAttraction + dataURL;
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
                      rank: 1,
                      name: 'hotels',
                      attractionText: 'Hotels',
                      markerImage: 'images/attraction-marker/hotels-icon.png',
                      isDefault: false,
                      htmlClass: 'attr-hotels'
                  },
                {
                    rank: 5,
                    name: 'Restaurants',
                    attractionText: 'Food',
                    subCategory: 'Food & Drink',
                    markerImage: 'images/attraction-marker/mapicon-restaurant.png',
                    isDefault: false,
                    htmlClass: 'attr-foods'
                },
                {
                    rank: 6,
                    name: 'beaches',
                    subCategory: 'Beaches',
                    markerImage: 'images/attraction-marker/palm-tree-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-beaches'
                },
                {
                    rank: 7,
                    name: 'casinos',
                    attractionText: 'Casinos',
                    subCategory: 'Casinos',
                    markerImage: 'images/attraction-marker/dice-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-casinos'
                },
                {
                    rank: 1,
                    name: 'outdoors',
                    attractionText: 'Outdoors',
                    markerImage: 'images/attraction-marker/climbing-icon.png',
                    isDefault: true,
                    htmlClass: 'attr-outdoors'
                },
                {
                    rank: 3,
                    name: 'shopping',
                    attractionText: 'Shops and Spas',
                    subCategory: 'Shopping',
                    markerImage: 'images/attraction-marker/full-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-shops'
                },
                {
                    rank: 4,
                    name: 'themeparks',
                    attractionText: 'Theme Parks',
                    subCategory: 'Amusement',
                    Types: '&types=amusement_park',
                    isDefault: false,
                    htmlClass: 'attr-theme-parks'
                },
                {
                    rank: 2,
                    name: 'historical',
                    attractionText: 'History and Culture',
                    subCategory: 'Cultural,Landmarks,Museums',
                    markerImage: 'images/attraction-marker/bank-icon.png',
                    isDefault: false,
                    htmlClass: 'attr-history'
                }
            ];
            return attractionList;
        }
    }
})();
