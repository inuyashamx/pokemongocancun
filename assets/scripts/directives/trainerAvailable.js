angular.module("myApp").directive('trainerAvailabilityValidator', ['F', function(F) {

    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {

            function setAsLoading(bool) {
                ngModel.$setValidity('recordLoading', !bool);
            }

            function setAsAvailable(bool) {
                ngModel.$setValidity('recordAvailable', bool);
            }

            ngModel.$parsers.push(function(value) {
                if (!value || value.length == 0) return;

                setAsLoading(true);
                setAsAvailable(false);
                var validate = value.toLowerCase();
                
                F.db.child("users").orderByChild("validate").equalTo(validate).on("value", function(snapshot) {
                    if (!snapshot.exists()) {
                        setAsLoading(false);
                        setAsAvailable(true);
                    }
                    else {
                        setAsLoading(false);
                        setAsAvailable(false);
                    }
                });
                return value;
            })
        }
    }
}]);