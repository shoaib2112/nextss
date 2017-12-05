/**
 * Created by MXG0RYP on 5/20/2016.
 */
(function(){
    angular.module('nextGrid').service('broker', broker);

    function broker(){
        return {
            buildQueryString: function(urlBase, obj){
                return urlBase + _(obj).map(function(value, key){return key + '=' + value}).reduce(function(memo, item){return memo + '&' + item});
            }
        }
    }
})();