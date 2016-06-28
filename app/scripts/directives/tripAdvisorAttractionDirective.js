angular.module('TrippismUIApp').directive('tripAdvisorAttractions', ['$rootScope',
                                                '$timeout',
                                                '$filter',
                                                '$sce',
                                                '$modal',
                                                'TripAdvisorAttractionFactory',
                                                'DestinationFactory',
                                                'dataConstant',
                                                'urlConstant',
    function ($rootScope, $timeout, $filter, $sce, $modal, TripAdvisorAttractionFactory, DestinationFactory, dataConstant, urlConstant) {
        return {
            restrict: 'E',
            scope: { googleattractionParams: '=', isOpen: '=' },
            templateUrl: urlConstant.partialViewsPath + 'tripAdvisorAttractionPartial.html',
            controller: function ($scope) {
                $scope.$watch('googleattractionParams', function (newValue, oldValue) {
                    if (newValue != undefined && newValue.DestinationAirport != undefined) {
                        var defaultAttractionTab = _.find(attractionsData, function (item) { return item.isDefault == true; });
                        if (defaultAttractionTab)
                            $scope.loadgoogleattractionInfo(defaultAttractionTab.name);
                    }
                });

                $scope.RenderMap = RenderMap;
                $scope.setAirportMarkerOnMap = setAirportMarkerOnMap;
                $scope.googleattractionsMap = undefined;
                $scope.AttractionMarkers = [];
                $scope.bounds = new google.maps.LatLngBounds();
                $scope.MapLoaded = false;
                var airportMarkerLatLog;    //for storing airport marker's lat/lon
                // get attraction object from factory
                var attractionsData = TripAdvisorAttractionFactory.getAttractionList();
                var markerList = [];
                $scope.$on('ontabClicked', function (event, args) {
                    if ($scope.MapLoaded) {
                        $timeout(function () {
                            $scope.FittoScreen();
                        }, 100, false);
                    }
                    else {
                        var defaultAttractionTab = _.find(attractionsData, function (item) { return item.isDefault == true; });
                        if (defaultAttractionTab)
                            $scope.loadgoogleattractionInfo(defaultAttractionTab.name);
                    }
                });

                $scope.$on('onMarkerPopup', function (event, args) {
                    $scope.attractionPopup(args.place);
                });

                // resize google map and fit all the bounds into viewport
                $scope.FittoScreen = function () {
                    google.maps.event.trigger($scope.googleattractionsMap, 'resize');
                    $scope.googleattractionsMap.fitBounds($scope.bounds);
                }

                var mapStyle = dataConstant.attractionTabMapStyle;
                // setting map option, used into view
                $scope.attractionmapOptions = {
                    center: new google.maps.LatLng(0, 0),
                    zoom: 11,
                    minZoom: 4,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER,
                        style: google.maps.ZoomControlStyle.LARGE
                    },
                    styles: mapStyle,
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
                    google.maps.event.trigger($scope.googleattractionsMap, 'resize');
                }, 1000, false);

                // get attractions from API
                $scope.loadgoogleattractionInfo = function (type) {
                    $scope.attractionsplaces = [];
                    if ($scope.googleattractionParams != undefined) {
                        var data = {
                            Latitude: $scope.googleattractionParams.DestinationAirport.airport_Lat,
                            Longitude: $scope.googleattractionParams.DestinationAirport.airport_Lng,
                            radius: 48300
                        };

                        var markerObj = _(markerList).find(function (item) { return item.type == type });
                        if (markerObj) {
                            RenderMap(markerObj.results, type);
                            return;
                        }

                        if (type == 'hotels') {
                            var key = {
                                Origin: $scope.googleattractionParams.SearchCriteria.Origin,
                                Destination: $scope.googleattractionParams.SearchCriteria.DestinationLocation,
                                StartDate: ConvertToRequiredDate($scope.googleattractionParams.SearchCriteria.FromDate, 'API'),
                                EndDate: ConvertToRequiredDate($scope.googleattractionParams.SearchCriteria.ToDate, 'API'),
                            };
                            var object;
                            var cacheData = DestinationFactory.DestinationDataStorage.hotel.get(key);
                            if (cacheData) {
                                object = _.chain(cacheData.data).map(function (item) {
                                    var itemData = item.HotelDetail;
                                    var rating = itemData.HotelRating ? itemData.HotelRating[0].RatingText.substring(0, 1) : 0;
                                    return {
                                        geometry:
                                           itemData.Latitude ? {
                                               location: { lat: itemData.Latitude, lng: itemData.Longitude }
                                           } : null,
                                        name: itemData.HotelName.toLowerCase(),
                                        vicinity: (itemData.Address[0] + ', ' + itemData.Address[1]).toLowerCase(),
                                        rating: rating,
                                        type: 'hotels',
                                        details: { FreeWifiInRooms: itemData.PropertyOptionInfo.FreeWifiInRooms, RateRange: itemData.RateRange, Rating: rating }
                                    }
                                }).compact().sortBy(function (item) { return item.details.RateRange ? parseFloat(item.details.RateRange.Min) : Infinity; }).value();
                                if (object && object.length)
                                    markerList.push({ results: object, type: type });
                            }

                            RenderMap(object, type);
                            $scope.MapLoaded = true;
                            $scope.attractionsplaces = { type: type, next_page_token: null, results: object && object.length > 0 ? object : null };
                            return;
                        }

                        var attractionDetail = _.find(attractionsData, function (item) { return type === item.name; });
                        if (attractionDetail) {
                            // setting parameters for requested attraction                            
                            var isSetCenter = attractionDetail.isDefault;

                            // setting map option, used into view
                            $scope.attractionmapOptions = {
                                center: new google.maps.LatLng($scope.googleattractionParams.DestinationAirport.airport_Lat, $scope.googleattractionParams.DestinationAirport.airport_Lng),
                                zoom: 12,
                                minZoom: 4,
                                backgroundColor: "#BCCFDE",
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            $scope.attractionMessage = 'Getting things to do in ' + $scope.googleattractionParams.DestinationAirport.airport_CityName;
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
                                    data.Attractions = _.map(data.Attractions, function (i) {
                                        return {
                                            geometry: { location: { lat: i.Latitude, lng: i.Longitude } },
                                            id: i.Ranking ? i.Ranking.GeoLocationId : null,
                                            place_id: i.Ranking ? i.Ranking.GeoLocationId : null,
                                            name: i.Name,
                                            rating: i.Rating,
                                            vicinity: i.Address.Street1,
                                            locationId: i.LocationId,
                                            provider: 'TripAdvisor'
                                        }
                                    });

                                    //var test = _.find(data.Attractions, function (i) { return i.name == 'Black Dog'; });
                                    //if (test) {
                                    //    var request = {
                                    //        Latitude: test.geometry.location.lat,
                                    //        Longitude: test.geometry.location.lng,
                                    //        Name: test.name,
                                    //        LocationId: test.locationId
                                    //    };
                                    //    TripAdvisorAttractionFactory.getLocation(request).then(function (data) {                                            
                                    //    });
                                    //}
                                    markerList.push({ results: data.Attractions, type: type });
                                }
                                RenderMap(data.Attractions, type);
                                $scope.MapLoaded = true;
                                $scope.attractionsplaces = { type: type, results: data.Attractions };
                            });
                        }
                    }
                };

                // set airport marker on map
                function setAirportMarkerOnMap() {
                    airportMarkerLatLog = new google.maps.LatLng($scope.googleattractionParams.DestinationAirport.airport_Lat, $scope.googleattractionParams.DestinationAirport.airport_Lng);
                    var marker = new MarkerWithLabel({
                        position: airportMarkerLatLog,
                        map: $scope.googleattractionsMap,
                        title: $scope.googleattractionParams.DestinationAirport.airport_FullName,
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
                function RenderMap(maps, type) {
                    $scope.AttractionMarkers.forEach(function (marker) {
                        marker.setMap(null);
                    });
                    if (maps != undefined && maps.length > 0) {
                        //  $scope.InfoWindow;
                        selected = maps;

                        $scope.bounds = new google.maps.LatLngBounds();
                        if (airportMarkerLatLog)
                            $scope.bounds.extend(airportMarkerLatLog);

                        $scope.AttractionMarkers = [];
                        // used for clearing all markers                        
                        for (var x = 0; x < maps.length; x++) {
                            var map = maps[x];
                            if (map.geometry) {
                                var iconlatlng = new google.maps.LatLng(map.geometry.location.lat, map.geometry.location.lng);
                                var marker = new MarkerWithLabel({
                                    position: iconlatlng,
                                    map: $scope.googleattractionsMap,
                                    title: type == "hotels" ? (map.name).toUpperCase() : map.name,
                                    labelAnchor: new google.maps.Point(12, 35),
                                    labelInBackground: false,
                                    visible: true,
                                    animation: google.maps.Animation.DROP,
                                    CustomMarkerInfo: map,
                                    labelStyle: { opacity: 0.75 },
                                    icon: getMarker(type)
                                });

                                $scope.bounds.extend(marker.position);
                                var contentString = "";
                                var MapDet = map;
                                google.maps.event.addListener(marker, 'click', (function (MapDet) {
                                    return function () {
                                        $scope.attractionPopup(MapDet);
                                    };
                                })(MapDet));
                                $scope.AttractionMarkers.push(marker);
                            }
                        }
                    }
                    $timeout(function () { $scope.FittoScreen(); }, 1000, false);
                };

                function getMarker(type) {
                    var attraction = _.find(attractionsData, function (item) { return item.name == type; });
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
