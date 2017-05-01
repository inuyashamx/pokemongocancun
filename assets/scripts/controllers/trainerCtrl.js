angular.module("myApp").controller("trainerCtrl", ['$scope', 'F', '$timeout', '$location', function($scope, F, $timeout, $location) {

    $scope.checkForm = function(trainer, team) {
        var disabled = false;

        if ((trainer === '') || (typeof trainer === 'undefined')) {
            disabled = true;
        }

        if ((team === '') || (typeof team === 'undefined')) {
            disabled = true;
        }

        return disabled;
    }

    $scope.saveTrainer = function(trainer, team) {
        
        F.db.child("users").child(F.user.key).update({
            trainer: trainer,
            team: team,
            validate: trainer.toLowerCase()
        });
        
        $location.path("/chat");
        
    }

    console.log("Loaded trainer");

}]);