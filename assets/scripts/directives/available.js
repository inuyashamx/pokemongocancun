angular.module("myApp").directive('recordAvailabilityValidator', ['F', function(F) {

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
                var map = value.toLowerCase();

                F.db.child("maps").child(map).on("value", function(snapshot) {
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