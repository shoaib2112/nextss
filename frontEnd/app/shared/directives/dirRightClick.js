// directive to handle a right click event which Angular does not do as shipped

//TODO ask Alex if this is being utilized within the map
//TODO see if it can be optimized and follow code design standards
(function(){
    angular.module('nextGrid').directive('ngRightClick', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function(event) {
                scope.$apply(function() {
                    event.preventDefault();
                    fn(scope, {$event:event});
                });
            });
        };
    });
})();
