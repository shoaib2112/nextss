/**
 * Created by AJH0e3s on 2/9/2017.
 */
(function(){
    angular.module('nextGrid').factory('complaintsF', complaints);

    function complaints(DataModel, controlPanelSelection, areaF){
        var service = {
            data: {
                complaints: []
            },
            getDataFromServer: getDataFromServer
        };

        return service;


        function getDataFromServer(){
            clearComplaints();
            //loadScreen.showWait('Loading Complaints...', true);
            //console.log(controlPanelSelection.data.selectedSubstation);
            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selectionIdentifier = areaF.getDataIdentifierByType(mostSpecificSelectionType),
                feederList = [];

            //TODO fix when substation added to service - or get feeder list and pass feeder list in 
            if (mostSpecificSelectionType == 'sc'){
                mostSpecificSelectionType = 'ma';
                selectionIdentifier= areaF.data.selectedManagementArea._id;
            }
            if(mostSpecificSelectionType == 'sub'){
                mostSpecificSelectionType = 'feeder';
                areaF.data.selectedSubstation.feeders.forEach(function(fdr){
                    feederList.push(fdr.name);
                });
                selectionIdentifier = feederList
            }

            return DataModel.getComplaints(mostSpecificSelectionType, selectionIdentifier)
                .then(function (data) {
                    // $.unblockUI();
                    service.data.complaints = data;
                    if (data.length==0){
                        service.data.complaints.status =0;
                    }
                    return service.data.complaints;
                });
        }

        function clearComplaints(){
            service.data.complaints = [];
        }
    }
})();