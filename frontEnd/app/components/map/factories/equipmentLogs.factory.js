/**
 * Created by MXG0RYP on 6/2/2016.
 */
(function(){

    angular.module("nextGrid")
        .factory('equipmentLogsF', equipmentLogs);

    function equipmentLogs(loadScreen, DataModel, controlPanelSelection, areaF){
        var service = {
            data: {
                equipmentLogs: []
            },
            getDataFromServer: getDataFromServer,
            clearEquipmentLogs: clearEquipmentLogs
        };

        function getDataFromServer(){
            loadScreen.showWait('Loading Equipment Logs...', true);

            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selection = areaF.getDataIdentifierByType(mostSpecificSelectionType);
            return DataModel.getEquip(mostSpecificSelectionType, selection).then(function (data) {

                
                service.data.equipmentLogs = data;

                $.unblockUI();
                return service.data.equipmentLogs;
                
                // $scope.equip = data;
                // drawEquipmentLog($scope);
                
                // if ($scope.equip.length < 1) {
                //     $('#equipMessage').removeClass("hide");
                // }
                // else {
                //     $('#equipMessage').addClass("hide");
                // }
            });
        }

        function clearEquipmentLogs(){
            service.data.equipmentLogs = [];
        }

        return service;
    }

})();