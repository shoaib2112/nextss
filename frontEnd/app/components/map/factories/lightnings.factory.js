/**
 * Created by MXG0RYP on 5/31/2016.
 */
(function(){
    angular.module('nextGrid').factory('lightningsF', lightnings);

    function lightnings(loadScreen, DataModel, controlPanelSelection, areaF){
        var service = {
            data: {
                lightnings: []
            },
            getDataFromServer: getDataFromServer
        };

        return service;

        function getDataFromServer(){
            loadScreen.showWait('Loading Lightning Data...', true);
            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selection = areaF.getDataIdentifierByType(mostSpecificSelectionType),
                selectedCalendarDate = areaF.data.selectedCalendarDate,
                selectedCalendarEndDate = areaF.data.selectedCalendarEndDate;
            
            return DataModel.getLtgDay(mostSpecificSelectionType, selection, selectedCalendarDate,selectedCalendarEndDate, null)
                .then(function (data) {
                    service.data.lightnings = data;
                        $.unblockUI();

                    if(data.status === 0) {
                        $.growlUI('No Known Lightning');
                    }
                    console.log('Investigation Lit Data Count ' + service.data.lightnings.length);
                    // console.log(service.data.lightnings);
                    return service.data.lightnings;
                    }
                );
        }
    }
})();