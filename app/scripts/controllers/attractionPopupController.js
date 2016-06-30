(function () {
    angular.module('TrippismUIApp').controller('AttractionPopupController', ['$scope', '$sce', '$timeout', 'attractionData', 'UtilFactory', 'GoogleAttractionFactory', 'TripAdvisorAttractionFactory', AttractionPopupController]);
    function AttractionPopupController($scope, $sce, $timeout, attractionData, UtilFactory, GoogleAttractionFactory, TripAdvisorAttractionFactory) {
        $scope.IsMapPopupLoading = false;
        $scope.slides = [];
        $scope.addSlides = addSlides;
        $scope.provider = "Google+";
        $scope.isPhotoLoading = false;
        var service = new google.maps.places.PlacesService($scope.attractionsMap);
        init(attractionData);
        function addSlides(photos) {
            for (var i = 0; i < photos.length; i++)
                $scope.slides.push(photos[i]);
        };

        function init(attractionData) {
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
                    GoogleAttractionFactory.googleAttraction(data).then(function (data) {
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
            else if (attractionData.provider == "TripAdvisor") {
                $scope.provider = "TripAdvisor";
                var request = {
                    LocationId: attractionData.locationId,
                    Name: attractionData.name,
                    Latitude: attractionData.geometry.location.lat,
                    Longitude: attractionData.geometry.location.lng
                };
                $scope.isPhotoLoading = true;
                TripAdvisorAttractionFactory.getLocation(request).then(function (data) {
                    $scope.IsMapPopupLoading = false;
                    if (data) {
                        if (data.GooglePlaceId) {
                            var request = { placeId: data.GooglePlaceId };
                            service.getDetails(request, function (place, status) {
                                $timeout(function () {
                                    $scope.isPhotoLoading = false;
                                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                                        if (place.photos != null && place.photos.length > 0) {
                                            var photos = [];

                                            for (var i = 0; i < place.photos.length; i++) {
                                                var Imgsrc = place.photos[i].getUrl({ 'maxWidth': 570, 'maxHeight': 400 });
                                                var objtopush = { image: Imgsrc, text: "" };
                                                photos.push(objtopush);
                                            }
                                            $scope.addSlides(photos);
                                        }
                                    }
                                }, 0, true);
                            });
                        }
                        else
                            $scope.isPhotoLoading = false;

                        $timeout(function () {
                            $scope.locationDetail = {};
                            $scope.attractionReviews = [];
                            $scope.locationDetail.PlaceName = data.Name.toLowerCase();
                            var street2 = data.Address.Street2;
                            var address = data.Address.Street1 + (street2 ? ', ' + street2 : '');
                            $scope.locationDetail.Placeaddress = $sce.trustAsHtml(address + ', ' + data.LocationDetail);
                            $scope.locationDetail.raitingToAppend = data.RatingImageUrl;
                            $scope.locationDetail.NumReviews = data.NumReviews;
                            $scope.locationDetail.WebUrl = data.WebUrl;
                            for (var i = 0; i < data.Reviews.length; i++) {
                                var review = data.Reviews[i];
                                $scope.attractionReviews.push({
                                    author_name: null,
                                    text: review.Text,
                                    rating: $sce.trustAsHtml(getRatings(review.Rating)),
                                    time: review.PublishedDate,
                                    raitingToAppend: review.RatingImageUrl,
                                    author_name: review.User.UserName
                                });
                            }
                        }, 0, true);
                    }
                    else {
                        setDefaultPopupDetails(attractionData);
                        $scope.isPhotoLoading = false;
                    }
                });
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
            else if (attractionData.provider == 'TripAdvisor') {
                $scope.locationDetail.PlaceName = attractionData.name.toLowerCase();
                $scope.locationDetail.Placeaddress = $sce.trustAsHtml(attractionData.vicinity);
                $scope.locationDetail.raitingToAppend = attractionData.raitingToAppend;
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
            var request = { placeId: attractionData.place_id };
            service.getDetails(request, function (place, status) {
                $scope.IsMapPopupLoading = false;
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    if (place.photos != null && place.photos.length > 0) {
                        var photos = [];
                        for (var i = 0; i < place.photos.length; i++) {
                            var Imgsrc = place.photos[i].getUrl({ 'maxWidth': 570, 'maxHeight': 400 });
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
                                    rating: $sce.trustAsHtml(getRatings(place.reviews[i].rating)),
                                    time: place.reviews[i].time
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

                for (var i = 0; i < stars.length; i++)
                    ratingDiv += "<li class='star'><i class='fa fa-star'></i></li>";

                ratingDiv += "</ul>";
                ratingDiv += "<ul class='rating foreground readonly'  style='width:" + filledInStarsContainerWidth + "%'>";

                for (var i = 0; i < stars.length; i++)
                    ratingDiv += "<li class='star filled'><i class='fa fa-star'></i></li>";
            }
            ratingDiv += "  </ul></div>";
            return ratingDiv;
        }
    }
})();