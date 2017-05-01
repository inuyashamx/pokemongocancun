angular.module("myApp").controller("chatCtrl", ['$scope', 'F', '$timeout', '$mdDialog', '$location', '$routeParams', '$filter', 'Upload', '$mdToast', function($scope, F, $timeout, $mdDialog, $location, $routeParams, $filter, Upload, $mdToast) {

    //console.log(F.user);
    $scope.F = F;
    $scope.chats = [];
    $scope.map = $routeParams.map;
    $scope.room = $routeParams.room;

    F.db.child("list").child($routeParams.map).on("value", function(snapshot) {
        if (snapshot.exists()) {
            F.mapData = snapshot.val();
        }
        else {
            $location.path("/");
            $timeout(function() {});
        }
    });

    if (!angular.isDefined($routeParams.room)) {
        $routeParams.room = "General";
    }

    $scope.changeRoom = function(room) {
        $scope.selectedTab = room;
        $routeParams.room = room;
    }

    var getExtension = function(fileName) {
        var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
        return ext;
    }

    var scrollWindows = function() {
        $timeout(function() {
            var scroller = document.getElementsByTagName("md-tab-content");
            for (var i = 0; i < scroller.length; i++) {
                scroller[i].scrollTop = scroller[i].scrollHeight;
            }
        });
    }

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
        scrollWindows();
    });

    $scope.upload = function(file, room) {
        //Se obtiene un  nuevo nombre para subir la imagen al servidor
        var new_image = F.db.child('images').push().key;
        var new_name = new_image + "." + getExtension(file.name);
        var uploadTask = F.storage.child('images/' + new_name).put(file);
        // Register three observers:
        // 1. 'state_changed' observer, called any time the state changes
        // 2. Error observer, called on failure
        // 3. Completion observer, called on successful completion
        uploadTask.on('state_changed', function(snapshot) {

            //console.log(snapshot, "change");
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

            F.db.child("chats").child($scope.map).child(room).push({
                user: F.user.trainer,
                user_id: F.user.key,
                user_photo: angular.isDefined(F.user.photoURL) ? F.user.photoURL : null,
                team: F.user.team,
                msg: "",
                time: firebase.database.ServerValue.TIMESTAMP,
                img: new_image,
                img_url: downloadURL
            });
        });
    };

    $scope.rooms = [{
        name: "General",
        allowGuestAccess: true,
        img: "img/backgrounds/trainer.png",
        class: "white-color"
    }, {
        name: "Mystic",
        allowGuestAccess: false,
        img: "img/icons/teams/1.png",
        class: "blue"
    }, {
        name: "Instinct",
        allowGuestAccess: false,
        img: "img/icons/teams/3.png",
        class: "yellow"
    }, {
        name: "Valor",
        allowGuestAccess: false,
        img: "img/icons/teams/2.png",
        class: "red"
    }];

    var setRoom = function(room, chats) {

        var index = 0;
        var createnew = true;

        angular.forEach(chats, function(chat, key) {
            if (chat.title == room.title) {
                index = key;
                createnew = false;
                chats[key].enabled = room.enabled;
                chats[key].loaded = angular.isDefined(room.loaded) ? room.loaded : chats[key].loaded;
                return false;
            }
        });

        if (createnew) {
            $scope.chats.push(room);
            index = ((chats.length) - 1);
        }

        return index;
    }

    var addMessage = function(chats, roomName, message) {
        angular.forEach(chats, function(chat, key) {
            if (chat.title == roomName) {
                chats[key].messages.push(message);
                return false;
            }
        });
        $timeout(function() {});
    }

    $scope.$watch(function() {
        if (typeof F.user !== "undefined") {
            return F.user;
        }
    }, function(NewValue, OldValue) {
        getChats();
    });

    var addChatListener = function(title, roomName) {
        F.db.child("chats/" + $scope.map + "/" + roomName).limitToLast(30).on('child_added', function(snapshot) {
            var chat = snapshot.val();
            var newChat = {};
            var newTime = angular.isDefined(chat.time) ? $filter("date")(chat.time, "mediumTime") : "";
            var newChar = angular.isDefined(chat.char) ? chat.char : "";
            addMessage($scope.chats, title, chat);
        });
    }

    var getChats = function() {
        angular.forEach($scope.rooms, function(room, key) {
            //se verifica si el room tiene acceso para que los usuarios invitados pueda verlos
            var loadData = false;
            if (room.allowGuestAccess) {
                loadData = true;
            }
            else {
                //si el room no permite el acceso al usuario invitado se verifica que el usuario este identificado
                if (F.user) {
                    //si esta identificado se verifica que el chat que se cargara sea el chat al que pertenece el usuario
                    if (F.user.team == room.name) {
                        loadData = true;
                    }
                }
            }
            //si se pasaron las condiciones anteriores se cargan los mensajes de los rooms
            if (loadData) {
                var roomTitle = room.name;

                var addRoom = true;
                var index = 0;
                //se busca si ya existe el elemento en el chat
                angular.forEach($scope.chats, function(chat, key) {
                    if (chat.title == roomTitle) {
                        index = key;
                        addRoom = false;
                        return false;
                    }
                });
                if (addRoom) {
                    var r = {
                        title: roomTitle,
                        enabled: true,
                        messages: [],
                        loaded: false,
                        img: room.img,
                        class: room.class
                    };
                    index = setRoom(r, $scope.chats);
                }
                if (!$scope.chats[index].loaded) {
                    addChatListener($scope.chats[index].title, room.name);
                    $scope.chats[index].loaded = true;
                    $scope.chats[index].enabled = true;
                }
            }
            //si no se pueden cargar los mensajes del room se inserta un elemento vacio con la opcion desabilitada
            else {
                var r = {
                    title: room.name,
                    enabled: false,
                    messages: [],
                    img: room.img,
                    class: room.class
                };
                setRoom(r, $scope.chats);
            }

            if (angular.isDefined($scope.room)) {
                angular.forEach($scope.chats, function(chat, key) {
                    if ($scope.room == chat) {
                        $scope.selectedTabIndex = key;
                    }
                });
            }

        });
        //console.log($scope.chats);
    }

    $scope.saveMsg = function(room) {
        if (F.user) {
            if (F.isSuscribe[$scope.map]) {

                F.db.child("maps").child($routeParams.map).child("users").child("exceptions").child(F.user.key).child("chat").on("value", function(snapshot) {

                    if (snapshot.exists()) {
                        $scope.chatPrivileges = snapshot.val();
                    }
                    else {
                        $scope.chatPrivileges = true;
                    }

                    if ($scope.chatPrivileges) {
                        if (($scope.msg !== '') && (typeof $scope.msg !== 'undefined')) {

                            F.db.child("chats").child($scope.map).child(room).push({
                                user: F.user.trainer,
                                user_id: F.user.key,
                                team: F.user.team,
                                msg: $scope.msg,
                                time: firebase.database.ServerValue.TIMESTAMP,
                                user_photo: angular.isDefined(F.user.photoURL) ? F.user.photoURL : null
                            });

                            $scope.msg = "";

                        }
                    }
                    else {
                        $scope.showSimpleToast("You're muted chat , you can contact an administrator for help.");
                    }
                    $timeout(function() {});
                });
            }
            else {
                F.suscribeDialog();
            }
        }
        else {
            F.getUser();
        }
    };

    var initLoggedIn = function() {
        F.getSubscribe(F.user.key, $scope.map);
        F.presenceSystem(F.user.key);
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