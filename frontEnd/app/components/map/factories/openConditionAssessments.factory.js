/**
 * Created by MXG0RYP on 6/6/2016.
 */
(function(){
    angular.module('nextGrid').factory('openConditionAssessmentF', openConditionAssessment);
    
    function openConditionAssessment(loadScreen, controlPanelSelection, DataModel, areaF) {
        var service = {
            data: {
                openConditionAssessments : []
            },
            getDataFromServer: getDataFromServer
            
        };
        
        function getDataFromServer(){
            loadScreen.showWait('Loading Open Condition Assessments...', true);
            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selection = areaF.getMostSpecificSelection(),
                feederList = [];
            // selectedCalendarDate = controlPanelSelection.data.selectedCalendarDate;



            if(mostSpecificSelectionType === 'sub'){
                selection.feeders.forEach(function(feeder){
                    mostSpecificSelectionType = 'feeders';
                    feederList.push(feeder.name);
                });
            }
            else if(mostSpecificSelectionType === 'feeder') {
                mostSpecificSelectionType = 'feeders';
                feederList = selection.name;
            }

            return DataModel.getCond(mostSpecificSelectionType, feederList).then(function (data) {
                    $.unblockUI();
                // console.log(data);
                if(data.status==0){

                }else{
                    // data.forEach(function(d){
                        // if(d.image1 !==null && d.image1.indexOf('goxsa1102')== -1) {
                        //     console.log(d.image1);
                        // }
                //
                //     // if(d.image1 !==null && d.image1.indexOf('goxsa1102')== -1){
                //     //     // console.log(d);
                //     //     d.image1=d.image1.replace('goxsa1102' ,'cainspect'); d.image1=d.image1.replace('GOXSA1102' ,'cainspect');
                //     // }
                // });
                }

                    service.data.openConditionAssessments = data;
                    console.log('Investigation Open CA count ' + data.length);
                    return service.data.openConditionAssessments;
                }
            );
        }
        
        return service;
    }
})();