/**
 * Created by AJH0E,3S on 03/22/2017.
 */
(function(){
    angular.module('nextGrid').directive('sidebar', sidebar);
    
    function sidebar(
        //Dependencies
        momCountsF,
        areaF,
        stemNGS,
        controlPanelSelection,
        mapFactory,
        faults,
        troubleTicketsF,
        equipmentLogsF,
        //vinesF,
        lightningsF,
        openConditionAssessmentF,
        knownMomentariesFeederOutagesF,
        palmsBamboosF,
        feederFailPointF,
        fciF, complaintsF,
        alsEventsF,
        //investigationsF,
        highVoltTxF
    ){
        var directive = {
            link: link,
            templateUrl: 'app/components/map/directives/sidebar-left.html',//'app/components/map/directives/sidebar-left.html',
            restrict: 'E',//'E',
            //may not need this two way binding anymore
            scope:{}
        };
        
        return directive;

        function link(scope, element, attrs){

            (function init(){
                // console.log('SIDEBAR DIRECTIVE');
                scope.managementAreaSelectedFromList = managementAreaSelectedFromList; //copied from other Directory - will need to be able to call this function from factory later.
                scope.substationSelectedFromList = substationSelectedFromList;
                scope.fdrSelectedFromList = fdrSelectedFromList;
                scope.momSortKey=momSortKey;
                scope.momListSortKey=momListSortKey;
                scope.showMomEdit = showMomEdit;
                scope.hideMomEdit = hideMomEdit;
                scope.submitMomEdit = submitMomEdit;
                scope.cancelMomEdit = cancelMomEdit;
                scope.openMomDetails = openMomDetails;
                scope.setMomAsUnknown = setMomAsUnknown;
                scope.mapMomLocations = mapMomLocations;
                scope.setSelectedMomentary = setSelectedMomentary;
                scope.goToMomMap = goToMomMap;
                // scope.drawKnownMomChart = drawKnownMomChart;
                // scope.canEditMom = canEditMom;
                scope.toggleSubHeatMap = toggleSubHeatMap;
                //scope elements to be from factories
                scope.subMapIsActive = momCountsF.data.subMapIsActive;
                scope.areaData = areaF.data;
                scope.leftTabs={
                    MoMCountIsActive : true,
                    test2IsActive    : false,
                    InvestigationIsActive : false,
                    mapKeyIsActive   : false
                };
                scope.rightTabs={
                    MitIsActive : false,
                    MomListIsActive: false,
                    MomChartIsActive:false
                    };
                scope.checkBoxes = controlPanelSelection.data.checkBoxes;
                scope.displayMomEdit = momCountsF.data.displayMomEdit;
                scope.enableMomEdit = true;
                //scope.momCountData;
                scope.momCountData = momCountsF.data;

                //for paging & Sorting
                scope.momCountCurrentPg=momCountsF.data.momCountCurrentPg;
                // scope.momListCurrentPg=1;
                scope.momCountSortBy = 'sub';
                scope.momCountSortReverse = false;
                scope.momListSortBy = 'BKR_OPEN_DTTM';
                scope.momListSortReverse = false;
                // console.log('map' + mapFactory.data.map);
                scope.map = mapFactory.data.map;
                // scope.highMomNumSub;
                // scope.highMomNumFdr;
                // scope.highMomNumMA;
                scope.momCountCsvHeaders = ['MA','SVC','SUB','Feeder','YTD Unknown','12 MoE Unknown','YTD Known','12 MoE Known'];
                scope.momCountCsvCols = ['ma','sc','sub','name','mYTD','m12Moe','mYTDknown','m12MoeKnown'];
                scope.momListCsvHeaders = ['MA','SUB','Feeder','Status','Breaker Open','Breaker Close', 'causeCode','causeId','lat', 'lng','TroubleTicket #','TT Type','TT Int Type','TT TCMS Fpl ID'];
                scope.momListCsvCols = ['ma','sub','feeder','status','openTime', 'closeTime', 'causeCode','causeId','lat', 'lng','ttNum','ttType','ttIntType','ttTcmsFplId'];

                momCountsF.getDataFromServer().then(function (momData) {
                    // console.log('get MOM DataFromServer!');
                    scope.momCountData = momCountsF.data;
                    scope.highMomNumMA = getValuesForColors(scope.momCountData.maCounts, 'YTD');
                    //console.log(momCountsF.data.usrSlid.security.canEditMIT);
                    //if  (momCountsF.data.usrSlid.security.canEditMIT==true || momCountsF.data.usrSlid.security.canEditMIT=='true'){
                        mapFactory.data.map.on('click', function(e){
                            getLatLngFromMap(e);
                        });
                    //}
                    // google.charts.load('current', {'packages':['corechart']});
                    // google.charts.setOnLoadCallback(drawKnownMomChart);
                    // drawKnownMomChart();
                });


                scope.faultsData = faults.data;
                scope.troubleTicketsData = troubleTicketsF.data;
                scope.alsEventsData = alsEventsF.data;
                scope.lightningData = lightningsF.data;
                scope.openConditionAssessmentData = openConditionAssessmentF.data;
                scope.knownMomentariesFeederOutagesData = knownMomentariesFeederOutagesF.data;
                scope.palmsBambooData = palmsBamboosF.data;
                scope.equipmentLogsData = equipmentLogsF.data;
                scope.feederFailurePointsData = feederFailPointF.data;
                scope.complaintsData = complaintsF.data;
                scope.hvtData = highVoltTxF.data;
                scope.displayMomEditLocation=[];
                scope.selMomID = scope.momCountData.selectedMomentaryID;
                scope.momListForCsvExport = [];

                

            })();//close init


            // setInterval(function(){
            //     console.log(areaF.data.mostSpecificSelection);
            // }, 1000);
            scope.areaFData = areaF.data;
            setTimeout(function(){
                scope.$watch('areaFData.mostSpecificSelection', function(newVal, oldVal){
                    hideMomEdit();
                });
            }, 1000);

            function managementAreaSelected() {
                areaF.managementAreaSelected();
                momCountsF.data.momCountCurrentPg = 1;
                momCountsF.getMomsForMa(areaF.data.selectedManagementArea);
                momCountsF.updateSubsWithMoms();

                turnAllInvestigationLayersOff();
                momCountsF.data.subMapIsActive = false;
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateClearSubstationMoms();
                stemNGS.initiateMapSubstationMoms();
                stemNGS.setBounds();
                momCountsF.drawKnownMomChart();
                console.log(areaF.data.selectedManagementArea);
            }

            function managementAreaSelectedFromList(m) {
                // momCountsF.updateSubsWithMoms();
                var maCode = m._id;
                areaF.setManagementArea(maCode);
                if(!areaF.data.selectedManagementArea){
                    // console.log('no stuff');
                    areaF.setManagementArea('All');
                }else{
                    managementAreaSelected();
                    momCountsF.getMomsForMa(areaF.data.selectedManagementArea);
                }
            }

            function substationSelectedFromList(sub) {
                var subCode = sub._id;
                areaF.setSubstation(subCode);
                momCountsF.data.momCountCurrentPg = 1;
                momCountsF.updateSubsWithMoms();
                momCountsF.getMomDetailsFromServer();
                momCountsF.getMomDateArray();

                turnAllInvestigationLayersOff();
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.initiateSubstationGridClear();
                stemNGS.initiateSubstationGridDraw();
                stemNGS.initiateSubstationHeatMap();
                stemNGS.setBounds();
                // console.log(areaF.data.selectedSubstation)
                momCountsF.drawKnownMomChart();
            }

            function toggleSubHeatMap(){
                var subMapIsActive = momCountsF.data.subMapIsActive;
                // console.log('toggleSubHeatMap');
                subMapIsActive = !subMapIsActive;
                // console.log('toggleSubHeatMap - is active: ' +subMapIsActive);
               // areaF.data.selectedCalendarDate = scope.momCountData.firstMomDate;
               // areaF.data.selectedCalendarEndDate = scope.momCountData.lastMomDate;

                if (subMapIsActive){
                    stemNGS.initiateSubstationHeatMap();
                } else {
                    // console.log('CLEAR');
                    stemNGS.initiateSubstationHeatMapClear();
                }
                momCountsF.data.subMapIsActive = subMapIsActive;
                scope.subMapIsActive = momCountsF.data.subMapIsActive
            }

            function fdrSelectedFromList(fdr){
                // console.log(fdr);
                var fdrCode = fdr.name;
                areaF.setFeederById(fdrCode);
                momCountsF.getMomDetailsFromServer();
                momCountsF.getMomDateArray();

                scope.momListCurrentPg=1;
                scope.momCountCurrentPg=1;
                stemNGS.initiateSubstationHeatMapClear();
                stemNGS.highlightSelectedFeeder();
                turnAllInvestigationLayersOff();
                momCountsF.drawKnownMomChart();
            }

            function openMomDetails(mom){
                // console.log('openMomDetails', mom._id);
                //close left sidebar
                scope.MoMCountIsActive = false;
                //open right sidebar
                scope.MomListIsActive = true;
                scope.setSelectedMomentary(mom);
                // console.log(scope.momCountData.selectedMomentary);

                scope.selMomID = scope.momCountData.selectedMomentaryID;
                // console.log('selected ID', scope.selMomID );
            }

            function setMomAsUnknown(mom){
                scope.displayMomEditLocation = null;
                momCountsF.setMomAsUnknown(mom);
            }
            
            function momSortKey(key) {
                var originalKey = scope.momCountSortBy;
                scope.momCountSortBy = key;   //set the sortKey to the param passed
                if(key ==originalKey){
                    scope.momCountSortReverse = !scope.momCountSortReverse; //if true make it false and vice versa
                }else {
                    scope.momCountSortReverse = false;
                }
            }

            function momListSortKey(key) {
                var originalKey = scope.momListSortBy;
                scope.momListSortBy = key;   //set the sortKey to the param passed
                if(key ==originalKey){
                    scope.momListSortReverse = !scope.momListSortReverse; //if true make it false and vice versa
                }else {
                    scope.momListSortReverse = false;
                }
            }

            function setSelectedMomentary(mom){
                momCountsF.setMomentary(mom);
                if(momCountsF.data.selectedMomentary.Status == "Known"){
                    momCountsF.data.momEdits={
                        causeCode:{
                            cause_id : momCountsF.data.selectedMomentary.causeCode.cause_id,
                            cause_code : momCountsF.data.selectedMomentary.causeCode.cause_code
                        },
                        causeLocation:momCountsF.data.selectedMomentary.causeLocation

                    };
                    scope.displayMomEditLocation = [momCountsF.data.selectedMomentary.causeLocation.lat, momCountsF.data.selectedMomentary.causeLocation.lng];

                    if(momCountsF.data.selectedMomentary.causeComments){
                        momCountsF.data.momEdits.causeComments = momCountsF.data.selectedMomentary.causeComments;
                    }

                    mapMomLocations(momCountsF.data.selectedMomentary);
                }else{
                    scope.displayMomEditLocation = [];
                    if(momCountsF.data.selectedMomentary.causeComments){
                        momCountsF.data.momEdits.causeComments = momCountsF.data.selectedMomentary.causeComments;
                    }
                }
                scope.selMomID = scope.momCountData.selectedMomentaryID;
            }

            function mapMomLocations(mom){
                // console.log('mapMomLocations');
                // console.log(mom);
                mapFactory.data.momGroup.clearLayers();
                if(mapFactory.data.map.hasLayer(mapFactory.data.momGroup)){
                    mapFactory.data.map.removeLayer(mapFactory.data.momGroup);
                }
                mapFactory.data.momGroup = L.featureGroup([], {makeBoundsAware: true, minZoom:10});
                mapFactory.data.momTempMkr= L.marker();
                mapFactory.data.momTempLitMkr= L.marker();
                var alreadyDrawn = false;
                if(mom.Status == "Known"){
                    if( mom.Ticket.TRBL_TCKT_NUM) {
                        var t = mom.Ticket;
                        scope.displayMomEditLocation = [mom.causeLocation.lat, mom.causeLocation.lng];
                        mapFactory.data.momTempMkr = L.marker([mom.causeLocation.lat, mom.causeLocation.lng], {
                            icon: mapFactory.data.icon,
                            zIndexOffset: 9000
                        })
                            .bindPopup('<h5>Matched Trouble Ticket</h5>'
                                +'<strong>Mom Time: </strong>' + moment(mom.BKR_OPEN_DTTM).format("MM/DD/YY  - hh:mm:ss A")+'<br />'
                                +'<strong>TT Number: </strong>'+t.TRBL_TCKT_NUM+'<br />'
                                +'<strong>Listed Cause: </strong>'+t.IRPT_CAUS_DS);
                        mapFactory.data.momGroup.addLayer(mapFactory.data.momTempMkr);
                        alreadyDrawn = true;
                    }
                    if(typeof mom.Lightning != 'undefined' && typeof mom.Lightning.location != 'undefined'){
                        if (mom.Lightning.location){
                            mapFactory.data.momTempLitMkr = L.marker([mom.Lightning.location.coordinates[1], mom.Lightning.location.coordinates[0]],{icon:mapFactory.data.iconLitMom, zIndexOffset:999999})
                                .bindPopup('<h5>Matched Lightning</h5> '+ moment(mom.Lightning.valid_utc).format("MM/DD/YY  - hh:mm:ss A"));
                            mapFactory.data.momGroup.addLayer(mapFactory.data.momTempLitMkr);
                            mapFactory.data.map.panTo([mom.Lightning.location.coordinates[1], mom.Lightning.location.coordinates[0]]);
                        }
                    }
                    else if(mom.causeLocation && !alreadyDrawn){
                        mapFactory.data.momTempMkr = L.marker([mom.causeLocation.lat, mom.causeLocation.lng], {
                            icon: mapFactory.data.icon,
                            zIndexOffset: 9000
                        });
                        mapFactory.data.momGroup.addLayer(mapFactory.data.momTempMkr);
                    }
                }
                mapFactory.data.momGroup.addTo(mapFactory.data.map);

                if(mom.causeLocation){
                    console.log('bounds: ' + JSON.stringify(mapFactory.data.momGroup.getBounds()));
                     mapFactory.data.map.fitBounds(mapFactory.data.momGroup.getBounds());
                }
            }

            function goToMomMap(mom){
                //close tab
                scope.MomListIsActive = false;
                scope.setSelectedMomentary(mom);
            }
            
            function showMomEdit(mom){
                //$.growlUI('First click on the map to drop a pin where the momentary occurred.');
                momCountsF.data.momEdits = {};
                // console.log('showMomEdit');
                scope.displayMomEdit = true;
                scope.rightTabs.MomListIsActive = true;
                scope.setSelectedMomentary(mom);
                canEditMom();

                document.getElementById('rightSB').setAttribute("style","width:40%");

            }

            function hideMomEdit(){
                // console.log('hideMomEdit');
                scope.displayMomEdit = false;
                // #rightSB remove style Attribute
                document.getElementById('rightSB').setAttribute("style","");
                mapFactory.data.map.removeLayer(mapFactory.data.momTempMkr);
                mapFactory.data.map.removeLayer(mapFactory.data.momTempLitMkr);
            }

            function cancelMomEdit(){
                momCountsF.data.momEdits={};
                hideMomEdit();
                mapFactory.data.map.removeLayer(mapFactory.data.momTempMkr);
                mapFactory.data.map.removeLayer(mapFactory.data.momTempLitMkr);
            }

            function submitMomEdit(){
                console.log('submitMomEdit');
                //get usr SLID
                // console.log('user SLID: ', scope.momCountData.usrSLID);
                // scope.momCountData.momEdits.editedBy =
                momCountsF.sendMomEditToServer();
                hideMomEdit();
                mapFactory.data.map.removeLayer(mapFactory.data.momTempMkr);
                mapFactory.data.map.removeLayer(mapFactory.data.momTempLitMkr);

                var mom = momCountsF.data.selectedMomentary;

            }

            function canEditMom(){
                scope.enableMomEdit = true;
                return true;
                // if(!momCountsF.data.usrSlid || momCountsF.data.usrSlid.security.canEditMIT==null || !momCountsF.data.usrSlid.security ||
                //     momCountsF.data.usrSlid.security.canEditMIT=='false' || momCountsF.data.usrSlid.security.canEditMIT==false ){
                //     scope.enableMomEdit = false;
                //     return false;
                // }else if(momCountsF.data.usrSlid.security.canEditMIT=='true' || momCountsF.data.usrSlid.security.canEditMIT==true){
                //     scope.enableMomEdit = true;
                //     return true;
                // }
                // console.log(scope.enableMomEdit);
            }

            function getLatLngFromMap(e){
                var loc = e.latlng;
                if(scope.displayMomEdit == true){
                    // console.log('latlng is ', loc);

                    scope.momCountData.momEdits.causeLocation = loc;
                    scope.displayMomEditLocation = [loc.lat, loc.lng];
                        mapFactory.data.momTempMkr.setLatLng([loc.lat, loc.lng]);
                        mapFactory.data.momTempMkr.setIcon(mapFactory.data.icon);
                        mapFactory.data.momTempMkr.addTo(mapFactory.data.map);
                        //= L.marker([loc.lat, loc.lng],{icon:mapFactory.data.icon}).addTo(mapFactory.data.map);
                }
            }

            /*******
             *  Pie Chart Functions
             */

            



            function turnAllInvestigationLayersOff() {
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
                toggleSubHeatMap();
            }

            /**
             * TOGGLE INVESTIGATION FUNCTIONS
             */
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
                    singleFault = {},
                    multiFaults=[];

                fault.isActive = !fault.isActive;

                stemNGS.initiateFaultsClear();

                //seeing if we have one fault or multiple active
                faults.data.faults.forEach(function(element){
                    if(element.isActive === true){
                        numOfFaults+=1;
                        multiFaults.push(element);
                    }
                });
                if(numOfFaults >= 2){
                    stemNGS.drawFaults(multiFaults);
                }
                else if(numOfFaults === 1){
                    stemNGS.drawFaults(multiFaults);
                    //stemNGS.initiateFaultsDrawing(multiFaults);
                }
                else{
                    stemNGS.initiateFaultsClear();
                    console.log("no faults selected");
                }
            }

            function toggleCombinedFault(fault,singleCombined){
                singleCombined.includeFault=!singleCombined.includeFault;
                var count=0;
                fault.groupedF.forEach(function(fault){
                    if(fault.includeFault){count++}
                });
                if(fault.isActive) {
                    // console.log('included ',count);
                    toggleFault(fault);
                    if(count>0){
                        toggleFault(fault);
                    }
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
                    setTimeout(function(){scope.lightningData = lightningsF.data;}, 100);
                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
                }

                else{
                    stemNGS.initiateLightningDayClear();
                }
                //scope.lightningData = [];

            }

            function toggleTroubleTickets(){
                if(scope.checkBoxes.isTroubleTicketsChecked){
                    if (scope.controlPanelSelectionData.selectedCalendarDate  === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isTroubleTicketsChecked = false;
                        return;
                    }
                    stemNGS.initiateTroubleTicketsDrawing();

                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
                }

                else{
                    stemNGS.initiateTroubleTicketsClear();
                }
            }

            function toggleEquipmentLog(){
                if(scope.checkBoxes.isEquipmentLogChecked) {
                    //get equipment log data
                    equipmentLogsF.getDataFromServer();
                    //     .then(function(data){
                    //     debugger;
                    //     scope.equipmentLogsData = data;
                    // })

                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
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

            function toggleFCIs(){

                if(scope.checkBoxes.isFCIChecked){
                    fciF.getDataFromServer();
                    setTimeout(function(){
                        console.log('fci data: ' ,fciF.data);
                        stemNGS.initiateFCIFaultDrawing();
                    }, 5000);
                }
            }

            function togglePalmsBamboos(){

                if(scope.checkBoxes.isPalmsBamboosChecked){
                    stemNGS.initiatePalmsBamboosDrawing();
                    setTimeout(function(){scope.palmsBambooData = palmsBamboosF.data;}, 100);
                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
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

                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
                }

                else {
                    stemNGS.initiateVinesClear();
                }
            }

            function toggleKnownMomentariesFeederOutagesChecked(){
                if(scope.checkBoxes.isKnownMomentariesFeederOutagesChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        scope.checkBoxes.isKnownMomentariesFeederOutagesChecked = false;
                        setTimeout(function(){scope.knownMomentariesFeederOutagesData = knownMomentariesFeederOutagesF.data;},100);
                        return;
                    }
                    stemNGS.initiateKnownMomentariesFeederOutagesDrawing();

                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
                }
                else {
                    stemNGS.initiateKnownMomentariesFeederOutagesClear();
                }
            }

            function toggleFeederFailurePoints(){
                if(scope.checkBoxes.isFeederFailurePointsChecked) {
                    stemNGS.initiateFeederFailurePoints();
                }
                else {
                    stemNGS.initiateFeederFailurePointsClear();
                }
            }

            function toggleOpenConditionAssessmentsChecked() {
                if(scope.checkBoxes.isOpenConditionAssessmentsChecked) {
                    stemNGS.initiateOpenConditionAssessmentsDrawing();
                    setTimeout(function(){scope.openConditionAssessmentData = openConditionAssessmentF.data;}, 100);
                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
                }

                else {
                    stemNGS.initiateOpenConditionAssessmentsClear();
                }
            }

            function toggleLightningYTD() {
                if(scope.checkBoxes.isLightningYTDChecked){
                    if (scope.controlPanelSelectionData.selectedCalendarDate  === '') {
                        //TODO look into having the popup show on the bottom right of the app as opposed to the top right
                        $.growlUI('Please pick a date.');
                        scope.checkBoxes.isLightningYTDChecked = false;
                        return;
                    }
                    stemNGS.initiateLightningYTDDrawing();

                    if(scope.selectAreaIsOpen){
                        scope.selectAreaIsOpen = false;
                    }
                }
                else {
                    stemNGS.initiateLightningYTDClear();
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

        }

        function getValuesForColors(array,prop){
            var highestNum=0;
            array.forEach(function(sub){
                if(sub[prop]>highestNum){
                    highestNum = sub[prop];
                }
            });

            return highestNum;
        }

        function toggleSideBarOpen(){
            if(leftTabs==false){
                lSideBarIsCollapsed = true;
            }else{
                lSideBarIsCollapsed = false;
            }
        }

        function toggleSBTab(TabNameIsActive){
            for(var i=0; i<leftTabs.length; i++){
                if( leftTabs[i] !==TabNameIsActive ) {
                    leftTabs[i] == false;
                }
            }
            TabNameIsActive != TabNameIsActive
            toggleSideBarOpen();
        }

    }

})();