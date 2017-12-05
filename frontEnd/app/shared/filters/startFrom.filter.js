/**
 * Created by MXG0RYP on 5/16/2016.
 */
(function(){
    angular.module('nextGrid').filter('startFrom', function () {
        return function (data, start) {
            if (data && data.length) {
                return data.slice(start);
            }
        };
    });
})();