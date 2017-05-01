angular.module("myApp")
    .directive("logs", [function() {
        return {
            restrict: "AEC",
            replace: true,
            scope: {
                origin: '@',
                key: '@'
            },
            controller: "logsCtrl",
            templateUrl: "views/logs.html"
        }
    }]);