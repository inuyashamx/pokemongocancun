angular.module("myApp").controller("mapCtrl", ['$scope', 'F', 'NgMap', '$timeout', '$mdDialog', '$mdMedia', '$routeParams', '$rootScope', '$mdToast', '$location', function($scope, F, NgMap, $timeout, $mdDialog, $mdMedia, $routeParams, $rootScope, $mdToast, $location) {

    var pokemonList;
    var timerstamp = {};
    var globalInterval = {};
    var mapRef = F.db.child("maps").child($routeParams.map);
    var mapDataRef = F.db.child("list").child($routeParams.map);
    var chatRef = F.db.child('chats').child($routeParams.map);
    var markersRef = F.db.child('markers').child($routeParams.map);
    var pokemonRef = F.db.child("pokemons");
    var suscriptionsRef = mapRef.child("users").child("suscriptions");

    F.suscriptionsRef = suscriptionsRef;
    F.admin = false;

    $scope.F = F;
    $scope.vm = {};
    $scope.timer = [];
    $scope.pokemonMarkers = {};
    $scope.city = $routeParams.map;
    $scope.showNests = true;
    $scope.showForts = true;
    $scope.showPokestops = true;
    $scope.showDanger = true;
    $scope.showInterest = true;
    $scope.editingComments = false;
    $scope.showPokemon = true;
    $scope.mapPrivileges = true;
    $scope.markerType = false;
    $scope.pokestopDraggable = false;
    $scope.gymDraggable = false;
    $scope.setNewMarker = false;
    $scope.newMarkerInfo = "<div>Drag Me! </div><div>to the nearest position..</div>";

    $scope.total = {
        rojo: 10,
        azul: 10,
        amarillo: 10
    };

    NgMap.getMap({
        id: 'mainMap'
    }).then(function(response) {
        $scope.vm.map = response;
    });

    $scope.w = window.innerWidth;
    $scope.h = window.innerHeight;

    pokemonRef.on("value", function(snapshot) {
        pokemonList = snapshot.val();
        $timeout(function() {});
    });

    suscriptionsRef.on("value", function(snapshot) {
        $scope.suscriptions = snapshot.numChildren();
        $timeout(function() {});
    });

    mapDataRef.on("value", function(snapshot) {
        if (snapshot.exists()) {
            F.mapData = snapshot.val();
        }
        else {
            $location.path("/");
        }
        $timeout(function() {});
    });

    markersRef.child("gyms").on("value", function(snapshot) {

        $scope.Forts = [];

        snapshot.forEach(function(childSnapshot) {

            var data = childSnapshot.val();

            var pokemonMarker = {
                pokeMarkKey: childSnapshot.key,
                userName: data.userName,
                time: data.time,
                userId: data.userId,
                lat: data.lat,
                lng: data.lng,
                fortName: data.fortName,
                comments: data.comments,
            };

            $scope.Forts.push(pokemonMarker);

        });

        markersRef.orderByChild("Team").equalTo(1).once('value', function(data) {
            $scope.total.azul = data.numChildren();
            renderChart();
            $timeout(function() {});
        });

        markersRef.orderByChild("Team").equalTo(2).once('value', function(data) {
            $scope.total.rojo = data.numChildren();
            renderChart();
            $timeout(function() {});
        });

        markersRef.orderByChild("Team").equalTo(3).once('value', function(data) {
            $scope.total.amarillo = data.numChildren();
            renderChart();
            $timeout(function() {});
        });

        $timeout(function() {});

    });

    markersRef.child("nests").on("value", function(snapshot) {
        $scope.nestMarkers = [];
        snapshot.forEach(function(childSnapshot) {
            
            var data = childSnapshot.val();
            
            var pokemonId = parseInt(data.pokemon);
            
            var marker = {
                fortName: data.fortName,
                pokeMarkKey: childSnapshot.key,
                pokemonId: pokemonId,
                user: data.userName,
                team: data.userTeam,
                userId: data.userId,
                lat: data.lat,
                lng: data.lng,
                comments: data.comments,
                name: pokemonList[pokemonId].name,
                imgUrl: "https://pokecentergo.net/img/icons/game/pokemon/" + data.pokemon + ".png",
                timeFound: data.time,
                voteUp: data.voteUp,
                voteDown: data.voteDown
            };
            
            $scope.nestMarkers.push(marker);
            
        });
        $timeout(function() {});
    });

    markersRef.child("pokestops").on("value", function(snapshot) {
        $scope.pokeStops = [];
        snapshot.forEach(function(childSnapshot) {
            var data = childSnapshot.val();
            var pokemonMarker = {
                pokeMarkKey: childSnapshot.key,
                userName: data.userName,
                time: data.time,
                userId: data.userId,
                lat: data.lat,
                lng: data.lng,
                fortName: data.fortName,
                comments: data.comments,
                pokestopName: data.pokestopName
            };
            $scope.pokeStops.push(pokemonMarker);
        });
        $timeout(function() {});
    });
    
    markersRef.child("interest").on("value", function(snapshot) {
        $scope.Interest = [];
        snapshot.forEach(function(childSnapshot) {
            var data = childSnapshot.val();
            var pokemonMarker = {
                pokeMarkKey: childSnapshot.key,
                userName: data.userName,
                time: data.time,
                userId: data.userId,
                lat: data.lat,
                lng: data.lng,
                fortName: data.fortName,
                comments: data.comments,
                pokestopName: data.pokestopName
            };
            $scope.Interest.push(pokemonMarker);
        });
        $timeout(function() {});
    });
    
    markersRef.child("danger").on("value", function(snapshot) {
        $scope.Danger = [];
        snapshot.forEach(function(childSnapshot) {
            var data = childSnapshot.val();
            var pokemonMarker = {
                pokeMarkKey: childSnapshot.key,
                userName: data.userName,
                time: data.time,
                userId: data.userId,
                lat: data.lat,
                lng: data.lng,
                fortName: data.fortName,
                comments: data.comments,
                lng: data.lng,
                pokestopName: data.pokestopName
            };
            $scope.Danger.push(pokemonMarker);
        });
        $timeout(function() {});
    });

    markersRef.child("pokemons").child("alive").on("child_removed", function(snapshot) {
        clearInterval(globalInterval[snapshot.key]);
        delete $scope.pokemonMarkers[snapshot.key];
        $timeout(function() {});
    });

    markersRef.child("pokemons").child("alive").on("child_added", function(snapshot) {
        var key = snapshot.key;
        var data = snapshot.val();
        var pokemonId = parseInt(data.pokemonId, 10) - 1;
        var timeCreated = data.timeFound;
        var timeNow = getServerTime();
        var diff = timeNow - timeCreated;
        var timeleft = 300000 - diff;
        timerstamp[key] = timeleft;

        var pokemonMarker = {
            pokeMarkKey: key,
            pokemonId: data.pokemonId,
            user: data.userName,
            team: data.userTeam,
            comments: data.comments,
            userId: data.userId,
            lat: data.lat,
            lng: data.lng,
            name: pokemonList[pokemonId].name,
            imgUrl: "https://pokecentergo.net/img/icons/game/pokemon/" + data.pokemonId + ".png",
            timeFound: data.timeFound,
            voteUp: data.voteUp,
            voteDown: data.voteDown
        };

        globalInterval[key] = setInterval(function() {
            timerstamp[key] -= 1000;
            if (parseInt(timerstamp[key]) < 0) {
                F.db.child("markers").child($scope.city).child("pokemons").child("alive").child(key).remove();
                clearInterval(timerstamp[key]);
            }
            $scope.timer[key] = msToTime(timerstamp[key]);
            $timeout(function() {});
        }, 1000);

        $scope.pokemonMarkers[key] = pokemonMarker;
        $timeout(function() {});
    });

    $scope.go_admin = function() {
        $location.path($routeParams.map + "/admin");
    };
    $scope.go_logs = function() {
        $location.path($routeParams.map + "/admin/logs");
    };

    $scope.showPokemonInfoWindow = function(evt, pokemon) {
        $scope.pokemonInfo = {};
        $scope.pokemonInfo.name = pokemon.name;
        $scope.pokemonInfo.user = pokemon.user;
        $scope.pokemonInfo.team = pokemon.team;
        $scope.pokemonInfo.comments = pokemon.comments;
        $scope.pokemonInfo.pokemonId = pokemon.pokemonId;
        $scope.pokemonInfo.userId = pokemon.userId;
        $scope.pokemonInfo.timeFound = pokemon.timeFound;
        $scope.pokemonInfo.voteUp = pokemon.voteUp;
        $scope.pokemonInfo.voteDown = pokemon.voteDown;
        $scope.pokemonInfo.pokeMarkKey = pokemon.pokeMarkKey;
        $scope.pokemonInfo.fortName = pokemon.fortName;
        $scope.pokemonInfo.pokemonLocation = pokemon.lat + ',' + pokemon.lng;
        $scope.pokemonInfo.mediaUrl = $scope.createUrlShare(pokemon.lat + ',' + pokemon.lng, pokemon.imgUrl, 16);
        $scope.pokemonInfo.shareUrl = 'https://pokecentergo.net/#/' + $scope.city + '?lat=' + pokemon.lat + '&lng=' + pokemon.lng + '&zoom=19&pokemon=' + pokemon.pokeMarkKey;
        $scope.pokemonInfo.shareText = 'A wild ' + pokemon.name + ' has appeared!';
        $scope.vm.map.showInfoWindow('pokemonInfoWindow', this);
    };

    $scope.showNestInfoWindow = function(evt, pokemon) {
        $scope.pokemonInfo = {};
        $scope.pokemonInfo.name = pokemon.name;
        $scope.pokemonInfo.user = pokemon.user;
        $scope.pokemonInfo.team = pokemon.team;
        $scope.pokemonInfo.markerType = "nests";
        $scope.pokemonInfo.comments = pokemon.comments;
        $scope.pokemonInfo.fortName = pokemon.fortName;
        $scope.pokemonInfo.pokemonId = pokemon.pokemonId;
        $scope.pokemonInfo.userId = pokemon.userId;
        $scope.pokemonInfo.timeFound = pokemon.timeFound;
        $scope.pokemonInfo.voteUp = pokemon.voteUp;
        $scope.pokemonInfo.voteDown = pokemon.voteDown;
        $scope.pokemonInfo.pokeMarkKey = pokemon.pokeMarkKey;
        $scope.pokemonInfo.markerKey = pokemon.pokeMarkKey;
        $scope.pokemonInfo.markerType = "nests";
        $scope.pokemonInfo.pokemonLocation = pokemon.lat + ',' + pokemon.lng;
        $scope.pokemonInfo.mediaUrl = $scope.createUrlShare(pokemon.lat + ',' + pokemon.lng, pokemon.imgUrl, 16);
        $scope.pokemonInfo.shareUrl = 'https://pokecentergo.net/#/' + $scope.city + '?lat=' + pokemon.lat + '&lng=' + pokemon.lng + '&zoom=19';
        $scope.pokemonInfo.shareText = "I found  " + pokemon.name + ' nest!';
        $scope.vm.map.showInfoWindow('showNestInfoWindow', this);
    };

    $scope.pokeVoteUp = function(pokey) {

        var ref = markersRef.child("pokemons").child("alive");
        console.log(pokey.fortName);

        if (typeof pokey.fortName !== "undefined") {
            if (pokey.fortName === "Nests") {
                ref = markersRef.child("nests");
            }
        }

        if (pokey.userId !== F.user.key) {

            if (typeof F.user.key !== "undefined") {

                ref.child(pokey.pokeMarkKey).child('voters').child(F.user.key).on("value", function(snapshot) {
                    $scope.allReadyVote = snapshot.val();
                    $timeout(function() {});
                });

                ref.child(pokey.pokeMarkKey).child('voteUp').on("value", function(snapshot) {
                    $scope.currentVotesUp = snapshot.val();
                    $timeout(function() {});
                });

                if ($scope.allReadyVote) {
                    F.showSimpleToast('You already vote!');
                }
                else {
                    ref.child(pokey.pokeMarkKey).child('voteUp').set(parseInt($scope.currentVotesUp) + 1);
                    $scope.pokeVoters(pokey, ref);
                    $scope.pokeVoteUserUp(pokey);
                    F.showSimpleToast('Your vote was recorded correctly!');

                    var params = {
                        user: F.user.key,
                        map: $scope.city,
                        mapName: F.mapData.name,
                        trainer: F.user.trainer,
                        team: F.user.team,
                        mrkType: "voteUp",
                        pokemon: pokey.pokemonId,
                        toUserKey: pokey.userId,
                        toUserTrainer: pokey.user,
                        toUserTeam: pokey.team
                    };

                    F.recordLog(params);

                }
            }
            else {
                F.getUser();
            }

        }
        else {
            F.showSimpleToast("You can't vote for yourself");
        }
    };

    $scope.pokeVoteDown = function(pokey) {

        var ref = markersRef.child("pokemons").child("alive");

        if (typeof pokey.fortName !== "undefined") {
            if (pokey.fortName === "Nests") {
                ref = markersRef.child("nests");
            }
        }

        if (pokey.userId !== F.user.key) {
            if (typeof F.user.key !== "undefined") {
                ref.child(pokey.pokeMarkKey).child('voters').child(F.user.key).on("value", function(snapshot) {
                    $scope.allReadyVote = snapshot.val();
                    $timeout(function() {});
                });

                ref.child(pokey.pokeMarkKey).child('voteDown').on("value", function(snapshot) {
                    $scope.currentVotesUp = snapshot.val();
                    $timeout(function() {});
                });

                if ($scope.allReadyVote) {
                    F.showSimpleToast('You already vote!');
                }
                else {
                    ref.child(pokey.pokeMarkKey).child('voteDown').set(parseInt($scope.currentVotesUp) + 1);
                    $scope.pokeVoters(pokey, ref);
                    $scope.pokeVoteUserDown(pokey);
                    F.showSimpleToast('Your vote was recorded correctly!');

                    var params = {
                        user: F.user.key,
                        map: $scope.city,
                        mapName: F.mapData.name,
                        trainer: F.user.trainer,
                        team: F.user.team,
                        mrkType: "voteDown",
                        pokemon: pokey.pokemonId,
                        toUserKey: pokey.userId,
                        toUserTrainer: pokey.user,
                        toUserTeam: pokey.team
                    };

                    F.recordLog(params);
                }
            }
            else {
                F.getUser();
            }
        }
        else {
            F.showSimpleToast("You can't vote for yourself");
        }
    };

    $scope.pokeVoters = function(pokey, ref) {
        ref.child(pokey.pokeMarkKey).child('voters').child(F.user.key).set(true);
    };

    $scope.pokeVoteUserUp = function(pokey) {
        var currentUserVotesUp;
        suscriptionsRef.child(pokey.userId).child("likes").once("value", function(snapshot) {
            currentUserVotesUp = snapshot.val();
            suscriptionsRef.child(pokey.userId).child("likes").set(currentUserVotesUp + 1);
        });
    };

    $scope.pokeVoteUserDown = function(pokey) {
        suscriptionsRef.child(pokey.userId).child("dislikes").on("value", function(snapshot) {
            $scope.currentUserVotesDown = snapshot.val();
            $timeout(function() {});
        });

        if (typeof $scope.currentUserVotesDown === 'undefined') {
            suscriptionsRef.child(pokey.userId).child("dislikes").set(1);
        }
        else {
            suscriptionsRef.child(pokey.userId).child("dislikes").set(parseInt($scope.currentUserVotesDown) + 1);
        }
    };

    $scope.setMarkerType = function(mrkType) {

        if (mrkType == $scope.markerType) {
            $scope.markerType = false;
        }
        else {
            $scope.markerType = mrkType;
        }

        if (mrkType == 'pokestops') {
            if ($scope.pokestopDraggable == true) {
                $scope.pokestopDraggable = false;
            }
            else {
                $scope.pokestopDraggable = true;
                $scope.gymDraggable = false;
                $scope.nestDraggable = false;
            }

        }
        if (mrkType == 'gyms') {

            if ($scope.gymDraggable == true) {
                $scope.gymDraggable = false;
            }
            else {
                $scope.gymDraggable = true;
                $scope.pokestopDraggable = false;
                $scope.nestDraggable = false;
            }
        }

        if (mrkType == 'nest') {
            if ($scope.nestDraggable == true) {
                $scope.nestDraggable = false;
            }
            else {
                $scope.nestDraggable = true;
                $scope.pokestopDraggable = false;
                $scope.gymDraggable = false;
            }
        }

    };

    $scope.showMarkerInfoWindow = function(evt, marker, type) {
        $scope.markerInfo = {};
        $scope.markerInfo.markerKey = marker.pokeMarkKey;
        $scope.markerInfo.markerType = type;
        $scope.markerInfo.userName = marker.userName;
        $scope.markerInfo.time = marker.time;
        $scope.markerInfo.fortName = marker.fortName;
        $scope.markerInfo.comments = marker.comments;
        $scope.vm.map.showInfoWindow('markerInfoWindow', this);
    };

    $scope.addMarker = function(e, mrkType) {
        if ($scope.markerType !== false) {
            var mrk = {};
            mrk.lat = e.latLng.lat();
            mrk.lng = e.latLng.lng();
            mrk.userId = F.user.key;
            mrk.userName = F.user.trainer;
            mrk.userTeam = F.user.team;
            mrk.voteDown = 0;
            mrk.voteUp = 0;
            mrk.time = firebase.database.ServerValue.TIMESTAMP;
            switch (mrkType) {
                case "pokestops":
                    mrk.pokestopName = 'Pokestop';
                    mrk.pokemon = null;
                    break;
                case "gyms":
                    mrk.fortName = 'GyM';
                    mrk.pokemon = null;
                    break;
                case "interest":
                    mrk.fortName = 'Interest';
                    mrk.pokemon = null;
                    break;    
                case "danger":
                    mrk.fortName = 'Danger';
                    mrk.pokemon = null;
                    break;     
                case "nests":
                    mrk.fortName = 'Nests';
                    mrk.pokemon = 1;
                    break;
                    
            }


            $scope.insertMarker(mrkType, mrk);
        }
    };

    $scope.insertMarker = function(mrkType, mrk) {

        if (typeof F.user.key !== "undefined") {

            markersRef.child(mrkType).push(mrk);

            var params = {
                user: F.user.key,
                map: $scope.city,
                mapName: F.mapData.name,
                trainer: F.user.trainer,
                team: F.user.team,
                mrkType: mrkType,
                pokemon: mrk.pokemon,
                toUserKey: null,
                toUserTrainer: null,
                toUserTeam: null,
            };

            F.recordLog(params);

        }
        else {
            F.getUser();
        }
    };
    
    $scope.updateDiscover = function(e) {
        var lat = e.latLng.lat();
        var lng = e.latLng.lng();
        F.db.child("discover").set({
            lat: lat,
            lng: lng
        });
    };

    $scope.updtMarkerLocation = function(e, mrk, mrkType) {
        var lat = e.latLng.lat();
        var lng = e.latLng.lng();
        markersRef.child(mrkType).child(mrk).child("lat").set(lat);
        markersRef.child(mrkType).child(mrk).child("lng").set(lng);
    };

    $scope.removeMarker = function(mrk) {
        var key;
        if (typeof mrk.markerKey === "undefined") {
            key = mrk.pokeMarkKey;
        }
        else {
            key = mrk.markerKey;
        }
        markersRef.child(mrk.markerType).child(key).remove();
    };
    
    $scope.editComments = function(){
        $scope.editingComments=true;
    }

    $scope.saveComments = function(marker) {    
        console.log(marker);
        markersRef.child(marker.markerType).child(marker.markerKey).child("comments").set(marker.comments); 
        $scope.editingComments = false;
    }

    $scope.changePokemon = function(pokemonInfo) {
        if (F.user) {
            if (F.isSuscribe[$scope.city]) {
                if ($scope.mapPrivileges) {

                    $mdDialog.show({
                            controller: pokemonListCtrl,
                            templateUrl: './views/pokemon.html',
                            parent: angular.element(document.body),
                            clickOutsideToClose: true
                        })
                        .then(function(pokemon) {
                            markersRef.child("nests").child(pokemonInfo.pokeMarkKey).child("pokemon").set(pokemon.id);
                        }, function() {
                            $scope.mdstatus = 'You cancelled the dialog.';
                        });
                }
                else {
                    F.showSimpleToast("You can't add more Pokemons, contact an administrator");
                }
            }
            else {
                F.suscribeDialog();
            }
        }
        else {
            F.getUser();
        }
    };

    $scope.addPokemon = function(ev) {
        if (F.user) {
            if (F.isSuscribe[$scope.city]) {
                if ($scope.mapPrivileges) {

                    F.db.child("blocked").child(F.user.key).once("value", function(snapshot) {
                        if (snapshot.exists()) {
                            F.showSimpleToast("You have added pokemon recently, wait a few minutes and try again");
                        }
                        else {
                            $mdDialog.show({
                                    controller: pokemonListCtrl,
                                    templateUrl: './views/pokemon.html',
                                    parent: angular.element(document.body),
                                    targetEvent: ev,
                                    clickOutsideToClose: true
                                })
                                .then(function(answer) {
                                    console.log("answer");
                                    $scope.insertPokemon(answer);
                                }, function() {
                                    $scope.mdstatus = 'You cancelled the dialog.';
                                });
                        }
                    })
                }
                else {
                    F.showSimpleToast("You can't add more Pokemons, contact an administrator");
                }
            }
            else {
                F.suscribeDialog();
            }
        }
        else {
            F.getUser();
        }
    };

    $scope.insertPokemon = function(pokemon) {
        
        if (typeof F.user.key !== "undefined") {

            //parametros para insertar pokemon
            var objPokemon = {
                userId: F.user.key,
                userName: F.user.trainer,
                userTeam: F.user.team,
                pokemonId: pokemon.id,
                lat: F.position.coords.latitude,
                lng: F.position.coords.longitude,
                timeFound: firebase.database.ServerValue.TIMESTAMP,
                voteDown: 0,
                voteUp: 0
            };

            //inserta el pokemon
            var push = markersRef.child("pokemons").child("alive").push(objPokemon);

            //parametros para el log
            var params = {
                user: F.user.key,
                map: $scope.city,
                mapName: F.mapData.name,
                trainer: F.user.trainer,
                team: F.user.team,
                mrkType: "pokemons",
                pokemon: pokemon.id,
                toUserKey: null,
                toUserTrainer: null,
                toUserTeam: null
            };

            //crea log para el mapa y el usuario
            F.recordLog(params);

            //programa al pokemon para borrarse, el server lo maneja
            F.db.child("deletions").push({
                key: push.key,
                pokemon: objPokemon,
                map: $routeParams.map
            });

            //bloquea 1 min al jugador
            F.db.child("blocked").child(F.user.key).set(true);

            //manda a chat un mensaje
            $scope.saveMsg('I found a ' + pokemonList[parseInt(pokemon.id) - 1].name + ' .... <img src="' + pokemonList[parseInt(pokemon.id) - 1].img + '" style="height:20px; width:20px;"><a href="#/' + $routeParams.map + '?lat=' + F.position.coords.latitude + '&lng=' + F.position.coords.longitude + '&zoom=19&pokemon=' + push.key + '" target="_blank"> See Location!</a>');
        }
        else {
            F.getUser();
        }

    };

    $scope.saveMsg = function(msg) {
        if (F.user) {
            if ((msg !== '') && (typeof msg !== 'undefined')) {
                chatRef.child('General').push({
                    user: F.user.trainer,
                    user_id: F.user.key,
                    team: F.user.team,
                    msg: msg,
                    time: firebase.database.ServerValue.TIMESTAMP,
                    user_photo: angular.isDefined(F.user.photoURL) ? F.user.photoURL : null
                });
            }
        }
        else {
            F.getUser();
        }
    };

    $scope.createUrlShare = function(location, icon, zoom) {
        return "http://maps.googleapis.com/maps/api/staticmap?center=" + location + "&zoom=" + zoom + "&scale=1&size=600x300&maptype=roadmap&format=jpg&visual_refresh=true&markers=icon:" + icon + "%7Cshadow:true%7C" + location + "&key=AIzaSyDvhJ1afQl92WuP2bKn4zlXg8Akxix86F8";
    }

    $scope.suscribeMe = function() {
        F.suscribeMe(F.mapData, F.user);
    }

    $scope.unSuscribe = function() {
        F.unSuscribe(F.mapData, F.user);
    }

    $scope.goToMyLocation = function() {

        var latLng = new google.maps.LatLng(F.position.coords.latitude, F.position.coords.longitude); //Makes a latlng
        var image = './img/icons/google/blue_dot.png';
        var marker = new google.maps.Marker({
            position: latLng,
            title: "Im Here!!",
            icon: image
        });

        marker.setMap($scope.vm.map);

        $scope.vm.map.panTo(latLng);


    };

    var initPosition = function() {
        $scope.center = {};
        if (typeof $routeParams.lat === 'undefined' && typeof $routeParams.lng === 'undefined') {
            $scope.center.lat = F.position.coords.latitude;
            $scope.center.lng = F.position.coords.longitude;
            $scope.center.zoom = 14;
        }
        else {
            if (typeof $routeParams.pokemon !== "undefined") {
                checkPokemonAlive($routeParams.pokemon);
            }
            $scope.center.lat = $routeParams.lat;
            $scope.center.lng = $routeParams.lng;
            $scope.center.zoom = $routeParams.zoom;
        }
    }

    var initLoggedIn = function() {
        F.getSubscribe(F.user.key, $routeParams.map);
        F.db.child("maps").child($routeParams.map).child("users").child("exceptions").child(F.user.key).child("map").on("value", function(snapshot) {

            if (snapshot.exists()) {
                $scope.mapPrivileges = snapshot.val();
            }
            else {
                $scope.mapPrivileges = true;
            }

            $timeout(function() {});
        });

        mapRef.child('users').child('admins').child(F.user.key).on("value", function(snapshot) {
            if (snapshot.exists()) {
                F.admin = true;
                $scope.admin = true;
                $timeout(function() {});
            }
        });

        mapRef.child('users').child('owners').child(F.user.key).on("value", function(snapshot) {
            if (snapshot.exists()) {
                F.admin = true;
                $scope.admin = true;
                $timeout(function() {});
            }
        });

        suscriptionsRef.on("value", function(snapshot) {
            $scope.ImHere = false;
            snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key;
                if (key === F.user.key) {
                    $scope.ImHere = true;
                    $timeout(function() {});
                }
            });
        });
    }

    var checkPokemonAlive = function(key) {
        markersRef.child("pokemons").child("alive").child(key).once("value", function(snapshot) {
            if (!snapshot.exists()) {
                $mdDialog.show(
                    $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Pokemon expired!')
                    .textContent('The pokemon you are looking for has disappeared')
                    .ariaLabel('Alert')
                    .ok('Got it!')
                    .targetEvent()
                );
            }
            else {
                return false;
            }
        });
    }

    var pokemonListCtrl = function($scope) {
        $scope.DialogPokemonList = pokemonList
        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };
    }

    var msToTime = function(duration) {
        var seconds = parseInt((duration / 1000) % 60),
            minutes = parseInt((duration / (1000 * 60)) % 60);
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        return minutes + ":" + seconds;
    }

    var getServerTime = (function(ref) {
        var offset = 0;
        ref.child('.info/serverTimeOffset').on('value', function(snap) {
            offset = snap.val();
        });

        return function() {
            return Date.now() + offset;
        }
    })(F.db);



    var renderChart = function() {
        $scope.rojo = [{
            v: "Rojo"
        }, {
            v: $scope.total.rojo
        }];

        $scope.azul = [{
            v: "Azul"
        }, {
            v: $scope.total.azul
        }];

        $scope.amarillo = [{
            v: "Amarillo"
        }, {
            v: $scope.total.amarillo
        }];

        $scope.myChartObject = {};

        $scope.myChartObject.type = "PieChart";

        $scope.myChartObject.data = {
            "cols": [{
                id: "t",
                label: "Equipos",
                type: "string"
            }, {
                id: "s",
                label: "Porcentaje",
                type: "number"
            }],
            "rows": [{
                c: $scope.azul
            }, {
                c: $scope.rojo
            }, {
                c: $scope.amarillo
            }]
        };

        $scope.myChartObject.options = {
            title: 'Equipos',
            width: 150,
            height: 150,
            pieStartAngle: 100,
            chartArea: {
                'width': '100%',
                'height': '100%'
            },
            colors: ['#007FFF', '#FF0000', '#f4d984'],
            backgroundColor: {
                fill: 'transparent'
            },
            legend: {
                position: 'none'
            }
        };

    };

    //Watchs

    $scope.$watch(function() {
        if (typeof F.user !== "undefined") {
            return F.user.key;
        }
    }, function(NewValue, OldValue) {
        if (typeof NewValue !== "undefined") {
            initLoggedIn();
        }
    });

    $scope.$watch(function() {
        return F.position;
    }, function(NewValue, OldValue) {
        if (typeof NewValue !== "undefined") {
            initPosition();
        }
    });

}]);