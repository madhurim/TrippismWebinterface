(function () {
    angular.module('TrippismUIApp').directive('googleAttractions', ['$rootScope',
                                                'GoogleAttractionFactory',
                                                '$timeout',
                                                '$filter',
                                                'dataConstant',
                                                'DestinationFactory',
                                                '$modal',
                                                'urlConstant',
function ($rootScope, GoogleAttractionFactory, $timeout, $filter, dataConstant, DestinationFactory, $modal, urlConstant) {
    return {
        restrict: 'E',
        scope: { googleAttractionParams: '=' },
        templateUrl: urlConstant.partialViewsPath + 'googleAttractionPartial.html',
        controller: function ($scope) {
            $scope.$watch('googleAttractionParams', function (newValue, oldValue) {
                if (newValue != undefined && newValue.DestinationAirport != undefined) {
                    var hotelData = getHotelData();
                    if (hotelData) {
                        $scope.$broadcast('HotelData');
                        setAirportMarkerOnMap();
                    }
                    else {
                        var defaultAttractionTab = _.find($scope.attractionsData, function (item) { return item.isDefault == true; });
                        if (defaultAttractionTab)
                            $scope.loadAttractionInfo(defaultAttractionTab.name);
                    }
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
            $scope.attractionsData = GoogleAttractionFactory.getAttractionList();
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
            }, 0, false);

            // get attractions from API
            $scope.loadAttractionInfo = function (type) {
                $scope.attractionsplaces = [];
                if ($scope.googleAttractionParams != undefined) {
                    var data = {
                        Latitude: $scope.googleAttractionParams.DestinationAirport.airport_Lat,
                        Longitude: $scope.googleAttractionParams.DestinationAirport.airport_Lng,
                        radius: 48300
                    };

                    var markerObj = _(markerList).find(function (item) { return item.type == type });
                    if (markerObj) {
                        renderMap(markerObj.results, type);
                        return;
                    }

                    if (type == 'hotels') {
                        var hotelData = getHotelData();
                        hotelData = filterHotelData(hotelData);
                        if (hotelData && hotelData.length)
                            markerList.push({ results: hotelData, type: type });

                        renderMap(hotelData, type);
                        $scope.mapLoaded = true;
                        $scope.attractionsplaces = { type: type, next_page_token: null, results: hotelData && hotelData.length > 0 ? hotelData : null };
                        return;
                    }

                    var attractionDetail = _.find($scope.attractionsData, function (item) { return type === item.name; });
                    if (attractionDetail) {
                        // setting parameters for requested attraction 
                        data.Types = attractionDetail.Types;
                        data.ExcludeTypes = attractionDetail.ExcludeTypes;
                        var isSetCenter = attractionDetail.isDefault;

                        // setting map option, used into view
                        $scope.attractionMapOptions = {
                            center: new google.maps.LatLng($scope.googleAttractionParams.DestinationAirport.airport_Lat, $scope.googleAttractionParams.DestinationAirport.airport_Lng),
                            zoom: 12,
                            minZoom: 4,
                            backgroundColor: "#BCCFDE",
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };
                        $scope.attractionMessage = 'Getting things to do in ' + $scope.googleAttractionParams.DestinationAirport.airport_CityName;
                        $scope.googleAttractionPromise = GoogleAttractionFactory.googleAttraction(data).then(function (data) {
                            // set airport marker only first time.
                            if (isSetCenter)
                                setAirportMarkerOnMap();

                            if (data.status == 404) {
                                return;
                            }
                            if (data.results && data.results.length > 0)
                                markerList.push({ results: data.results, type: type });
                            renderMap(data.results, type);
                            $scope.mapLoaded = true;
                            $scope.attractionsplaces = { type: type, next_page_token: data.next_page_token, results: data.results };
                        });
                    }
                }
            };

            // used to load more attractions from next_page_token
            $scope.loadMoreGoogleAttractionInfo = function () {
                if ($scope.googleAttractionParams != undefined && $scope.attractionsplaces.next_page_token) {
                    var data = {
                        "NextPageToken": $scope.attractionsplaces.next_page_token
                    };
                    $scope.googleAttractionPromise = GoogleAttractionFactory.googleAttraction(data).then(function (data) {
                        setAirportMarkerOnMap();
                        if (data.status != 404) {
                            $scope.attractionsplaces = { next_page_token: data.next_page_token, results: data.results };
                            renderMap(data.results, type);
                        }
                    });
                }
            };

            // set airport marker on map
            function setAirportMarkerOnMap() {
                createMapLabelControl();
                airportMarkerLatLog = new google.maps.LatLng($scope.googleAttractionParams.DestinationAirport.airport_Lat, $scope.googleAttractionParams.DestinationAirport.airport_Lng);
                var marker = new MarkerWithLabel({
                    position: airportMarkerLatLog,
                    map: $scope.attractionsMap,
                    title: $scope.googleAttractionParams.DestinationAirport.airport_FullName,
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

            // bind label control to map on right-top of map.
            function createMapLabelControl() {
                if ($scope.attractionsMap) {
                    var label = document.createElement("Label");
                    label.innerHTML = "Points of interest in 30 miles radius of Airport";
                    label.style.fontSize = '11px';
                    label.style.color = "rgb(68, 68, 68)";
                    label.style.whiteSpace = "nowrap";
                    label.style.fontFamily = "Roboto, Arial, sans-serif";
                    label.style.textAlign = "right";
                    label.style.backgroundColor = "#fbf7ee";
                    label.style.padding = "3px 5px";
                    label.style.opacity = "0.8";
                    label.style.zIndex = "1";
                    $scope.attractionsMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(label);
                }
            }

            function getMarker(type) {
                var attraction = _.find($scope.attractionsData, function (item) { return item.name == type; });
                if (attraction)
                    return attraction.markerImage;
            }

            function getHotelData() {
                var key = {
                    Origin: $scope.googleAttractionParams.SearchCriteria.Origin,
                    Destination: $scope.googleAttractionParams.SearchCriteria.DestinationLocation,
                    StartDate: ConvertToRequiredDate($scope.googleAttractionParams.SearchCriteria.FromDate, 'API'),
                    EndDate: ConvertToRequiredDate($scope.googleAttractionParams.SearchCriteria.ToDate, 'API'),
                };
                return DestinationFactory.DestinationDataStorage.hotel.get(key);
            }

            function filterHotelData(cacheData) {
                var object;
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
                }
                return object;
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
})();
