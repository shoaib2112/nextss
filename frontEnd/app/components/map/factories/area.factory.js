/**
 * Created by MXG0RYP on 4/12/2017.
 */
(function(){
    angular.module('nextGrid').factory('areaF', area);

    function area(loadScreen, DataModel){
        var service = {
            data: {
                serviceCentersList: [],
                substationsList: [],
                subsListArray: [],
                fdrList:[],
                momCountSub:[],
                momCountFeeder:[],
                momCountAll:[],
                feederCounts:[],
                managementAreaData:{},
                selectedManagementArea: {},
                selectedServiceCenter: {},
                selectedSubstation: {},
                selectedFeeder: {},
                mostSpecificSelection: {},
                mostSpecificSelectionType: '',
                mostSpecificSelectionIdentifier: '',
                easyModeOn: false,
                checkboxes: {},
                fplCounts:{mYTD:0, mYTDknown:0, m12Moe:0, m12MoeKnown:0},
                selectedCalendarDate: new Date(),
                selectedCalendarEndDate: new Date(),
            },
            getDataFromServerAndFormat: getDataFromServerAndFormat,
            getMostSpecificSelection: getMostSpecificSelection,
            getMostSpecificSelectionType: getMostSpecificSelectionType,
            getDataIdentifierByType: getDataIdentifierByType,
            setMostSpecificSelectionAndType: setMostSpecificSelectionAndType,
            managementAreaSelected:managementAreaSelected,
            updateSubstationSelectionListForServiceCenterAll: updateSubstationSelectionListForServiceCenterAll,
            serviceCenterSelected: serviceCenterSelected,
            substationSelected: substationSelected,
            feederSelected: feederSelected,
            findManagementAreaById:findManagementAreaById,
            setManagementArea:setManagementArea,
            setSubstation:setSubstation,
            setFeederById:setFeederById,
            replaceOldMaNames:replaceOldMaNames,
            updateSubMomList:updateSubMomList
        };

        (function init(){
            service.data.selectedCalendarDate.setDate(service.data.selectedCalendarDate.getDate() - 1);
            // console.log('area Selection Factory');
            // console.log(service.data.checkBoxes);
            service.data.dateOptions = {
                // 'popup-placement' : 'bottom-right',
                dateFormat: 'mm-dd-yy',
                formatYear: 'yy',
                // startingDay: 5,
                showWeeks:false, //Adding this line solve the issue in the controller
                maxDate : new Date()
            };
        })();

        return service;

        //formerly known as loadMetadata
        function getDataFromServerAndFormat(){
            var managementAreaData = {
                all: {
                    _id: 'All',
                    serviceCenters: {
                        all: {
                            _id: 'All',
                            substations: {

                            }
                        }
                    }
                }

            };

            // console.log('area FACTORY - getDataFromServerAndFormat');
            //show the user the loading screen
            loadScreen.showWait('Loading NEXTgrid Data...', true);

            //get management area, service center, substation and feeder data
            //data comes as one big array with types specifying what it is
            //we reorganize it into its hierarchical representation
            return DataModel.getNav()
                .then(function(data){
                    // console.log(data);
                    var tempSC = {};
                    DataModel.getPolyMA().then(function(polyData){
                        DataModel.getSubLocations().then(function(sData){
                            DataModel.getMomentaryCounts().then(function(countData){
                                // console.log('known mom counts', countData.known);
                                service.data.momCountAll = countData;
                                var maCounts = countData.MAs;
                                var maKnown = countData.known.MAs;
                                var subCounts = countData.Substations;
                                var subKnown = countData.known.Substations;
                                var fdrCounts = countData.Feeders;
                                var fdrKnown = countData.known.Feeders;
                                service.data.feederCounts = countData.Feeders;
                                // maCounts.forEach(function(ma){
                                //     replaceOldMaNames(ma);
                                // });
                                // maKnown.forEach(function(ma){
                                //     replaceOldMaNames(ma);
                                // });
                                // console.log('maCounts', maCounts);
                                // console.log('areaData', data);

                                data.forEach(function(dataElement, dataIndex, dataArray){
                                    if(dataElement.type === 'ma') {
                                        //if else to avoid overwriting
                                        if(managementAreaData.hasOwnProperty(dataElement._id)){
                                            angular.merge(managementAreaData[dataElement._id], dataElement);
                                        }
                                        else {
                                            managementAreaData[dataElement._id] = dataElement;
                                        }
                                        addPolygonDataToMas(dataElement,polyData);
                                        //mom counts
                                        // maCounts.forEach(function(count){
                                        //     if (dataElement._id ==count._id){
                                        //         if(count.YTD){
                                        //             dataElement.mYTD = count.YTD;
                                        //             service.data.fplCounts.mYTD +=count.YTD;
                                        //         }else {dataElement.mYTD=0}
                                        //
                                        //         if(count.twelvemoe) {
                                        //             dataElement.m12Moe = count.twelvemoe;
                                        //             service.data.fplCounts.m12Moe +=count.twelvemoe;
                                        //         }else{dataElement.m12Moe =0}
                                        //
                                        //         // fplCounts:{mYTD:0, mYTDknown:0, m12Moe:0, m12MoeKnown:0}
                                        //     }
                                        // });
                                        // maKnown.forEach(function(count){
                                        //     if (dataElement._id ==count._id){
                                        //
                                        //         var id = count._id;
                                        //         addKnownCountToArea(dataElement, count, id);
                                        //     }
                                        // })
                                    }
                                    else if(dataElement.type === 'sc') {
                                        // console.log('sc' , dataElement);
                                        tempSC[dataElement._id] = dataElement;
                                    }
                                    else if(dataElement.type === 'sub') {
                                        for(var s=0; s<sData.length; s++){
                                            if(dataElement._id== sData[s].sub){
                                                dataElement.points = sData[s].points;
                                                break;
                                            }
                                        }

                                        //adding this substation to its respective management area - > service center
                                        // without overriding existing data if it exists
                                        if(managementAreaData.hasOwnProperty(dataElement.ma)){
                                            if(managementAreaData[dataElement.ma].hasOwnProperty('serviceCenters')){
                                                if(managementAreaData[dataElement.ma]['serviceCenters'].hasOwnProperty(dataElement.sc)){
                                                    if(managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc].hasOwnProperty('substations')){
                                                        managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'][dataElement._id] = dataElement;

                                                        managementAreaData.all.serviceCenters[dataElement.sc]['substations'][dataElement._id] = dataElement;
                                                    }
                                                    else{
                                                        managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'] = {};
                                                        managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'][dataElement._id] = dataElement;

                                                        managementAreaData.all.serviceCenters[dataElement.sc]['substations'] = {};
                                                        managementAreaData.all.serviceCenters[dataElement.sc].substations[dataElement._id] = dataElement;
                                                    }
                                                }
                                                else{
                                                    managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc] = tempSC[dataElement.sc];
                                                    managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'] = {};
                                                    managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'][dataElement._id] = dataElement;

                                                    managementAreaData.all.serviceCenters[dataElement.sc] = tempSC[dataElement.sc];
                                                    managementAreaData.all.serviceCenters[dataElement.sc].substations = {};
                                                    managementAreaData.all.serviceCenters[dataElement.sc].substations[dataElement._id] = dataElement;
                                                }
                                            }
                                            else{
                                                managementAreaData[dataElement.ma]['serviceCenters'] = {};
                                                managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc] = tempSC[dataElement.sc];
                                                managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'] = {};
                                                managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'][dataElement._id] = dataElement;

                                                managementAreaData.all.serviceCenters[dataElement.sc] = tempSC[dataElement.sc];
                                                managementAreaData.all.serviceCenters[dataElement.sc]['substations'] = {};
                                                managementAreaData.all.serviceCenters[dataElement.sc]['substations'][dataElement._id] = dataElement;

                                            }
                                        }
                                        else {

                                            managementAreaData[dataElement.ma] = {};
                                            managementAreaData[dataElement.ma]['serviceCenters'] = {};
                                            managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc] = tempSC[dataElement.sc];
                                            managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'] = {};
                                            managementAreaData[dataElement.ma]['serviceCenters'][dataElement.sc]['substations'][dataElement._id] = dataElement;
                                        }

                                        // subCounts.forEach(function(count){
                                        //     if (dataElement._id.replace(/_/g, ' ') == count._id){
                                        //         if(count.YTD){
                                        //             dataElement.mYTD = count.YTD;
                                        //         }else{dataElement.mYTD=0}
                                        //         if(count.twelvemoe){
                                        //             dataElement.m12Moe = count.twelvemoe;
                                        //         }else{dataElement.m12Moe =0}
                                        //     }
                                        // });
                                        // subKnown.forEach(function(count){
                                        //     var id = count._id.replace(/\s/g, '_');
                                        //     if (dataElement._id == id){
                                        //         addKnownCountToArea(dataElement, count, id);
                                        //     }
                                        // });

                                        //add counts to Feeders 
                                        //dataElement.feeders.forEach(function(fdr){
                                            // fdrCounts.forEach(function(count){
                                            //     if (fdr.name == count._id){
                                            //         if(count.YTD){ fdr.mYTD = count.YTD;}else{fdr.mYTD=0}
                                            //         if(count.twelvemoe){fdr.m12Moe = count.twelvemoe;}else{fdr.m12Moe =0}
                                            //     }
                                            // });
                                            // fdrKnown.forEach(function(count){
                                            //     if (fdr.name == count._id){
                                            //         if(count.YTD){fdr.mYTDknown = count.YTD;}else{fdr.mYTDknown=0}
                                            //         if(count.twelvemoe){fdr.m12MoeKnown = count.twelvemoe;}else{fdr.m12MoeKnown =0}
                                            //     }
                                            // });
                                        //});
                                        managementAreaData.all.serviceCenters.all.substations[dataElement._id] = dataElement;
                                    }

                                });//data forEach
                                // console.log(service.data.managementAreaData);
                                updateFdrMomList();
                            });//get Mom Count
                        });//Get Sub Locations
                    });//get poly data
                    // var sorted_keys = Object.keys(managementAreaData).sort()

                    service.data.managementAreaData = managementAreaData;
                    //$.unblockUI();
                    return service.data.managementAreaData;
                })

        }

        function addPolygonDataToMas(ma,polyData){

                polyData.forEach(function(poly){
                    if(poly.properties.ma == ma._id){
                        ma.poly = poly;
                    }
                });

        }
        
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

        // function managementAreaSelected(){
        //     if(service.data.selectedManagementArea._id === 'All'){
        //         showAllManagementAreasServiceCentersSubstations();
        //         service.data.selectedServiceCenter = null;
        //         service.data.selectedSubstation = null;
        //         service.data.mostSpecificSelectionType= '';
        //     }
        //     else {
        //         //updateSubstationSelectionListForServiceCenterAll();
        //     }
        //     //turnAllInvestigationLayersOff();
        //     // stemNGS.initiateSubstationGridClear();
        //     // stemNGS.setBounds();
        // }

        function showAllManagementAreasServiceCentersSubstations(){
            service.data.selectedManagementArea = service.data.managementAreaData['all'];

            service.data.selectedManagementArea.serviceCenters= service.data.managementAreaData['all'].serviceCenters;
            service.data.serviceCentersList= service.data.selectedManagementArea.serviceCenters;
            service.data.selectedServiceCenter = service.data.selectedManagementArea.serviceCenters['all'];
            service.data.substationsList = service.data.selectedServiceCenter.substations;
        }

        function updateSubstationSelectionListForServiceCenterAll() {
            var tempSubstationList = {};

            service.data.serviceCentersList = service.data.selectedManagementArea.serviceCenters;

            for (var key in service.data.selectedManagementArea.serviceCenters) {
                if (service.data.selectedManagementArea.serviceCenters.hasOwnProperty(key)) {
                    angular.merge(tempSubstationList, service.data.selectedManagementArea.serviceCenters[key].substations);
                }
            }
            service.data.substationsList = tempSubstationList;
            service.data.selectedServiceCenter = null;
            service.data.selectedSubstation = null;
            setMostSpecificSelectionAndType();
        }

        function managementAreaSelected() {
            service.data.momCountFeeder=[];
            if (service.data.selectedManagementArea._id === 'All') {
                showAllManagementAreasServiceCentersSubstations();
                service.data.selectedServiceCenter = null;
                service.data.selectedSubstation = null;
                service.data.mostSpecificSelectionType = '';
            }
            else {
                updateSubstationSelectionListForServiceCenterAll();
            }
            updateSubMomList();
            updateFdrMomList();
            // console.log(service.data.momCountSub);

        }

        function serviceCenterSelected() {

            if (service.data.selectedServiceCenter !== null) {
                service.data.selectedManagementArea = service.data.managementAreaData[service.data.selectedServiceCenter.substations[Object.keys(service.data.selectedServiceCenter.substations)[0]].ma]
                service.data.substationsList = service.data.selectedServiceCenter.substations;
                service.data.selectedSubstation = null;

                service.data.selectedSubstation = null;


                setMostSpecificSelectionAndType();
            }

            else {
                updateSubstationSelectionListForServiceCenterAll()
            }
            updateFdrMomList();
            // console.log(service.data.substationsList);
            // console.log('sub '+ service.data.selectedSubstation)
        }

        function substationSelected() {
            service.data.momCountFeeder=[];
            if (service.data.selectedSubstation !== null) {
                service.data.selectedManagementArea = service.data.managementAreaData[service.data.selectedSubstation.ma];
                service.data.serviceCentersList = service.data.selectedManagementArea.serviceCenters;
                service.data.selectedServiceCenter = service.data.managementAreaData[service.data.selectedSubstation.ma].serviceCenters[service.data.selectedSubstation.sc];
                service.data.substationsList = service.data.selectedServiceCenter.substations;
                service.data.selectedSubstation = service.data.substationsList[service.data.selectedSubstation._id];
                //    resetting the investigation layer
                setMostSpecificSelectionAndType();
                updateFdrMomList();
                // console.log('selected SUB', service.data.selectedSubstation);
            }
        }

        function feederSelected() {
            //console.log('feeder selected');
            setMostSpecificSelectionAndType();
        }

        function findManagementAreaById(id){
            var maData = service.data.managementAreaData;
            for(var i in maData){
                if(maData[i]._id==id){

                    return maData[i];
                }else{
                    //if not matches
                    //return maData["all"]
                }
            }
        }

        function setManagementArea(id){
            service.data.selectedManagementArea= findManagementAreaById(id);
            if (!service.data.selectedManagementArea){
                // console.log('oops');
            }else{
                managementAreaSelected();
                setMostSpecificSelectionAndType();
            }
        }
        
        function findSubstationById(id){
            var subData = service.data.substationsList;
            // debugger;
            for(var i in subData){
                if(subData[i]._id==id){
                    return subData[i];
                }
                //if not matches
                //return maData["all"]
            }
        }
        
        function findFeederById(id){
            // console.log('findFeederById');
            var fdrData = service.data.selectedSubstation.feeders;
            // console.log(fdrData);
            for(var i in fdrData){
                if(fdrData[i].name==id){
                    return fdrData[i];
                }
                //if not matches
                //return maData["all"]
            }
        }

        function setSubstation(id){
            service.data.selectedSubstation= findSubstationById(id);
            substationSelected();
            setMostSpecificSelectionAndType();
        }

        function setFeederById(id){
            // console.log(service.data.selectedSubstation.feeders);
            service.data.selectedFeeder= findFeederById(id);
            feederSelected();
        }
        
        
        // Todo move MA renaming to backend
        function replaceOldMaNames(ma){
            if(ma._id =='WG'){ma._id ="CB"}
            if(ma._id =='CE'){ma._id ="CD"}
            if(ma._id =='GS'){ma._id ="SB"}
            if(ma._id =='PM'){ma._id ="NB"}
        }

        function updateSubMomList(){
            var arr=[];
            _.forEach (service.data.substationsList, function(el){
                //el.fdrTicketYTD = 11;
                arr.push(el);
            });
            service.data.momCountSub = arr;
            // console.log('updateSubMomList  ' , service.data.momCountSub.length);
        }

        function updateFdrMomList(){
            var arr=[];
            var subs;
            if(service.data.mostSpecificSelectionType=='ma'||service.data.mostSpecificSelectionType=='sc' || service.data.mostSpecificSelectionType=='' ){
                subs = service.data.substationsList;
            }else if(service.data.mostSpecificSelectionType=='sub'){
                subs = [service.data.selectedSubstation];
            }
            // console.log(service.data.momCountAll);
            _.forEach(subs, function(sub){
                _.forEach (sub.feeders, function(el){
                    service.data.feederCounts.forEach(function(fdrCount){
                        if (el.name == fdrCount._id){
                            el.mYTD   = fdrCount.YTD;
                            el.m12Moe = fdrCount.twelvemoe;
                            if (!fdrCount.YTD){el.mYTD   = 0;}
                            if (!fdrCount.twelvemoe){el.m12Moe = 0;}
                            el.fdrTicketYTD = fdrCount.fdrTicketYTD || 0;
                        }
                        
                    });
                    service.data.momCountAll.known.Feeders.forEach(function(knownCount){
                        if (el.name == knownCount._id){
                            el.mYTDknown   = knownCount.YTD;
                            el.m12MoeKnown = knownCount.twelvemoe;
                            if (!knownCount.YTD){el.mYTDknown   = 0;}
                            if (!knownCount.twelvemoe){el.m12MoeKnown = 0;}
                        }
                    });
                    if(!el.mYTD){el.mYTD   = 0;}
                    if(!el.m12Moe){el.m12Moe   = 0;}
                    if(!el.mYTDknown){el.mYTDknown   = 0;}
                    if(!el.m12MoeKnown){el.m12MoeKnown   = 0;}
                    el.ma=sub.ma;
                    el.sc=sub.sc;
                    el.sub=sub._id;
                    arr.push(el);
                })
            });

    // console.log('updateFdrMomList  ' , arr[0]);
    // console.log('FdrMomList length  ' + arr.length);
    // console.log('feederCounts  ' , service.data.fdrList);
            service.data.momCountFeeder = arr;

        }

        function addKnownCountToArea(area, knownCount, id){
            // if(id== area._id){
                if(knownCount.YTD){
                    area.mYTDknown = knownCount.YTD;
                }else {area.mYTDknown = 0}
                if (knownCount.twelvemoe){
                    area.m12MoeKnown = knownCount.twelvemoe;
                }else{area.m12MoeKnown=0}
            // }
        }
    }
})();