app.controller('loginCtrl', function ($scope, $uibModalInstance, DataModel, $cookies, $cookieStore) {
    $scope.login = function () {
        if (!$scope.usr.slid || !$scope.usr.password)
            return;
        DataModel.authenticate($scope.usr)
            .then(function (data) {
                if (data) {
                    if (data.authenticated) {
                        
                        var dt = new Date();
                        dt.setDate(dt.getDate() + 30);

                        $cookies.put('nextGrid_slid', $scope.usr.slid, {
                            expires: dt
                        });
                        //$.growlUI(data.message);
                        //$scope.loadMetadata();  ///////////////////////////////////
                        //$scope.loginClose();    ////////////////////////////////////
                    }
                    else {
                        $.growlUI(data.message);
                    }
                }
            });
    };

    $scope.loginClose = function () {
        $uibModalInstance.dismiss('cancel');
    };
});
app.controller('assetCtrl', function ($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('editVineCtrl', function($scope, $uibModalInstance, DataModel) {
    // this needs to be redone to update TCMS when we can do that
    $scope.vineAction = function (act) {
        $scope.vine.action = act;
        // for sprayed/held, there is no ticket number and the date is today
        if (act === 'Sprayed' || act === 'Held'){
            $scope.vine.ticketNumber = 0;
            $scope.vine.ticketDate = new Date();
        }
        $scope.vine.comments = $scope.vine.comments.replace(/'/g, ''); //remove single quote which breaks SQL
        var resp = DataModel.putVine($scope.vine);
        $uibModalInstance.close();
    };

    $scope.vineClose = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

//moved to map.controller.js
app.controller('showMatrixCtrl', function ($scope, $uibModalInstance, DataModel) {
    //$scope.matrixOk = function () { $uibModalInstance.close(); };

    //$scope.createWorkRequest = function(tln) {
        //var resp = DataModel.postWorkOrder(tln);
        // if (resp)
        //     put ok message on screen, grey out button
        // else
        //     put fail message?
    //};

    $scope.matrixClose = function () {
        $uibModalInstance.dismiss('cancel');
    };
});

app.controller('showVineCtrl', function($scope, $uibModalInstance, $uibModal) {
    $scope.vineOk = function () {
        $uibModalInstance.close();
    };

    $scope.vineClose = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.vineEdit = function(id) {
        $scope.vine = _.find($scope.vines, function(vine) {if (vine.aid === id) return vine});
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: '/modals/editVines.html?bust=' + Math.random().toString(36).slice(2),
            controller: 'editVineCtrl',
            scope: $scope,
            size: 'me'
        });
    };
});

app.controller('condCtrl', function($scope, $uibModalInstance) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };
});