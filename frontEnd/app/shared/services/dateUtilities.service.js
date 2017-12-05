/**
 * Created by MXG0RYP on 5/20/2016.
 */
(function(){
    angular.module('nextGrid').service('dateUtilities', dateUtilities);

    function dateUtilities(){
        return {
            getISODate: function(dt) {
                var mm = (1 + dt.getMonth()).toString();
                if (mm.length === 1)
                    mm = '0' + mm;
                var dd = dt.getDate().toString();
                if (dd.length === 1)
                    dd = '0' + dd;
                return dt.getFullYear().toString() + "-" + mm  + "-" + dd;
            },
            getQuotedISODate: function(dt) {
                var mm = (1 + dt.getMonth()).toString();
                if (mm.length === 1)
                    mm = '0' + mm;
                var dd = dt.getDate().toString();
                if (dd.length === 1)
                    dd = '0' + dd;
                return "'" + dt.getFullYear().toString() + "-" + mm  + "-" + dd + "'";
            },
            dateMinus: function(days) {
                var now = new Date();
                var then = new Date();
                then.setDate(now.getDate() - days);
                return then;
            },
            dateMinusFromSelectedDate: function(originalDate, daysToMinus) {
                var now = new Date(originalDate);
                now.setDate(now.getDate() - daysToMinus);
                return now;
            }
        }
    }
})();