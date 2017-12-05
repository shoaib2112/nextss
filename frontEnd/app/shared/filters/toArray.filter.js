/**
 * Created by MXG0RYP on 5/18/2016.
 */
(function(){
    angular.module('nextGrid').filter("toArray", function(){
        return function(obj) {
            var result = [];
            angular.forEach(obj, function(val, key) {
                result.push(val);
            });
            return result;
        };
    });
})();