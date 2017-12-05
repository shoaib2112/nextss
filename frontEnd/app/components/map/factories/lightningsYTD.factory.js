/**
 * Created by MXG0RYP on 6/20/2016.
 */
(function(){
    angular.module('nextGrid').factory('lightningsYTDF', lightningsYTD);

    function lightningsYTD(loadScreen, DataModel, controlPanelSelection, areaF){
        var service = {
            data: {
                lightningsYTD: []
            },
            getDataFromServer: getDataFromServer
        };
        
        return service;
        
        function getDataFromServer(tl, br){
            loadScreen.showWait('Loading Lightning Data', true);
            var year = areaF.data.selectedCalendarDate.getFullYear();

            return DataModel.getRawLtgYTD(year, tl, br)
                .then(function (data) {
                    $.unblockUI();
                    service.data.lightningsYTD = data;
                    return service.data.lightningsYTD;
                }
            );
        }
    }
})();