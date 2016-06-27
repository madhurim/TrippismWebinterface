(function () {
    'use strict';
    var constants = {
        highChartDateFormat: '%m-%e-%Y',
        highChartTwoDecimalCurrencyFormat: '{point.y:.2f}',
        maxLOS: 16,
        attractionTabMapStyle: [{ "featureType": "landscape", "stylers": [{ "hue": "#FFBB00" }, { "saturation": 43.400000000000006 }, { "lightness": 37.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.highway", "stylers": [{ "hue": "#FFC200" }, { "saturation": -61.8 }, { "lightness": 45.599999999999994 }, { "gamma": 1 }] }, { "featureType": "road.arterial", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 51.19999999999999 }, { "gamma": 1 }] }, { "featureType": "road.local", "stylers": [{ "hue": "#FF0300" }, { "saturation": -100 }, { "lightness": 52 }, { "gamma": 1 }] }, { "featureType": "water", "stylers": [{ "hue": "#0078FF" }, { "saturation": -13.200000000000003 }, { "lightness": 2.4000000000000057 }, { "gamma": 1 }] }, { "featureType": "poi", "stylers": [{ "hue": "#00FF6A" }, { "saturation": -1.0989010989011234 }, { "lightness": 11.200000000000017 }, { "gamma": 1 }] }],
        destinationSearchMapSyle: [{ "featureType": "all", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative.country", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative.country", "elementType": "geometry", "stylers": [{ "lightness": "1" }, { "visibility": "on" }, { "color": "#bbbbbb" }] }, { "featureType": "administrative.country", "elementType": "labels", "stylers": [{ "lightness": "65" }, { "visibility": "on" }] }, { "featureType": "administrative.country", "elementType": "labels.text", "stylers": [{ "weight": "1" }, { "visibility": "simplified" }, { "saturation": "0" }, { "lightness": "40" }] }, { "featureType": "administrative.province", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative.locality", "elementType": "all", "stylers": [{ "hue": "#0049ff" }, { "saturation": 7 }, { "lightness": "0" }, { "visibility": "off" }] }, { "featureType": "administrative.locality", "elementType": "geometry", "stylers": [{ "visibility": "on" }] }, { "featureType": "administrative.neighborhood", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "administrative.land_parcel", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": "100" }, { "visibility": "off" }, { "color": "#fcfcfc" }, { "weight": "1" }] }, { "featureType": "landscape.man_made", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "landscape.natural", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "hue": "#ff0000" }, { "saturation": -100 }, { "lightness": 100 }, { "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "hue": "#bbc0c4" }, { "saturation": -93 }, { "lightness": 31 }, { "visibility": "simplified" }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "hue": "#bbc0c4" }, { "saturation": -93 }, { "lightness": 31 }, { "visibility": "on" }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road.arterial", "elementType": "labels", "stylers": [{ "hue": "#bbc0c4" }, { "saturation": -93 }, { "lightness": -2 }, { "visibility": "simplified" }] }, { "featureType": "road.local", "elementType": "geometry", "stylers": [{ "hue": "#e9ebed" }, { "saturation": -90 }, { "lightness": -8 }, { "visibility": "simplified" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "hue": "#007fff" }, { "saturation": 10 }, { "lightness": 69 }, { "visibility": "off" }] }, { "featureType": "transit.line", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.station", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.station.airport", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "transit.station.bus", "elementType": "all", "stylers": [{ "visibility": "on" }] }, { "featureType": "transit.station.rail", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "saturation": -78 }, { "lightness": 67 }, { "visibility": "simplified" }, { "color": "#91B7CF" }] }],
        zoomLevel: [{ zoom: 3, dis: 1000 }, { zoom: 4, dis: 700 }, { zoom: 5, dis: 500 }, { zoom: 6, dis: 200 }, { zoom: 7, dis: 65 }],

        // if you want to remove or add new attraction tab just change into this object.
        // need to add class name into 'htmlClass' element and create css
        // (isDefault: true) used for setting attraction as default active and fetch it's data first when destination tab page is opened.
        attractionList: [
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
                            Types: '&types=restaurant|cafe',                            
                            ExcludeTypes: ["lodging"],
                            subCategory: 'Food & Drink',
                            Keywords: null,
                            markerImage: 'images/attraction-marker/mapicon-restaurant.png',
                            isDefault: false,
                            htmlClass: 'attr-foods'
                        },
                        {
                            rank: 6,
                            name: 'beaches',
                            attractionText: 'Beaches',
                            Types: '&keyword=beach',
                            ExcludeTypes: ["store"],
                            subCategory: 'Beaches',
                            Keywords: null,
                            markerImage: 'images/attraction-marker/palm-tree-icon.png',
                            isDefault: false,
                            htmlClass: 'attr-beaches'
                        },
                        {
                            rank: 7,
                            name: 'casinos',
                            attractionText: 'Casinos',
                            Types: '&types=casino',
                            ExcludeTypes: ["store"],
                            subCategory: 'Casinos',
                            Keywords: null,
                            markerImage: 'images/attraction-marker/dice-icon.png',
                            isDefault: false,
                            htmlClass: 'attr-casinos'
                        },
                        {
                            rank: 1,
                            name: 'outdoors',
                            attractionText: 'Outdoors',
                            Types: '&types=park|zoo|campground',
                            ExcludeTypes: ["store"],
                            subCategory: 'Outdoors',
                            Keywords: null,
                            markerImage: 'images/attraction-marker/climbing-icon.png',
                            isDefault: true,
                            htmlClass: 'attr-outdoors'
                        },
                        {
                            rank: 3,
                            name: 'shopping',
                            attractionText: 'Shops and Spas',
                            Types: '&types=spa|shopping_mall',
                            ExcludeTypes: null,
                            subCategory: 'Shopping',
                            Keywords: null,
                            markerImage: 'images/attraction-marker/full-icon.png',
                            isDefault: false,
                            htmlClass: 'attr-shops'
                        },
                        {
                            rank: 4,
                            name: 'themeparks',
                            attractionText: 'Theme Parks',
                            Types: '&types=amusement_park',
                            ExcludeTypes: ["store"],
                            subCategory: 'Amusement',
                            Keywords: null,
                            markerImage: 'images/attraction-marker/cruise-icon.png',
                            isDefault: false,
                            htmlClass: 'attr-theme-parks'
                        },
                        {
                            rank: 2,
                            name: 'historical',
                            attractionText: 'History and Culture',
                            Types: '&types=art_gallery|church|mosque|hindu_temple|synagogue|museum',
                            ExcludeTypes: ["store"],
                            subCategory: 'Cultural,Landmarks,Museums',
                            Keywords: null,
                            markerImage: 'images/attraction-marker/bank-icon.png',
                            isDefault: false,
                            htmlClass: 'attr-history'
                        }
        ]
    };
    angular.module('TrippismUIApp').constant('dataConstant', constants);
})();