(function () {
    angular.module('TrippismUIApp').controller('AttractionPopupController', ['$scope', 'attractionData', 'UtilFactory', 'GoogleAttractionFactory', '$sce', AttractionPopupController]);
    function AttractionPopupController($scope, attractionData, UtilFactory, GoogleAttractionFactory, $sce) {
        $scope.IsMapPopupLoading = false;
        $scope.slides = [];
        $scope.addSlides = addSlides;
        function addSlides(photos) {
            for (var photoidex = 0; photoidex < photos.length; photoidex++)
                $scope.slides.push(photos[photoidex]);
        };

        function SetMarkerSlider(attractionData) {
            $scope.slides = [];
            $scope.IsMapPopupLoading = true;
            $scope.isAttrDataFound = true;
            if (attractionData.type == "hotels") {
                if (attractionData.geometry) {
                    var data = {
                        Latitude: attractionData.geometry.location.lat,
                        Longitude: attractionData.geometry.location.lng,
                        radius: 200,
                        name: attractionData.name
                    };
                    $scope.attractionMessage = 'Getting hotel details';
                    $scope.googleattractionpromise = GoogleAttractionFactory.googleAttraction(data).then(function (data) {
                        if (data && data.results && data.results.length) {
                            attractionData.place_id = data.results[0].place_id;
                            getPlaceDetails(attractionData);
                        }
                        else
                            setDefaultPopupDetails(attractionData);
                    });
                }
                else
                    setDefaultPopupDetails(attractionData);
            }
            else
                getPlaceDetails(attractionData);
        }

        function setDefaultPopupDetails(attractionData) {
            $scope.IsMapPopupLoading = false;
            $scope.locationDetail = {
                AttractionType: attractionData.type
            }
            if ($scope.locationDetail.AttractionType == 'hotels') {
                $scope.locationDetail.FreeWifiInRooms = attractionData.details.FreeWifiInRooms;
                $scope.locationDetail.RateRange = attractionData.details.RateRange;
                $scope.locationDetail.PlaceName = attractionData.name.toLowerCase();
                $scope.locationDetail.Placeaddress = $sce.trustAsHtml(attractionData.Placeaddress);
            }
        }

        function getPlaceDetails(attractionData) {
            $scope.locationDetail = {
                PhoneNo: undefined,
                raitingToAppend: undefined,
                PlaceName: undefined,
                Placeaddress: undefined,
                AttractionType: attractionData.type
            }
            if ($scope.locationDetail.AttractionType == 'hotels') {
                $scope.locationDetail.FreeWifiInRooms = attractionData.details.FreeWifiInRooms;
                $scope.locationDetail.RateRange = attractionData.details.RateRange;
            }

            $scope.attractionReviews = [];
            var service = new google.maps.places.PlacesService($scope.googleattractionsMap);
            var request = { placeId: attractionData.place_id };
            service.getDetails(request, function (place, status) {
                $scope.IsMapPopupLoading = false;
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    if (place.photos != null && place.photos.length > 0) {
                        var photos = [];
                        for (var photoidx = 0; photoidx < place.photos.length; photoidx++) {
                            var Imgsrc = place.photos[photoidx].getUrl({ 'maxWidth': 570, 'maxHeight': 400 });
                            var objtopush = { image: Imgsrc, text: "" };
                            photos.push(objtopush);
                        }
                        $scope.addSlides(photos);
                    }
                    if ($scope.locationDetail.AttractionType == 'hotels') {
                        $scope.locationDetail.PlaceName = attractionData.name;
                        $scope.locationDetail.Placeaddress = $sce.trustAsHtml(attractionData.vicinity);
                    }
                    else {
                        $scope.locationDetail.PlaceName = place.name;
                        $scope.locationDetail.Placeaddress = $sce.trustAsHtml(place.adr_address);
                    }
                    if (place.formatted_phone_number != undefined)
                        $scope.locationDetail.PhoneNo = place.formatted_phone_number;

                    if (place.rating != undefined)
                        $scope.locationDetail.raitingToAppend = $sce.trustAsHtml(getRatings(place.rating));

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
                    window.setTimeout(function () { loadScrollbars(); }, 0);
                }
            });
        }

        $scope.dismiss = function () {
            $scope.$dismiss('cancel');
        };

        $scope.amountBifurcation = function (value) { return UtilFactory.amountBifurcation(value); };
        $scope.GetCurrencySymbol = function (code) {
            return UtilFactory.GetCurrencySymbol(code);
        }

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

        SetMarkerSlider(attractionData);
    }
})();