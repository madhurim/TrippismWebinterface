(function () {
    'use strict';
    angular.module('TrippismUIApp')
      .directive('googleMap', ['$timeout', '$rootScope', '$window', 'UtilFactory', 'urlConstant', googleMap]);

    function googleMap($timeout, $rootScope, $window, UtilFactory, urlConstant) {
        return {
            templateUrl: urlConstant.viewsPath + 'GoogleMap.html',
            scope: {},
            controller: ['$scope', '$q', '$compile', '$location', 'dataConstant', '$stateParams', function ($scope, $q, $compile, $location, dataConstant, $stateParams) {
                $scope.destinationMap = undefined;
                $scope.destinationMarkers = [];
                $scope.airportList = [];
                var highRankedMarkers;
                $scope.origin = getParam("f");
                var isCardClicked = false;  // isCardClicked for preventing 'idle' event when destination card is click and we highlight clicked destination on map                

                // setting marker icon properties
                var markerImageObj = {
                    marker: {
                        size: new google.maps.Size(21, 21),
                        origin: new google.maps.Point(0, 0),
                        anchorBig: new google.maps.Point(10, 10),
                        scaledSizeBig: new google.maps.Size(20, 20),
                        anchorSmall: new google.maps.Point(7, 7),
                        scaledSizeSmall: new google.maps.Size(14, 14),
                    }
                };
                UtilFactory.ReadAirportJson().then(function (data) {
                    $scope.airportList = data;
                });
                markerImageObj.big = new google.maps.MarkerImage("/images/big-point.png", markerImageObj.marker.size, markerImageObj.marker.origin, markerImageObj.marker.anchorBig, markerImageObj.marker.scaledSizeBig);
                markerImageObj.bigOver = new google.maps.MarkerImage("/images/big-point-over.png", markerImageObj.marker.size, markerImageObj.marker.origin, markerImageObj.marker.anchorBig, markerImageObj.marker.scaledSizeBig);
                markerImageObj.bigOverSelect = new google.maps.MarkerImage("/images/big-point-over-select.png", markerImageObj.marker.size, markerImageObj.marker.origin, markerImageObj.marker.anchorBig, markerImageObj.marker.scaledSizeBig);
                markerImageObj.small = new google.maps.MarkerImage("/images/big-point.png", markerImageObj.marker.size, markerImageObj.marker.origin, markerImageObj.marker.anchorSmall, markerImageObj.marker.scaledSizeSmall);

                //sets the map options
                $scope.mapOptions = {
                    zoom: 4,
                    minZoom: 3,
                    maxZoom: 7,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER,
                        style: google.maps.ZoomControlStyle.LARGE
                    },
                    backgroundColor: "#BCCFDE",
                    styles: dataConstant.destinationSearchMapSyle,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                };

                function getParam(name) {
                    var params = $stateParams.path.split(";");
                    for (var i = 0; i < params.length; i++) {
                        var para = params[i].split("=");
                        if (para[0].trim() === name) {
                            return para[1].trim().toUpperCase();
                        }
                    }
                }

                $scope.RenderMap = function (maps, sortByPrice) {
                    $timeout(function () {
                        var bounds = new google.maps.LatLngBounds();
                        $scope.destinationMarkers = [];
                        for (var x = 0; x < maps.length; x++) {
                            var latlng1 = new google.maps.LatLng(maps[x].lat, maps[x].lng);
                            var marker = new MarkerWithLabel({
                                position: latlng1,
                                map: $scope.destinationMap,
                                title: maps[x].FullName + ', ' + maps[x].CityName,
                                markerInfo: maps[x],
                                labelContent: '<div>' + maps[x].CityName + '<br/><span>' + UtilFactory.GetCurrencySymbol(maps[x].CurrencyCode) + ' ' + Math.ceil(maps[x].LowRate) + '</span></div>',
                                labelAnchor: new google.maps.Point(-11, 15),
                                labelClass: 'Maplabel',
                                icon: {
                                    url: "/images/big-point.png",
                                    scaledSize: markerImageObj.marker.scaledSizeSmall,
                                    origin: markerImageObj.marker.origin,
                                    anchor: markerImageObj.marker.anchorSmall
                                },
                                labelVisible: false
                            });

                            $scope.destinationMarkers.push(marker);
                            google.maps.event.addListener(marker, 'click', (function (marker) {
                                return function () {
                                    var finalpath = 'destination/f=' + $scope.origin.toUpperCase() + ';t=' + marker.markerInfo.DestinationLocation + ';d=' + ConvertToRequiredDate(marker.markerInfo.DepartureDateTime, 'API') + ';r=' + ConvertToRequiredDate(marker.markerInfo.ReturnDateTime, 'API');
                                    $timeout(function () { $location.path(finalpath); }, 0, true);
                                };
                            })(marker));
                        }

                        redrawMarkers(sortByPrice);

                        google.maps.event.clearListeners($scope.destinationMap, 'idle');
                        google.maps.event.addListener($scope.destinationMap, 'idle', function () {
                            // isCardClicked for preventing 'idle' event when destination card is click and we highlight clicked destination on map
                            if (!isCardClicked)
                                redrawMarkers(sortByPrice);
                            else
                                isCardClicked = false;
                        });
                    }, 0, false);
                };

                // distance in KM per zoom level
                var zoomLvlArr = dataConstant.zoomLevel;
                function addMarkerListerners(marker) {
                    google.maps.event.clearListeners(marker, 'mouseover');
                    google.maps.event.clearListeners(marker, 'mouseout');
                    marker.addListener('mouseover', function () {
                        this.setIcon(markerImageObj.bigOver);
                        this.labelVisible = true;
                        this.label.draw();
                    });
                    marker.addListener('mouseout', function () {
                        this.setIcon(markerImageObj.small);
                        this.labelVisible = false;
                        this.label.draw();
                    });
                }

                var highRankedMarkers = [];
                function redrawMarkers(sortByPrice) {
                    highRankedMarkers = [];
                    if (UtilFactory.Device.medium()) {
                        // get distance by zoom level
                        var dist = _.find(zoomLvlArr, function (i) { return i.zoom == $scope.destinationMap.zoom; }) || 0;
                        dist = dist.dis || dist;

                        // get markers on current map view port
                        var bounds = $scope.destinationMap.getBounds();
                        for (var i = 0; i < $scope.destinationMarkers.length; i++) {
                            if (!$scope.destinationMarkers[i].map) continue;
                            if (bounds.contains($scope.destinationMarkers[i].getPosition())) {
                                $scope.destinationMarkers[i].isRemoved = false;
                                highRankedMarkers.push($scope.destinationMarkers[i]);
                            }
                            else if ($scope.destinationMarkers[i].labelVisible) {
                                $scope.destinationMarkers[i].setIcon(markerImageObj.small);
                                $scope.destinationMarkers[i].labelVisible = false;
                                $scope.destinationMarkers[i].label.draw();
                                addMarkerListerners($scope.destinationMarkers[i]);
                            }
                            else
                                addMarkerListerners($scope.destinationMarkers[i]);
                        }
                    }
                    else
                        highRankedMarkers = $scope.destinationMarkers;

                    // sort markers by rank or price
                    if (sortByPrice) {
                        highRankedMarkers = sortByPrice == 'asc' ? _.sortBy(highRankedMarkers, function (i) { return i.markerInfo.LowRate }) : _.sortBy(highRankedMarkers, function (i) { return i.markerInfo.LowRate * -1; });
                    }
                    else {
                        highRankedMarkers = _.sortBy(highRankedMarkers, function (i) {
                            return i.markerInfo.rank;
                        });
                    }

                    // send data to controller for destination cards render                    
                    $scope.$emit('redrawMarkers', highRankedMarkers);
                    if (UtilFactory.Device.small()) return;   // if small device, do not execute map code

                    // for low zoom level pick up some high ranked markers
                    if ($scope.destinationMap.zoom < 6) {
                        var partition = _.partition(highRankedMarkers, function (item, index) { return index < $scope.destinationMap.zoom * 10 });
                        highRankedMarkers = partition[0];

                        // mark all low ranked destinations as a small markers
                        for (var i = 0; i < partition[1].length; i++) {
                            partition[1][i].setIcon(markerImageObj.small);
                            partition[1][i].labelVisible = false;
                            partition[1][i].label.draw();
                            addMarkerListerners(partition[1][i]);
                        }
                    }

                    // loop through all markers and compare it's distance with others.
                    // If distance is lower than specified value then mark high rank marker as a big icon and others as a small icons.                    
                    for (var i = 0; i < highRankedMarkers.length; i++) {
                        if (highRankedMarkers[i].isRemoved || !highRankedMarkers[i].map) continue;
                        var markers = [];
                        markers.push(highRankedMarkers[i]);
                        for (var j = 0; j < highRankedMarkers.length; j++) {
                            if (i == j || highRankedMarkers[j].isRemoved) continue;
                            var distance = UtilFactory.DistanceBetweenPoints(highRankedMarkers[i].position, highRankedMarkers[j].position);
                            if (distance < dist)
                                markers.push(highRankedMarkers[j]);
                        }

                        var highLowArr = _.sortBy(markers, function (i) { return sortByPrice ? (sortByPrice == 'asc' ? i.markerInfo.LowRate : i.markerInfo.LowRate * -1) : i.markerInfo.rank; });

                        // updating high rank marker
                        highLowArr[0].setIcon(markerImageObj.big);
                        highLowArr[0].labelVisible = true;
                        highLowArr[0].label.draw();
                        highLowArr[0].setOptions({ zIndex: 1 });
                        google.maps.event.clearListeners(highLowArr[0], 'mouseover');
                        google.maps.event.clearListeners(highLowArr[0], 'mouseout');
                        highLowArr[0].addListener('mouseover', function () {
                            this.setIcon(markerImageObj.bigOver);
                        });
                        highLowArr[0].addListener('mouseout', function () {
                            this.setIcon(markerImageObj.big);
                        });

                        // updating low rank markers                        
                        for (var j = 1; j < highLowArr.length; j++) {
                            highLowArr[j].isRemoved = true;
                            highLowArr[j].setIcon(markerImageObj.small);
                            highLowArr[j].labelVisible = false;
                            highLowArr[j].label.draw();
                            addMarkerListerners(highLowArr[j]);
                        }
                    }
                }

                var maxZindex = google.maps.Marker.MAX_ZINDEX;
                // used to highlight a perticular marker on the map
                var selectedMarker;
                $scope.$on('gotoMap', function (event, data) {
                    isCardClicked = true;
                    // get distance by zoom level                          
                    var dist = _.find(zoomLvlArr, function (i) { return i.zoom == $scope.destinationMap.zoom; }) || 0;
                    dist = dist.dis || dist;

                    $timeout(function () {
                        var bounds = $scope.destinationMap.getBounds();
                        var markerList = [];
                        if (selectedMarker && selectedMarker.map) {
                            selectedMarker.setIcon(selectedMarker.lastIcon);
                            selectedMarker.labelVisible = selectedMarker.lastLabelVisible;
                            selectedMarker.label.draw();
                            selectedMarker.lastIcon = null;
                            selectedMarker.lastLabelVisible = null;
                        }
                        selectedMarker = null;
                        for (var i = 0; i < highRankedMarkers.length; i++) {
                            selectedMarker = highRankedMarkers[i];
                            if (selectedMarker.markerInfo.DestinationLocation == data.DestinationLocation) {
                                if (!selectedMarker.lastIcon) {
                                    selectedMarker.lastIcon = selectedMarker.icon;
                                    selectedMarker.lastLabelVisible = selectedMarker.labelVisible;
                                }

                                selectedMarker.setIcon(markerImageObj.bigOverSelect);
                                selectedMarker.labelVisible = true;
                                selectedMarker.label.draw();
                                selectedMarker.setOptions({ zIndex: maxZindex++ });
                            }
                            else {
                                var distance = UtilFactory.DistanceBetweenPoints(selectedMarker.position, selectedMarker.position);
                                if (distance < dist) {
                                    selectedMarker.setIcon(markerImageObj.small);
                                    selectedMarker.labelVisible = false;
                                    selectedMarker.label.draw();
                                    addMarkerListerners(selectedMarker);
                                }
                            }
                        }
                        $scope.destinationMap.panTo(new google.maps.LatLng(data.lat, data.lng));
                    }, 0, false);
                });
            }],
            link: function (scope, elm, attr) {
                setAirportMarkerOnMap();

                scope.$on('setMarkerOnMap', function (event, args) {
                    if (!args) {
                        displayBlankMap();
                        return;
                    }

                    resetMarker();

                    if (!args.sortByPrice)
                        centerMap(args);

                    if (args.destinationlist != undefined && args.destinationlist.length > 0) {
                        scope.RenderMap(args.destinationlist, args.sortByPrice);
                        if ($rootScope.isShowAlerityMessage && UtilFactory.Device.medium()) {
                            $timeout(function () {
                                showMessage();
                            }, 0, false);
                        }
                    }
                });

                // remove all markers from map
                function resetMarker(zoomLevel) {
                    $timeout(function () {
                        if (scope.destinationMarkers.length > 0) {
                            for (var i = 0; i < scope.destinationMarkers.length; i++)
                                scope.destinationMarkers[i].setMap(null);
                        }
                    }, 0, true);
                }

                function centerMap(args) {
                    var airportLoc;
                    // lat lon information taken from http://www.mapsofworld.com/
                    switch (args.Region) {
                        case "Africa":
                            { airportLoc = new google.maps.LatLng(7.1881, 21.0936); break; }
                        case "Europe":
                            { airportLoc = new google.maps.LatLng(53.0000, 9.0000); break; }
                        case "South America":
                            { airportLoc = new google.maps.LatLng(-14.6048, -59.0625); break; }
                        case "North America":
                            { airportLoc = new google.maps.LatLng(48.1667, -100.1667); break; }
                        case "Middle East":
                            { airportLoc = new google.maps.LatLng(31.268205, 29.995368); break; }
                        case "Asia Pacific":
                            { airportLoc = new google.maps.LatLng(49.8380, 105.8203); break; }
                        default: {
                            var originairport = _.find(scope.airportList, function (airport) {
                                return airport.airport_Code == scope.origin.toUpperCase();
                            });
                            airportLoc = new google.maps.LatLng(originairport.airport_Lat, originairport.airport_Lng); break;
                        }
                    }

                    $timeout(function () {
                        scope.destinationMap.panTo(airportLoc);
                    }, 0, false);
                }

                function setAirportMarkerOnMap() {
                    UtilFactory.ReadAirportJson().then(function (data) {
                        if (!scope.origin)
                            return;
                        var originAirport = _.find(data, function (airport) {
                            return airport.airport_Code == scope.origin.toUpperCase()
                        });
                        if (!originAirport) return;
                        var airportLoc = new google.maps.LatLng(originAirport.airport_Lat, originAirport.airport_Lng);
                        var marker = new MarkerWithLabel({
                            position: airportLoc,
                            map: scope.destinationMap,
                            title: originAirport.airport_FullName,
                            labelAnchor: new google.maps.Point(12, 35),
                            labelInBackground: false,
                            visible: true,
                            animation: google.maps.Animation.DROP,
                            labelStyle: { opacity: 0.75 },
                            icon: 'images/dot.png',
                            options:
                                { zIndex: -1 }
                        });

                        $timeout(function () {
                            scope.destinationMap.panTo(airportLoc);
                        }, 0, false);
                    });
                }

                function showMessage() {
                    alertify.dismissAll();
                    var message = "<div class='alert-box'><p>The bigger markers are our top ranked destinations based on popularity from the Origin airport.</p>"
                       + "<input type='button' class='btn btn-primary' value='Got It' />"
                     + "</div><div class='clear'></div>";
                    alertify.set('notifier', 'position', 'top-right');
                    alertify.warning(message, 15, function () { $rootScope.isShowAlerityMessage = false; });
                    setMessagePosition();
                }

                function setMessagePosition() {
                    var alertBoxElement = angular.element(".ajs-message.ajs-warning.ajs-visible");
                    var headerElement = angular.element("#header")[0];
                    alertBoxElement.css({ "top": headerElement.offsetHeight - 9 });
                }

                function displayBlankMap() {
                    scope.destinationMap.setOptions({ zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true });
                    var latLng = new google.maps.LatLng(0, 0);
                    var marker = new MarkerWithLabel({
                        position: latLng,
                        map: scope.destinationMap,
                        visible: false
                    });

                    $timeout(function () {
                        scope.destinationMap.panTo(latLng);
                    }, 0, false);
                }
            }
        }
    }
})();