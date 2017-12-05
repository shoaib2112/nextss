/**
 * Created by MXG0RYP on 5/8/2017.
 */
/**
 * Created by MXG0RYP on 4/16/2017.
 */
(function(){
    angular.module('nextGrid').factory('cmeDemoF', cmeDemoF);

    function cmeDemoF(controlPanelSelection, areaF, loadScreen, DataModel, $http){

        var service = {
            data: {},
            getDataFromServer: getDataFromServer
        };

        return service;

        function getDataFromServer(){
            console.log(areaF.data.selectedSubstation);
            return DataModel.getCMEData(areaF.data.selectedCalendarDate, areaF.data.selectedCalendarEndDate, 'ACREAGE').then(function(resp){
                return resp;
            });
        }



    }

})();