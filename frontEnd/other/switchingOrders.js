var appso = angular.module('soApp', ['ui.bootstrap', 'ngSanitize', 'ngCsv']);

appso.controller('switchingCtrl', function($scope, soModel){
    showWait('Loading...', true);
    $scope.myOrder = 'ma';
    $scope.ud = false;

    soModel.getOrders('complete').then(function (socom) {
        $scope.completedOrders = socom;
        $scope.keysC = Object.keys($scope.completedOrders[0]);
    });

    soModel.getOrders('incomplete').then(function (socom) {
        $scope.incompleteOrders = socom;
        $scope.keysI = Object.keys($scope.incompleteOrders[0]);
    });

    soModel.getOrders('written').then(function (socom) {
        $scope.writtenOrders = socom;
        $scope.keysW = Object.keys($scope.writtenOrders[0]);
        $.unblockUI();
    });

});

appso.service('soModel', function ($http) {
    var url = null;
    var port = 8080;

    this.getOrders = function(callType) {
        url = "http://" + window.location.hostname + ":" + port + "/so/" + callType;
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };
});