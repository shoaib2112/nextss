/**
 * Created by MXG0RYP on 6/14/2016.
 */

(function(){
    angular.module('nextGrid').directive('areaDateInvestigationSelection', areaDateInvestigationSelection);
    
    function areaDateInvestigationSelection(controlPanelSelection,
                                            managementArea,
                                            faults,
                                            stemNGS,
                                            loadScreen,
                                            troubleTicketsF,
                                            equipmentLogsF,
                                            vinesF,
                                            $uibModal) {

        var directive = {
            link: link,
            templateUrl: 'app/components/map/directives/areaDateInvestigationSelection.view.html',
            restrict: 'E'
        };

        return directive;

        function link(scope, element, attrs) {
            (function init(){

                setInterval(function(){
                    console.log(scope.controlPanelSelectionData.selectedServiceCenter._id);
                }, 1000);
                scope.isInvestigationCollapsed = true;

                //all functions bounded to view
                scope.managementAreaSelected = managementAreaSelected;
                scope.serviceCenterSelected = serviceCenterSelected;
                scope.substationSelected = substationSelected;
                scope.feederSelected = feederSelected;
                scope.onSelectSearchSubstation = onSelectSearchSubstation;
                scope.turnAllInvestigationLayersOff = turnAllInvestigationLayersOff;
                scope.toggleFault = toggleFault;
                scope.toggleLightningDay = toggleLightningDay;
                scope.toggleTroubleTickets = toggleTroubleTickets;
                scope.toggleEquipmentLog = toggleEquipmentLog;
                scope.toggleVines = toggleVines;
                scope.toggleMOMsChecked = toggleMOMsChecked;
                scope.toggleOpenConditionAssessmentsChecked = toggleOpenCondAssessChecked;
                scope.togglePalmsBamboos = togglePalmsBamboos;
                scope.showVinesList = showVinesList;

                //functions for checkboxes
                scope.toggleFaults = toggleFaults;

                scope.checkBoxes = {};

                scope.selectAreaIsOpen = true;

                //binding this controller to data  of controlPanelSelection Factory
                scope.controlPanelSelectionData = controlPanelSelection.data;
                


                //pagination setting default page
                // scope.troubleTicketsCurrentPage = 1;

                //binding this controller to data of faults factory
                scope.faultsData = faults.data;

                //binding this controller to data of troubleTickets factory
                scope.troubleTicketsData = troubleTicketsF.data;

                //binding equipmentLogs factory data to the view
                scope.equipmentLogsData = equipmentLogsF.data;

                //binding vines factory data to the view
                scope.vinesData = vinesF.data;

                scope.isVinesOpen = true;

                //scope.feederFailurePointsData = feederFailPointF.data;


                //    configuration for calendar
                scope.dateOptions = {
                    dateFormat: 'mm-dd-yy',
                    formatYear: 'yy',
                    startingDay: 1,
                    showWeeks:false //Adding this line solve the issue in the controller
                };

                scope.isControlPanelClosed = false;

                //load managemenet Areas, Service Centers, Substations, and feeders
                managementArea.getDataFromServerAndFormat().then(function(managementAreaData){
                    console.log('managementAreaData: ', managementAreaData);
                    scope.managementAreas = managementAreaData;

                    showAllManagementAreasServiceCentersSubstations();
                });
            })();

            function managementAreaSelected(){
                var tempSubstationList = {};
                if(scope.controlPanelSelectionData.selectedManagementArea._id === 'All'){
                    showAllManagementAreasServiceCentersSubstations();
                }
                else {

                    scope.serviceCentersList = scope.controlPanelSelectionData.selectedManagementArea.serviceCenters;

                    for (var key in scope.controlPanelSelectionData.selectedManagementArea.serviceCenters) {
                        if (scope.controlPanelSelectionData.selectedManagementArea.serviceCenters.hasOwnProperty(key)) {
                            angular.merge(tempSubstationList, scope.controlPanelSelectionData.selectedManagementArea.serviceCenters[key].substations);
                        }
                    }

                    scope.substationsList = tempSubstationList;
                    controlPanelSelection.setMostSpecificSelectionAndType();
                }


            }

            function serviceCenterSelected(){

                if(scope.controlPanelSelectionData.selectedServiceCenter !== null) {
                    scope.controlPanelSelectionData.selectedManagementArea = scope.managementAreas[scope.controlPanelSelectionData.selectedServiceCenter.substations[Object.keys(scope.controlPanelSelectionData.selectedServiceCenter.substations)[0]].ma]
                    scope.substationsList = scope.controlPanelSelectionData.selectedServiceCenter.substations;

                    controlPanelSelection.setMostSpecificSelectionAndType();
                }
            }

            function substationSelected(){
                if(scope.controlPanelSelectionData.selectedSubstation !== null){
                    scope.controlPanelSelectionData.selectedManagementArea = scope.managementAreas[scope.controlPanelSelectionData.selectedSubstation.ma];
                    scope.serviceCentersList = scope.controlPanelSelectionData.selectedManagementArea.serviceCenters;
                    scope.controlPanelSelectionData.selectedServiceCenter = scope.managementAreas[scope.controlPanelSelectionData.selectedSubstation.ma].serviceCenters[scope.controlPanelSelectionData.selectedSubstation.sc];
                    scope.substationsList = scope.controlPanelSelectionData.selectedServiceCenter.substations;
                    scope.controlPanelSelectionData.selectedSubstation = scope.substationsList[scope.controlPanelSelectionData.selectedSubstation._id];


                    //    reseting the investigation layer
                    turnAllInvestigationLayersOff();

                    controlPanelSelection.setMostSpecificSelectionAndType();
                    stemNGS.initiateSubstationGridClear();
                    stemNGS.initiateSubstationGridDraw();

                }
            }

            function feederSelected(){
                controlPanelSelection.setMostSpecificSelectionAndType();
            }

            function showAllManagementAreasServiceCentersSubstations(){
                scope.controlPanelSelectionData.selectedManagementArea = scope.managementAreas['all'];
                scope.serviceCentersList = scope.managementAreas['all'].serviceCenters;
                scope.substationsList = scope.managementAreas['all'].serviceCenters['all'].substations;
            }

            function onSelectSearchSubstation(searchedSubstation){
                scope.controlPanelSelectionData.selectedManagementArea = scope.managementAreas[searchedSubstation.ma];

                scope.serviceCentersList = scope.controlPanelSelectionData.selectedManagementArea.serviceCenters;

                scope.controlPanelSelectionData.selectedServiceCenter = scope.controlPanelSelectionData.selectedManagementArea.serviceCenters[searchedSubstation.sc];

                scope.substationsList = scope.controlPanelSelectionData.selectedServiceCenter.substations;

                scope.controlPanelSelectionData.selectedSubstation = scope.controlPanelSelectionData.selectedServiceCenter.substations[searchedSubstation._id];

                clearSearchSubstation();

                turnAllInvestigationLayersOff();

                controlPanelSelection.setMostSpecificSelectionAndType();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateSubstationGridDraw();
            }

            function turnAllInvestigationLayersOff(){
                scope.checkBoxes.isFaultsChecked = false;
                toggleFaults();

                scope.checkBoxes.isLightningDayChecked = false;
                toggleLightningDay();

                scope.checkBoxes.isTroubleTicketsChecked = false;
                toggleTroubleTickets();

                scope.checkBoxes.isEquipmentLogChecked = false;
                toggleEquipmentLog();

                scope.checkBoxes.isOpenConditionAssessmentsChecked = false;
                toggleOpenCondAssessChecked();

                scope.checkBoxes.isKnownMomentariesFeederOutagesChecked = false;
                toggleMOMsChecked();
            }

            function clearSearchSubstation(){
                scope.searchedSubstation = "";
            }

            function toggleFaults(){


                if(scope.checkBoxes.isFaultsChecked){
                    if (scope.controlPanelSelectionData.selectedCalendarDate  === '') {
                        //TODO look into having the popup show on the bottom right of the app as opposed to the top right
                        $.growlUI('Please pick a date.');
                        scope.checkBoxes.isFaultsChecked = false;
                        return;
                    }

                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }

                    stemNGS.initiateFaultsClear();
                    stemNGS.initiateFaultsDrawing();
                }
                else{
                    stemNGS.initiateFaultsClear();
                    faults.clearFaults();
                }
            }

            function toggleFault(fault){
                // var faultIndex = 0;
                //
                // for(var i=0, len = faults.data.faults.length; i++; i<len){
                //     if(fault.id === faults.data.faults[i].id){
                //         faultIndex = faults.data.faults[i];
                //         break;
                //     }
                // }

                var numOfFaults = 0,
                    singleFault = {};

                fault.isActive = !fault.isActive;

                stemNGS.initiateFaultsClear();

                //seeing if we have one fault or multiple active
                faults.data.faults.forEach(function(element){
                    if(element.isActive === true){
                        numOfFaults+=1;
                        singleFault = element;
                    }
                });
                if(numOfFaults >= 2){
                    stemNGS.initiateFaultsDrawing();
                }
                else if(numOfFaults === 1){
                    stemNGS.drawFault(singleFault);
                }
                else{
                    stemNGS.initiateFaultsClear();
                    console.log("no faults selected");
                }
            }

            function toggleLightningDay(){


                if(scope.checkBoxes.isLightningDayChecked){
                    if (scope.controlPanelSelectionData.selectedCalendarDate  === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isLightningDayChecked = false;
                        return;
                    }
                    stemNGS.initiateLightningDayDrawing();
                }

                else{
                    stemNGS.initiateLightningDayClear();
                }
            }

            function toggleTroubleTickets(){


                if(scope.checkBoxes.isTroubleTicketsChecked){
                    if (scope.controlPanelSelectionData.selectedCalendarDate  === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isTroubleTicketsChecked = false;
                        return;
                    }
                    stemNGS.initiateTroubleTicketsDrawing();
                }

                else{
                    stemNGS.initiateTroubleTicketsClear();
                }



                // $scope.activeLevel = 'tickets';
                //
                // $("#tab-wrapper").removeClass("tabHide hide").addClass("tabShow");
                // swapClass('#tktTab, #tktTabLink', '#chartTab, #faultsTab,#EquipLog', 'active');
                // $("#tktTabLink").removeClass("hide");
                // checkTab();
            }

            function toggleEquipmentLog(){
                if(scope.checkBoxes.isEquipmentLogChecked) {
                    //get equipment log data
                    equipmentLogsF.getDataFromServer();
                    //     .then(function(data){
                    //     debugger;
                    //     scope.equipmentLogsData = data;
                    // })
                }
                else{
                    equipmentLogsF.clearEquipmentLogs();
                    //    delete equipment log data
                }

                // showWait();
                // setBounds($scope, DataModel);
                // $scope.activeLevel = 'equip';
                // //$('#equipBtn').addClass('active');
                // if (!$scope.oneDate)
                //     $scope.now = dateMinus(1);
                // else
                //     $scope.now = new Date($scope.oneDate);
                //
                // DataModel.getEquip($scope.selectionType, $scope.selection).then(function (data) {
                //     $scope.equip = data;
                //     drawEquipmentLog($scope);
                //     $.unblockUI();
                //     if ($scope.equip.length < 1) {
                //         $('#equipMessage').removeClass("hide");
                //     } else {
                //         $('#equipMessage').addClass("hide");
                //     }
                // }
            }

            function togglePalmsBamboos(){

                if(scope.checkBoxes.isPalmsBamboosChecked){
                    stemNGS.initiatePalmsBamboosDrawing();
                }
                else{
                    stemNGS.initiatePalmsBamboosClear();
                }
            }

            function toggleVines() {
                if(scope.checkBoxes.isVinesChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isVinesChecked = false;
                        return;
                    }
                    stemNGS.initiateVinesDrawing();
                }

                else {
                    stemNGS.initiateVinesClear();
                }
            }

            function showVinesList() {
                $uibModal.open({
                    animation: scope.animationsEnabled,
                    templateUrl: '/app/components/map/modals/showVines.html?bust=' + Math.random().toString(36).slice(2),
                    controller: 'showVineCtrl',
                    scope: scope,
                    size: 'lg'
                });
            };

            function toggleMOMsChecked(){
                if(scope.checkBoxes.isKnownMomentariesFeederOutagesChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isKnownMomentariesFeederOutagesChecked = false;
                        return;
                    }
                    stemNGS.initiateKnownMomentariesFeederOutagesDrawing();
                }
                else {
                    stemNGS.initiateKnownMomentariesFeederOutagesClear();
                }
            }

            function toggleOpenCondAssessChecked() {
                if(scope.checkBoxes.isOpenConditionAssessmentsChecked) {
                    stemNGS.initiateOpenConditionAssessmentsDrawing();
                }

                else {
                    stemNGS.initiateOpenConditionAssessmentsClear();
                }
            }
        }
    }
})();