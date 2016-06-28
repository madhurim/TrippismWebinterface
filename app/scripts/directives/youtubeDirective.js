
angular.module('TrippismUIApp').directive('youtubeInfo', ['YouTubeFactory', 'urlConstant',
    function (YouTubeFactory, urlConstant) {
        return {
            restrict: 'E',
            scope: {
                youtubeParams: '=',
            },
            templateUrl: urlConstant.partialViewsPath + 'youtubePartial.html',
            controller: ['$scope', function (scope) {
                scope.curPage = 0;
                scope.pageSize = 10;
                scope.isDataLoadedFirstTime = false;

                scope.loadyoutubeInfo = function (nextTokenID, prevTokenID) {
                    scope.youtubeInfoLoaded = false;
                    scope.youtubeInfoDataFound = false;
                    // scope.youtubeData = "";
                    if (scope.youtubeParams != undefined) {
                        var parameters = scope.youtubeParams.DestinationAirport.airport_Lat + "," + scope.youtubeParams.DestinationAirport.airport_Lng;
                        if (nextTokenID != null) {
                            scope.curPage = scope.curPage + 1;
                            parameters += "&pageToken=" + nextTokenID
                        }
                        else if (prevTokenID != null) {
                            scope.curPage = scope.curPage - 1;
                            parameters += "&pageToken=" + prevTokenID
                        }

                        var data = {
                            "location": parameters
                        };

                        if (scope.youtubeInfoLoaded == false) {
                            scope.youtubepromise = YouTubeFactory.youTube(data).then(function (data) {
                                if (data.status != 200) {
                                    scope.youtubeInfoDataFound = false;
                                    return;
                                }
                                scope.isDataLoadedFirstTime = true;
                                scope.youtubeData = data;

                                if (scope.youtubeData.nextPageToken != null)
                                    scope.nextToken = scope.youtubeData.nextPageToken;

                                if (scope.youtubeData.prevPageToken != null)
                                    scope.prevToken = scope.youtubeData.prevPageToken;

                                scope.numberOfPages = Math.ceil(scope.youtubeData.pageInfo.totalResults / scope.pageSize);
                                if ((scope.curPage + 1) >= scope.numberOfPages)
                                    scope.isdisabled = 0;
                                else
                                    scope.isdisabled = 1;

                                scope.youtubeInfoDataFound = true;

                                loadScrollbars();
                                angular.element('.news-block .contentHorizontal').mCustomScrollbar('scrollTo', 'top');
                            });
                        }
                        scope.youtubeInfoLoaded = true;
                    }
                };
            }],
            link: function (scope, elem, attrs) {
                var youtubeTblheight = ($(window).height() - 100) + 'px';
                $('.ytubetabletbody').each(function (i, obj) {
                    $(this).css('height', youtubeTblheight);
                });

                scope.youtubeInfoDataFound = false;
                scope.$watchGroup(['youtubeParams'], function (newValue, oldValue, scope) {
                    if (newValue[0] && newValue[0].DestinationAirport != undefined) {
                        scope.youtubeData = "";
                        scope.loadyoutubeInfo();
                    }
                });
            }
        }
    }]);