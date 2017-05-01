angular.module("myApp")
    .constant("allowedOfflineStates", ["chat", "map", "maps", "chat.child"])
    .run([
        "$rootScope",
        "F",
        "FB_CONFIG",
        "$log",
        "allowedOfflineStates",
        function($rootScope, F, config, $log, states) {
            // initialize firebase app
            firebase.initializeApp(config);
            F.storage=firebase.storage().ref();;
            F.db = firebase.database().ref("/");
            
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    F.db.child("users").child(user.uid).on("value", function(snapshot) {
                        if (!snapshot.exists()) {
                            F.db.child("users").child(user.uid).set(user.providerData[0]);
                        }
                        F.getUser();
                    });
                }
                else {
                    F.user = false;
                }
            });
            
        }
    ]);