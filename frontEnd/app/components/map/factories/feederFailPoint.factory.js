/**
 * Created by AJH0e3s on 2/9/2017.
 */
(function(){
    angular.module('nextGrid').factory('feederFailPointF', feederFailPoints);

    function feederFailPoints(DataModel, controlPanelSelection){
        var service = {
            data: {
                feederFailurePoints: []
            },
            getDataFromServer: getDataFromServer
        };

        return service;


        function getDataFromServer(){
            //loadScreen.showWait('Loading Trouble Tickets...', true);

            var mostSpecificSelectionType = controlPanelSelection.getMostSpecificSelectionType(),
                selectionIdentifier = controlPanelSelection.getDataIdentifierByType(mostSpecificSelectionType);
                //feederList = [];
                // selectedCalendarDate = controlPanelSelection.data.selectedCalendarDate,
                // stringSelectedCalendarDate = moment(selectedCalendarDate).format('YYYY-MM-DD').toString(),
                // selectedCalendarEndDate = controlPanelSelection.data.selectedCalendarEndDate,
                // stringSelectedCalendarEndDate = moment(selectedCalendarEndDate).format('YYYY-MM-DD').toString();
            //var endDate = controlPanelSelection.data.selectedCalendarEndDate;

            return DataModel.getfeederFailurePoints(mostSpecificSelectionType, selectionIdentifier)
                .then(function (data) {
                    console.log(data);
                    // $.unblockUI();
                    service.data.feederFailurePoints = [data];
                    if (data.length==0 || data==undefined){
                        service.data.feederFailurePoints.status =0;
                    }
                    return service.data.feederFailurePoints;
                });
        }

        function clearTroubleTickets(){
            service.data.feederFailurePoints = [];
        }
    }
})();