angular.module('TrippismUIApp').directive('backButtonHandle',
                                            ['$compile',
                                                '$rootScope',
                                                '$location',
                                               '$filter',
                                                'TrippismConstants',
        function ($compile, $rootScope, $location,$filter, TrippismConstants) {
            return {
                restrict: 'E',
                scope: {
                },
                controller: function ($scope) {
                    $scope.$on('onBackButtonClicked', function (event, args) {
                        //for see destinations search
                        if ($location.$$url == TrippismConstants.destSearchURL) {
                            args.ViewDestination();
                        }
                            // tab management
                        else if ($location.$$url.indexOf("destination") != -1 && $location.$$url.indexOf("-") != -1) { // if url e.g. www.abc.com/destination/org-dest than
                            // if url contains "/"
                            if ($location.$$url.indexOf("/") != -1) {
                                var orgdest = $location.search().Origin;
                                //get origin code
                                var orgCode = orgdest.split("-")[0].trim();
                                //get destination code
                                var destCode = orgdest.split("-")[1].trim();
                                //get matchTab by title with comparing all the tabs
                                //Find Tab Detail from TabItems and if found then activate that tab
                                var filtertab = _.find(args.tabManager.tabItems, function (item) {
                                    return item.title == orgCode + ' - ' + destCode &&
                                           $filter('date')(item.parametersData.SearchCriteria.FromDate, 'yyyy-MM-dd') == $filter('date')($location.search().DepartureDate, 'yyyy-MM-dd') &&
                                        $filter('date')(item.parametersData.SearchCriteria.ToDate, 'yyyy-MM-dd') == $filter('date')($location.search().ReturnDate, 'yyyy-MM-dd')
                                });
                                if (filtertab != undefined) {
                                    args.tabManager.select(args.tabManager.tabItems.indexOf(filtertab));
                                }
                            }
                        }
                    });
                },
                link: function (scope, elem, attrs) {
                }
            }
        }]);
