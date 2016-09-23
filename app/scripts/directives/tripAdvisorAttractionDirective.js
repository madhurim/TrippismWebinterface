angular.module('TrippismUIApp').directive('tripAdvisorAttractions', ['$rootScope',
                                                '$timeout',
                                                '$modal',
                                                'TripAdvisorAttractionFactory',
                                                'DestinationFactory',
                                                'dataConstant',
                                                'urlConstant',
    function ($rootScope, $timeout, $modal, TripAdvisorAttractionFactory, DestinationFactory, dataConstant, urlConstant) {
        return {
            restrict: 'E',
            scope: { attractionParams: '=' },
            templateUrl: urlConstant.partialViewsPath + 'tripAdvisorAttractionPartial.html',
            controller: function ($scope) {
                $scope.$watch('attractionParams', function (newValue, oldValue) {
                    if (newValue != undefined && newValue.DestinationAirport != undefined) {
                        var defaultAttractionTab = _.find($scope.attractionsData, function (item) { return item.isDefault == true; });
                        if (defaultAttractionTab)
                            $scope.loadAttractionInfo(defaultAttractionTab.name);
                    }
                });

                $scope.renderMap = renderMap;
                $scope.setAirportMarkerOnMap = setAirportMarkerOnMap;
                $scope.attractionsMap = undefined;
                $scope.attractionMarkers = [];
                $scope.bounds = new google.maps.LatLngBounds();
                $scope.mapLoaded = false;
                var airportMarkerLatLog;    //for storing airport marker's lat/lon
                // get attraction object from factory
                $scope.attractionsData = TripAdvisorAttractionFactory.getAttractionList();
                var markerList = [];

                $scope.$on('onMarkerPopup', function (event, args) {
                    $scope.attractionPopup(args.place);
                });

                // resize google map and fit all the bounds into viewport
                $scope.fitToScreen = function () {
                    google.maps.event.trigger($scope.attractionsMap, 'resize');
                    $scope.attractionsMap.fitBounds($scope.bounds);
                }

                // setting map option, used into view
                $scope.attractionMapOptions = {
                    center: new google.maps.LatLng(0, 0),
                    zoom: 11,
                    minZoom: 4,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER,
                        style: google.maps.ZoomControlStyle.LARGE
                    },
                    styles: dataConstant.attractionTabMapStyle,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                if ($rootScope.mapHeight == undefined) {
                    $rootScope.mapHeight = $(window).height() - 350;
                    $(".map-canvas").css("height", $rootScope.mapHeight + 'px');
                } else {
                    $('.map-canvas').each(function (i, obj) {
                        $(this).css('height', $rootScope.mapHeight);
                    });
                }

                $timeout(function () {
                    google.maps.event.trigger($scope.attractionsMap, 'resize');
                }, 1000, false);

                // get attractions from API
                $scope.loadAttractionInfo = function (type) {
                    $scope.attractionsplaces = [];
                    if ($scope.attractionParams != undefined) {
                        var data = {
                            Latitude: $scope.attractionParams.DestinationAirport.airport_Lat,
                            Longitude: $scope.attractionParams.DestinationAirport.airport_Lng,
                            radius: 48300
                        };

                        var markerObj = _(markerList).find(function (item) { return item.type == type });
                        if (markerObj) {
                            renderMap(markerObj.results, type);
                            return;
                        }

                        var attractionDetail = _.find($scope.attractionsData, function (item) { return type === item.name; });
                        if (attractionDetail) {
                            // setting parameters for requested attraction                            
                            var isSetCenter = attractionDetail.isDefault;

                            // setting map option, used into view
                            $scope.attractionMapOptions = {
                                center: new google.maps.LatLng($scope.attractionParams.DestinationAirport.airport_Lat, $scope.attractionParams.DestinationAirport.airport_Lng),
                                zoom: 12,
                                minZoom: 4,
                                backgroundColor: "#BCCFDE",
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            $scope.attractionMessage = 'Getting things to do in ' + $scope.attractionParams.DestinationAirport.airport_CityName;
                            if (type == 'Restaurants') {
                                $scope.googleAttractionPromise = TripAdvisorAttractionFactory.getRestaurants(data);
                            }
                            else {
                                data.subCategory = attractionDetail.subCategory;
                                $scope.googleAttractionPromise = TripAdvisorAttractionFactory.getAttractions(data);
                            }

                            $scope.googleAttractionPromise.then(function (data) {

                                // set airport marker only first time.
                                if (isSetCenter)
                                    setAirportMarkerOnMap();

                                if (data && data.Attractions && data.Attractions.length > 0) {
                                    data.Attractions = _.chain(data.Attractions).map(function (i) {
                                        return {
                                            geometry: { location: { lat: i.Latitude, lng: i.Longitude } },
                                            id: i.Ranking ? i.Ranking.GeoLocationId : null,
                                            place_id: i.Ranking ? i.Ranking.GeoLocationId : null,
                                            name: i.Name,
                                            rating: i.Rating,
                                            vicinity: i.Address.Street1 + ', ' + i.Address.City,
                                            locationId: i.LocationId,
                                            provider: dataConstant.attractionProviders.TripAdvisor,
                                            ratingImage: i.RatingImageUrl,
                                            NumReviews: i.NumReviews,
                                            WebUrl: i.WebUrl
                                        };
                                    }).sortBy(function (i) { return parseFloat(i.rating) * -1; }).value();

                                    markerList.push({ results: data.Attractions, type: type });
                                }
                                renderMap(data.Attractions, type);
                                $scope.mapLoaded = true;
                                $scope.attractionsplaces = { type: type, results: data.Attractions };
                            });
                        }
                    }
                };

                // set airport marker on map
                function setAirportMarkerOnMap() {
                    airportMarkerLatLog = new google.maps.LatLng($scope.attractionParams.DestinationAirport.airport_Lat, $scope.attractionParams.DestinationAirport.airport_Lng);
                    var marker = new MarkerWithLabel({
                        position: airportMarkerLatLog,
                        map: $scope.attractionsMap,
                        title: $scope.attractionParams.DestinationAirport.airport_FullName,
                        labelAnchor: new google.maps.Point(12, 35),
                        labelInBackground: false,
                        visible: true,
                        animation: google.maps.Animation.DROP,
                        labelStyle: { opacity: 0.75 },
                        icon: 'images/attraction-marker/airport-marker.png'
                    });

                    $scope.bounds.extend(airportMarkerLatLog);
                }
                // set markers
                function renderMap(maps, type) {
                    $scope.attractionMarkers.forEach(function (marker) {
                        marker.setMap(null);
                    });
                    if (maps != undefined && maps.length > 0) {
                        //  $scope.InfoWindow;
                        selected = maps;

                        $scope.bounds = new google.maps.LatLngBounds();
                        if (airportMarkerLatLog)
                            $scope.bounds.extend(airportMarkerLatLog);

                        $scope.attractionMarkers = [];
                        // used for clearing all markers                        
                        for (var x = 0; x < maps.length; x++) {
                            var map = maps[x];
                            if (map.geometry) {
                                var iconlatlng = new google.maps.LatLng(map.geometry.location.lat, map.geometry.location.lng);
                                var marker = new MarkerWithLabel({
                                    position: iconlatlng,
                                    map: $scope.attractionsMap,
                                    title: map.name,
                                    labelAnchor: new google.maps.Point(12, 35),
                                    labelInBackground: false,
                                    visible: true,
                                    animation: google.maps.Animation.DROP,
                                    CustomMarkerInfo: map,
                                    labelStyle: { opacity: 0.75 },
                                    icon: getMarker(type)
                                });

                                $scope.bounds.extend(marker.position);
                                google.maps.event.addListener(marker, 'click', (function (map) {
                                    return function () {
                                        $scope.attractionPopup(map);
                                    };
                                })(map));
                                $scope.attractionMarkers.push(marker);
                            }
                        }
                    }
                    $timeout(function () {
                        $scope.fitToScreen();
                        if ($scope.attractionMarkers.length == 0)
                            $scope.attractionsMap.setZoom(10);
                    }, 1000, false);
                };

                function getMarker(type) {
                    var attraction = _.find($scope.attractionsData, function (item) { return item.name == type; });
                    if (attraction)
                        return attraction.markerImage;
                }
            },
            link: function ($scope, elem, attr) {
                $scope.attractionPopup = function (attractionData) {
                    var attractionPopupInstance = $modal.open({
                        templateUrl: urlConstant.partialViewsPath + 'attractionPopupPartial.html',
                        controller: 'AttractionPopupController',
                        scope: $scope,
                        size: 'lg',
                        resolve: {
                            attractionData: function () { return attractionData; }
                        }
                    });
                };
            }
        }
    }]);