/**
 * Created by MXG0RYP on 5/16/2016.
 */
(function(){
    angular.module('nextGrid').controller('myMapCtrl', myMapCtrl);

    function myMapCtrl($scope, DataModel, loadScreen, areaF, momCountsF, $uibModal, $cookies, $state) {

        //a container object to allow this controller to specific functions within the leaflet directive
        $scope.leafletControls = {};
        $scope.controlPanelSelectionData = areaF.data;

        //TODO connect to new area selection in the header

        $scope.openMatrixModal = function (e) {
            loadScreen.showWait();
            var dt = new Date();
            dt.setDate(dt.getDate() - 365);
            var mit = {
                dtbegin: dt.toISOString().split('T')[0], // '2016-01-05',
                //dtend fomerly known as $scope.then
                dtend: dt.toISOString().split('T')[0], //'2016-01-05',
                feeder_num: ''
            };

            DataModel.getMatrix(mit)
                .then(function (data) {
                    $scope.mitmatrix = [];
                    $scope.mitmatrix = data;

                    $uibModal.open({
                        animation: $scope.animationsEnabled,
                        draggable: true,
                        templateUrl: 'app/components/map/modals/mit-matrix.html',
                        controller: 'showMatrixCtrl',
                        scope: $scope,
                        size: 'lg',

                    });
                    $.unblockUI();
                    window.setTimeout(function () {
                        if ($scope.ma) {
                            document.getElementById("MITmalist").value = $scope.ma;
                            if ($scope.sub) {
                                document.getElementById("MITsublist").value = $scope.sub;
                                if ($scope.feeder) {
                                    document.getElementById("MITfeederlist").value = $scope.feeder;
                                }
                            }
                        }
                    }, 150);
                });
        };

        $scope.logout = function () {
            $cookies.remove('nextGrid_slid');
            $state.transitionTo('login');
        };

        var init = function () {
            //loadScreen.showWait('Loading', false);
            $scope.usr = {
                slid: null,
                password: null,
                name_first: null,
                name_last: null,
                fpl_email: null,
                name_formatted: null,
                security : {}
            };
            if ($cookies.get('nextGrid_slid')) {

                DataModel.getGroups($cookies.get('nextGrid_slid'))
                    .then(function (data) {
                        // console.log(data[0]);
                        if(data[0]){
                            // console.log(data[0]);
                            $scope.usr.slid = data[0].slid;
                            $scope.usr.security = data[0].security;
                        }else{
                            $scope.usr = {slid:'',
                                security : {canEditMIT : 'false'}
                            }
                        }
                        momCountsF.data.usrSlid = $scope.usr;
                        // console.log('from controller', momCountsF.data.usrSlid);
                        $.unblockUI();
                    });
            }
            else{
                // $scope.showLogin();
                $state.transitionTo('login');
            }
        }();
    }
    
})();