angular.module('TrippismUIApp').directive('googleattractionInfo',
                                            ['$rootScope',
                                                'GoogleAttractionFactory',
                                                '$timeout',
                                                '$filter',
                                                '$sce',
                                                'TrippismConstants',
    function ($rootScope, GoogleAttractionFactory, $timeout, $filter, $sce, TrippismConstants) {
        return {
            restrict: 'E',
            scope: { googleattractionParams: '=', isOpen: '=' },
            templateUrl: '/Views/Partials/GoogleAttractionPartial.html',
            controller: function ($scope) {
                $scope.$watch('googleattractionParams', function (newValue, oldValue) {
                    if (newValue != undefined && newValue.DestinationairportName != undefined) {
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
                var attractionsData = GoogleAttractionFactory.getAttractionList();
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
                    SetMarkerSlider(args.place)
                });

                function SetMarkerSlider(MapDet) {
                    $scope.slides = [];
                    $scope.IsMarkerSelected = false;
                    $scope.IsMapPopupLoading = true;
                    $scope.PhoneNo = "";
                    $scope.raitingToAppend = "";
                    $scope.PlaceName = "";
                    $scope.Placeaddress = "";
                    $scope.attractionReviews = [];
                    var service = new google.maps.places.PlacesService($scope.googleattractionsMap);
                    var request = { placeId: MapDet.place_id };
                    $scope.SelectedPlaceId = MapDet.place_id;
                    service.getDetails(request, function (place, status) {
                        $scope.IsMapPopupLoading = false;
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            // Multi photo
                            if (place.photos != null && place.photos.length > 0) {
                                var photos = [];
                                for (var photoidx = 0; photoidx < place.photos.length; photoidx++) {
                                    var Imgsrc = place.photos[photoidx].getUrl({ 'maxWidth': 570, 'maxHeight': 400 });
                                    var objtopush = { image: Imgsrc, text: "" };
                                    photos.push(objtopush);
                                }
                                $scope.addSlides(photos);
                            }
                            $scope.PlaceName = place.name;
                            $scope.Placeaddress = $sce.trustAsHtml(place.adr_address);
                            if (place.formatted_phone_number != undefined)
                                $scope.PhoneNo = place.formatted_phone_number;

                            $scope.raitingToAppend = "";
                            if (place.rating != undefined)
                                $scope.raitingToAppend = $sce.trustAsHtml(getRatings(place.rating));

                            $scope.IsMapPopupLoading = false;
                            if (place.reviews != null && place.reviews.length > 0) {
                                for (var i = 0; i < place.reviews.length; i++) {
                                    if (place.reviews[i].text.length > 0) {
                                        // commented because currently we are not displaying aspects into reviews
                                        //var rating = [];
                                        //for (var x = 0; x < place.reviews[i].aspects.length; x++) {
                                        //    var item = place.reviews[i].aspects[x];
                                        //    item.rating = $sce.trustAsHtml(getRatings(item.rating));
                                        //    rating.push(item);
                                        //}
                                        //$scope.attractionReviews.push({
                                        //    author_name: place.reviews[i].author_name, text: place.reviews[i].text,
                                        //    rating: $sce.trustAsHtml(getRatings(place.reviews[i].rating)), aspects: place.reviews[i].aspects, time: place.reviews[i].time
                                        //});

                                        $scope.attractionReviews.push({
                                            author_name: place.reviews[i].author_name, text: place.reviews[i].text,
                                            rating: $sce.trustAsHtml(getRatings(place.reviews[i].rating)), time: place.reviews[i].time
                                        });
                                    }
                                }
                            }
                            $scope.$apply();
                        }
                    });

                    var mapheight = $('#gMapId_').height() - 400;
                    var mapWidth = $('#gMapId_').width() - 600;

                    $("#googleMapId_").css('top', '-25px');
                    $("#googleMapId_").css('left', mapWidth / 2);

                    $scope.IsMarkerSelected = true;

                }

                // resize google map and fit all the bounds into viewport
                $scope.FittoScreen = function () {
                    google.maps.event.trigger($scope.googleattractionsMap, 'resize');
                    $scope.googleattractionsMap.fitBounds($scope.bounds);
                }

                var mapStyle = TrippismConstants.attractionTabMapStyle;
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
                            "Latitude": $scope.googleattractionParams.DestinationairportName.airport_Lat,
                            "Longitude": $scope.googleattractionParams.DestinationairportName.airport_Lng
                        };

                        var markerObj = _(markerList).find(function (item) { return item.type == type });
                        if (markerObj) {
                            RenderMap(markerObj.results, type);
                            return;
                        }
                        var attractionDetail = _.find(attractionsData, function (item) { return type === item.name; });
                        if (attractionDetail) {
                            // setting parameters for requested attraction 
                            data.Types = attractionDetail.Types;
                            data.ExcludeTypes = attractionDetail.ExcludeTypes;
                            var isSetCenter = attractionDetail.isDefault;

                            // setting map option, used into view
                            $scope.attractionmapOptions = {
                                center: new google.maps.LatLng($scope.googleattractionParams.DestinationairportName.airport_Lat, $scope.googleattractionParams.DestinationairportName.airport_Lng),
                                zoom: 12,
                                minZoom: 4,
                                backgroundColor: "#BCCFDE",
                                mapTypeId: google.maps.MapTypeId.ROADMAP
                            };
                            $scope.googleattractionpromise = GoogleAttractionFactory.googleAttraction(data).then(function (data) {
                                // set airport marker only first time.
                                if (isSetCenter)
                                    setAirportMarkerOnMap();

                                if (data.status == 404) {
                                    return;
                                }
                                if (data.results && data.results.length > 0)
                                    markerList.push({ results: data.results, type: type });
                                RenderMap(data.results, type);
                                $scope.MapLoaded = true;
                                $scope.attractionsplaces = { type: type, next_page_token: data.next_page_token, results: data.results };
                            });
                        }
                    }
                };

                // used to load more attractions from next_page_token
                $scope.loadMoreGoogleAttractionInfo = function () {
                    if ($scope.googleattractionParams != undefined && $scope.attractionsplaces.next_page_token) {
                        var data = {
                            "NextPageToken": $scope.attractionsplaces.next_page_token
                        };
                        $scope.googleattractionpromise = GoogleAttractionFactory.googleAttraction(data).then(function (data) {
                            setAirportMarkerOnMap();
                            if (data.status != 404) {
                                $scope.attractionsplaces = { next_page_token: data.next_page_token, results: data.results };
                                RenderMap(data.results, type);
                            }
                        });
                    }
                };

                $scope.cancel = function () {
                    $scope.IsMarkerSelected = false;
                };

                function getRatings(num) {
                    var MaxRating = 5;
                    var stars = [];
                    for (var i = 0; i < MaxRating; i++) {
                        stars.push({});
                    }
                    var filledInStarsContainerWidth = num / MaxRating * 86.3; //% changed from 100 to 86.3 because of star fill problem

                    var ratingDiv = "<div class='average-rating-container' title='" + num + "'>";
                    if (stars.length > 0) {

                        ratingDiv += "<ul class='rating background' class='readonly'>";

                        for (var starIdx = 0; starIdx < stars.length; starIdx++)
                            ratingDiv += "<li class='star'><i class='fa fa-star'></i></li>";

                        ratingDiv += "</ul>";
                        ratingDiv += "<ul class='rating foreground readonly'  style='width:" + filledInStarsContainerWidth + "%'>";

                        for (var starIdx = 0; starIdx < stars.length; starIdx++)
                            ratingDiv += "<li class='star filled'><i class='fa fa-star'></i></li>";
                    }
                    ratingDiv += "  </ul></div>";
                    return ratingDiv;
                }

                $scope.IsMapPopupLoading = false;

                var slides = [];
                $scope.slides = [];

                $scope.addSlides = function (photos) {
                    for (var photoidex = 0; photoidex < photos.length; photoidex++)
                        $scope.slides.push(photos[photoidex]);
                    $scope.$apply();
                };
                $scope.SelectedPlaceId = "";

                // set airport marker on map
                function setAirportMarkerOnMap() {
                    createMapLabelControl();
                    airportMarkerLatLog = new google.maps.LatLng($scope.googleattractionParams.DestinationairportName.airport_Lat, $scope.googleattractionParams.DestinationairportName.airport_Lng);
                    var marker = new MarkerWithLabel({
                        position: airportMarkerLatLog,
                        map: $scope.googleattractionsMap,
                        title: $scope.googleattractionParams.DestinationairportName.airport_FullName,
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
                            var iconlatlng = new google.maps.LatLng(maps[x].geometry.location.lat, maps[x].geometry.location.lng);
                            var marker = new MarkerWithLabel({
                                position: iconlatlng,
                                map: $scope.googleattractionsMap,
                                title: '' + maps[x].name + '',
                                labelAnchor: new google.maps.Point(12, 35),
                                labelInBackground: false,
                                visible: true,
                                animation: google.maps.Animation.DROP,
                                CustomMarkerInfo: maps[x],
                                labelStyle: { opacity: 0.75 },
                                icon: getMarker(type)
                            });

                            $scope.bounds.extend(marker.position);
                            var contentString = "";
                            var MapDet = maps[x];
                            google.maps.event.addListener(marker, 'click', (function (MapDet) {
                                return function () {
                                    SetMarkerSlider(MapDet);
                                };
                            })(MapDet));
                            $scope.AttractionMarkers.push(marker);
                        }
                    }
                    $timeout(function () { $scope.FittoScreen(); }, 1000, false);
                };

                // bind label control to map on right-top of map.
                function createMapLabelControl() {
                    if ($scope.googleattractionsMap) {
                        var label = document.createElement("Label");
                        label.innerHTML = "Points of interest in 30 miles radius of Airport";
                        label.style.fontSize = '10px';
                        label.style.color = "rgb(68, 68, 68)";
                        label.style.whiteSpace = "nowrap";
                        label.style.fontFamily = "Roboto, Arial, sans-serif";
                        label.style.textAlign = "right";
                        label.style.backgroundColor = "#fbf7ee";
                        label.style.padding = "3px 5px";
                        label.style.opacity = "0.8";
                        label.style.zIndex = "1";
                        $scope.googleattractionsMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(label);
                    }
                }

                function getMarker(type) {
                    var attraction = _.find(attractionsData, function (item) { return item.name == type; });
                    if (attraction)
                        return attraction.markerImage;
                }
            }
        }
    }]);
