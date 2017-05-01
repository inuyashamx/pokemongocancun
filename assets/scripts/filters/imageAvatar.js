'use strict';

angular.module("myApp")
    .filter("imageAvatar", [
        function(){
            return function(obj){
                if(typeof obj === "undefined"){
                    return "img/default-avatar.png";
                }
                else{
                    return obj;
                }
            }
        }
    ])