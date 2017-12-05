/**
 * Created by MXG0RYP on 6/6/2016.
 */
(function(){
    angular.module('nextGrid').factory('palmsBamboosF', palmsBamboos);


    function palmsBamboos(DataModel, controlPanelSelection, loadScreen,areaF){
        var service = {
            data: {
                palmsBamboos: []
            },
            getDataFromServer: getDataFromServer,
            clearData: clearData
        };
        function getDataFromServer(){
            loadScreen.showWait('Loading Palms & Bamboos...', true);

            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selectionIdentifier = areaF.getDataIdentifierByType(mostSpecificSelectionType);
            
            return DataModel.getPalm(mostSpecificSelectionType, selectionIdentifier)
                .then(function (data) {
                        $.unblockUI();
                        service.data.palmsBamboos = data;
                    console.log('Investigation Palms Data Count ' + service.data.palmsBamboos.length);
                        return service.data.palmsBamboos;
                    }
                );
        }
        function clearData(){
            service.data.palmsBamboos = [];
        }
        return service;
    }
})();