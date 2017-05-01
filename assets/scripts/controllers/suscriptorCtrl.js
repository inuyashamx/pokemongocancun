angular.module("myApp").controller("suscriptorCtrl", ['$scope', 'F', '$timeout', '$routeParams', '$location', function($scope, F, $timeout, $routeParams, $location) {

    var userRef = F.db.child("maps").child($routeParams.map).child("users").child("suscriptions").child($routeParams.key);
    $scope.UserKey = $routeParams.key;
   
    userRef.on("value", function(snapshot) {
        var profile = snapshot.val();
        $scope.profile = profile;
        var total = profile.likes + profile.dislikes;
        if (total > 0) {
            $scope.reputation = parseInt((profile.likes / total) * 100);
        }
        else {
            $scope.reputation = 0;
        }
        $timeout(function() {});
    });

}]);