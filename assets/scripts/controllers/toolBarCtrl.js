angular.module("myApp").controller("toolbarCtrl", ['$rootScope', '$scope', 'F', '$timeout', '$window', '$mdSidenav', '$mdDialog', function($rootScope, $scope, F, $timeout, $window, $mdSidenav, $mdDialog) {

    $scope.F = F;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            F.position = position;
            $rootScope.$emit("positionReady", true);
        });
    }

    $scope.openLeftMenu = function() {
        $mdSidenav('left').toggle();
    };
  
    $scope.setSubscription = function() {
        if (!F.isSubscribed) {
            F.unsubscribe();
        }
        else {
            F.subscribe();
        }
    }

    $scope.logout = function(ev) {
        firebase.auth().signOut().then(function() {

            $scope.closeNav();

            $mdDialog.show(
                $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(true)
                .title('Disconnected')
                .textContent('Your account has been disconnected')
                .ariaLabel('Disconnect')
                .ok('Ok')
                .targetEvent(ev)
            );

        }, function(error) {
            // An error happened.
        });
    }

    $scope.closeNav = function() {
        $mdSidenav('left').close();
    };

}]);