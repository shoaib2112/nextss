angular.module('nextGrid').factory('sharedService', function () {
    
    return {
        logout: function ($scope, $cookies) {
            showNotification('Busy...');
            setTimeout(function () {  
                $cookies.remove('nextGrid_slid');
                initializeScope($scope);
                $scope.showLogin();
                $('.notifyjs-wrapper').trigger('notify-hide');            
            }, 200);
        }
    };
});