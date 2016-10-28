(function () {
    'use strict';
    var controllerId = 'BaseController';
    angular.module('TrippismUIApp').controller(controllerId,
        ['$scope', '$modal', '$rootScope', 'UtilFactory', 'urlConstant', 'LocalStorageFactory', 'dataConstant', 'BaseFactory', 'tmhDynamicLocale', '$locale', '$q', BaseController]);

    function BaseController($scope, $modal, $rootScope, UtilFactory, urlConstant, LocalStorageFactory, dataConstant, BaseFactory, tmhDynamicLocale, $locale, $q) {
        $rootScope.isShowAlerityMessage = true;
        $scope.currencyList;

        init();

        function init() {
            UtilFactory.ReadAirportJson();
            UtilFactory.GetCurrencySymbols();
            UtilFactory.ReadHighRankedAirportsJson();
            setauthenticationLabel();
            getLocale();
        }

        function buidCurrencyDropDown() {
            UtilFactory.GetCurrencySymbols().then(function (data) {
                getfilterCurrencyInfo(data);
            });
        }


        // Getting user loacle
        function getLocale() {
            return BaseFactory.getLocale().then(function (data) {
                if (data) {
                    var anonoymousdata = {
                        City: data.city,
                        Region: data.region,
                        Country: data.country,
                        Ipaddress: data.ip
                    }
                    tmhDynamicLocale.set("en-" + (data.country).toLowerCase());
                    var guidDetail = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
                    guidDetail = (guidDetail) ? ((guidDetail.Guid) ? guidDetail.Guid : false) : false;
                    if (!guidDetail) {
                        return BaseFactory.storeAnonymousData(anonoymousdata).then(function (data) {
                            if (data) {
                                LocalStorageFactory.save(dataConstant.GuidLocalstorage, { Guid: data });
                                return data;
                            }
                        });
                    }
                    return guidDetail;
                }
                else {
                    $rootScope.format = 'MM/dd/yyyy';
                    return null;
                }
            });
        }

        $rootScope.getGuid = function () {
            var objguid = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            if (objguid && objguid.Guid) {
                var defer = $q.defer();
                defer.resolve({ Guid: objguid.Guid });
                return defer.promise;
            }
            else {
                return getLocale.then(function (data) {
                    return objguid = data.Guid;
                });
            }
        }

        // filter Currecncy data on based Currency List
        function getfilterCurrencyInfo(currencyData) {
            // Get Base CurrencyCode
            var currencyCode = $rootScope.base;

            var currencyList = dataConstant.currencyList;
            $scope.currencyList = [];

            // Check currency into CurrencyList exits or not 
            var exitsCurrency = _.find(currencyList, function (i) { return i.CurrencyCode == currencyCode });

            //iF New currencyCode Find then set or Add into drop down as a Default
            if (!exitsCurrency) {
                // Find currencuCode from CurrencyData
                var currency = _.find(currencyData, function (i) { return i.code == currencyCode; });
                var symbol = (currency) ? (currency.code + " - " + currency.symbol) : currencyCode;

                $scope.currencyList.push({
                    code: (currency) ? currency.code : currencyCode,
                    symbol: symbol
                });
            }

            // Bind CurrencyList into CurrencyCode DropDown
            _.each(currencyList, function (item) {

                $scope.currencyList.push({
                    code: item.CurrencyCode,
                    symbol: item.CurrencyCode + " - " + item.CurrencySymbol
                });
            });

            // Set Selected CurrencyCode
            $scope.currencyCode = $rootScope.currencyInfo.currencyCode;
        }

        $scope.aboutUs = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'aboutUsPartial.html',
                controller: 'FeedbackController',
            });
        };
        $scope.feedback = function () {
            var GetFeedbackPopupInstance = $modal.open({
                templateUrl: urlConstant.partialViewsPath + 'feedbackDetailFormPartial.html',
                controller: 'FeedbackController',
                scope: $scope,
            });
        }

        function setauthenticationLabel() {
            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            $scope.IsUserLogin = (userInfo) ? ((userInfo.IsLogin && userInfo.IsLogin == 1) ? ((userInfo.Username) ? true : false) : false) : false;
            if ($scope.IsUserLogin)
                $scope.userName = userInfo.Username;

            return $scope.IsUserLogin;
        }

        $rootScope.base;
        $scope.currencyCodeChange = function (code) {
            $rootScope.currencypromise = '';
            $scope.currencyCode = code;

            $rootScope.currencyCode = code;

            var IsSameCurrency = (code == $rootScope.currencyInfo.currencyCode) ? false : true;
            if (IsSameCurrency) {
                $rootScope.currencypromise = $rootScope.changeRate($rootScope.base).then(function (data) {
                    $scope.$broadcast('setExchangeRate');
                });
            }
        }

        $scope.$on('currencyChange', function (event, args) {
            $rootScope.base = args.currencyCode;
            $rootScope.changeRate($rootScope.base);
        });

        // also used to stop image slider [HomeController]
        $scope.$on('bodyClass', function (event, args) {
            $scope.bodyClass = args;
        });
        function getConversionRate(currentCurrencyCode, exchangeCurrencyCode) {
            var currencyConversionDetail = {
                base: currentCurrencyCode,
                target: exchangeCurrencyCode,
                timestamp: new Date()
            };
            return UtilFactory.getCurrencyConversion(currencyConversionDetail).then(function (data) {
                return data;
            });
        }
        $rootScope.changeRate = function (baseCode) {
            $rootScope.base = baseCode;
            var target = ($rootScope.currencyCode) ? $rootScope.currencyCode : baseCode;
            return getConversionRate($rootScope.base, target).then(function (data) {
                var currencyConversionRate = data;
                $rootScope.currencyInfo = {
                    rate: currencyConversionRate.rate,
                    symbol: currencyConversionRate.currencySymbol,
                    currencyCode: currencyConversionRate.currencyCode
                }
                buidCurrencyDropDown();
                return currencyConversionRate;
            });
        };

        $scope.$on('$localeChangeSuccess', function () {
            $rootScope.format = $locale.DATETIME_FORMATS.mediumDate;
        });

        $rootScope.setdefaultcurrency = function (target) {
            $scope.currencyCode = target;
            $rootScope.currencyCode = $scope.currencyCode;
        }

        $rootScope.loginPoupup = function (AddLike) {
            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            var ForAddLike = (AddLike) ? true : false;
            if (userInfo && userInfo.IsLogin && userInfo.IsLogin == 1 && userInfo.Username) {
                var d = $q.defer();
                d.resolve(true);
                return d.promise;
            }
            else {
                var d = $q.defer();
                return $modal.open({
                    templateUrl: urlConstant.partialViewsPath + 'loginPopUp.html',
                    controller: 'loginController',
                    scope: $scope,
                    resolve: {
                        AddLike: ForAddLike
                    }
                }).result.then(function (data) {
                    setauthenticationLabel();
                    $scope.$broadcast('setLogin', { IsLogin: true });
                    d.resolve(data);
                    return d.promise;
                }, function () {
                    setauthenticationLabel();
                    d.resolve(false);
                    return d.promise;
                });
            }
        }
        $scope.logOut = function () {
            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            if (userInfo && userInfo.IsLogin && userInfo.IsLogin == 1) {
                LocalStorageFactory.update(dataConstant.GuidLocalstorage, { IsLogin: 0, Username: undefined });
                $scope.IsUserLogin = false;
                $scope.$broadcast('setLogin', { IsLogin: false });
            }
            var IsLogin = setauthenticationLabel();
            return IsLogin;
        }
        $scope.changePwd = function () {
            var userInfo = LocalStorageFactory.get(dataConstant.GuidLocalstorage);
            if (userInfo && userInfo.IsLogin && userInfo.IsLogin == 1) {
                var GetEmailDetPopupInstance = $modal.open({
                    templateUrl: urlConstant.partialViewsPath + 'changePasswordPartial.html',
                    controller: 'changePasswordController'
                });
            }
            else {
                $rootScope.loginPoupup().then(function (data) {
                    setauthenticationLabel();
                });
            }
        }
    }
})();

