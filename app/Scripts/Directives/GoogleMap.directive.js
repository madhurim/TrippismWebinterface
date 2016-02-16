var selected;
'use strict';
angular.module('TrippismUIApp')
  .directive('googleMap', [
      function () {
          var directive = {};
          directive.templateUrl = '/Views/GoogleMap.html',
          directive.scope = {
              origin: "=",
              destinations: "=destinations",
              airportlist: "=airportlist",
              airlineJsonData: "=airlinejsondata",
              defaultlat: "@",
              defaultlng: "@"
          }

          directive.controller = ['$scope', '$q', '$compile', '$filter', '$timeout', '$rootScope', '$http', '$location', 'TrippismConstants', 'UtilFactory',
              function ($scope, $q, $compile, $filter, $timeout, $rootScope, $http, $location, TrippismConstants, UtilFactory) {
                  $scope.destinationMap = undefined;
                  $scope.faresList = [];
                  $scope.destinationMarkers = [];
                  $scope.bounds;
                  $scope.markerCluster;
                  $scope.Zoomsize = 8;
                  $scope.clusterFlag = true;    // flag for solving cluster issue if theme/region multiple time clicked
                  var mapStyle = TrippismConstants.destinationSearchMapSyle;
                  var imageurl = 'http://' + window.document.location.host

                  // sets the cluster options
                  var mcOptions = {
                      gridSize: 50,
                      maxZoom: $scope.Zoomsize,
                      zoomOnClick: false,
                      minimumClusterSize: 1,
                      setZoomOnClick: 8,
                      styles: [{
                          height: 47,
                          url: imageurl + '/images/icon-gps40x40.png',
                          textColor: "black",
                          textSize: 12,
                          width: 40,
                          anchor: [7, 43]
                      }]
                  };

                  //sets the map options
                  $scope.mapOptions = {
                      zoom: 3,
                      minZoom: 3,
                      zoomControl: true,
                      minimumClusterSize: 1,
                      zoomControlOptions: {
                          position: google.maps.ControlPosition.RIGHT_CENTER,
                          style: google.maps.ZoomControlStyle.LARGE
                      },
                      backgroundColor: "#BCCFDE",
                      styles: mapStyle,
                      mapTypeId: google.maps.MapTypeId.ROADMAP,
                      center: new google.maps.LatLng($scope.defaultlat, $scope.defaultlng)
                  };

                  $scope.destinationpopupClick = function (item) {

                      $location.path('destination/f=' + $scope.origin.toUpperCase() + ';t=' + item.CustomMarkerInfo.DestinationLocation + ';d=' + ConvertToRequiredDate(item.CustomMarkerInfo.DepartureDateTime, 'API') + ';r=' + ConvertToRequiredDate(item.CustomMarkerInfo.ReturnDateTime, 'API'));

                      //var OriginairportName = _.find($scope.airportlist, function (airport) {
                      //    return airport.airport_Code == $scope.origin.toUpperCase()
                      //});
                      //var DestinationairportName = _.find($scope.airportlist, function (airport) {
                      //    return airport.airport_Code == item.CustomMarkerInfo.DestinationLocation
                      //});
                      //var dataForecast = {
                      //    "Origin": $scope.origin.toUpperCase(),
                      //    "DepartureDate": $filter('date')(item.CustomMarkerInfo.DepartureDateTime, 'yyyy-MM-dd'),
                      //    "ReturnDate": $filter('date')(item.CustomMarkerInfo.ReturnDateTime, 'yyyy-MM-dd'),
                      //    "Destination": item.CustomMarkerInfo.DestinationLocation
                      //};
                      //$rootScope.$broadcast('EmptyFareForcastInfo', {
                      //    Origin: OriginairportName.airport_CityName,
                      //    Destinatrion: DestinationairportName.airport_Code,
                      //    Fareforecastdata: dataForecast,
                      //    mapOptions: item.CustomMarkerInfo,
                      //    OriginairportName: OriginairportName,
                      //    DestinationairportName: DestinationairportName,
                      //    DestinationList: $scope.destinations,
                      //    AvailableAirports: $scope.airportlist,
                      //    AvailableAirline: $scope.airlineJsonData
                      //});
                  };

                  var infowindow = new google.maps.InfoWindow();
                  google.maps.event.addListener(infowindow, 'domready', function () {
                      // Reference to the DIV that wraps the bottom of infowindow
                      var iwOuter = angular.element(document.getElementsByClassName('gm-style-iw'));
                      // move info window right
                      iwOuter.parent().parent().css({ left: '20px' });
                      // remove default popup divs
                      iwOuter.prev().remove();

                      // Reference to the div that groups the close button elements.
                      var iwCloseBtn = iwOuter.next();
                      var closeButton = $compile('<img class="iw-close" src="images/close.png" ng-click="closeInfowindow();"/>')($scope);
                      iwCloseBtn.html(closeButton);
                      iwCloseBtn.css({
                          opacity: '1',
                          top: '3px',
                          border: '4px solid #01a7e4',
                          'border-radius': '10px',
                          'box-shadow': '0 0 5px #3990B9',
                          'box-sizing': 'content-box',
                          'position': 'absolute',
                          'z-index': '1002'
                      });
                      $timeout(function () {
                          // set parent div's width
                          iwOuter.parent().css({ maxWidth: iwOuter.css('width'), width: iwOuter.css('width') });
                          iwCloseBtn.css({
                              left: '98%',
                          });
                      }, 100, false);
                  });

                  $scope.closeInfowindow = function () {
                      if (infowindow)
                          infowindow.close();
                      $scope.destinationMap.setOptions({ zoomControl: true, scrollwheel: true, disableDoubleClickZoom: false });
                  }
                  $scope.setMarkerCluster = function () {
                      $timeout(function () {
                          if ($scope.destinationMap)
                              $scope.destinationMap.setOptions($scope.mapOptions);
                          else
                              $scope.destinationMap = new google.maps.Map(document.getElementById("map_canvas"), $scope.mapOptions);

                          var map = $scope.destinationMap;
                          if ($scope.destinationMarkers.length > 0) {
                              $scope.markerCluster = new MarkerClusterer(map, $scope.destinationMarkers, mcOptions);
                              //zoom changed time closed infowindow if any open. b'caz open infowindow not work proper at zoom changed time.
                              google.maps.event.addListener(map, 'zoom_changed', function (event) {
                                  if (infowindow)
                                      infowindow.close();

                              });
                              google.maps.event.addListener(infowindow, 'closeclick', function () {
                                  //InfoWindow when open at that time we disabled mapzoom functionlity and close time again enabled map zoom functility
                                  map.setOptions({ zoomControl: true, scrollwheel: true, disableDoubleClickZoom: false });
                              });
                              //google.maps.event.addListener($scope.markerCluster, "mouseover", function (cluster) {
                              //});
                              /*google.maps.event.addListener($scope.markerCluster, "mouseout", function (cluster) {                              
                                });*/

                              google.maps.event.addListener($scope.markerCluster, 'clusterclick', function (cluster) {
                                  if (infowindow) {
                                      infowindow.close();
                                  }

                                  var content = '';
                                  // Convert lat/long from cluster object to a usable MVCObject
                                  var info = new google.maps.MVCObject;
                                  info.set('position', cluster.center_);

                                  //Get markers
                                  var markers = cluster.getMarkers();
                                  $scope.markers = markers;
                                  var titles = "";
                                  //Get all the titles                              
                                  titles = '<div class="clustermarkerpopup content contentVertical">';
                                  for (var i = 0; i < markers.length; i++) {
                                      var LowRate = UtilFactory.GetLowFareForMap(markers[i].CustomMarkerInfo);
                                      titles += '<div class="destinations-list iw-destinations-list" ng-click="destinationpopupClick(markers[' + i + '])"> ' +
                                          '<div style="margin-bottom:3px;">' + '<div style="float:left">' +
                                            '<h6 style="margin:0;font-size:16px;">' + markers[i].CustomMarkerInfo.CityName + '</h6>' +
                                            '</div>' +
                                            '<div style="float:right">' +
                                            '<p style="margin:0;font-weight:500;"><span>' + UtilFactory.GetCurrencySymbol(markers[i].CustomMarkerInfo.CurrencyCode) + " " + Math.ceil(LowRate) + '</span></p>' +
                                            '</div> ' +
                                            '<div class="clear"></div></div>' +
                                            '<small style="font-weight:500;">' + markers[i].CustomMarkerInfo.airport_FullName + '</small>'
                                            + '</div>';
                                  }
                                  //----
                                  titles += '</div>';

                                  map.setOptions({ zoomControl: false, scrollwheel: false, disableDoubleClickZoom: true });

                                  var finaltitle = $compile(titles)($scope);
                                  infowindow.setContent(finaltitle[0]); //set infowindow content to titles                              
                                  infowindow.open(map, info);
                                  // adjusting info window height if there are less than 3 markers
                                  if (markers.length <= 3) {
                                      var iwWrapper = angular.element(document.getElementsByClassName('clustermarkerpopup'));
                                      iwWrapper.css({ height: (markers.length * 80) - ((markers.length - 1) * 15) + 'px' });
                                  }
                                  loadScrollbars();
                              });
                          }
                          $scope.clusterFlag = true;    // flag for solving cluster issue if theme/region multiple time clicked
                      }, 0, false);
                  }

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
                      $scope.faresList = [];
                      $scope.faresList = angular.copy(destinations);
                      $scope.showPosition(_.uniq($scope.faresList, function (destination) { return destination.DestinationLocation; }))
                  }

                  var RenderMap = function (maps) {
                      $scope.InfoWindow;
                      var bounds = new google.maps.LatLngBounds();
                      $scope.bounds = bounds;
                      selected = maps;
                      $scope.destinationMarkers = [];
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
                                  labelContent: '<div class="tooltip-arrow custom-arrow"></div><div class="tooltip-inner custom-tooltip-inner" title="' + airportName.airport_FullName + ', ' + airportName.airport_CityName + '"> ' + UtilFactory.GetCurrencySymbol(maps[x].CurrencyCode) + ' ' + Math.ceil(LowRate) + '</div>',
                                  labelAnchor: new google.maps.Point(12, 35),
                                  labelClass: "tooltip top custom-tooltip",
                                  labelInBackground: false,
                                  labelanimation: google.maps.Animation.DROP,
                                  animation: google.maps.Animation.DROP,
                                  CustomMarkerInfo: maps[x],
                                  labelStyle: { opacity: 1 },
                                  icon: '/images/mapicon.png'
                              });
                              bounds.extend(marker.position);
                              $scope.bounds.extend(marker.position);


                              var contentString = '<div style="min-width:100px;padding-top:5px;" id="content">' +
                                                      '<div class="col-sm-12 padleft0"><strong>'
                                                        + "(" + maps[x].DestinationLocation + ") " + airportName.airport_FullName + ', ' + airportName.airport_CityName + '</strong></div>' +
                                                        '<br /><div class="col-sm-12 padleft0">' +
                                                        '<label>Lowest fare: </label><strong class="text-success"> ' + maps[x].CurrencyCode + ' ' + maps[x].LowestFare + '</strong>' +
                                                '</div> ';

                              $scope.InfoWindow = new google.maps.InfoWindow();
                              var mapsdetails = maps[x];
                              $scope.destinationMarkers.push(marker);

                              google.maps.event.addListener(marker, 'click', (function (marker, contentString, infowindow) {
                                  return function () {
                                      var OriginairportName = _.find($scope.airportlist, function (airport) {
                                          return airport.airport_Code == $scope.origin.toUpperCase()
                                      });
                                      var DestinationairportName = _.find($scope.airportlist, function (airport) {
                                          return airport.airport_Code == marker.CustomMarkerInfo.DestinationLocation
                                      });

                                      var dataForecast = {
                                          "Origin": $scope.origin.toUpperCase(),
                                          "DepartureDate": $filter('date')(marker.CustomMarkerInfo.DepartureDateTime, 'yyyy-MM-dd'),
                                          "ReturnDate": $filter('date')(marker.CustomMarkerInfo.ReturnDateTime, 'yyyy-MM-dd'),
                                          "Destination": marker.CustomMarkerInfo.DestinationLocation
                                      };

                                      $rootScope.$broadcast('EmptyFareForcastInfo', {
                                          Origin: OriginairportName.airport_CityName,
                                          Destinatrion: DestinationairportName.airport_Code,
                                          Fareforecastdata: dataForecast,
                                          mapOptions: marker.CustomMarkerInfo, //mapsdetails,
                                          OriginairportName: OriginairportName,
                                          DestinationairportName: DestinationairportName,
                                          DestinationList: $scope.destinations,
                                          AvailableAirports: $scope.airportlist,
                                          AvailableAirline: $scope.airlineJsonData
                                      });
                                      google.maps.event.trigger($scope.destinationMap, 'resize');
                                  };
                              })(marker, contentString, $scope.InfoWindow));


                          }
                      }
                  };

                  var getMapUrlData = function (airportCode) {
                      var d = $q.defer();
                      var originairport = _.find($scope.airportlist, function (airport) {
                          return airport.airport_Code == airportCode.DestinationLocation
                      });

                      if (originairport != undefined) {
                          airportCode.lat = originairport.airport_Lat;
                          airportCode.lng = originairport.airport_Lng;
                          d.resolve(airportCode); // return the original object, so you can access it's other properties
                      } else {
                          //Missing Airport Details log 
                          UtilFactory.AirportCodeLog(airportCode.DestinationLocation);
                          d.resolve();
                      }
                      return d.promise;
                  }

                  $scope.$on('eventDestinationMapresize', function (event, args) {
                      google.maps.event.addListenerOnce($scope.destinationMap, 'idle', function () {
                          google.maps.event.trigger($scope.destinationMap, 'resize');
                      });
                      //google.maps.event.trigger($scope.destinationMap, 'resize');
                  });

                  $scope.resetMarker = function () {
                      $timeout(function () {
                          $scope.destinationMap.setZoom(2);
                          var latlng = new google.maps.LatLng($scope.defaultlat, $scope.defaultlng);
                          $scope.destinationMap.panTo(latlng);
                      }, 0, false);

                      $timeout(function () {
                          if ($scope.destinationMarkers.length > 0) {
                              for (var i = 0; i < $scope.destinationMarkers.length; i++)
                                  $scope.destinationMarkers[i].setMap(null);
                          }
                          if ($scope.markerCluster) {
                              $scope.markerCluster.clearMarkers();
                          }
                      }, 0, true);
                  }

                  function serialize(obj) {
                      var str = [];
                      for (var p in obj)
                          if (obj.hasOwnProperty(p)) {
                              var propval = encodeURIComponent(obj[p]);
                              if (propval != "undefined" && propval != "null" && propval != '')
                                  str.push(encodeURIComponent(p) + "=" + propval);
                          }
                      return str.join("&");
                  }
              }];

          directive.link = function (scope, elm, attrs) {
              scope.$watchGroup(['destinations', 'airportlist'], function (newValues, oldValues, scope) {
                  if (scope.clusterFlag) {
                      scope.clusterFlag = false;    // flag for solving cluster issue if theme/region multiple time clicked
                      scope.resetMarker();
                      if (scope.destinations != undefined && scope.destinations.length > 0) {
                          scope.displayDestinations(scope.destinations);
                          scope.setMarkerCluster();
                      }
                      else
                          scope.clusterFlag = true;    // flag for solving cluster issue if theme/region multiple time clicked
                  }
              });

              function setAirportMarkerOnMap() {
                  var airportLoc = new google.maps.LatLng($scope.googleattractionParams.DestinationairportName.airport_Lat, $scope.googleattractionParams.DestinationairportName.airport_Lng);
                  var marker = new MarkerWithLabel({
                      position: airportLoc,
                      map: $scope.googleattractionsMap,
                      title: $scope.googleattractionParams.DestinationairportName.airport_FullName,
                      labelAnchor: new google.maps.Point(12, 35),
                      labelInBackground: false,
                      visible: true,
                      animation: google.maps.Animation.DROP,
                      labelStyle: { opacity: 0.75 },
                      icon: 'images/attraction-marker/airport-marker.png'
                  });

                  $scope.bounds.extend(airportLoc);
              }
          }
          return directive;
      }]);
