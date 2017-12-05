/**
 * Created by MXG0RYP on 6/27/2016.
 */
angular.module('nextGrid').controller('loginCtrl', function ($scope, $uibModalInstance, DataModel, $cookies, $cookieStore) {
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
                        //$scope.loadMetadata();  ////////////////////////////////////
                        $scope.loginClose();    ////////////////////////////////////
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