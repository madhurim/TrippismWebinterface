angular.module('TrippismUIApp').directive('googleattractionInfo',
                                            ['$rootScope',
                                                'GoogleAttractionFactory',
                                                '$timeout',
                                                '$filter',
                                                'dataConstant',
                                                'DestinationFactory',
                                                '$modal',
                                                'urlConstant',
                                                '$rootScope',
                                                'UtilFactory',
function ($rootScope, GoogleAttractionFactory, $timeout, $filter, dataConstant, DestinationFactory, $modal, urlConstant, $rootScope,UtilFactory) {
    return {
        restrict: 'E',
        scope: { googleattractionParams: '=', isOpen: '=' },
        templateUrl: urlConstant.partialViewsPath + 'googleAttractionPartial.html',
        controller: function ($scope) {
            $scope.$watch('googleattractionParams', function (newValue, oldValue) {
                if (newValue != undefined && newValue.DestinationAirport != undefined) {
                    var defaultAttractionTab = _.find(attractionsData, function (item) { return item.isDefault == true; });
                    if (defaultAttractionTab)
                        $scope.loadgoogleattractionInfo(defaultAttractionTab.name);
                }
            });
            $scope.amountBifurcation = function (value) { return UtilFactory.amountBifurcation(value); };

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
                        if (markerObj.type == 'hotels')
                        {
                            _.each(markerObj.results, function (item) {
                                if (item.details.RateRange != undefined) {
                                    item.details.RateRange.Min = $scope.amountBifurcation((item.details.RateRange.OriginalMin * $rootScope.currencyInfo.rate).toFixed(2));
                                    item.details.RateRange.Max = $scope.amountBifurcation((item.details.RateRange.OriginalMax * $rootScope.currencyInfo.rate).toFixed(2));
                                    item.details.RateRange.CurrencyCode = $rootScope.currencyInfo.currencyCode;
                                }
                            });
                        }
                        RenderMap(markerObj.results, type);
                        return;
                    }

                    if (type == 'hotels') {
                        var key = {
                            Origin: $scope.googleattractionParams.SearchCriteria.Origin,
                            Destination: $scope.googleattractionParams.SearchCriteria.DestinationLocation,
                            DepartureDate: ConvertToRequiredDate($scope.googleattractionParams.SearchCriteria.FromDate, 'API'),
                            ReturnDate: ConvertToRequiredDate($scope.googleattractionParams.SearchCriteria.ToDate, 'API'),
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
                                    details: { FreeWifiInRooms: itemData.PropertyOptionInfo.FreeWifiInRooms, RateRange: hotelrangeRate(itemData.RateRange), Rating: rating }
                                }
                            }).compact().sortBy(function (item) { return item.details.RateRange ? parseFloat(item.details.RateRange.Min.BeforeDecimal) : Infinity; }).value();
                            if (object && object.length)
                                markerList.push({ results: object, type: type });
                        }

                        RenderMap(object, type);
                        $scope.MapLoaded = true;
                        $scope.attractionsplaces = { type: type, next_page_token: null, results: object && object.length > 0 ? object : null };
                        return;
                    }
                    function hotelrangeRate(rateRange)
                    {
                        if(rateRange)
                        {
                           return{
                               CurrencyCode: $rootScope.currencyInfo.currencyCode,
                               Min: $scope.amountBifurcation((rateRange.Min * $rootScope.currencyInfo.rate).toFixed(2)),
                               Max: $scope.amountBifurcation((rateRange.Max * $rootScope.currencyInfo.rate).toFixed(2)),
                               OriginalMin: rateRange.Min,
                               OriginalMax: rateRange.Max,
                            }
                        }
                    }

                    var attractionDetail = _.find(attractionsData, function (item) { return type === item.name; });
                    if (attractionDetail) {
                        // setting parameters for requested attraction 
                        data.Types = attractionDetail.Types;
                        data.ExcludeTypes = attractionDetail.ExcludeTypes;
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

            // set airport marker on map
            function setAirportMarkerOnMap() {
                createMapLabelControl();
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
                        if (maps[x].geometry) {
                            var iconlatlng = new google.maps.LatLng(maps[x].geometry.location.lat, maps[x].geometry.location.lng);
                            var marker = new MarkerWithLabel({
                                position: iconlatlng,
                                map: $scope.googleattractionsMap,
                                title: type == "hotels" ? (maps[x].name).toUpperCase() : maps[x].name,
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
                                    $scope.attractionPopup(MapDet);
                                };
                            })(MapDet));
                            $scope.AttractionMarkers.push(marker);
                        }
                    }
                }
                $timeout(function () { $scope.FittoScreen(); }, 1000, false);
            };

            // bind label control to map on right-top of map.
            function createMapLabelControl() {
                if ($scope.googleattractionsMap) {
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
                    $scope.googleattractionsMap.controls[google.maps.ControlPosition.TOP_RIGHT].push(label);
                }
            }

            function getMarker(type) {
                var attraction = _.find(attractionsData, function (item) { return item.name == type; });
                if (attraction)
                    return attraction.markerImage;
            }
        },
        link: function ($scope, elem, attr) {
            $scope.attractionPopup = function (attractionData) {
                var attractionPopupInstance = $modal.open({
                    templateUrl: 'views/partials/attractionPopupPartial.html',
                    controller: 'AttractionPopupController',
                    scope: $scope,
                    size: 'lg',
                    resolve: {
                        attractionData: function () { return attractionData; }
                    }
                });
            };
            $scope.$on('setExchangeRate', function (event, args) {
                $scope.loadgoogleattractionInfo("hotels");
            });
            
        }
    }
}]);
