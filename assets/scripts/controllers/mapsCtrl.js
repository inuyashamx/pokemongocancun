angular.module("myApp").controller("mapsCtrl", ['$scope', 'F', '$timeout', '$mdDialog', '$location', function($scope, F, $timeout, $mdDialog, $location) {
    var listRef = F.db.child("list");

    listRef.on("value", function(snapshot) {
        $scope.maps = Object.keys(snapshot.val()).map(function(key) {
            return snapshot.val()[key];
        });
        $timeout(function() {});
    });

    $scope.NewMap = function() {
        if (!F.user) {
            F.getUser();
        }
        else {
            $location.path("/new");
        }
    }
}]);