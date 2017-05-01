angular.module("myApp")
    .directive("message", [function() {
        return {
            restrict: "AEC",
            replace: true,
            scope: {
                item: '=',
                map: '@city'
            },
            controller: "messageCtrl",
            templateUrl: "views/message.html"
        }
    }])
    .directive('onFinishRender', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function() {
                        scope.$emit(attr.onFinishRender);
                    });
                }
            }
        }
    })
    .directive('imageonload', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('load', function() {
                    $timeout(function() {
                        scope.$emit(attrs.imageonload);
                    });
                });
            }
        };
    })
    .directive('messagehtml', ['$timeout','$sanitize',
        function($timeout,$sanitize) {
            return {
                restrict: 'A',
                replace: false,
                scope: {
                    ngModel: '=',
                },
                link: function(scope, element, attrs) {
                    
                    element.html($sanitize(scope.ngModel));
                    
                    
                    angular.forEach(element.find("img"), function(value, key) {
                        console.log(value);
                        var a = angular.element(value);
                        a.bind('load', function() {
                            $timeout(function() {
                            scope.$emit(attrs.messagehtml);
                            });
                        });
                    });
                }
            };
        }
    ]);