/**
 * Created by MXG0RYP on 6/29/2016.
 */
(function(){
    angular.module('nextGrid').controller('loginCtrl', loginCtrl);

    function loginCtrl($scope, DataModel, $cookies, $cookieStore, $state, loadScreen) {
        $scope.login = function () {
            //console.log(DataModel.usr);
            $scope.isInputEmpty();
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
                            DataModel.getGroups($scope.usr.slid)
                                .then(function (data) {
                                    $scope.usr.security = data[0].security;
                                    //$.unblockUI();
                                });
                            //$.growlUI(data.message);
                            //$scope.loadMetadata();  ////////////////////////////////////
                            $scope.loginClose();    ////////////////////////////////////
                        }
                        else {
                            $.growlUI(data.message);
                            document.getElementById('loginError').innerHTML ='Invalid Username or Password';
                        }
                    }
                });
        };

        $scope.loginClose = function () {
            $state.transitionTo('map');
        };

        //AJH added for frontend functionality
         $scope.isInputEmpty = function(input){
            var msg ='';
            if (document.getElementById('slid').value==''){
                msg = 'You must enter a SLID';
                $('#slid').addClass('b-red');
            }else if (document.getElementById('slid').value!==''){
                 $('#slid').removeClass('b-red');
             }
             if (document.getElementById('passwordField').value==''){
                 if (document.getElementById('slid').value==''){
                     msg +='<br />';
                     $('#passwordField').addClass('b-red');
                 }
                 msg += 'You must enter a Password';
             }else  if (document.getElementById('passwordField').value==''){
                 $('#passwordField').removeClass('b-red');
             }
             document.getElementById('loginError').innerHTML =msg;
        };

    }
})();