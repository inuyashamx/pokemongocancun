angular.module("myApp").controller("logsMapCtrl", ['$scope', 'F', '$routeParams', function($scope, F, $routeParams) {
    $scope.mapKey = $routeParams.map;
}]);