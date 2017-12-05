var apphvt = angular.module('hvtApp', ['ui.bootstrap', 'ngSanitize', 'ngCsv']);
//
apphvt.controller('hvtCtrl', function($scope, hvtModel){
    $scope.today = new Date();
    $scope.twoBack = new Date();
	$scope.twoBack.setDate($scope.today.getDate() - 2);
	
    showWait('Loading...', true);
    $scope.getAMI = function(fplId){
        hvtModel.getMeters($scope.twoBack.toISOString().substr(0,10), $scope.today.toISOString().substr(0,10), fplId).then(function (meters) {
            $scope.meter = {};
            $scope.meter.fplId = fplId;
            $scope.meter.tot = 0;
            $scope.meter.cnt = 0;
            $scope.meter.min = 1000;
            $scope.meter.max = 0;
            _.each(meters, function (m) {
                $scope.meter.tot += parseInt(m.round);
                if (m.round < $scope.meter.min) $scope.meter.min = m.round;
                if (m.round > $scope.meter.max) $scope.meter.max = m.round;
                $scope.meter.cnt += 1;
            });
            $scope.meter.avg = ($scope.meter.tot/$scope.meter.cnt).toFixed(2)
        });
    };

    hvtModel.getHvtDay().then(function (txs) {
        
        hvtModel.getWorkOrders().then(function (wo) {
            $scope.workOrders = wo;
            $scope.workOrdersHdr = Object.keys($scope.workOrders[0]);
            doTransformers($scope, txs);
            $scope.todayHdr = Object.keys($scope.txDay[0]);
            
        });
    });

    hvtModel.getHvtSuppressed().then(function (txs) {
        $scope.txSuppress = [];
        _.forEach(txs, function(tx) {
            try {
                tx = JSON.parse(tx.itemJson);
                $scope.txSuppress.push(tx);
            }
            catch (e) {}
        });
        $scope.suppressHdr = Object.keys($scope.txSuppress[0]);
    });

    hvtModel.getHvtAll().then(function (txs) {
        _.forEach(txs, function (tx) {
            // subtract end date from start and compare to days on
            tx.diff = 1 + (Math.abs(new Date(tx.end) - new Date(tx.start)) /86400000);
            tx.presence = ((tx.count / tx.diff) * 1000).toFixed(0);
        });
        $scope.txAll = txs;
        $scope.allHighHdr = Object.keys($scope.txAll[0]);
    });

    hvtModel.getHvtDrop().then(function (txs) {
        $scope.txDrop = [];
        _.forEach(txs, function(tx) {
            try {
                tx = JSON.parse(tx.itemJson);
                $scope.txDrop.push(tx);
            }
            catch (e) {}
        });
        $scope.recentDropHdr = Object.keys($scope.txDrop[0]);

        $.unblockUI();
    });

    

    function doTransformers($scope, txs) {
        $scope.txDay = [];
        _.forEach(txs, function(tx) {
            try{
                tx = JSON.parse(tx.itemJson);
                var then = new Date(tx.insertDate).getTime();
                tx.days = Math.floor((Date.now() - then) / 86400000);
                tx.yellow = (tx.days > 24 && tx.days < 35);
                tx.red = (tx.days > 34);
                tx.wr = _.find($scope.workOrders, function(order) {
                    if (order.equipId === tx.ddb){
                        tx.comments = order.comments;
                        return order.workRequest;
                    }
                });
                if (tx.workOrders.length === 0){
                    tx.wo = '';
                    tx.status = '';
                }
                else{
                    tx.wo = tx.workOrders[0].Item1;
                    tx.status = tx.workOrders[0].Item2;
                }
                if (tx.status === '70'){
                    tx.green = true;
                }
                $scope.txDay.push(tx);
            }
            catch (e){}
        });
        //console.log($scope.workOrders);
        //console.log($scope.txDay);
    }
});

apphvt.service('hvtModel', function ($http) {
    var url = null;
    var port = 8080;

    this.getHvtDay = function() {
        url = "http://" + window.location.hostname + ":" + port + "/work/hvtday";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getHvtAll = function() {
        url = "http://" + window.location.hostname + ":" + port + "/work/hvtall";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getHvtSuppressed = function() {
        url = "http://" + window.location.hostname + ":" + port + "/work/hvtsup";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getHvtDrop = function() {
        url = "http://" + window.location.hostname + ":" + port + "/work/hvtdrop";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getWorkOrders = function() {
        url = "http://" + window.location.hostname + ":" + port + "/work";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getMeters = function(from, to, id) {
        url = "http://" + window.location.hostname + ":" + port + "/ami/meters/?dateFrom=" + from + "&dateTo=" + to + "&fplID=" + id;
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