angular.module("myApp").controller("newCtrl", ['$rootScope', '$scope', 'F', '$timeout', '$mdDialog', '$location', 'trimFilter', function($rootScope, $scope, F, $timeout, $mdDialog, $location, trim) {

    var mapsRef = F.db.child("maps");
    var listRef = F.db.child("list");

    F.url_img = "img/icons/game/icon-map.png";
    F.indeterminate = true;

    $scope.showForm = false;
    $scope.F = F;

    var getExtension = function(fileName) {
        var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
        return ext;
    }

    $scope.uploadLogo = function(file) {
        var new_image = F.db.child('images').push().key;
        var new_name = new_image + "." + getExtension(file.name);
        var uploadTask = F.storage.child('avatar/' + new_name).put(file);
        uploadTask.on('state_changed', function(snapshot) {
            console.log(snapshot, "change");
            F.indeterminate = false;
        }, function(error) {
            console.log(error)
        }, function() {
            var downloadURL = uploadTask.snapshot.downloadURL;

            var image = {
                server_name: new_name,
                original_name: file.name,
                url: downloadURL
            }

            F.db.child('images').child(new_image).update(image);
            F.url_img = downloadURL;
            F.indeterminate = true;
        });
    };



    $scope.save = function(map) {
        
        var self = this;
        map.url = map.url.toLowerCase();
        self.map = map;
        
        if ((F.position) && (F.user)) {

            var onComplete = function(error) {
                if (error) {
                    console.log('Synchronization failed');
                }
                else {
                    F.suscribeMe(self.map, F.user);
                    mapsRef.child(self.map.url).child("users").child("owners").child(F.user.key).set(F.user);
                    $location.path("/" + self.map.url);
                    $scope.map.url = "";
                    $scope.map.name = "";
                    $scope.showForm = false;
                }
            };

            listRef.child(map.url).set({
                url: map.url,
                name: map.name,
                latitute: F.position.coords.latitude,
                longitude: F.position.coords.longitude,
                description: map.description,
                img: F.url_img,
                type: "Public",
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                suscriptions: 0,
                createdBy: F.user.trainer
            }, onComplete);

        }
        else {
            $location.path("/");
        }

    };

    if ((!F.position) || (!F.user)) {
        $location.path("/");
    }
    else {
        $scope.showForm = true;
    }

}])

.filter('trim', function() {
    return function(value) {
        return value.replace(/(^\s*)|(\s*$)/g, "");
    }
});
