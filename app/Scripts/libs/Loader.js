angular.module('TrippismUIApp')
    .directive('uiLoader', ['$compile', '$http', function ($compile, $http) {
        return {
            restrict: 'A',
            scope: {
                isLoading: '=?isloading',
                isHttpCalling: '=?'
            },
            link: function (scope, element, attrs) {

                var options = attrs;
                var templateScope;
                var templateElement;

                if (scope.isHttpCalling == undefined) {
                    scope.isHttpCalling = false;
                }

                scope.ishttpLoading = function () { return $http.pendingRequests.length > 0; }

                function ShowLoader(isshow) {
                    if (!templateScope) {
                        templateScope = scope;
                    }
                    if (isshow) {
                        
                        var template = '<div id="uiloader" class="' + options.wrapperclass + '"></div>';
                        templateElement = $compile(template)(templateScope);
                        var height = element[0].offsetHeight + 'px';
                        var width = element[0].offsetWidth + 'px';
                        //var rect = element[0].getBoundingClientRect();
                        angular.element(templateElement)
                                .css('position', 'absolute')
                                .css('top', 0)
                                //.css('left', 0)
                                //.css('right', 0)
                                .css('bottom', 0)
                                //.css('height', height)
                                .css('height', 'auto')
                                .css('width', width)
                                .css('z-index', 1001);
                        if (angular.element(element[0]).hasClass('modal-body')) {
                            angular.element(templateElement).css('left', 0);
                        }
                        element.append(templateElement);
                    } else {
                        if (templateElement) {
                            templateElement.remove();
                        }
                    }
                }

                scope.$watch('isLoading', function (v) {
                    ShowLoader(v);
                });

                scope.$watch(scope.ishttpLoading, function (v) {
                    if (scope.isHttpCalling) {
                        ShowLoader(v);
                    }
                });
            }
        }
    }]);
