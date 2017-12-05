/**
 * Created by MXG0RYP on 6/1/2016.
 */
(function(){
    angular.module('nextGrid').factory('troubleTicketsF', troubleTickets);

    function troubleTickets(DataModel, controlPanelSelection, loadScreen, areaF){
        var service = {
            data: {
                troubleTickets: [],
                ticketArray : ['FDR', 'OCR', 'LAT', 'TX', 'SEC', 'MTR', 'NLS', 'SV'],
            },
            getDataFromServer: getDataFromServer,
            clearTroubleTickets: clearTroubleTickets
        };

        return service;

        function getDataFromServer(){
            loadScreen.showWait('Loading Trouble Tickets...', true);

            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selectionIdentifier = areaF.getDataIdentifierByType(mostSpecificSelectionType).replace(/_/g,' '),
                feederList = [],
                selectedCalendarDate = areaF.data.selectedCalendarDate,
                stringSelectedCalendarDate = moment(selectedCalendarDate).format('YYYY-MM-DD').toString(),
                selectedCalendarEndDate = areaF.data.selectedCalendarEndDate,
                stringSelectedCalendarEndDate = moment(selectedCalendarEndDate).format('YYYY-MM-DD').toString();
            //var endDate = controlPanelSelection.data.selectedCalendarEndDate;
            
            return DataModel.getTicket(mostSpecificSelectionType, selectionIdentifier, stringSelectedCalendarDate,stringSelectedCalendarEndDate, null)
                .then(function (data) {
                    
                    service.data.troubleTickets = data;
                    console.log('Investigation Trouble Tickets Data Count ' + service.data.troubleTickets.length);
                    $.unblockUI();
                    
                    return service.data.troubleTickets;
                });
        }

        function clearTroubleTickets(){
            service.data.troubleTickets = [];
        }
    }
})();