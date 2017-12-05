/**
 * Created by MXG0RYP on 5/11/2016.
 */

(function(){
    angular.module('nextGrid').controller('homeCtrl', homeCtrl);

    function homeCtrl($scope){
        $scope.testVar = 0;
        $scope.stopCounting = stopCounte;
        
        var myInterval = setInterval(function(){
            $scope.$apply(function(){
                $scope.testVar++;
            })
        }, 1000);
        
        function stopCounte(){
            clearInterval(myInterval);
        }

        setTimeout(function(){
            clearInterval(myInterval);
        }, 5000);
    }
})();


