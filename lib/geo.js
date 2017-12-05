'use strict';

var geo = {
    RADIUS : 0.02,

    distToPoint: function(lat1, lat2, lng1, lng2) {
        return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lng1 - lng2, 2));
    }
    
}
module.exports = geo;