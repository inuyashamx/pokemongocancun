angular.module("myApp").controller("adminCtrl", ['$scope', 'F', '$routeParams', '$timeout', '$location', function($scope, F, $routeParams, $timeout, $location) {

    var mainRef = F.db.child("maps").child($routeParams.map).child("users");
    var usersRef = mainRef.child("suscriptions");
    var exceptionsRef = mainRef.child("exceptions");
    var ownersRef = mainRef.child("owners");
    var adminsRef = mainRef.child("admins");
    var mapRef = F.db.child("list").child($routeParams.map);

    $scope.usersExceptions = [];

    mapRef.on("value", function(snapshot) {
        if (snapshot.exists()) {
            F.mapData = snapshot.val();
        }
        else {
            $location.path("/");
        }
        $timeout(function() {});
    });

    ownersRef.on("value", function(snapshot) {
        $scope.owners = snapshot.val();
    });

    adminsRef.on("value", function(snapshot) {
        $scope.admins = snapshot.val();
        $timeout(function() {});
    });

    usersRef.on("value", function(snapshot) {

        $scope.users = [];

        snapshot.forEach(function(childSnapshot) {

            var userkey = childSnapshot.key;

            var tempUser = {
                trainer: childSnapshot.val().trainer,
                team: childSnapshot.val().team,
                photoURL: childSnapshot.val().photoURL,
                key: childSnapshot.val().key
            };

            exceptionsRef.child(userkey).child('chat').on("value", function(snapshot) {
                if (snapshot.exists()) {
                    tempUser.chat = snapshot.val();
                }
                else {
                    tempUser.chat = true;
                }
                $timeout(function() {});
            });

            exceptionsRef.child(userkey).child('map').on("value", function(snapshot) {
                if (snapshot.exists()) {
                    tempUser.map = snapshot.val();
                }
                else {
                    tempUser.map = true;
                }
                $timeout(function() {});
            });

            adminsRef.child(userkey).on("value", function(snapshot) {
                if (snapshot.exists()) {
                    tempUser.admin = true
                }
                else {
                    tempUser.admin = false;
                }
                $timeout(function() {});
            });

            ownersRef.child(userkey).on("value", function(snapshot) {
                if (snapshot.exists()) {
                    tempUser.admin = true
                }
                else {
                    tempUser.admin = false;
                }
                $timeout(function() {});
            });

            $scope.users.push(tempUser);
        });

        $timeout(function() {});
    });

    $scope.userChatPrivileges = function(user) {
        var sett;
        if (user.chat == true) {
            sett = false;
        }
        else {
            sett = true;
        }

        var params = {
            user: F.user.key,
            map: $routeParams.map,
            mapName: F.mapData.name,
            trainer: F.user.trainer,
            team: F.user.team,
            mrkType: "userChatPrivileges" + sett,
            pokemon: null,
            toUserKey: user.key,
            toUserTrainer: user.trainer,
            toUserTeam: user.team
        };

        F.recordLog(params);

        exceptionsRef.child(user.key).child('chat').set(sett);
        //console.log('chat', user);

    };

    $scope.userMapPrivileges = function(user) {
        var sett;
        if (user.map == true) {
            sett = false;
        }
        else {
            sett = true;
        }

        var params = {
            user: F.user.key,
            map: $routeParams.map,
            mapName: F.mapData.name,
            trainer: F.user.trainer,
            team: F.user.team,
            mrkType: "userMapPrivileges" + sett,
            pokemon: null,
            toUserKey: user.key,
            toUserTrainer: user.trainer,
            toUserTeam: user.team
        };

        F.recordLog(params);

        exceptionsRef.child(user.key).child('map').set(sett);
        //console.log('map', user);

    };

    $scope.addAdmin = function(user) {

        adminsRef.child(user.key).set({
            key: user.key,
            trainer: user.trainer,
            photoURL: user.photoURL,
            team: user.team
        });

        var params = {
            user: F.user.key,
            map: $routeParams.map,
            mapName: F.mapData.name,
            trainer: F.user.trainer,
            team: F.user.team,
            mrkType: "adminAdd",
            pokemon: null,
            toUserKey: user.key,
            toUserTrainer: user.trainer,
            toUserTeam: user.team
        };

        F.recordLog(params);

    }

    $scope.remove = function(user) {

        var params = {
            user: F.user.key,
            map: $routeParams.map,
            mapName: F.mapData.name,
            trainer: F.user.trainer,
            team: F.user.team,
            mrkType: "adminRemove",
            pokemon: null,
            toUserKey: user.key,
            toUserTrainer: user.trainer,
            toUserTeam: user.team
        };

        F.recordLog(params);

        adminsRef.child(user.key).remove();
    }

    var initLoggedIn = function() {
        ownersRef.child(F.user.key).once("value", function(snapshot) {
            if (!snapshot.exists()) {
                adminsRef.child(F.user.key).once("value", function(snapshotAdmin) {
                    if (!snapshotAdmin.exists()) {
                        $location.path("/");
                    }
                });
            }
        });
    }

    $scope.$watch(function() {
        if (typeof F.user !== "undefined") {
            return F.user.key;
        }
    }, function(NewValue, OldValue) {
        if (typeof NewValue !== "undefined") {
            initLoggedIn();
        }
    });

}]);