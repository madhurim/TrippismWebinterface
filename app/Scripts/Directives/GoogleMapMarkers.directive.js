(function () {
    'use strict';
    angular.module('TrippismUIApp')
      .directive('googleMap', ['$timeout', '$rootScope', '$window', 'UtilFactory',
          function ($timeout, $rootScope, $window, UtilFactory) {
              var directive = {};
              directive.templateUrl = '/Views/GoogleMap.html',
              directive.scope = {
                  airportlist: "=airportlist",
                  airlineJsonData: "=airlinejsondata",
              }

              directive.controller = ['$scope', '$q', '$compile', '$location', 'TrippismConstants', '$stateParams',
                  function ($scope, $q, $compile, $location, TrippismConstants, $stateParams) {
                      $scope.highRankedAirportlist = [];
                      $scope.destinationMap = undefined;
                      $scope.destinationMarkers = [];
                      $scope.bounds;
                      $scope.markerCluster;
                      $scope.clusterFlag = true;    // flag for solving cluster issue if theme/region multiple time clicked                      
                      var highRankedMarkers;
                      var params = $stateParams.path.split(";");
                      for (var i = 0; i < params.length; i++) {
                          var para = params[i].split("=");
                          if (para[0].trim() === "f") {
                              $scope.origin = para[1].trim().toUpperCase();
                              break;
                          }
                      }

                      //sets the map options
                      $scope.mapOptions = {
                          zoom: 3,
                          minZoom: 3,
                          zoomControl: true,
                          zoomControlOptions: {
                              position: google.maps.ControlPosition.RIGHT_CENTER,
                              style: google.maps.ZoomControlStyle.LARGE
                          },
                          backgroundColor: "#BCCFDE",
                          //styles: TrippismConstants.destinationSearchMapSyle,                          
                          styles: [{ featureType: "all", elementType: "all", stylers: [{ visibility: "on" }] },
                              { featureType: "administrative", elementType: "all", stylers: [{ visibility: "on" }] },
                              { featureType: "administrative.country", elementType: "all", stylers: [{ visibility: "on" }] },
                              { featureType: "administrative.country", elementType: "geometry", stylers: [{ lightness: "1" }, { visibility: "on" }, { color: "#bbbbbb" }] },
                              { featureType: "administrative.country", elementType: "labels", stylers: [{ lightness: "65" }, { visibility: "on" }] },
                              { featureType: "administrative.country", elementType: "labels.text", stylers: [{ weight: "1" }, { visibility: "simplified" }, { saturation: "0" }, { lightness: "40" }] },
                              { featureType: "administrative.province", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "administrative.locality", elementType: "all", stylers: [{ hue: "#0049ff" }, { saturation: 7 }, { lightness: "0" }, { visibility: "off" }] },
                              { featureType: "administrative.locality", elementType: "geometry", stylers: [{ visibility: "on" }] },
                              { featureType: "administrative.neighborhood", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "administrative.land_parcel", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "landscape", elementType: "all", stylers: [{ saturation: -100 }, { lightness: "100" }, { visibility: "off" }, { color: "#fcfcfc" }, { weight: "1" }] },
                              { featureType: "landscape.man_made", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "landscape.natural", elementType: "all", stylers: [{ visibility: "on" }] },
                              { featureType: "poi", elementType: "all", stylers: [{ hue: "#ff0000" }, { saturation: -100 }, { lightness: 100 }, { visibility: "off" }] },
                              { featureType: "road", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "road", elementType: "geometry", stylers: [{ hue: "#bbc0c4" }, { saturation: -93 }, { lightness: 31 }, { visibility: "simplified" }] },
                              { featureType: "road", elementType: "labels", stylers: [{ hue: "#bbc0c4" }, { saturation: -93 }, { lightness: 31 }, { visibility: "on" }] },
                              { featureType: "road.highway", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "road.arterial", elementType: "labels", stylers: [{ hue: "#bbc0c4" }, { saturation: -93 }, { lightness: -2 }, { visibility: "simplified" }] },
                              { featureType: "road.local", elementType: "geometry", stylers: [{ hue: "#e9ebed" }, { saturation: -90 }, { lightness: -8 }, { visibility: "simplified" }] },
                              { featureType: "transit", elementType: "all", stylers: [{ hue: "#007fff" }, { saturation: 10 }, { lightness: 69 }, { visibility: "off" }] },
                              { featureType: "transit.line", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "transit.station", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "transit.station.airport", elementType: "all", stylers: [{ visibility: "on" }] },
                              { featureType: "transit.station.bus", elementType: "all", stylers: [{ visibility: "on" }] },
                              { featureType: "transit.station.rail", elementType: "all", stylers: [{ visibility: "off" }] },
                              { featureType: "water", elementType: "all", stylers: [{ saturation: -78 }, { lightness: 67 }, { visibility: "simplified" }, { color: "#91B7CF" }] }
                          ],
                          mapTypeId: google.maps.MapTypeId.ROADMAP,
                      };

                      $scope.showPosition = function (destinations) {
                          $scope.destinationslist = destinations;
                          var promises = [];
                          for (var i = 0; i < $scope.destinationslist.length; i++) {
                              promises.push(getMapUrlData($scope.destinationslist[i]));
                          }
                          $q.all(promises).then(function (maps) {
                              if (maps.length > 0) {
                                  maps = _.compact(maps);
                              }
                              RenderMap(maps);
                          }.bind(this));
                      }

                      $scope.displayDestinations = function (destinations) {
                          var faresList = angular.copy(destinations);
                          $scope.showPosition(_.uniq(faresList, function (destination) { return destination.DestinationLocation; }))
                      }

                      var RenderMap = function (maps) {
                          $timeout(function () {
                              $scope.InfoWindow;
                              $scope.bounds = new google.maps.LatLngBounds();
                              //selected = maps;                              
                              $scope.destinationMarkers = [];
                              maps = _.sortBy(maps, 'rank');
                              for (var x = 0; x < maps.length; x++) {
                                  var latlng1 = new google.maps.LatLng(maps[x].lat, maps[x].lng);
                                  // Moved code for getting LowFare into UtilFactory because same logic needs to apply in DestinationController.js for pre setting min/max fare refine search textbox
                                  var LowRate = UtilFactory.GetLowFareForMap(maps[x]);
                                  var airportName = _.find($scope.airportlist, function (airport) {
                                      return airport.airport_Code == maps[x].DestinationLocation
                                  });
                                  if (LowRate != "N/A") {
                                      maps[x].CityName = airportName.airport_CityName;
                                      maps[x].airport_FullName = airportName.airport_FullName;
                                      //maps[x].rate = LowRate;
                                      var marker = new MarkerWithLabel({
                                          position: latlng1,
                                          map: $scope.destinationMap,
                                          title: airportName.airport_FullName + ', ' + airportName.airport_CityName,
                                          CustomMarkerInfo: maps[x],
                                          //labelContent: '<div style="color:black;font-weight:700;white-space:nowrap;">' + airportName.airport_CityName + '<br/><span>' + UtilFactory.GetCurrencySymbol(maps[x].CurrencyCode) + ' ' + Math.ceil(LowRate) + '</span><br/>' + airportName.rank + '</div>',
                                          labelContent: '<div style="color:black;font-weight:500;white-space:nowrap;font-size:13px;line-height:15px;">' + airportName.airport_CityName + '<br/><span style="color:#2f86cd;font-weight:900;font-size:11px;">' + UtilFactory.GetCurrencySymbol(maps[x].CurrencyCode) + ' ' + Math.ceil(LowRate) + '</span></div>',
                                          labelAnchor: new google.maps.Point(-11, 15),
                                          icon: {
                                              url: "/images/big-point.png", // url                                          
                                              scaledSize: new google.maps.Size(14, 14),
                                              origin: new google.maps.Point(0, 0),
                                              anchor: new google.maps.Point(7, 7)
                                          },
                                          labelVisible: false
                                      });

                                      var contentString = '<div style="min-width:100px;padding-top:5px;" id="content">' +
                                                              '<div class="col-sm-12 padleft0"><strong>'
                                                                + "(" + maps[x].DestinationLocation + ") " + airportName.airport_FullName + ', ' + airportName.airport_CityName + '</strong></div>' +
                                                                '<br /><div class="col-sm-12 padleft0">' +
                                                                '<label>Lowest fare: </label><strong class="text-success"> ' + maps[x].CurrencyCode + ' ' + maps[x].LowestFare + '</strong>' +
                                                        '</div> ';

                                      $scope.InfoWindow = new google.maps.InfoWindow();
                                      $scope.destinationMarkers.push(marker);

                                      google.maps.event.addListener(marker, 'click', (function (marker, contentString, infowindow) {
                                          return function () {
                                              var finalpath = 'destination/f=' + $scope.origin.toUpperCase() + ';t=' + marker.CustomMarkerInfo.DestinationLocation + ';d=' + ConvertToRequiredDate(marker.CustomMarkerInfo.DepartureDateTime, 'API') + ';r=' + ConvertToRequiredDate(marker.CustomMarkerInfo.ReturnDateTime, 'API');
                                              $location.path(finalpath);
                                          };
                                      })(marker, contentString, $scope.InfoWindow));
                                  }
                              }

                              var partition = _.partition(_.sortBy($scope.destinationMarkers, function (i) { return i.CustomMarkerInfo.rank; }), function (item, index) { return index < 30 });
                              highRankedMarkers = partition[0];
                              for (var i = 0; i < partition[1].length; i++) {
                                  addMarkerListerners(partition[1][i]);
                              }

                              redrawMarkers();
                              google.maps.event.clearListeners($scope.destinationMap, 'zoom_changed');
                              google.maps.event.addListener($scope.destinationMap, "zoom_changed", function () {
                                  redrawMarkers();
                              });
                              $scope.clusterFlag = true;
                          }, 0, false);
                      };
                      // distance in KM per zoom level
                      var zoomLvlArr = [{ zoom: 3, dis: 1000 }, { zoom: 4, dis: 700 }, { zoom: 5, dis: 500 }, { zoom: 6, dis: 400 }, { zoom: 7, dis: 300 }];
                      function addMarkerListerners(marker) {
                          google.maps.event.clearListeners(marker, 'mouseover');
                          google.maps.event.clearListeners(marker, 'mouseout');
                          marker.addListener('mouseover', function () {
                              this.setIcon(new google.maps.MarkerImage("/images/big-point-over.png", new google.maps.Size(21, 21), new google.maps.Point(0, 0), new google.maps.Point(10, 10), new google.maps.Size(20, 20)));
                              this.labelVisible = true;
                              this.label.draw();
                          });
                          marker.addListener('mouseout', function () {
                              this.setIcon(new google.maps.MarkerImage("/images/big-point.png", new google.maps.Size(21, 21), new google.maps.Point(0, 0), new google.maps.Point(7, 7), new google.maps.Size(14, 14)));
                              this.labelVisible = false;
                              this.label.draw();
                          });
                      }

                      function redrawMarkers() {
                          highRankedMarkers = _.each(highRankedMarkers, function (i) { i.isRemoved = false; });
                          // get distance by zoom level
                          var dist = _.find(zoomLvlArr, function (i) { return i.zoom == $scope.destinationMap.zoom; }) || 0;
                          dist = dist.dis || dist;

                          // loop through all markers and compare it's distance with others.
                          // If distance is lower than specified value then mark high rank marker as a big icon and others as a small icons.
                          for (var i = 0; i < highRankedMarkers.length; i++) {
                              if (highRankedMarkers[i].isRemoved) continue;
                              var markers = [];
                              markers.push(highRankedMarkers[i]);
                              for (var j = 0; j < highRankedMarkers.length; j++) {
                                  if (i == j || highRankedMarkers[j].isRemoved) continue;
                                  var distance = distanceBetweenPoints(highRankedMarkers[i].position, highRankedMarkers[j].position);
                                  if (distance < dist)
                                      markers.push(highRankedMarkers[j]);
                              }

                              var highLowArr = _.sortBy(markers, function (i) { return i.CustomMarkerInfo.rank; });

                              // updating high rank marker
                              highLowArr[0].setIcon(new google.maps.MarkerImage("/images/big-point.png", new google.maps.Size(21, 21), new google.maps.Point(0, 0), new google.maps.Point(10, 10), new google.maps.Size(20, 20)));
                              highLowArr[0].labelVisible = true;
                              //if ($scope.destinationMap.zoom == 3) {
                              //    debugger;
                              //    highLowArr[0].labelContent = '<div style="color:black;font-weight:500;white-space:nowrap;font-size:12px;line-height:15px;">' + highLowArr[0].CustomMarkerInfo.CityName + '<br/><span style="color:#2f86cd;font-weight:900;font-size:10px;">' + UtilFactory.GetCurrencySymbol(highLowArr[0].CustomMarkerInfo.CurrencyCode) + ' ' + Math.ceil(highLowArr[0].CustomMarkerInfo.rate) + '</span></div>';
                              //}
                              //else {
                              //    highLowArr[0].labelContent = '<div style="color:black;font-weight:500;white-space:nowrap;font-size:13px;line-height:15px;">' + highLowArr[0].CustomMarkerInfo.CityName + '<br/><span style="color:#2f86cd;font-weight:900;font-size:11px;">' + UtilFactory.GetCurrencySymbol(highLowArr[0].CustomMarkerInfo.CurrencyCode) + ' ' + Math.ceil(highLowArr[0].CustomMarkerInfo.rate) + '</span></div>';
                              //}
                              highLowArr[0].label.draw();
                              highLowArr[0].setOptions({ zIndex: 999 });
                              google.maps.event.clearListeners(highLowArr[0], 'mouseover');
                              google.maps.event.clearListeners(highLowArr[0], 'mouseout');
                              highLowArr[0].addListener('mouseover', function () {
                                  this.setIcon(new google.maps.MarkerImage("/images/big-point-over.png", new google.maps.Size(21, 21), new google.maps.Point(0, 0), new google.maps.Point(10, 10), new google.maps.Size(20, 20)));
                              });
                              highLowArr[0].addListener('mouseout', function () {
                                  this.setIcon(new google.maps.MarkerImage("/images/big-point.png", new google.maps.Size(21, 21), new google.maps.Point(0, 0), new google.maps.Point(10, 10), new google.maps.Size(20, 20)));
                              });

                              // updating low rank markers
                              for (var j = 1; j < highLowArr.length; j++) {
                                  highLowArr[j].isRemoved = true;
                                  highLowArr[j].setIcon(new google.maps.MarkerImage("/images/big-point.png", new google.maps.Size(21, 21), new google.maps.Point(0, 0), new google.maps.Point(7, 7), new google.maps.Size(14, 14)));
                                  highLowArr[j].labelVisible = false;
                                  addMarkerListerners(highLowArr[j]);
                              }
                          }
                      }

                      var distanceBetweenPoints = function (p1, p2) {
                          if (!p1 || !p2) {
                              return 0;
                          }

                          var R = 6371; // Radius of the Earth in km
                          var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
                          var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
                          var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                            Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
                            Math.sin(dLon / 2) * Math.sin(dLon / 2);
                          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                          var d = R * c;
                          return d;
                      };

                      var getMapUrlData = function (airportCode) {
                          var d = $q.defer();
                          var originairport = _.find($scope.highRankedAirportlist, function (airport) {
                              return airport.airport_Code == airportCode.DestinationLocation
                          });

                          if (originairport != undefined) {
                              airportCode.lat = originairport.airport_Lat;
                              airportCode.lng = originairport.airport_Lng;
                              airportCode.rank = originairport.rank;
                              d.resolve(airportCode);
                          } else {
                              //Missing Airport Details log 
                              //UtilFactory.AirportCodeLog(airportCode.DestinationLocation);
                              d.resolve();
                          }
                          return d.promise;
                      }

                      $scope.$on('eventDestinationMapresize', function (event, args) {
                          google.maps.event.addListenerOnce($scope.destinationMap, 'idle', function () {
                              google.maps.event.trigger($scope.destinationMap, 'resize');
                          });
                      });

                      $scope.resetMarker = function (zoomLevel) {
                          $timeout(function () {
                              $scope.destinationMap.setZoom(zoomLevel);
                          }, 0, false);

                          $timeout(function () {
                              if ($scope.destinationMarkers.length > 0) {
                                  for (var i = 0; i < $scope.destinationMarkers.length; i++)
                                      $scope.destinationMarkers[i].setMap(null);
                              }
                          }, 0, true);
                      }
                  }];

              directive.link = function (scope, elm, attrs) {
                  var w = angular.element($window);
                  w.bind('resize', setIwCloseButtonPositionFn);

                  // set position of infowindow close button
                  function setIwCloseButtonPositionFn() {
                      $timeout(function () {
                          if (!angular.element('#mainmap').length) w.unbind('resize', setIwCloseButtonPositionFn);
                          var iwOuter = angular.element('.gm-style-iw');
                          iwOuter.parent().css({ width: iwOuter.css('width'), maxWidth: iwOuter.css('width') });
                      }, 100, false);

                      var iwOuter = angular.element('.clustermarkerpopup');
                      angular.element('.gm-style-iw').css({ width: iwOuter.css('width'), maxWidth: iwOuter.css('width') });
                  }

                  setAirportMarkerOnMap();
                  //Convert watch code into brodcast method                   
                  scope.$on('setMarkeronMap', function (event, args) {
                      if (!args) {
                          displayBlankMap();
                          return;
                      }

                      if (scope.clusterFlag) {
                          scope.clusterFlag = false;    // flag for solving cluster issue if theme/region multiple time clicked

                          scope.destinations = args.destinationlist;
                          scope.highRankedAirportlist = args.highRankedAirportlist;
                          scope.resetMarker(args.Region || args.Theme ? 3 : 4);
                          if (scope.destinations != undefined && scope.destinations.length > 0) {
                              scope.displayDestinations(scope.destinations);
                              if ($rootScope.isShowAlerityMessage && w.width() >= 768) {
                                  $timeout(function () {
                                      showMessage();
                                  }, 0, false);
                              }
                          }
                          else
                              scope.clusterFlag = true;    // flag for solving cluster issue if theme/region multiple time clicked


                          var originairport = _.find(scope.airportlist, function (airport) {
                              return airport.airport_Code == scope.origin.toUpperCase()
                          });
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
                              default: { airportLoc = new google.maps.LatLng(originairport.airport_Lat, originairport.airport_Lng); break; }
                          }

                          if (args.Region == "Africa")
                              airportLoc = new google.maps.LatLng(7.1881, 21.0936);
                          else if (args.Region == "Europe")
                              airportLoc = new google.maps.LatLng(53.0000, 9.0000);
                          else if (args.Region == "South America")
                              airportLoc = new google.maps.LatLng(-14.6048, -59.0625);
                          else if (args.Region == "North America")
                              airportLoc = new google.maps.LatLng(48.1667, -100.1667);
                          else if (args.Region == "Middle East")
                              airportLoc = new google.maps.LatLng(31.268205, 29.995368);
                          else if (args.Region == "Asia Pacific")
                              airportLoc = new google.maps.LatLng(49.8380, 105.8203);
                          else
                              airportLoc = new google.maps.LatLng(originairport.airport_Lat, originairport.airport_Lng);

                          $timeout(function () {
                              scope.destinationMap.panTo(airportLoc);
                          }, 0, false);
                      }
                  });

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
                      var message = "<div class='alert-box'><p>Click on any of the numbered clusters to see destinations. Numbers represent how many destinations fall into a nearby radius.</p>"
                          + "<input type='button' class='btn btn-primary' value='Got It' />"
                        + "</div><div class='clear'></div>";
                      alertify.set('notifier', 'position', 'top-right');
                      alertify.warning(message, 15, function () { $rootScope.isShowAlerityMessage = false; });
                      showMessagePosition();
                  }

                  function showMessagePosition() {
                      var alertBoxElement = angular.element(".ajs-message.ajs-warning.ajs-visible");
                      var searchBoxElement = angular.element("#search-box")[0];
                      var headerElement = angular.element("#header")[0];
                      alertBoxElement.css({ "top": searchBoxElement.offsetHeight + headerElement.offsetHeight - 9 });
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
              return directive;
          }]);
})();