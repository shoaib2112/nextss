var appfci = angular.module('myApp', ['ui.bootstrap', 'ngSanitize', 'ngCsv']);

appfci.controller('indexCtrl', function($scope, fciModel){
    fciModel.getSummary().then(function(summary) {
        console.log(summary);
        totalChart($scope, summary[0]);
        alarmChart($scope, summary[0]);
        pointsInScope($scope, summary[0]);
    });
});

function totalChart($scope, summary){
    $scope.total = [summary.IN_SCAN.total, 
                    summary.PWR_LOW.total, 
                    summary.COUNTER_SYS_BOOT.total, 
                    summary.BATTERY_LIFE.total, 
                    summary.ENERGY_RESV_mV.total, 
                    summary.RADIO_STATUS.total ];

    var scale = d3.scale.linear($scope).domain([0, d3.max($scope.total)]).range([0,200]);
    makeBarChart($scope.total, scale, "#total");    
}

function alarmChart($scope, summary){
    $scope.alarm = [summary.IN_SCAN.alarm, 
                    summary.PWR_LOW.alarm, 
                    summary.COUNTER_SYS_BOOT.alarm, 
                    summary.BATTERY_LIFE.alarm, 
                    summary.ENERGY_RESV_mV.alarm, 
                    summary.RADIO_STATUS.alarm ];
    var scale = d3.scale.linear($scope).domain([0, d3.max($scope.alarm)]).range([0,400]);
    makeBarChart($scope.alarm, scale, "#alarm");    
}

function pointsInScope($scope, summary){
    $scope.when = summary.created; 
    $scope.pointsOutOfScan = summary.IN_SCAN.inAlarm;
    $scope.pointsPowerLow = summary.PWR_LOW.inAlarm;
    $scope.pointsSysBoot = summary.COUNTER_SYS_BOOT.inAlarm;
    $scope.pointsBatteryLife = summary.BATTERY_LIFE.inAlarm;
    $scope.pointsEnergyReserve = summary.ENERGY_RESV_mV.inAlarm;
    $scope.pointsRadioStatus = summary.RADIO_STATUS.inAlarm;   
}

function makeBarChart(data, scale, div){
    d3.select(div)
    .selectAll("div")
    .data(data)
    .enter().append("div")
    .style("width", function(d) {
        return 20 + scale(d) + "px";
    })
    .text(function(d) {
        return d;
    });
};

appfci.service('fciModel', function ($http) {
    var url = null;
    var port = 8080;

    this.getSummary = function() {
        url = "http://" + window.location.hostname + ":" + port + "/fci";
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