'use strict';

angular.module("myApp")
    .filter("countObject", [
        function(){
            return function(obj){
                if(typeof obj == "undefined"){
                    return 0;
                }
                return Object.keys(obj).length;
            }
        }
    ])