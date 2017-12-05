var appmon = angular.module('monApp', ['ui.bootstrap']);

appmon.controller('datamonCtrl', function($scope, monModel){
    $scope.myOrder = 'id';
    $scope.ud = false;

    showWait('Loading...', true);
    monModel.getMonitorC().then(function (m) {
        $scope.rows = m;
        //console.log($scope.rows);
        for (var i = 0; i < $scope.rows.length; i++){
            if ($scope.rows[i].message != null && $scope.rows[i].message != '' && $scope.rows[i].message != ' ' && $scope.rows[i].message.toUpperCase() != 'OK')
                $scope.rows[i].red = true;
        }

        $.unblockUI();
    });
    
    monModel.getMonitorJ().then(function (m) {
        $scope.rows2 = m;
    });    
});

appmon.service('monModel', function ($http) {
    var url = null;
    var port = 8080;

    this.getMonitorC = function () {
        url = "http://" + window.location.hostname + ":" + port + "/monitor";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        )
    };

    this.getMonitorJ = function () {
        url = "http://" + window.location.hostname + ":" + port + "/monitor/j";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        )
    }    
});

appmon.filter('addSpaces', function () {
	return function (input) {
		if (input) {
			return input.replace(","/g ,",\s");
		}
	}
});