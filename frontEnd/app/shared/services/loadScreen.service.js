/**
 * Created by MXG0RYP on 5/17/2016.
 */
(function(){
    angular.module('nextGrid').service('loadScreen', loadScreen);

    function loadScreen(){
        return {
            showWait: function(msg, hidegif) {
                $.blockUI({
                    css: {
                        border: 'none',
                        padding: '4px',
                        backgroundColor: '#000',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        opacity: .5,
                        color: '#fff',
                        baseZ: 200000
                    },
                    theme: false,
                    title: 'NextGrid',
                    message: '<h1><b>' + (msg || 'Loading') + '&nbsp;' + (!hidegif ? '<img src="images/ajax-loader.gif"/>' : '') + '</b></h1>'
                });
            },
            showNotification: function(msg) {
            var opts = {
                // whether to hide the notification on click
                clickToHide: false,
                // whether to auto-hide the notification
                autoHide: false,
                arrowShow: true,
                // arrow size in pixels
                arrowSize: 5,
                // position defines the notification position though uses the defaults below
                position: 'top right',
                // default positions
                globalPosition: 'top center',
                // default style
                style: 'bootstrap',
                // default class (string or [string])
                //className: 'biggerinfo',
                // show animation
                showAnimation: 'slideDown',
                // show animation duration
                showDuration: 150,
                // hide animation
                hideAnimation: 'slideUp',
                // hide animation duration
                hideDuration: 50,
                // padding between element and notification
                gap: 2
            };
            $.notify(msg || 'Please wait...', opts);
        }
        }
    }
})();