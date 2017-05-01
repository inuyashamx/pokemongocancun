angular.module("myApp").filter('pokestops', function() {
  return function(input) {
      
    input  = input;
    
    var out = [];
    
    angular.forEach(input, function(data) {
        
      if (typeof data.Team === "undefined") out.push(data);
      
    });
   
    return out; 
    
  };
});