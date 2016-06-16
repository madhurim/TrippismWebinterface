(function () {
    'use strict';
    angular.module('TrippismUIApp')
      .directive('googleMap', ['$timeout', '$rootScope', '$window', 'UtilFactory', 'urlConstant',
          function ($timeout, $rootScope, $window, UtilFactory, urlConstant) {
              var directive = {};
              directive.templateUrl = urlConstant.viewsPath + 'GoogleMap.html',
              directive.scope = {
                  airportlist: "=airportlist"
              }

              directive.controller = ['$scope', '$q', '$compile', '$location', 'dataConstant', '$stateParams',
                  function ($scope, $q, $compile, $location, dataConstant, $stateParams) {
                      $scope.highRankedAirportlist = [];
                      $scope.destinationMap = undefined;
                      $scope.destinationMarkers = [];
                      $scope.bounds;
                      $scope.markerCluster;
                      var highRankedMarkers;
                      $scope.origin = getParam("f");
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

                      $scope.showPosition = function (destinations) {
                          $scope.destinationslist = destinations;
                          var promises = [];
                          for (var i = 0; i < $scope.destinationslist.length; i++) {
                              promises.push(updateObject($scope.destinationslist[i]));
                          }
                          $q.all(promises).then(function (data) {
                              if (data.length > 0) {
                                  data = _.compact(data);
                              }
                              RenderMap(data);
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
                              $scope.destinationMarkers = [];
                              maps = _.sortBy(maps, 'rank');
                              $scope.$emit('RenderMap', maps);
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
                                      var marker = new MarkerWithLabel({
                                          position: latlng1,
                                          map: $scope.destinationMap,
                                          title: airportName.airport_FullName + ', ' + airportName.airport_CityName,
                                          markerInfo: maps[x],
                                          //labelContent: '<div>' + airportName.airport_CityName + '<br/><span>' + UtilFactory.GetCurrencySymbol(maps[x].CurrencyCode) + ' ' + Math.ceil(LowRate) + '</span><br/>' + airportName.rank + '</div>',
                                          labelContent: '<div>' + airportName.airport_CityName + '<br/><span>' + UtilFactory.GetCurrencySymbol(maps[x].CurrencyCode) + ' ' + Math.ceil(LowRate) + '</span></div>',
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
                              }
                              //google.maps.event.addListenerOnce($scope.destinationMap, 'tilesloaded', function () {
                              redrawMarkers();
                              //});
                              google.maps.event.clearListeners($scope.destinationMap, 'zoom_changed');
                              google.maps.event.addListener($scope.destinationMap, "zoom_changed", function () {
                                  redrawMarkers();
                              });

                              google.maps.event.clearListeners($scope.destinationMap, 'dragend');
                              google.maps.event.addListener($scope.destinationMap, "dragend", function () {
                                  if ($scope.destinationMap.zoom == 6 || $scope.destinationMap.zoom == 7)
                                      redrawMarkers();
                              });
                          }, 0, false);
                      };
                      // distance in KM per zoom level
                      var zoomLvlArr = [{ zoom: 3, dis: 1000 }, { zoom: 4, dis: 700 }, { zoom: 5, dis: 500 }, { zoom: 6, dis: 200 }, { zoom: 7, dis: 65 }];
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

                      function redrawMarkers() {
                          var highRankedMarkers = [];
                          // get distance by zoom level
                          var dist = _.find(zoomLvlArr, function (i) { return i.zoom == $scope.destinationMap.zoom; }) || 0;
                          dist = dist.dis || dist;

                          if ($scope.destinationMap.zoom == 6 || $scope.destinationMap.zoom == 7) {
                              var bounds = $scope.destinationMap.getBounds();
                              for (var i = 0; i < $scope.destinationMarkers.length; i++) {
                                  if ($scope.destinationMarkers[i].map && bounds.contains($scope.destinationMarkers[i].getPosition()))
                                      highRankedMarkers.push($scope.destinationMarkers[i]);
                              }
                              highRankedMarkers = _.sortBy(highRankedMarkers, function (i) { return i.markerInfo.rank; });
                          }
                          else {
                              var partition = _.partition(_.sortBy($scope.destinationMarkers, function (i) { return i.markerInfo.rank; }), function (item, index) { return index < $scope.destinationMap.zoom * 10 });
                              highRankedMarkers = partition[0];

                              // mark all low ranked destinations as a small markers
                              for (var i = 0; i < partition[1].length; i++) {
                                  partition[1][i].setIcon(markerImageObj.small);
                                  partition[1][i].labelVisible = false;
                                  addMarkerListerners(partition[1][i]);
                              }
                          }

                          highRankedMarkers = _.each(highRankedMarkers, function (i) { i.isRemoved = false; });
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

                              var highLowArr = _.sortBy(markers, function (i) { return i.markerInfo.rank; });

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
                                  addMarkerListerners(highLowArr[j]);
                              }
                          }
                      }

                      // update destination object to set it on marker object
                      var updateObject = function (obj) {
                          var d = $q.defer();
                          var originAirport = _.find($scope.highRankedAirportlist, function (airport) {
                              return airport.airport_Code == obj.DestinationLocation
                          });

                          if (originAirport != undefined) {
                              obj.lat = originAirport.airport_Lat;
                              obj.lng = originAirport.airport_Lng;
                              obj.rank = originAirport.rank;
                              obj.CityName = originAirport.airport_CityName;
                              obj.CityCode = originAirport.airport_CityCode;
                              obj.FullName = originAirport.airport_FullName;
                              d.resolve(obj);
                          } else {
                              d.resolve();
                          }
                          return d.promise;
                      }

                      var maxZindex = google.maps.Marker.MAX_ZINDEX;
                      // used to highlight a perticular marker on the map
                      $scope.$on('gotoMap', function (event, data) {
                          var selectedMarker;
                          // get distance by zoom level                          
                          var dist = _.find(zoomLvlArr, function (i) { return i.zoom == $scope.destinationMap.zoom; }) || 0;
                          dist = dist.dis || dist;

                          $timeout(function () {
                              $scope.destinationMap.panTo(new google.maps.LatLng(data.lat, data.lng));
                              var bounds = $scope.destinationMap.getBounds();
                              var markerList = [];
                              for (var i = 0; i < $scope.destinationMarkers.length; i++) {
                                  if ($scope.destinationMarkers[i].markerInfo.DestinationLocation == data.DestinationLocation) {
                                      selectedMarker = $scope.destinationMarkers[i];

                                      if (!selectedMarker.lastIcon) {
                                          selectedMarker.lastIcon = selectedMarker.icon;
                                          selectedMarker.lastLabelVisible = selectedMarker.labelVisible;
                                      }

                                      selectedMarker.setIcon(markerImageObj.bigOverSelect);
                                      selectedMarker.labelVisible = true;
                                      selectedMarker.label.draw();
                                      selectedMarker.setOptions({ zIndex: maxZindex++ });
                                  }
                                  else if ($scope.destinationMarkers[i].lastIcon) {
                                      $scope.destinationMarkers[i].setIcon($scope.destinationMarkers[i].lastIcon);
                                      $scope.destinationMarkers[i].labelVisible = $scope.destinationMarkers[i].lastLabelVisible;
                                      $scope.destinationMarkers[i].label.draw();
                                      $scope.destinationMarkers[i].lastIcon = null;
                                      $scope.destinationMarkers[i].lastLabelVisible = null;
                                  }
                                  else if (!$scope.destinationMarkers[i].isRemoved && bounds.contains($scope.destinationMarkers[i].getPosition())) {
                                      markerList.push($scope.destinationMarkers[i]);
                                  }
                              }

                              for (var i = 0; i < markerList.length; i++) {
                                  var distance = UtilFactory.DistanceBetweenPoints(selectedMarker.position, markerList[i].position);
                                  if (distance < dist) {
                                      markerList[i].setIcon(markerImageObj.small);
                                      markerList[i].labelVisible = false;
                                      markerList[i].label.draw();
                                      addMarkerListerners(markerList[i]);
                                  }
                              }
                          }, 0, false);
                      });
                  }];

              directive.link = function (scope, elm, attr) {
                  var w = angular.element($window);
                  setAirportMarkerOnMap();

                  scope.$on('setMarkeronMap', function (event, args) {
                      if (!args) {
                          displayBlankMap();
                          return;
                      }

                      scope.destinations = args.destinationlist;
                      scope.highRankedAirportlist = args.highRankedAirportlist;
                      resetMarker();

                      if (scope.destinations != undefined && scope.destinations.length > 0) {
                          scope.displayDestinations(scope.destinations);
                          if ($rootScope.isShowAlerityMessage && w.width() >= 768) {
                              $timeout(function () {
                                  showMessage();
                              }, 0, false);
                          }
                      }
                      else {
                          scope.$emit('RenderMap', []);
                      }

                      centerMap(args);
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
                              var originairport = _.find(scope.airportlist, function (airport) {
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
                      if (w.width() <= 991) return;
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
              return directive;
          }]);
})();