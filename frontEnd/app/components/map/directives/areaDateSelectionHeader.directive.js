/**
 * Created by MXG0RYP on 4/11/2017.
 */
(function() {
    angular.module('nextGrid').directive('areaDateSelectionHeader', areaDateSelectionHeader);

    function areaDateSelectionHeader(controlPanelSelection,
                                     // managementArea,
                                     areaF,
                                     momCountsF,
                                     faults,
                                     mapFactory,
                                     stemNGS,
                                     loadScreen,
                                     troubleTicketsF,
                                     equipmentLogsF,
                                     vinesF,
                                     lightningsF,
                                     openConditionAssessmentF,
                                     knownMomentariesFeederOutagesF,
                                     palmsBamboosF,
                                     feederFailPointF,
                                     fciF, complaintsF,
                                     // investigationF,
                                     $uibModal) {
        var directive = {
            link: link,
            templateUrl: 'app/components/map/directives/areaDateSelectionHeader.view.html',
            restrict: 'E',
            //may not need this two way binding anymore
            scope: {
                leafletControls: '='
            }
        };

        return directive;
        //TODO AJH See about "No results" (bootstrap Alerts) notifications being dismissible:
        // They can currently be made dismissable, but then will not re-appear when they should if the parameters are changed.

        function link(scope, element, attrs) {

            (function init() {
                scope.isCalendarOpen = false;
                scope.isCalendarEndOpen = false;
                //all functions bounded to view
                scope.managementAreaSelected = managementAreaSelected;
                scope.serviceCenterSelected = serviceCenterSelected;
                scope.substationSelected = substationSelected;
                scope.substationSelectedVerticeGrid = substationSelectedVerticeGrid;
                scope.feederSelected = feederSelected;
                // scope.setManagementAreaById= setManagementAreaById;
                scope.calendarDaySelected = calendarDaySelected;
                scope.onSelectSearchSubstation = onSelectSearchSubstation;
                scope.turnAllInvestigationLayersOff = turnAllInvestigationLayersOff;
                scope.toggleFault = toggleFault;
                scope.toggleCombinedFault = toggleCombinedFault;
                scope.toggleLightningDay = toggleLightningDay;
                scope.toggleLightningYTD = toggleLightningYTD;
                scope.toggleTroubleTickets = toggleTroubleTickets;
                scope.toggleEquipmentLog = toggleEquipmentLog;
                scope.toggleVines = toggleVines;
                scope.toggleKnownMomentariesFeederOutagesChecked = toggleKnownMomentariesFeederOutagesChecked;
                scope.toggleOpenConditionAssessmentsChecked = toggleOpenConditionAssessmentsChecked;
                scope.togglePalmsBamboos = togglePalmsBamboos;
                scope.toggleFCIs = toggleFCIs;
                scope.toggleComplaints = toggleComplaints;
                scope.toggleFeederFailurePoints = toggleFeederFailurePoints;
                scope.setEndDateTime = setEndDateTime;
                scope.setStartDateTime = setStartDateTime;

                scope.showVinesList = showVinesList;
                scope.showSetCause = showSetCause;
                scope.formatFCIdataForCsv = formatFCIdataForCsv;

                scope.calendarDaySelected = calendarDaySelected;
                scope.setStartDateTime = setStartDateTime;
                scope.setEndDateTime = setEndDateTime;

                scope.initiateEZTasks = initiateEZTasks;
                scope.controlPanelSelectionData = controlPanelSelection.data;

                // momCountsF.getDataFromServer().then(function (areaData) {
                areaF.getDataFromServerAndFormat().then(function (areaData) {
                    // console.log('area in HEADER DIRECTIVE');
                    // scope.managementAreas = areaData;
                    scope.managementAreas = areaF.data.managementAreaData;
                    showAllManagementAreasServiceCentersSubstations();
                });

                scope.checkBoxes = controlPanelSelection.data.checkBoxes;
                // console.log('in Area Selection directive', scope.checkBoxes);                

                //TODO set other current pages in the html (in ng-repeat and in the paging controls
                //remove currentPage when all others are transferred to more specific paging variables
                scope.faultOrderBy = 'faultDate';
                scope.currentPage = 1;
                //pagination currentPage, set initial to 1
                scope.troubleTicketsCurrentPage = 1;
                scope.vinesCurrentPage = 1;
                scope.faultsCurrentPage = 1;
                scope.equipLogCurrentPage = 1;
                scope.complaintsCurrentPage = 1;
                //Done (move completed items below this comment


                scope.fcis = fciF.data;
                //functions for checkboxes
                scope.toggleFaults = toggleFaults;
                scope.selectAreaIsOpen = true;
                //binding this controller to data  of controlPanelSelection Factory
                scope.areaFData = areaF.data;
                //binding this controller to data of faults factory
                scope.faultsData = faults.data;
                //binding this controller to data of troubleTickets factory
                scope.troubleTicketsData = troubleTicketsF.data;
                scope.lightningData = lightningsF.data;
                scope.openConditionAssessmentData = openConditionAssessmentF.data;
                scope.knownMomentariesFeederOutagesData = knownMomentariesFeederOutagesF.data;
                scope.palmsBambooData = palmsBamboosF.data;
                //binding equipmentLogs factory data to the view
                scope.equipmentLogsData = equipmentLogsF.data;
                //binding vines factory data to the view
                scope.vinesData = vinesF.data;
                scope.isVinesOpen = true;
                scope.feederFailurePointsData = feederFailPointF.data;
                scope.complaintsData = complaintsF.data;

                //    configuration for calendar
                scope.dateOptions = {
                    dateFormat: 'mm-dd-yy',
                    formatYear: 'yy',
                    startingDay: 1,
                    showWeeks: false //Adding this line solve the issue in the controller
                };

                scope.isControlPanelClosed = false;

                //load managemenet Areas, Service Centers, Substations, and feeders
            })();
                        //Copied to Stem.services
            function managementAreaSelected() {
                areaF.managementAreaSelected();
                momCountsF.data.momCountCurrentPg = 1;
                momCountsF.getMomsForMa(areaF.data.selectedManagementArea);
                momCountsF.updateSubsWithMoms();

                turnAllInvestigationLayersOff();
                turnSubHeatMapOff();
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateClearSubstationMoms();
                stemNGS.initiateMapSubstationMoms();
                stemNGS.setBounds();
                momCountsF.drawKnownMomChart();
            }

            // function setManagementAreaById(id){
            //     console.log('setManagementAreaById: ' + id);
            //     areaF.setManagementArea(id);
            //     // areaF.setSubstation(id);
            // }

            function serviceCenterSelected() {
                areaF.serviceCenterSelected();
                momCountsF.data.momCountCurrentPg = 1;
                if(!areaF.data.selectedManagementArea.m12Moe){
                    momCountsF.getMomsForMa(areaF.data.selectedManagementArea);
                }
                momCountsF.updateSubsWithMoms();

                turnAllInvestigationLayersOff();
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.initiateClearSubstationMoms();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateMapSubstationMoms();
                stemNGS.setBounds();
                momCountsF.drawKnownMomChart();
            }

            function substationSelected() {
                areaF.substationSelected();
                areaF.setMostSpecificSelectionAndType();
                momCountsF.data.momCountCurrentPg = 1;
                momCountsF.updateSubsWithMoms();
                momCountsF.getMomDetailsFromServer();
                momCountsF.getMomDateArray();


                turnSubHeatMapOff();
                turnAllInvestigationLayersOff();
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateSubstationGridDraw();
                stemNGS.initiateSubstationHeatMap();
                stemNGS.setBounds();
                momCountsF.drawKnownMomChart();
            }

            function substationSelectedVerticeGrid(){
                areaF.substationSelected();
                areaF.setMostSpecificSelectionAndType();
                momCountsF.data.momCountCurrentPg = 1;
                momCountsF.updateSubsWithMoms();
                momCountsF.getMomDetailsFromServer();
                momCountsF.getMomDateArray();
                turnAllInvestigationLayersOff();
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateSubstationGridDrawVertice();
                stemNGS.setBounds();
            }

            function feederSelected() {
                areaF.feederSelected();
                momCountsF.getMomDetailsFromServer();
                momCountsF.getMomDateArray();
                // momCountsF.updateMomChartData();

                turnAllInvestigationLayersOff();
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.highlightSelectedFeeder();
                stemNGS.setBounds();
                momCountsF.drawKnownMomChart();

            }

            function calendarDaySelected() {
                //console.log(scope.controlPanelSelectionData.selectedCalendarEndDate);
                turnAllInvestigationLayersOff();
            }

            //Copied to Stem.services
            function showAllManagementAreasServiceCentersSubstations() {
                scope.areaFData.selectedManagementArea = scope.managementAreas['all'];
                scope.areaFData.serviceCentersList = scope.managementAreas['all'].serviceCenters;
                scope.areaFData.substationsList = scope.managementAreas['all'].serviceCenters['all'].substations;
            }

            function setStartDateTime() {
                scope.areaFData.selectedCalendarDate.setHours(0, 0, 0, 0);
                //console.log(scope.controlPanelSelectionData.selectedCalendarDate);
            }

            function setEndDateTime() {
                // scope.controlPanelSelectionData.selectedCalendarEndDate.setHours(23, 59, 59);
                scope.areaFData.selectedCalendarEndDate.setHours(23, 59, 59);
                //console.log(scope.controlPanelSelectionData.selectedCalendarEndDate);
            }

            function onSelectSearchSubstation(searchedSubstation) {
                scope.areaFData.selectedManagementArea = scope.managementAreas[searchedSubstation.ma];

                scope.areaFData.serviceCentersList = scope.areaFData.selectedManagementArea.serviceCenters;

                scope.areaFData.selectedServiceCenter = scope.areaFData.selectedManagementArea.serviceCenters[searchedSubstation.sc];

                scope.areaFData.substationsList = scope.areaFData.selectedServiceCenter.substations;

                scope.areaFData.selectedSubstation = scope.areaFData.selectedServiceCenter.substations[searchedSubstation._id];

                clearSearchSubstation();

                turnAllInvestigationLayersOff();

                areaF.setMostSpecificSelectionAndType();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateSubstationGridDraw();
            }

            //TODO move checkboxes and Toggle Functions to controlPanelSelectionFactory
            /**
             *    ~~~~~~Toggle Investigation Layers
             **/

            //Copied to Stem.services
            function turnAllInvestigationLayersOff() {
                // console.log('off in directive');
                controlPanelSelection.turnAllInvestigationLayersOff();

                toggleFaults();
                toggleVines();
                togglePalmsBamboos();
                toggleLightningDay();
                toggleTroubleTickets();
                toggleEquipmentLog();
                toggleOpenConditionAssessmentsChecked();
                toggleKnownMomentariesFeederOutagesChecked();
                toggleLightningYTD();
                toggleFCIs();
                toggleFeederFailurePoints();
                toggleComplaints();
                toggleALSChecked();
                toggleHvtChecked();
            }

            function clearSearchSubstation() {
                scope.searchedSubstation = "";
            }

            function turnSubHeatMapOff(){
                // console.log('toggleSubHeatMap');
                momCountsF.data.subMapIsActive = false;
                stemNGS.initiateSubstationHeatMapClear();
            }

            function toggleFaults() {

                if (scope.checkBoxes.isFaultsChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        //TODO look into having the popup show on the bottom right of the app as opposed to the top right
                        $.growlUI('Please pick a date.');
                        scope.checkBoxes.isFaultsChecked = false;
                        return;
                    }

                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }

                    stemNGS.initiateFaultsClear();
                    stemNGS.initiateFaultsDrawing();
                }
                else {
                    stemNGS.initiateFaultsClear();
                    faults.clearFaults();
                }
            }

            function toggleFault(fault) {
                // var faultIndex = 0;
                //
                // for(var i=0, len = faults.data.faults.length; i++; i<len){
                //     if(fault.id === faults.data.faults[i].id){
                //         faultIndex = faults.data.faults[i];
                //         break;
                //     }
                // }
                var numOfFaults = 0,
                    singleFault = {},
                    multiFaults = [];

                fault.isActive = !fault.isActive;

                stemNGS.initiateFaultsClear();

                //seeing if we have one fault or multiple active
                faults.data.faults.forEach(function (element) {
                    if (element.isActive === true) {
                        numOfFaults += 1;
                        multiFaults.push(element);
                    }
                });
                if (numOfFaults >= 2) {
                    stemNGS.drawFaults(multiFaults);
                }
                else if (numOfFaults === 1) {
                    stemNGS.drawFaults(multiFaults);
                    //stemNGS.initiateFaultsDrawing(multiFaults);
                }
                else {
                    stemNGS.initiateFaultsClear();
                    console.log("no faults selected");
                }
            }

            function toggleCombinedFault(fault, singleCombined) {
                singleCombined.includeFault = !singleCombined.includeFault;
                var count = 0;
                fault.groupedF.forEach(function (fault) {
                    if (fault.includeFault) {
                        count++
                    }
                });
                if (fault.isActive) {
                    // console.log('included ',count);
                    toggleFault(fault);
                    if (count > 0) {
                        toggleFault(fault);
                    }
                }
            }

            function toggleLightningDay() {

                if (scope.checkBoxes.isLightningDayChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isLightningDayChecked = false;
                        return;
                    }
                    stemNGS.initiateLightningDayDrawing();
                    setTimeout(function () {
                        scope.lightningData = lightningsF.data;
                    }, 100);
                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
                }
                else {
                    stemNGS.initiateLightningDayClear();
                }
            }

            function toggleTroubleTickets() {

                if (scope.checkBoxes.isTroubleTicketsChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isTroubleTicketsChecked = false;
                        return;
                    }
                    stemNGS.initiateTroubleTicketsDrawing();

                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
                }

                else {
                    stemNGS.initiateTroubleTicketsClear();
                }
            }

            function toggleEquipmentLog() {
                if (scope.checkBoxes.isEquipmentLogChecked) {
                    //get equipment log data
                    equipmentLogsF.getDataFromServer();
                    //     .then(function(data){
                    //     debugger;
                    //     scope.equipmentLogsData = data;
                    // })

                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
                }
                else {
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

            function toggleFCIs() {

                if (scope.checkBoxes.isFCIChecked) {
                    fciF.getDataFromServer();
                    setTimeout(function () {
                        console.log('fci data: ', fciF.data);
                        stemNGS.initiateFCIFaultDrawing();
                    }, 5000);
                }
            }

            function formatFCIdataForCsv(data) {
                //fciF.data.fci
                var myData = [];
                data.forEach(function (fci) {
                    //if(fci.ednaPoints.length > 0){
                    fci.ednaPoints.forEach(function (ednaPoint) {
                        var ednaDate = moment(ednaPoint.time).format('MM-DD-YYYY');
                        var endaTime = moment(ednaPoint.time).format('HH:mm:ss');
                        myData.push({
                            feeder: '',
                            phase: fci.phase,
                            switchNumber: fci.switchNumber,
                            date: ednaDate,
                            time: endaTime,
                            amp: ednaPoint.amp
                        })
                    });
                });
                return myData;
            }

            function togglePalmsBamboos() {

                if (scope.checkBoxes.isPalmsBamboosChecked) {
                    stemNGS.initiatePalmsBamboosDrawing();
                    setTimeout(function () {
                        scope.palmsBambooData = palmsBamboosF.data;
                    }, 100);
                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
                }
                else {
                    stemNGS.initiatePalmsBamboosClear();
                }
            }

            function toggleVines() {
                if (scope.checkBoxes.isVinesChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isVinesChecked = false;
                        return;
                    }
                    stemNGS.initiateVinesDrawing(vineEdit);


                    function vineEdit(vine) {
                        scope.vine = vine;
                        var modalInstance = $uibModal.open({
                            animation: scope.animationsEnabled,
                            templateUrl: '/app/components/map/modals/editVine.html?bust=' + Math.random().toString(36).slice(2),
                            controller: 'editVineCtrl',
                            scope: scope,
                            size: 'me'
                        });
                    }

                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
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
            }

            function showSetCause() {
                $uibModal.open({
                    animation: scope.animationsEnabled,
                    templateUrl: '/app/components/map/modals/showSetCause.html',
                    controller: 'showSetCauseCtrl',
                    scope: scope,
                    size: 'me'
                });
                console.log('open');
            }

            function toggleKnownMomentariesFeederOutagesChecked() {
                if (scope.checkBoxes.isKnownMomentariesFeederOutagesChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isKnownMomentariesFeederOutagesChecked = false;
                        setTimeout(function () {
                            scope.knownMomentariesFeederOutagesData = knownMomentariesFeederOutagesF.data;
                        }, 100);
                        return;
                    }
                    stemNGS.initiateKnownMomentariesFeederOutagesDrawing();

                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
                }
                else {
                    stemNGS.initiateKnownMomentariesFeederOutagesClear();
                }
            }

            function toggleFeederFailurePoints() {
                if (scope.checkBoxes.isFeederFailurePointsChecked) {
                    stemNGS.initiateFeederFailurePoints();
                }
                else {
                    stemNGS.initiateFeederFailurePointsClear();
                }
            }

            function toggleComplaints() {
                if (scope.checkBoxes.isComplaintsChecked) {
                    stemNGS.initiateComplaintsDrawing();
                }
                else {
                    stemNGS.initiateComplaintsClear();
                }
            }

            function toggleOpenConditionAssessmentsChecked() {
                if (scope.checkBoxes.isOpenConditionAssessmentsChecked) {
                    stemNGS.initiateOpenConditionAssessmentsDrawing();
                    setTimeout(function () {
                        scope.openConditionAssessmentData = openConditionAssessmentF.data;
                    }, 100);

                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
                }

                else {
                    stemNGS.initiateOpenConditionAssessmentsClear();
                }

            }

            function toggleLightningYTD() {

                if (scope.checkBoxes.isLightningYTDChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        //TODO look into having the popup show on the bottom right of the app as opposed to the top right
                        $.growlUI('Please pick a date.');
                        scope.checkBoxes.isLightningYTDChecked = false;
                        return;
                    }
                    stemNGS.initiateLightningYTDDrawing();

                    if (scope.selectAreaIsOpen) {
                        scope.selectAreaIsOpen = false;
                    }
                }
                else {
                    stemNGS.initiateLightningYTDClear();
                }
            }

            function toggleALSChecked(){
                if(scope.checkBoxes.isALSChecked) {
                    stemNGS.initiateALSInvestigationDrawing();
                    // console.log(scope.alsEventsData.alsEvents);
                }
                else {
                    stemNGS.initiateALSInvestigationClear();
                }
            }

            function toggleHvtChecked(){
                if(scope.checkBoxes.isHvtChecked) {
                    stemNGS.initiateHvtInvestigationDrawing();
                }
                else {
                    stemNGS.initiateHvtInvestigationClear();
                }
            }

            function calendarDaySelected(){
                //console.log(scope.areaFData.selectedCalendarEndDate);
                turnAllInvestigationLayersOff();
            }

            function setStartDateTime(){
                scope.areaFData.selectedCalendarDate.setHours(0,0,0,0);
                //console.log(scope.controlPanelSelectionData.selectedCalendarDate);
            }
            function setEndDateTime(){
                // scope.controlPanelSelectionData.selectedCalendarEndDate.setHours(23, 59, 59);
                scope.areaFData.selectedCalendarEndDate.setHours(23, 59, 59);
                //console.log(scope.controlPanelSelectionData.selectedCalendarEndDate);
            }

            function initiateEZTasks() {
                scope.areaFData.easyModeOn = !scope.areaFData.easyModeOn;
                //console.log(scope.areaFData.easyModeOn);
                if (scope.areaFData.selectedSubstation._id == "SABAL") {
                    scope.checkBoxes.isFaultsChecked = true;
                    toggleFaults();

                    scope.checkBoxes.isFCIChecked = true;
                    toggleFCIs();

                    setTimeout(function () {
                        scope.faultsData.faults[0].segments = [
                            {
                                "sect": "9762142_683939331_OHP",
                                "color": "Orange",
                                "points": [[27.329661069234113, -80.43413283798073], [27.329596585252748, -80.43407677935824]]
                            },
                            {
                                "sect": "9760589_820640037_UGP",
                                "color": "Orange",
                                "points": [[27.329673079660484, -80.434067801651], [27.329875329005333, -80.43322229569972]]
                            },
                            {
                                "sect": "9761916_554484465_OHP",
                                "color": "Orange",
                                "points": [[27.330617230532933, -80.43486333269117], [27.330120797358443, -80.43449004233766]]
                            },
                            {
                                "sect": "275394855_625543530_UGP",
                                "color": "Orange",
                                "points": [[27.329875329005333, -80.43322229569972], [27.329892468960775, -80.43319825956873]]
                            },
                            {
                                "sect": "8270342_USW",
                                "color": "Orange",
                                "points": [[27.329892468960775, -80.43319825956873], [27.329921657867885, -80.43320733230598]]
                            },
                            {
                                "sect": "9761380_173454389_UGP",
                                "color": "Orange",
                                "points": [[27.32990817563534, -80.43317685803827], [27.334948622033966, -80.42997738336705]]
                            },
                            {
                                "sect": "9761916_554484464_OHP",
                                "color": "Orange",
                                "points": [[27.33109255890732, -80.43524016906055], [27.330617230532933, -80.43486333269117]]
                            },
                            {
                                "sect": "8270326_UFS",
                                "color": "Orange",
                                "points": [[27.329921657867885, -80.43320733230598], [27.329930606270885, -80.43323343330796]]
                            },
                            {
                                "sect": "8272227_USW",
                                "color": "Orange",
                                "points": [[27.334948622033966, -80.42997738336705], [27.33497506335867, -80.4299688341262]]
                            },
                            {
                                "sect": "9761687_659688927_OHP",
                                "color": "Orange",
                                "points": [[27.33109255890732, -80.43524016906055], [27.33134861731058, -80.43542460477273]]
                            },
                            {
                                "sect": "9761687_659688928_OHP",
                                "color": "Orange",
                                "points": [[27.33134861731058, -80.43542460477273], [27.331590271545206, -80.43559557328086]]
                            },
                            {
                                "sect": "289638845_289686103_UGP",
                                "color": "Orange",
                                "points": [[27.33049081213708, -80.43315267412324], [27.329930606270885, -80.43323343330796]]
                            },
                            {
                                "sect": "8272201_UFS",
                                "color": "Orange",
                                "points": [[27.33497506335867, -80.4299688341262], [27.334991271571862, -80.42999020131653]]
                            },
                            {
                                "sect": "8272217_USW",
                                "color": "Orange",
                                "points": [[27.33496030496918, -80.42994316698534], [27.33497506335867, -80.4299688341262]]
                            },
                            {
                                "sect": "9099457_OFS",
                                "color": "Orange",
                                "points": [[27.33134861731058, -80.43542460477273], [27.331334283575806, -80.43545084982601]]
                            },
                            {
                                "sect": "9761030_289518631_UGP",
                                "color": "Orange",
                                "points": [[27.335431491212503, -80.42872778738663], [27.33496030496918, -80.42994316698534]]
                            },
                            {
                                "sect": "9761662_659688937_OHP",
                                "color": "Orange",
                                "points": [[27.331709842788705, -80.43572764923343], [27.331590271545206, -80.43559557328086]]
                            },
                            {
                                "sect": "9762192_714404376_OHP",
                                "color": "Orange",
                                "points": [[27.331709842788705, -80.43572764923343], [27.331746197794907, -80.4357685934127]]
                            },
                            {
                                "sect": "9762192_714404377_OHP",
                                "color": "Orange",
                                "points": [[27.331746197794907, -80.4357685934127], [27.331755354742924, -80.43577895541476]]
                            },
                            {
                                "sect": "289441909_628181429_UGP",
                                "color": "Orange",
                                "points": [[27.331334283575806, -80.43545084982601], [27.330171553867217, -80.43731587210011]]
                            },
                            {
                                "sect": "289642169_582757684_UGP",
                                "color": "Orange",
                                "points": [[27.335162324859514, -80.43017516688282], [27.334991271571862, -80.42999020131653]]
                            },
                            {
                                "sect": "8270826_USW",
                                "color": "Orange",
                                "points": [[27.335431491212503, -80.42872778738663], [27.33545639127663, -80.4287331894968]]
                            },
                            {
                                "sect": "8270816_USW",
                                "color": "Orange",
                                "points": [[27.335456035142258, -80.42870482300209], [27.33545639127663, -80.4287331894968]]
                            },
                            {
                                "sect": "163728483_173454024_UGP",
                                "color": "Orange",
                                "points": [[27.338150547883668, -80.4268899523432], [27.335456035142258, -80.42870482300209]]
                            },
                            {
                                "sect": "152505757_OSW",
                                "color": "Orange",
                                "points": [[27.338177982793635, -80.42688981121759], [27.338150547883668, -80.4268899523432]]
                            },
                            {
                                "sect": "152505929_674031038_OHP",
                                "color": "Orange",
                                "points": [[27.33816849551887, -80.42633737623296], [27.338177982793635, -80.42688981121759]]
                            },
                            {
                                "sect": "152505929_674031040_OHP",
                                "color": "Orange",
                                "points": [[27.338177982793635, -80.42688981121759], [27.338178566707658, -80.426922146767]]
                            },
                            {
                                "sect": "152505929_674031041_OHP",
                                "color": "Orange",
                                "points": [[27.338178566707658, -80.426922146767], [27.338179262506134, -80.42698176736603]]
                            },
                            {
                                "sect": "9760217_674031052_OHP",
                                "color": "Orange",
                                "points": [[27.338179262506134, -80.42698176736603], [27.338190227819243, -80.42741100522724]]
                            },
                            {
                                "sect": "9760217_674031053_OHP",
                                "color": "Orange",
                                "points": [[27.338190227819243, -80.42741100522724], [27.338190430245696, -80.42741636024357]]
                            },
                            {
                                "sect": "9761130_660515273_OHP",
                                "color": "Orange",
                                "points": [[27.338168113578515, -80.42631029467438], [27.33816849551887, -80.42633737623296]]
                            },
                            {
                                "sect": "296633617_JMP1",
                                "color": "Orange",
                                "points": [[27.33816813331186, -80.42633707492475], [27.338168113578515, -80.42631029467438]]
                            },
                            {
                                "sect": "296633617_JMP2",
                                "color": "Orange",
                                "points": [[27.338192049030113, -80.42633705283065], [27.33816813331186, -80.42633707492475]]
                            },
                            {
                                "sect": "9761130_660515272_OHP",
                                "color": "Orange",
                                "points": [[27.33816032008487, -80.42573137391521], [27.338168113578515, -80.42631029467438]]
                            },
                            {
                                "sect": "9761255_9761265_OHP",
                                "color": "Orange",
                                "points": [[27.338086822744554, -80.42517421654017], [27.33816032008487, -80.42573137391521]]
                            },
                            {
                                "sect": "9761280_9761290_OHP",
                                "color": "Orange",
                                "points": [[27.338086822744554, -80.42517421654017], [27.338059841148258, -80.4251748610627]]
                            },
                            {
                                "sect": "9761305_9761315_OHP",
                                "color": "Orange",
                                "points": [[27.338086822744554, -80.42517421654017], [27.338068626322904, -80.42450288217613]]
                            },
                            {
                                "sect": "9762707_660515264_OHP",
                                "color": "Orange",
                                "points": [[27.338625129605465, -80.42633189219927], [27.338192049030113, -80.42633705283065]]
                            },
                            {
                                "sect": "9762707_660515265_OHP",
                                "color": "Orange",
                                "points": [[27.338192049030113, -80.42633705283065], [27.338182483296276, -80.42633720314734]]
                            },
                            {
                                "sect": "296633603_JMP1",
                                "color": "Orange",
                                "points": [[27.338622380003624, -80.42635459395576], [27.338625129605465, -80.42633189219927]]
                            },
                            {
                                "sect": "296633603_JMP2",
                                "color": "Orange",
                                "points": [[27.33864265339694, -80.42635767290962], [27.338622380003624, -80.42635459395576]]
                            },
                            {
                                "sect": "9706563_OSW",
                                "color": "Orange",
                                "points": [[27.33803250561718, -80.42517722535419], [27.338059841148258, -80.4251748610627]]
                            },
                            {
                                "sect": "9760029_607230753_OHP",
                                "color": "Red",
                                "points": [[27.338067188578844, -80.42380377157131], [27.338068626322904, -80.42450288217613]]
                            },
                            {
                                "sect": "9761205_607230856_OHP",
                                "color": "Red",
                                "points": [[27.338068626322904, -80.42450288217613], [27.338422212162655, -80.42450115680282]]
                            },
                            {
                                "sect": "9761205_607230857_OHP",
                                "color": "Red",
                                "points": [[27.338422212162655, -80.42450115680282], [27.338432319757892, -80.42450110459187]]
                            },
                            {
                                "sect": "9762682_677924232_OHP",
                                "color": "Orange",
                                "points": [[27.33864252538406, -80.42634847727022], [27.33864265339694, -80.42635767290962]]
                            },
                            {
                                "sect": "9762682_677924233_OHP",
                                "color": "Orange",
                                "points": [[27.33864265339694, -80.42635767290962], [27.338649395098976, -80.42690082697709]]
                            },
                            {
                                "sect": "9762707_660515245_OHP",
                                "color": "Orange",
                                "points": [[27.338642276023556, -80.42633170284685], [27.338625129605465, -80.42633189219927]]
                            },
                            {
                                "sect": "9763093_135789854_UGP",
                                "color": "Orange",
                                "points": [[27.33803250561718, -80.42517722535419], [27.337682018126344, -80.42411247297012]]
                            },
                            {
                                "sect": "9763376_677924218_OHP",
                                "color": "Red",
                                "points": [[27.338654527310958, -80.42749219430758], [27.338649395098976, -80.42690082697709]]
                            },
                            {
                                "sect": "193187324_193187337_OHP",
                                "color": "Orange",
                                "points": [[27.338672415826455, -80.42633094130375], [27.338642276023556, -80.42633170284685]]
                            },
                            {
                                "sect": "8271518_USW",
                                "color": "Orange",
                                "points": [[27.337682018126344, -80.42411247297012], [27.337699467507612, -80.42408462433899]]
                            },
                            {
                                "sect": "8271528_USW",
                                "color": "Orange",
                                "points": [[27.337669285748408, -80.42408879028902], [27.337699467507612, -80.42408462433899]]
                            },
                            {
                                "sect": "9760029_607230752_OHP",
                                "color": "Red",
                                "points": [[27.338061685224048, -80.42321372345681], [27.338067188578844, -80.42380377157131]]
                            },
                            {
                                "sect": "9761205_140083311_OHP",
                                "color": "Red",
                                "points": [[27.338432319757892, -80.42450110459187], [27.338754321003886, -80.4244999465611]]
                            },
                            {
                                "sect": "9761230_607230872_OHP",
                                "color": "Red",
                                "points": [[27.338061685224048, -80.42321372345681], [27.33830848167262, -80.42318394741503]]
                            },
                            {
                                "sect": "9761230_607230873_OHP",
                                "color": "Red",
                                "points": [[27.33830848167262, -80.42318394741503], [27.33831037173944, -80.42302972305635]]
                            },
                            {
                                "sect": "9761787_289483697_UGP",
                                "color": "Red",
                                "points": [[27.337669285748408, -80.42408879028902], [27.335543118335888, -80.42297169705276]]
                            },
                            {
                                "sect": "193187256_OSW",
                                "color": "Orange",
                                "points": [[27.338672415826455, -80.42633094130375], [27.338699848269282, -80.4263301937007]]
                            },
                            {
                                "sect": "8271982_USW",
                                "color": "Red",
                                "points": [[27.335543118335888, -80.42297169705276], [27.33557079989484, -80.42295770779887]]
                            },
                            {
                                "sect": "8271992_USW",
                                "color": "Red",
                                "points": [[27.335543003973616, -80.42294400843535], [27.33557079989484, -80.42295770779887]]
                            },
                            {
                                "sect": "9633445_OFS",
                                "color": "Red",
                                "points": [[27.33831037173944, -80.42302972305635], [27.338309883880758, -80.42299900395034]]
                            },
                            {
                                "sect": "9633597_9633604_UGP",
                                "color": "Red",
                                "points": [[27.338309883880758, -80.42299900395034], [27.338309436055464, -80.4228687424527]]
                            },
                            {
                                "sect": "9633871_OFS",
                                "color": "Red",
                                "points": [[27.338754321003886, -80.4244999465611], [27.338776685537674, -80.4245177183951]]
                            },
                            {
                                "sect": "9633958_289475289_UGP",
                                "color": "Red",
                                "points": [[27.338776685537674, -80.4245177183951], [27.339105040366242, -80.42467872689878]]
                            },
                            {
                                "sect": "9759954_607230669_OHP",
                                "color": "Red",
                                "points": [[27.338061501584384, -80.4224265851429], [27.338061685224048, -80.42321372345681]]
                            },
                            {
                                "sect": "9760054_9760064_OHP",
                                "color": "Red",
                                "points": [[27.339289573610582, -80.424497484814], [27.338754321003886, -80.4244999465611]]
                            },
                            {
                                "sect": "9760344_172989492_UGP",
                                "color": "Red",
                                "points": [[27.333170066537203, -80.42219253541359], [27.335543003973616, -80.42294400843535]]
                            },
                            {
                                "sect": "9760509_9760519_OHP",
                                "color": "Red",
                                "points": [[27.33993791272768, -80.42447442899204], [27.339289573610582, -80.424497484814]]
                            },
                            {
                                "sect": "9760534_9760544_OHP",
                                "color": "Red",
                                "points": [[27.33993791272768, -80.42447442899204], [27.340084938515915, -80.4243676578591]]
                            },
                            {
                                "sect": "9633481_9633587_UGP",
                                "color": "Red",
                                "points": [[27.338309436055464, -80.4228687424527], [27.338309005250593, -80.42283030256294]]
                            },
                            {
                                "sect": "9633920_ELB",
                                "color": "Red",
                                "points": [[27.339105040366242, -80.42467872689878], [27.339125520957488, -80.42469923714944]]
                            },
                            {
                                "sect": "9759929_607230648_OHP",
                                "color": "Red",
                                "points": [[27.33929613793905, -80.42433838412622], [27.339289573610582, -80.424497484814]]
                            },
                            {
                                "sect": "9759929_722688069_OHP",
                                "color": "Red",
                                "points": [[27.339260780005464, -80.42329280927643], [27.33929613793905, -80.42433838412622]]
                            },
                            {
                                "sect": "9759929_722688229_OHP",
                                "color": "Red",
                                "points": [[27.339254715579834, -80.42313549196241], [27.339260780005464, -80.42329280927643]]
                            },
                            {
                                "sect": "9759954_607230668_OHP",
                                "color": "Red",
                                "points": [[27.338047964057523, -80.4217066185636], [27.338061501584384, -80.4224265851429]]
                            },
                            {
                                "sect": "9759979_9759989_OHP",
                                "color": "Red",
                                "points": [[27.338047964057523, -80.4217066185636], [27.33805602380423, -80.42110316067821]]
                            },
                            {
                                "sect": "9760004_607230741_OHP",
                                "color": "Red",
                                "points": [[27.338047964057523, -80.4217066185636], [27.33818190055199, -80.42170855087221]]
                            },
                            {
                                "sect": "9760004_607230742_OHP",
                                "color": "Red",
                                "points": [[27.33818190055199, -80.42170855087221], [27.338641292582725, -80.42171536268123]]
                            },
                            {
                                "sect": "9760344_172989491_UGP",
                                "color": "Red",
                                "points": [[27.332886006724095, -80.42035069871436], [27.333170066537203, -80.42219253541359]]
                            },
                            {
                                "sect": "9762943_9762953_OHP",
                                "color": "Red",
                                "points": [[27.338033978122965, -80.41972666645333], [27.33805602380423, -80.42110316067821]]
                            },
                            {
                                "sect": "9762968_9762978_OHP",
                                "color": "Red",
                                "points": [[27.338033978122965, -80.41972666645333], [27.33803015393567, -80.41885011152061]]
                            },
                            {
                                "sect": "8271280_USW",
                                "color": "Red",
                                "points": [[27.332886006724095, -80.42035069871436], [27.332858822267795, -80.42033241873054]]
                            },
                            {
                                "sect": "8271290_USW",
                                "color": "Red",
                                "points": [[27.332885127529135, -80.42031280837887], [27.332858822267795, -80.42033241873054]]
                            },
                            {
                                "sect": "9633763_OFS",
                                "color": "Red",
                                "points": [[27.339260780005464, -80.42329280927643], [27.33928821867587, -80.42329357675187]]
                            },
                            {
                                "sect": "9633849_722688092_UGP",
                                "color": "Red",
                                "points": [[27.33950068585263, -80.42362708364848], [27.33928821867587, -80.42329357675187]]
                            },
                            {
                                "sect": "9759929_722688228_OHP",
                                "color": "Red",
                                "points": [[27.33925390930416, -80.4231150822305], [27.339254715579834, -80.42313549196241]]
                            },
                            {
                                "sect": "9760004_607230731_OHP",
                                "color": "Red",
                                "points": [[27.338641292582725, -80.42171536268123], [27.3392140736336, -80.421709357818]]
                            },
                            {
                                "sect": "9761180_676699738_OHP",
                                "color": "Red",
                                "points": [[27.33803015393567, -80.41885011152061], [27.338025709310095, -80.41843266523362]]
                            },
                            {
                                "sect": "9761180_676699750_OHP",
                                "color": "Red",
                                "points": [[27.338025709310095, -80.41843266523362], [27.338025422792736, -80.41840720017082]]
                            },
                            {
                                "sect": "9761180_676699751_OHP",
                                "color": "Red",
                                "points": [[27.338025422792736, -80.41840720017082], [27.33802112140439, -80.41800278962536]]
                            },
                            {
                                "sect": "9761180_676699752_OHP",
                                "color": "Red",
                                "points": [[27.33802112140439, -80.41800278962536], [27.338008664035172, -80.41763389299238]]
                            },
                            {
                                "sect": "9761180_676699753_OHP",
                                "color": "Red",
                                "points": [[27.338008664035172, -80.41763389299238], [27.338009328260526, -80.41714396176691]]
                            },
                            {
                                "sect": "9762267_722688116_OHP",
                                "color": "Red",
                                "points": [[27.339776851737685, -80.42295088146204], [27.33925390930416, -80.4231150822305]]
                            },
                            {
                                "sect": "9762553_289767552_UGP",
                                "color": "Red",
                                "points": [[27.33160467004956, -80.41852852584803], [27.332885127529135, -80.42031280837887]]
                            },
                            {
                                "sect": "321199369_731335331_OHP",
                                "color": "Red",
                                "points": [[27.33910327673475, -80.42304754649842], [27.33925390930416, -80.4231150822305]]
                            },
                            {
                                "sect": "8252923_USW",
                                "color": "Red",
                                "points": [[27.33160467004956, -80.41852852584803], [27.33158841804911, -80.41855497634191]]
                            },
                            {
                                "sect": "8252933_USW",
                                "color": "Red",
                                "points": [[27.331570651774232, -80.41852981490494], [27.33158841804911, -80.41855497634191]]
                            },
                            {
                                "sect": "8271248_UFS",
                                "color": "Red",
                                "points": [[27.332858822267795, -80.42033241873054], [27.332837301548675, -80.42031416873948]]
                            },
                            {
                                "sect": "9633813_ELB",
                                "color": "Red",
                                "points": [[27.33950068585263, -80.42362708364848], [27.33952089751063, -80.4236479993918]]
                            },
                            {
                                "sect": "9760004_607230720_OHP",
                                "color": "Red",
                                "points": [[27.3392140736336, -80.421709357818], [27.339777817005714, -80.42170026687964]]
                            },
                            {
                                "sect": "9761180_676699745_OHP",
                                "color": "Red",
                                "points": [[27.338009328260526, -80.41714396176691], [27.338017618541475, -80.416211560048]]
                            },
                            {
                                "sect": "9762267_722688115_OHP",
                                "color": "Red",
                                "points": [[27.339812589307467, -80.42295069635087], [27.339776851737685, -80.42295088146204]]
                            },
                            {
                                "sect": "133930085_OFS",
                                "color": "Red",
                                "points": [[27.339812589307467, -80.42295069635087], [27.339815441373158, -80.42292016162828]]
                            },
                            {
                                "sect": "133930236_149563119_UGP",
                                "color": "Red",
                                "points": [[27.339815441373158, -80.42292016162828], [27.339889890245583, -80.42263478830314]]
                            },
                            {
                                "sect": "182460843_785179102_UGP",
                                "color": "Red",
                                "points": [[27.331570651774232, -80.41852981490494], [27.32853155782378, -80.41846958040448]]
                            },
                            {
                                "sect": "289765730_173110727_UGP",
                                "color": "Red",
                                "points": [[27.33261179494452, -80.41899458128918], [27.332837301548675, -80.42031416873948]]
                            },
                            {
                                "sect": "321199369_731335330_OHP",
                                "color": "Red",
                                "points": [[27.339097851946544, -80.4230451491867], [27.33910327673475, -80.42304754649842]]
                            },
                            {
                                "sect": "321199377_OSW",
                                "color": "Red",
                                "points": [[27.339078448864004, -80.42306707837423], [27.339097851946544, -80.4230451491867]]
                            },
                            {
                                "sect": "321199381_827944671_UGP",
                                "color": "Red",
                                "points": [[27.339078448864004, -80.42306707837423], [27.338342034269747, -80.42285139371184]]
                            },
                            {
                                "sect": "8252891_UFS",
                                "color": "Red",
                                "points": [[27.33158841804911, -80.41855497634191], [27.33157204658736, -80.41858306197824]]
                            },
                            {
                                "sect": "8271762_USW",
                                "color": "Red",
                                "points": [[27.32853155782378, -80.41846958040448], [27.328518469668065, -80.41850924317887]]
                            },
                            {
                                "sect": "9101959_181131326_UGP",
                                "color": "Red",
                                "points": [[27.33157204658736, -80.41858306197824], [27.33104175513795, -80.41849821694076]]
                            },
                            {
                                "sect": "9760004_607230709_OHP",
                                "color": "Red",
                                "points": [[27.339777817005714, -80.42170026687964], [27.340407465697897, -80.42169699834633]]
                            },
                            {
                                "sect": "9761180_676699742_OHP",
                                "color": "Red",
                                "points": [[27.338017618541475, -80.416211560048], [27.33801896026154, -80.41588483345944]]
                            },
                            {
                                "sect": "9761180_676699746_OHP",
                                "color": "Red",
                                "points": [[27.33801896026154, -80.41588483345944], [27.338020418959722, -80.4156078266701]]
                            },
                            {
                                "sect": "9761180_676699747_OHP",
                                "color": "Red",
                                "points": [[27.338020418959722, -80.4156078266701], [27.338033968611146, -80.41541665548324]]
                            },
                            {
                                "sect": "9762267_722688113_OHP",
                                "color": "Red",
                                "points": [[27.34046092247409, -80.42294814658517], [27.339812589307467, -80.42295069635087]]
                            },
                            {
                                "sect": "9762292_9762302_OHP",
                                "color": "Red",
                                "points": [[27.34046092247409, -80.42294814658517], [27.340962703941663, -80.423035794343]]
                            },
                            {
                                "sect": "133930149_ELB",
                                "color": "Red",
                                "points": [[27.339889890245583, -80.42263478830314], [27.33990920342132, -80.42261296040915]]
                            },
                            {
                                "sect": "8271720_UFS",
                                "color": "Red",
                                "points": [[27.328518469668065, -80.41850924317887], [27.328505432945793, -80.41852428320442]]
                            },
                            {
                                "sect": "9706547_OSW",
                                "color": "Red",
                                "points": [[27.338033840055054, -80.4153859345947], [27.338033968611146, -80.41541665548324]]
                            },
                            {
                                "sect": "9760004_607230698_OHP",
                                "color": "Red",
                                "points": [[27.340407465697897, -80.42169699834633], [27.34092747677538, -80.42169712857209]]
                            },
                            {
                                "sect": "9760004_723515379_OHP",
                                "color": "Red",
                                "points": [[27.34092747677538, -80.42169712857209], [27.340956708119283, -80.42154235438095]]
                            },
                            {
                                "sect": "9760004_723515397_OHP",
                                "color": "Red",
                                "points": [[27.340956708119283, -80.42154235438095], [27.340955988891753, -80.42134690724498]]
                            },
                            {
                                "sect": "9760004_723515398_OHP",
                                "color": "Red",
                                "points": [[27.340955988891753, -80.42134690724498], [27.340955709862055, -80.42125777343036]]
                            },
                            {
                                "sect": "268021823_544098136_UGP",
                                "color": "Red",
                                "points": [[27.338121654599636, -80.41502014993104], [27.338033840055054, -80.4153859345947]]
                            },
                            {
                                "sect": "9706483_OSW",
                                "color": "Red",
                                "points": [[27.338121654599636, -80.41502014993104], [27.338121525956105, -80.41498942905132]]
                            },
                            {
                                "sect": "9762762_9762772_OHP",
                                "color": "Red",
                                "points": [[27.338121525956105, -80.41498942905132], [27.3378570894889, -80.41363108843372]]
                            },
                            {
                                "sect": "152658257_629290052_OHP",
                                "color": "Red",
                                "points": [[27.337858734961458, -80.41344260749871], [27.3378570894889, -80.41363108843372]]
                            },
                            {
                                "sect": "152658257_629290051_OHP",
                                "color": "Red",
                                "points": [[27.337864186413345, -80.41280682588727], [27.337858734961458, -80.41344260749871]]
                            },
                            {
                                "sect": "152658257_764943078_OHP",
                                "color": "Red",
                                "points": [[27.337864503015222, -80.41277478899113], [27.337864186413345, -80.41280682588727]]
                            },
                            {
                                "sect": "145505478_OSW",
                                "color": "Red",
                                "points": [[27.337864186413345, -80.41280682588727], [27.337836751995482, -80.4128070715389]]
                            },
                            {
                                "sect": "145505507_155694759_UGP",
                                "color": "Red",
                                "points": [[27.337836751995482, -80.4128070715389], [27.33779054380626, -80.4128068097909]]
                            },
                            {
                                "sect": "152658257_764943077_OHP",
                                "color": "Red",
                                "points": [[27.33786517577782, -80.41265573966342], [27.337864503015222, -80.41277478899113]]
                            },
                            {
                                "sect": "155694551_USW",
                                "color": "Red",
                                "points": [[27.33779054380626, -80.4128068097909], [27.337766560869106, -80.41282078234951]]
                            },
                            {
                                "sect": "152658257_539866628_OHP",
                                "color": "Red",
                                "points": [[27.33786593754653, -80.41251496251687], [27.33786517577782, -80.41265573966342]]
                            }
                        ];

                        toggleFault(scope.faultsData.faults[0]);
                    }, 2000);

                    //stemNGS.mapEZLightning();
                }
            }
        }


    }
})();