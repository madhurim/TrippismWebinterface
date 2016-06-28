
angular.module('TrippismUIApp').directive('attractionList', ['$sce', '$rootScope', '$timeout', 'GoogleAttractionFactory', 'UtilFactory', 'urlConstant', function ($sce, $rootScope, $timeout, GoogleAttractionFactory, UtilFactory, urlConstant) {
    return {
        restrict: 'E',
        scope: {
            attractions: '=',
            attractionmap: '=',
            attractiontabindex: '=',
            loadMoreAttractionInfo: "&",
            loadAttractionInfo: "&"
        },
        templateUrl: urlConstant.partialViewsPath + 'attractionsListPartial.html',
        link: function (scope, elem, attrs) {
            scope.attractionsData = [];
            var attractionsData = _.sortBy(GoogleAttractionFactory.getAttractionList(), 'rank');

            //create attraction object from factory object
            attractionsData.forEach(function (item) {
                scope.attractionsData.push({
                    name: item.name, displayName: item.attractionText, data: null, isActive: item.isDefault, htmlClass: item.htmlClass, isDisplay: item.name == "hotels" ? null : true
                });
            });

            scope.$on('HotelData', function (event, data) {
                _.findWhere(scope.attractionsData, { name: 'hotels' }).isDisplay = true;
                if (!isTabClicked)
                    scope.loadAttractions('hotels', true);
            });

            scope.isAttractionCollapsed = true;
            scope.isAttractions = true;
            scope.attractionstoDisp = [];
            var isTabClicked = false;

            scope.getAttractionsList = function () {
                scope.isAttractionFound = true;
                if (scope.attractions != undefined && scope.attractions.length != 0) {
                    if (scope.attractions.results != undefined && scope.attractions.results.length > 0) {
                        // find attraction with same type from attractionData
                        var attraction = _.find(scope.attractionsData, function (item) { return scope.attractions.type === item.name; });
                        if (attraction) {
                            scope.attractionstoDisp = [];
                            var results = scope.attractions.results;
                            if (results.length > 0) {
                                for (var i = 0; i < results.length; i++) {
                                    var raitingToAppend = "";
                                    if (results[i].rating != undefined)
                                        raitingToAppend = $sce.trustAsHtml(getRatings(results[i].rating));
                                    var placedetails = {
                                        geometry: results[i].geometry,
                                        name: results[i].name,
                                        //Placeaddress: $sce.trustAsHtml(results[i].vicinity),
                                        vicinity: results[i].vicinity,
                                        place_id: results[i].place_id,
                                        raitingToAppend: raitingToAppend,
                                        type: scope.attractions.type,
                                        details: results[i].details,
                                        provider: results[i].provider,
                                        locationId: results[i].locationId
                                    };
                                    scope.attractionstoDisp.push(placedetails);
                                }
                            }

                            // add into attraction's data to fetch again without API call
                            attraction.data = scope.attractionstoDisp;
                        }
                    }
                    else
                        scope.isAttractionFound = false;
                }
            }

            scope.selectPlace = function (place) {
                var sliderdata = {
                    tabIndex: scope.attractiontabindex,
                    place: place,
                };
                $rootScope.$broadcast('onMarkerPopup', sliderdata);
            };

            scope.$watch('attractions', function (newValue, oldValue) {
                if (newValue != oldValue) {
                    scope.service = new google.maps.places.PlacesService(scope.attractionmap);
                    scope.getAttractionsList();
                    loadScrollbars();
                    updateScrollbars(); // update horizontal scroll bar
                }
            });

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
            // used to get more attraction using GoogleAttractionDirective
            scope.loadMoreAttractions = function () {
                scope.loadMoreAttractionInfo();
            }

            scope.loadAttractions = function (type, keepOpen) {
                isTabClicked = true;
                // for setting <li> tag active class            
                if (type == 'btn')
                    scope.isAttractionCollapsed = !scope.isAttractionCollapsed;
                else {
                    // find attraction with same type from attractionData
                    var attraction = _.find(scope.attractionsData, function (item) { return item.name === type; });
                    if (attraction) {
                        // if attraction tab is currently opened then just collepse attraction section
                        if (attraction.isActive && !keepOpen) {
                            scope.isAttractionCollapsed = !scope.isAttractionCollapsed;
                            return;
                        }
                        else {
                            scope.isAttractions = false;
                            scope.attractionsData.forEach(function (item) {
                                if (item.name == type) {
                                    // if attraction with same type found in attractionData then set it as active tab.
                                    item.isActive = true;
                                    // if it contains data then fetch it else request from API.
                                    if (item.data) {
                                        scope.isAttractionFound = true;
                                        scope.attractionstoDisp = attraction.data;
                                        $timeout(function () {
                                            updateScrollbars(); // update horizontal scroll bar
                                        }, 0, false);
                                        scope.loadAttractionInfo({ type: type });
                                    }
                                    else {
                                        scope.attractionstoDisp = [];
                                        scope.loadAttractionInfo({ type: type });
                                    }
                                }
                                else
                                    item.isActive = false;
                            });
                        }
                        scope.isAttractionCollapsed = true;
                    }
                }
            }

            scope.$on('showHotelDetailsOnMap', function () {
                scope.loadAttractions('hotels', true);
            });

            scope.amountBifurcation = function (value) { return UtilFactory.amountBifurcation(value); };
            scope.GetCurrencySymbol = function (code) {
                return UtilFactory.GetCurrencySymbol(code);
            }
        }
    }
}]);
