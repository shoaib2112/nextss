/**
 * Created by MXG0RYP on 5/20/2016.
 */
//manages the data within select your area

(function(){
    angular.module('nextGrid').factory('controlPanelSelection', controlPanelSelection);
    function controlPanelSelection($rootScope){


        var service = {
            data: {
                selectedCalendarDate: new Date(),
                selectedCalendarEndDate: new Date(),
                selectedManagementArea: {},
                selectedServiceCenter: {},
                selectedSubstation: {},
                selectedFeeder: {},
                mostSpecificSelection: {},
                mostSpecificSelectionType: '',
                mostSpecificSelectionIdentifier: '',
                easyModeOn: false,
                checkBoxes:{
                    isFaultsChecked                 : false,
                    isVinesChecked                  : false,
                    isPalmsBamboosChecked           : false,
                    isLightningDayChecked           : false,
                    isTroubleTicketsChecked         : false,
                    isEquipmentLogChecked           : false,
                    isOpenConditionAssessmentsChecked : false,
                    isKnownMomentariesFeederOutagesChecked : false,
                    isLightningYTDChecked           : false,
                    isFCIChecked                    : false,
                    isFeederFailurePointsChecked    : false,
                    isComplaintsChecked             : false,
                    isALSChecked                    : false,
                    isHvtChecked                    : false
                }
            },

            getMostSpecificSelection: getMostSpecificSelection,
            getMostSpecificSelectionType: getMostSpecificSelectionType,
            getDataIdentifierByType: getDataIdentifierByType,
            setMostSpecificSelectionAndType: setMostSpecificSelectionAndType,
            turnAllInvestigationLayersOff:turnAllInvestigationLayersOff

        };

        (function init(){
            service.data.selectedCalendarDate.setDate(service.data.selectedCalendarDate.getDate() - 1);
            // console.log('CP Selection Factory');
            // console.log(service.data.checkBoxes);
        })();

        function setMostSpecificSelectionAndType(){
            service.data.mostSpecificSelection = getMostSpecificSelection();
            service.data.mostSpecificSelectionType = getMostSpecificSelectionType();
            service.data.mostSpecificSelectionIdentifier = getMostSpecificSelectionIdentifier();
        }

        function getMostSpecificSelection(){
            if(service.data.selectedFeeder !== null && service.data.selectedFeeder.name !== undefined){
                return service.data.selectedFeeder;
            }
            else if(service.data.selectedSubstation !== null && service.data.selectedSubstation._id !== undefined){
                return service.data.selectedSubstation;
            }
            else if(service.data.selectedServiceCenter !== null && service.data.selectedServiceCenter._id !== undefined){
                return service.data.selectedServiceCenter;
            }
            else if(service.data.selectedManagementArea._id !== 'All'){
                return service.data.selectedManagementArea;
            }
            //console.log('GMSS');
        }

        function getMostSpecificSelectionType(){
            if(service.data.selectedFeeder !== null && service.data.selectedFeeder.name !== undefined){
                return 'feeder';
            }
            else if(service.data.selectedSubstation !== null && service.data.selectedSubstation._id !== undefined){
                return 'sub';
            }
            else if(service.data.selectedServiceCenter !== null && service.data.selectedServiceCenter._id !== undefined){
                return 'sc';
            }
            else if(service.data.selectedManagementArea._id !== 'All'){
                return 'ma';
            }
        }

        function getMostSpecificSelectionIdentifier(){
            if(service.data.selectedFeeder !== null && service.data.selectedFeeder.name !== undefined){
                return service.data.selectedFeeder.name;
            }
            else if(service.data.selectedSubstation !== null && service.data.selectedSubstation._id !== undefined){
                return service.data.selectedSubstation._id;
            }
            else if(service.data.selectedServiceCenter !== null && service.data.selectedServiceCenter._id !== undefined){
                return service.data.selectedServiceCenter._id;
            }
            else if(service.data.selectedManagementArea._id !== 'All'){
                return service.data.selectedManagementArea._id;
            }
        }

        function getDataIdentifierByType(selectionType){
            switch(selectionType){
                case 'feeder':
                    return service.data.selectedFeeder.name;
                case 'sub':
                    return service.data.selectedSubstation._id;
                case 'sc':
                    return service.data.selectedServiceCenter._id;
                case 'ma':
                    return service.data.selectedManagementArea._id;
            }
        }

        function turnAllInvestigationLayersOff() {
            // console.log(service.data.checkBoxes);
            // console.log('off in directive');
            service.data.checkBoxes.isFaultsChecked = false;
            service.data.checkBoxes.isVinesChecked = false;
            service.data.checkBoxes.isPalmsBamboosChecked = false;
            service.data.checkBoxes.isLightningDayChecked = false;
            service.data.checkBoxes.isTroubleTicketsChecked = false;
            service.data.checkBoxes.isEquipmentLogChecked = false;
            service.data.checkBoxes.isOpenConditionAssessmentsChecked = false;
            service.data.checkBoxes.isKnownMomentariesFeederOutagesChecked = false;
            service.data.checkBoxes.isLightningYTDChecked = false;
            service.data.checkBoxes.isFCIChecked = false;
            service.data.checkBoxes.isFeederFailurePointsChecked = false;
            service.data.checkBoxes.isComplaintsChecked = false;
            service.data.checkBoxes.isALSChecked = false;
            service.data.checkBoxes.isHvtChecked = false;
        }

        return service;
    }
})();