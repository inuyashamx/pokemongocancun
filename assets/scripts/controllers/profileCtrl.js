angular.module("myApp").controller("profileCtrl", ['$scope', 'F', '$timeout', '$routeParams', function($scope, F, $timeout, $routeParams) {

    var userRef = F.db.child("users").child($routeParams.key);
    

    userRef.on("value", function(snapshot) {
        var profile = snapshot.val();
        $scope.profile = profile;
        if (typeof profile.likes !== "undefined") {
            var total = profile.likes + profile.dislikes; 
            $scope.reputation =  parseInt((profile.likes/total)*100) ;
        }
        else{
            $scope.reputation = 0;
        }
    });

}]);