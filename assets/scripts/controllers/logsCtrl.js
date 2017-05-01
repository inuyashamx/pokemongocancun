angular.module("myApp").controller("logsCtrl", ['$scope', 'F','$timeout', function($scope, F, $timeout) {

    $scope.timeSince = function(time) {
        return F.timeSince(time);
    }

    F.db.child("logs").child($scope.origin).child($scope.key).on("value", function(snapshot) {
        $scope.logs = snapshot.val();
        $timeout(function() {});
    });

}]);