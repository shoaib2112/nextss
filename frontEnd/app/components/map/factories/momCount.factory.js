/**
 * Created by AJH0e3s on 4/17/2017.
 */
(function(){
    angular.module('nextGrid').factory('momCountsF', momCounts);

    function momCounts(DataModel, areaF, lightningsF, dateUtilities){
        var service = {
            data: {
                maCounts: [],
                svcCounts:[],
                subCounts:[],
                feederCounts:[],
                countCompareAll:{},
                countCompareMA:[],
                countCompareSvc:[],
                countCompareSub:[],
                countCompareFdr:[],
                momDates:[],
                firstMomDate:'',
                lastMomDate:'',
                selectedMomentary:{},
                selectedMomentaryID:"",
                subMapIsActive : false,
                causeCodes : [
                {"cause_code": "Accidental Contact", "color": "#ff6", "cause_id": "041"},
                {"cause_code": "Accidental Fire (forest fires,etc.)", "color": "#cccc00", "cause_id": "003"},
                {"cause_code": "Bird", "color": "#FFD3AB", "cause_id": "009"},
                {"cause_code": "Customer Request", "color": "#8C1844", "cause_id": "193"},
                {"cause_code": "Equip Failed-OH", "color": "#393b79", "cause_id": "188"},
                {"cause_code": "Equip Failed-UG", "color": "#5254a3", "cause_id": "189"},
                {"cause_code": "FDR Outage", "color": "#f00", "cause_id": ""},
                {"cause_code": "Improper Installation", "color": "#A85D7B", "cause_id": "183"},
                {"cause_code": "Lateral Outage", "color": "#6b6ecf", "cause_id": ""},
                {"cause_code": "Lightning Arrester", "color": "#787bd3", "cause_id": "085"},
                {"cause_code": "Lightning with equip damage", "color": "#b3e7ff", "cause_id": "001"},
                {"cause_code": "Loose Connection", "color": "#9e9ac8", "cause_id": "202"},
                {"cause_code": "OCR Outage", "color": "#AF1420", "cause_id": ""},
                {"cause_code": "Osprey", "color": "#ffbb80", "cause_id": "017"},
                {"cause_code": "Other (explain)", "color": "#B4B4B4", "cause_id": "197"},
                {"cause_code": "Other Animal", "color": "#ff9233", "cause_id": "011"},
                {"cause_code": "Overloaded Normal Conditions", "color": "#C18FA3", "cause_id": "172"},
                {"cause_code": "Slack Conductors", "color": "#bcbddc", "cause_id": "196"},
                {"cause_code": "Squirrel", "color": "#e66b00", "cause_id": "007"},
                {"cause_code": "Storm w/no equip damage", "color": "#0096db", "cause_id": "002"},
                {"cause_code": "Storm/Wind (with equip damage)", "color": "#33beff", "cause_id": "006"},
                {"cause_code": "Switching Error", "color": "#ea6e77", "cause_id": "046"},
                {"cause_code": "Tornado", "color": "#7594a3", "cause_id": "013"},
                {"cause_code": "Transformer Outage", "color": "#dadaeb", "cause_id": "094"},
                {"cause_code": "Tree/Limb Preventable", "color": "#2ca02c", "cause_id": "020"},
                {"cause_code": "Tree/Limb Unpreventable", "color": "#98df8a", "cause_id": "021"},
                {"cause_code": "Unknown", "color": "#454545", "cause_id": "190"},
                {"cause_code": "Vehicle", "color": "#720934", "cause_id": "040"},
                {"cause_code": "Vines/Grass", "color": "#5fd35f", "cause_id": "025"},
                {"cause_code": "Wind (clear day and high winds)", "color": "#007ab3", "cause_id": "005"}
            ],
                usrSLID:'',
                momEdits:{},
                displayMomEdit: false,
                heatEvents:[],
                heatEventCounts:[
                    {title:'Lightning Filtered', count: 0  },
                    {title:'Trouble Tickets Filtered', count: 0  },
                    {title:'Palms/Bamboo YTD', count: 0  },
                    {title:'Cond Assessment YTD', count: 0  },
                    {title:'ALS Events Filtered', count: 0  },
                    {title:'Vines Emails YTD', count: 0  },
                    {title:'Customer Complaints YTD', count: 0  }
                ],
                allEvents:[],
                mappedEvents:[],
                subHeatMapIsActive: false,
                //copy this to sidebar directive & HTML so that when changing substations/MAs, etc it can be reverted to false
                highMomNumSub:0,
                highMomNumFdr:0,
                highMomNumMA:0,
                momCountCurrentPg: 1,
                momListForCsvExport:[],
                chartMomData:[],    //known vs unknown momentaries
                chartKnownData:[]   //Known Causes -  TT, matched Lit, User Defined

            },
            getDataFromServer: getDataFromServer,
            getMomDetailsFromServer:getMomDetailsFromServer,
            momentarySelected:momentarySelected,
            setMomentary: setMomentary,
            sendMomEditToServer:sendMomEditToServer,
            updateSubsWithMoms:updateSubsWithMoms,
            getMomsForMa:getMomsForMa,
            setMomAsUnknown:setMomAsUnknown,
            getMomDateArray:getMomDateArray,
            filterEventsByDates:filterEventsByDates,
            getValuesForColors:getValuesForColors,
            // formatMomDetailsForCsv:formatMomDetailsForCsv
            pushDataToMomHeatArray:pushDataToMomHeatArray,
            getEventsFromServer:getEventsFromServer,
            drawKnownMomChart:drawKnownMomChart
            

        };

        //getDataFromServer();

        var chartKnownData = {};
        return service;

        function getDataFromServer(){
            // console.log('MOM COUNT Factory');
            // loadScreen.showWait('Loading NEXTgrid Data...', true);
            // var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
            //     selectionIdentifier = areaF.getDataIdentifierByType(mostSpecificSelectionType)
            // console.log('getDataFromServer ' + moment().toString());
            return DataModel.getMomentaryCounts().then(function (data) {

                var maCounts = data.MAs;
                var subCounts = data.Substations;
                var feederCounts = data.Feeders;
                var maKnown = data.known.MAs;
                var subKnown = data.known.Substations;
                var fdrKnown = data.known.Feeders;

                DataModel.getKnownMomentaryCounts().then(function(knownData){
                    chartKnownData = knownData;
                   // console.log('mom type counts',knownData);
                   // console.log('mom type counts MA',knownData.MAs);
                   console.log('mom counts MA',data.MAs);
                   // console.log('maCounts',maCounts);
                   // console.log('maKnown',maKnown);
                    // knownData.MAs.lightning
                    // knownData.Substations.lightning
                    // knownData.Feeders.lightning
                    var testData1={
                            "BR": {
                                litYTD: 5,
                                litTwelveMonth:7,
                                ttYTD: 10,
                                ttTwelveMonth:7,
                                userYTD:1,
                                userTwelveMonth:2,
                            },
                            "CD": {
                                litYTD: 5,
                                litTwelveMonth:7,
                                ttYTD: 10,
                                ttTwelveMonth:7,
                                userYTD:1,
                                userTwelveMonth:2,
                            }
                        };
                    var testData2=[
                        {
                            _id:"BR",
                            litYTD:5,
                            litTwelveMonth:5,
                            ttYTD:5,
                            ttTwelveMonth:5,
                            userYTD:5,
                            userTwelveMonth:5
                        }
                    ];

                        // knownData.MAs.lightning.find(function(element){
                        //     return element._id == ma._id;
                        // })

                        // for(var y = 0; y<knownData.MAs.lightning.length; y++){
                        //     var id = knownData.MAs.lightning[y]._id;
                        //     if(id== ma._id){
                        //         ma.litYTD = knownData.MAs.lightning[y].YTD;
                        //         ma.lit12moe = knownData.MAs.lightning[y].twelvemoe;
                        //         break;
                        //     }
                        // }
                        // for(var y = 0; y<knownData.MAs.tickets.length; y++){
                        //     var id = knownData.MAs.tickets[y]._id;
                        //     if(id== ma._id){
                        //         ma.ttYTD = knownData.MAs.tickets[y].YTD;
                        //         ma.tt12moe = knownData.MAs.tickets[y].twelvemoe;
                        //         break;
                        //     }
                        // }
                        // for(var y = 0; y<knownData.MAs.user.length; y++){
                        //     var id = knownData.MAs.user[y]._id;
                        //     if(id== ma._id){
                        //         ma.userYTD = knownData.MAs.user[y].YTD;
                        //         ma.user12moe = knownData.MAs.user[y].twelvemoe;
                        //         break;
                        //     }
                        // }

                });
                    maCounts.forEach(function(ma){
                        //TODO remove MGR Area code fix after it is changed in Data source
                        areaF.replaceOldMaNames(ma);

                        for(var i = 0; i<maKnown.length; i++){
                            var id = maKnown[i]._id;
                            if(id== ma._id){
                                addKnownCountToArea(ma, maKnown[i], id);
                                break;
                            }
                            if (!ma.mYTDknown){ma.mYTDknown = 0}
                            if (!ma.m12MoeKnown){ma.m12MoeKnown = 0}
                        }
                    });

                    subCounts.forEach(function(sub){

                        for(var i = 0; i<subKnown.length; i++){
                            var id = subKnown[i]._id.replace(/\s/g, '_');
                            if(id== sub._id) {
                                addKnownCountToArea(sub, subKnown[i], id);
                                break;
                            }
                            if (!sub.mYTDknown){sub.mYTDknown = 0}
                            if (!sub.m12MoeKnown){sub.m12MoeKnown = 0}
                        }
                    });

                    feederCounts.forEach(function(fdr){
                        for(var i = 0; i<fdrKnown.length; i++){
                            var id = fdrKnown[i]._id;
                            if(id== fdr._id) {
                                addKnownCountToArea(fdr, fdrKnown[i], id);
                                break;
                            }
                        }
                        if (!fdr.mYTDknown){fdr.mYTDknown = 0}
                        if (!fdr.m12MoeKnown){fdr.m12MoeKnown = 0}
                    });

                    service.data.maCounts= maCounts;
                    service.data.subCounts= subCounts;
                    service.data.feederCounts= feederCounts;
                    service.data.countCompareAll=getCountTotals(data);
                    $.unblockUI();
                    google.charts.load('current', {'packages':['corechart']});
                    google.charts.setOnLoadCallback(drawKnownMomChart);

            });
            //TODO when restrictions are added for editing MITs remove the line below
            service.data.usrSlid.security.canEditMIT = true;
            // $.unblockUI();
        }

        function getMomDetailsFromServer(){
            var obj = areaF.data.mostSpecificSelection;
            var selType = areaF.data.mostSpecificSelectionType;
            var id = areaF.data.mostSpecificSelectionIdentifier;
            //Default YTD
            var startDate =moment().startOf('year').format('YYYY-MM-DD');
            var endDate = moment().format('YYYY-MM-DD');

            DataModel.getMomDetails(selType,id,startDate, endDate).then(function(data){
                // console.log('getMomDetails',data);
                if(data.error){
                    areaF.data.mostSpecificSelection.moms=[data];
                    // console.log(areaF.data.mostSpecificSelection.moms[0]);
                }else{
                    //  var withTckt = data.filter(function (obj) {
                    //     return obj.Ticket ;
                    // });
                    data.forEach(function(mom){
                        if (mom.Ticket.TRBL_TCKT_NUM){
                            mom.causeCode={};
                            // Cause codes from data do not have leading 0s all of the time.
                            var causeID = mom.Ticket.IRPT_CAUS_CODE;
                            if(causeID.length==1){causeID= "00" + causeID}
                            if(causeID.length==2){causeID=  "0" + causeID}
                            var cause = service.data.causeCodes.filter(function (obj) {
                                return obj.cause_id ==causeID;
                            });
                            if(cause[0]){
                                mom.causeCode={};
                                mom.causeCode.cause_id = cause[0].cause_id;
                                mom.causeCode.cause_code = cause[0].cause_code;
                            }else{
                                mom.causeCode.cause_id = mom.Ticket.IRPT_CAUS_CODE;
                                mom.causeCode.cause_code = mom.Ticket.IRPT_CAUS_DS;
                            }
                            mom.causeLocation = {"lat":mom.Ticket.lng,"lng":mom.Ticket.lat};
                            // console.log(mom);
                        } else if(!mom.Ticket.TRBL_TCKT_NUM && mom.Lightning){
                            if(mom.Lightning.location){
                                mom.causeCode={};
                                mom.causeCode.cause_id = "001";
                                mom.causeCode.cause_code = "Lightning with equip damage";
                                // console.log('No Ticket, with Lightning   ', mom);
                                mom.causeLocation = {"lat":mom.Lightning.location.coordinates[1],"lng":mom.Lightning.location.coordinates[0]};
                                // console.log('No Ticket, with Lightning   ',mom);
                            }
                        }
                    });
                    areaF.data.mostSpecificSelection.moms = data;
                    getMomDateArray();
                    getEventsFromServer();
                    // console.log('got mom details');
                    // console.log(data);
                }
                formatMomDetailsForCsv(data);
            });

            service.data.highMomNumFdr = 0;
            var fdrList = areaF.data.selectedSubstation.feeders;
            service.data.highMomNumFdr = service.getValuesForColors(fdrList, 'mYTD');

        }

        function formatMomDetailsForCsv(data){
            // var data = areaF.data.mostSpecificSelection.moms;
            service.data.momListForCsvExport=[];

            if (!data.length)
                return;

            data.forEach(function(d){
                var item = {
                    'ma'        : d.MGR_AREA_CODE,
                    'sub'       : d.SUBSTN_NAME,
                    'feeder'    : d.FDR_NUM,
                    'status'    : d.Status,
                    //moment().format('h:mm:ss')
                    'openTime'  : moment(d.BKR_OPEN_DTTM).format('MM/DD/YY hh:mm:ss a'), //formatted for reader friendly local time
                    'closeTime' : moment(d.BKR_CLSE_DTTM).format('MM/DD/YY hh:mm:ss a') //formatted for reader friendly local time
                };
                if(d.causeCode){
                    item.causeCode = d.causeCode.cause_code;
                    item.causeId   = d.causeCode.cause_id;
                }
                if(d.causeLocation){
                    item.lat = d.causeLocation.lat;
                    item.lng = d.causeLocation.lng;
                }
                if(d.Ticket){
                    //Ticket Num, Ticket Type, Interruption type, TCMS_FPL_ID
                    item.ttNum      = d.Ticket.TRBL_TCKT_NUM;
                    item.ttType     = d.Ticket.TCKT_TYPE_CODE;
                    item.ttIntType  = d.Ticket.IRPT_TYPE_CODE;
                    item.ttTcmsFplId= d.Ticket.TCMS_FPL_ID
                }

                service.data.momListForCsvExport.push(item);
            });
        }

        function getEventsFromServer(){
            // console.log('getEventsFromServer');
            service.data.heatEvents=[];
            service.data.momDates=[];
            getMomDateArray();
            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selectionIdentifier = areaF.getDataIdentifierByType(mostSpecificSelectionType),
                selectionType = areaF.getDataIdentifierByType(mostSpecificSelectionType),
                selection = areaF.getMostSpecificSelection(),
                feederList = [],
                firstDate = service.data.firstMomDate,
                lastDate = service.data.lastMomDate;
            var dateFilterString='';
            //service.data.momDates
            service.data.momDates.forEach(function(date){
                var string = moment(date).format('YYYY-MM-DD');
                dateFilterString += string +',';
                //2017-05-10,2017-05-11,2017-05-05
            });
            //dateFilterString
            dateFilterString = dateFilterString.substring(0, dateFilterString.length-1);
            // console.log('date filters',dateFilterString);
            var type = areaF.data.mostSpecificSelectionType;
            var id = areaF.data.mostSpecificSelectionIdentifier;
            var firstDateYMD = moment(firstDate).format('YYYY-MM-DD'),
                lastDateYMD = moment(lastDate).format('YYYY-MM-DD'),
                today = new Date(),
                oneYearBack = dateUtilities.dateMinusFromSelectedDate(today, 365);

            if(mostSpecificSelectionType === 'sub'){
                selection.feeders.forEach(function(feeder){
                    feederList.push(feeder.name);
                });
            }
            else if(mostSpecificSelectionType === 'feeder') {
                feederList = selection.name;
            }

            var lit,tts;
            DataModel.getLtgDay(mostSpecificSelectionType, selectionType, firstDate,lastDate, dateFilterString)
                .then(function (data) {
                    // lit = filterEventsByDates(data, 'datetime');
                    lit = data;
                    if(data.length !== undefined || data.length > 0 ){
                        service.data.heatEventCounts[0]['count'] = data.length;
                    }else{
                        service.data.heatEventCounts[0]['count'] = 0;
                    }
                    pushDataToMomHeatArray(lit,'lat','lng', 'datetime', null, 'Lightning');
                    // console.log('lit ',lit.length);
                });
            DataModel.getTicket (mostSpecificSelectionType, selectionType,  moment(firstDate).format('YYYY-MM-DD'), moment(lastDate).format('YYYY-MM-DD'),dateFilterString)
                .then(function(data){
                    tts= data;
                    if(data.length !== undefined  || data.length > 0 ){
                        service.data.heatEventCounts[1]['count'] = data.length;
                    }else{
                        service.data.heatEventCounts[1]['count'] = 0;
                    }
                    pushDataToMomHeatArray(tts,'lng','lat','TCKT_CRTE_DTTM', null, 'Trouble Tickets')
                });
            DataModel.getPalm(mostSpecificSelectionType, selectionIdentifier)
                .then(function (data) {
                    if(data.length !== undefined || data.length > 0 ){
                        service.data.heatEventCounts[2]['count'] = data.length;
                    }else{
                        service.data.heatEventCounts[2]['count'] = 0;
                    }
                    pushDataToMomHeatArray(data,'lat','long',null, null, 'Palms/Bamboo')
                    }
                );
            DataModel.getCond('feeders', feederList)
                .then(function (data) {
                    if(data.length !== undefined || data.length > 0 ){
                        service.data.heatEventCounts[3]['count'] = data.length;
                    }else{
                        service.data.heatEventCounts[3]['count'] = 0;
                    }
                    pushDataToMomHeatArray(data,'latlng_y','latlng_x',null, null, 'Cond Assessment');
                    });
            DataModel.getALScountDetail(selectionIdentifier, firstDate, lastDate, dateFilterString)
                .then(function(data){
                    if(data.length !== undefined || data.length > 0 ){
                        service.data.heatEventCounts[4]['count'] = data.length;
                    }else{
                        service.data.heatEventCounts[4]['count'] = 0;
                    }
                    pushDataToMomHeatArray(data,'lng','lat',null, 'count', 'ALS Events')
            });
            DataModel.getVine(mostSpecificSelectionType, selectionIdentifier, oneYearBack, today)
                .then(function(data){
                    if(data.length !== undefined || data.length > 0 ){
                        service.data.heatEventCounts[5]['count'] = data.length;
                    }else{
                        service.data.heatEventCounts[5]['count'] = 0;
                    }
                    pushDataToMomHeatArray(data,'latitude','longitude',null, null, 'Vines Emails');
            });
            DataModel.getComplaints('feeder', feederList)
                .then(function(data){
                    if(data.length !== undefined || data.length > 0 ){
                        service.data.heatEventCounts[6]['count'] = data.length;
                    }else{
                        service.data.heatEventCounts[6]['count'] = 0;
                    }
                    data.forEach(function(d){
                        d.lat=d.location.coordinates[1];
                        d.lng=d.location.coordinates[0];
                    });
                    pushDataToMomHeatArray(data,'lat','lng',null, null, 'Customer Complaints')
            });

            console.log('Investigation results should be greater than, or equal to, the filter count.' +
                '\n Results that are not filtered by date:' +
                '\n Palms, CA, Complaints, Vines ');
            // setTimeout(function(){
                // console.log(service.data.heatEventCounts);
                // console.log('Heat Map events', service.data.heatEvents[0]);
                // console.log('Heat Map total events', service.data.heatEvents.length);
                return service.data.heatEvents;
            // },1000);

        }

        function momentarySelected(){}
        
        function setMomentary(mom){
            service.data.selectedMomentary = findMomById(mom._id);
            service.data.selectedMomentaryID = service.data.selectedMomentary._id;
            // console.log('selectedMom ID',service.data.selectedMomentary);
        }

        function setMomAsUnknown(){
            service.data.momEdits.updatedBy= service.data.usrSlid.slid;
            service.data.momEdits.lastUpdated = moment().format();
            var ed =service.data.momEdits; //Edits to send to server
            ed.causeCode ={};
            ed.causeLocation =null;
            ed.Status = "unknown";

        }

        function sendMomEditToServer(){
            console.log('sendMomEditToServer');
            service.data.momEdits.updatedBy= service.data.usrSlid.slid;
            service.data.momEdits.lastUpdated = moment().format();
            // console.log('Selected Mom', service.data.selectedMomentary);
            var mom = service.data.selectedMomentary; //Original Momentary Object
            var ed =service.data.momEdits; //Edits to send to server
            var areaMoms = areaF.data.mostSpecificSelection.moms;
            ed._id = mom._id;
            // ed._id = "666666666666666666666666";
            if (ed.causeLocation ==null){
                ed.Status = "Unknown";
            }else {
                ed.Status = "Known";
            }
            if(ed.causeCode.color){
                delete ed.causeCode.color;
            }
            // console.log(ed);

            DataModel.postMomEdit(ed).then(function(response){
                // console.log('response type', typeof response);
                var res = JSON.parse(response);
                console.log('response', res);
                if (res){
                    if(mom.Status = "Unknown"){
                        // update Count Totals
                        getDataFromServer();
                    }
                    updateSelectedMom(mom,res);
                    areaMoms.forEach(function(areaM){
                        if( areaM._id == mom._id){
                            areaM = mom;
                        }
                    });
                } else if (!res){
                    alert('There was a problem sending your edits to the server. \n NO RECORDS WERE UPDATED');
                }
            });

            service.data.momEdits ={};
        }

        function updateCountTotals(){
            //now not used
            var sub = areaF.data.selectedSubstation;
            var fdrId = service.data.selectedMomentary.FDR_NUM;

            areaF.data.fplCounts.mYTD = areaF.data.fplCounts.mYTD-1;
            areaF.data.fplCounts.mYTDknown = areaF.data.fplCounts.mYTDknown+1;
            areaF.data.fplCounts.m12Moe = areaF.data.fplCounts.m12Moe-1;
            areaF.data.fplCounts.m12MoeKnown = areaF.data.fplCounts.m12MoeKnown+1;

            areaF.data.selectedManagementArea.mYTD = areaF.data.selectedManagementArea.mYTD-1;
            areaF.data.selectedManagementArea.mYTDknown = areaF.data.selectedManagementArea.mYTDknown+1;
            areaF.data.selectedManagementArea.m12Moe = areaF.data.selectedManagementArea.m12Moe-1;
            areaF.data.selectedManagementArea.m12MoeKnown = areaF.data.selectedManagementArea.m12MoeKnown+1;

            sub.mYTD        = sub.mYTD-1;
            sub.mYTDknown   = sub.mYTDknown+1;
            sub.m12Moe      = sub.m12Moe-1;
            sub.m12MoeKnown = sub.m12MoeKnown+1;

            sub.feeders.forEach(function(fdr){
                if(fdr.name == fdrId){
                    // console.log('feeder', fdr);
                    fdr.mYTD = fdr.mYTD-1;
                    fdr.mYTDknown = fdr.mYTDknown+1;
                    fdr.m12Moe = fdr.m12Moe-1;
                    fdr.m12MoeKnown = fdr.m12MoeKnown+1;
                }
            });

        }

        function findMomById(id){
            var momList = areaF.data.selectedSubstation.moms;
            // debugger;
            for(var i in momList){
                if(momList[i]._id==id){
                    return momList[i];
                }
            }
        }

        function updateSubsWithMoms(){
            // console.log('momCountsF.updateSubsWithMoms');
            var subList = areaF.data.substationsList;
            var subCounts = service.data.subCounts;
            // console.log('subcounts', subCounts[77]);
            service.data.subCounts.forEach(function(count){
                if (count._id) {
                    count._id = count._id.replace(/\s/g, '_');
                    var id = count._id;
                    if (subList[id] || subList[id] !== undefined) {
                        addMomDataToArea(areaF.data.substationsList[id], count);
                    }
                }
            });
            areaF.updateSubMomList();
            
            service.data.highMomNumSub = 0;
            var subList = areaF.data.momCountSub;
            service.data.highMomNumSub = getValuesForColors(subList, 'mYTD');
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

        function addMomDataToArea(area,momObj){
            var id = momObj._id;
            var areaID = area._id;
            if(areaF.data.selectedFeeder !== null && areaF.data.selectedFeeder.name !== undefined){
                areaID = area.name;
            }
            if(id == areaID){
                if(momObj.YTD){area.mYTD = momObj.YTD}else{area.mYTD =0;}
                if(momObj.twelvemoe){area.m12Moe = momObj.twelvemoe}else{area.m12Moe =0}
                if(momObj.mYTDknown){area.mYTDknown = momObj.mYTDknown}else{area.mYTDknown =0}
                if(momObj.m12MoeKnown){area.m12MoeKnown = momObj.m12MoeKnown}else{area.m12MoeKnown =0}
                area.fdrTicketYTD = momObj.fdrTicketYTD || 0;
                // console.log(area);
            }
        }

        function getMomsForMa(ma){
            var mom = service.data.maCounts.filter(function (obj) {
                return obj._id == ma._id;
            });
            if(mom[0]){
                addMomDataToArea(ma, mom[0])
            }
            // console.log('MA Moms');
        }
        
        function getMomDateArray(){
            // debugger;
            if(areaF.data.selectedSubstation.moms){
                var substation = areaF.data.selectedSubstation;
                var array=[];
                var date;
                var moms = areaF.data.selectedSubstation.moms;//array
                var firstDate;
                var lastDate;

                moms.forEach(function(mom){
                    // if feeder is selected where moms[i].FDR_NUM = mostSpecificSelectionIdentifier
                    //and where mom.isSelected = true (to connect to checkboxes in the Mom list)
                    date = moment(mom.BKR_OPEN_DTTM).startOf('day');
                    // console.log('date ', date);


                    if(date.isBefore(firstDate) || firstDate == undefined){
                        firstDate = date;
                    }else if(date.isAfter(lastDate) || lastDate == undefined){
                        lastDate = date;
                    }

                    date = date.toDate();
                    // if(date is not in array){
                    if(isDateInArray(date, array)){
                    }else{
                        array.push(date);
                    }

                });
                // console.log(array);
                service.data.momDates = array;
                service.data.firstMomDate = firstDate.toDate();
                service.data.lastMomDate = lastDate.toDate();

            }
            
        }
        
        function filterEventsByDates(events, dateField){
            // console.log('~~FILTER BY DATE~~');
            //to pass heat events or allEvents
            var array = [];
            var dates = service.data.momDates;
            // console.log((moment(events[2][dateField]).startOf('day').toDate()).getTime());
            // console.log('date: ', dates[2].getTime());
            for(var i=0; i< events.length; i++){
                var event = events[i];

                for(var j=0; j< dates.length; j++){
                    // if (moment(event[dateField]).getTime() == dates[j].getTime()){
                    var evDate = moment(events[i][dateField]).startOf('day').toDate();
                    // console.log(evDate.getTime() == dates[j].getTime());
                    if (evDate.getTime() == dates[j].getTime()){
                        array.push(event);
                        // service.data.mappedEvents.push(event);
                        break;
                    }else{
                    }
                }
            }
            // console.log('lit', events);
            // console.log('array', array);
            return array;
        }

        function pushDataToMomHeatArray(data,latField, lngField, dateField, valueField, type ){
            if(data.length > 0 ){
                for(var i=0; i< data.length; i++){
                    var d = data[i];
                    var date;
                    var value;
                    //Format dateTime to JS object
                    if(d[lngField]!==undefined ||  d[latField]!==undefined){
                        if(valueField == null){
                            value = 1;
                        }else{
                            value = d[valueField];
                        }
                        if(dateField!==null){
                            date = moment(d[dateField]).startOf('day').toDate();
                            var object = {lng:d[lngField], lat: d[latField], 'value':value, dateTime:date, 'type':type};
                            service.data.heatEvents.push(object);
                        }else {
                            var object = {lng:d[lngField], lat: d[latField], 'value':value,'type':type };
                            service.data.heatEvents.push(object);
                        }
                    }else {
                        console.log('missing data');
                    }

                }
                // data.forEach(function(d){
                //
                // });
            }
        }

        function drawKnownMomChart(){
            updateMomChartData();
            // console.log('drawKnownMomChart', scope.momCountData.chartMomData);
            var data = google.visualization.arrayToDataTable(service.data.chartMomData);
            var options = {'title':'Known Vs Unknown Momentaries', 'width':350, 'height':300, colors:['#67bd45','#FF0000'],
                // legend: {position: 'top'}
            };
            var chart = new google.visualization.PieChart(document.getElementById('chartMomDiv'));
            chart.draw(data, options);

            var data2 = google.visualization.arrayToDataTable(service.data.chartKnownData);
            var options2 = {'title':'Known Momentaries by Cause', 'width':350, 'height':300, colors:['#67bd45','#0096db','#FEB705'],
                // legend: {position: 'top', textStyle: {color: 'blue', fontSize: 16}}
            };
            var chart2 = new google.visualization.PieChart(document.getElementById('chartKnownDiv'));
            chart2.draw(data2, options2);
        }

        function updateMomChartData(){
            //debugger;
            console.log(chartKnownData);
            // console.log('updateMomChartData');
            // chartMomData = [],    //known vs unknown momentaries
            // chartKnownData=[]   //Known Causes -  TT, matched Lit, User Defined
            var known, unknown, tt,user,lit;
            switch (areaF.data.mostSpecificSelectionType){
                case 'feeder':
                    known = areaF.data.selectedFeeder.mYTDknown;
                    unknown = areaF.data.selectedFeeder.mYTD;
                    for(var c = 0; c < chartKnownData.Feeders.length; c++){
                        if(areaF.data.selectedFeeder._id === chartKnownData.Feeders[c]._id){
                            tt = chartKnownData.Feeders[c].ttYTD;
                            user = chartKnownData.Feeders[c].userYTD;
                            lit = chartKnownData.Feeders[c].litYTD;
                        }
                    }
                    break;
                case 'sub':
                    known = areaF.data.selectedSubstation.mYTDknown;
                    unknown = areaF.data.selectedSubstation.mYTD;
                    for(var c = 0; c < chartKnownData.Substations.length; c++){
                        if(areaF.data.selectedSubstation._id === chartKnownData.Substations[c]._id){
                            tt = chartKnownData.Substations[c].ttYTD;
                            user = chartKnownData.Substations[c].userYTD;
                            lit = chartKnownData.Substations[c].litYTD;
                        }
                    }
                    break;
                case 'svc':
                    known = areaF.data.selectedServiceCenter.mYTDknown;
                    unknown = areaF.data.selectedServiceCenter.mYTD;
                    for(var c = 0; c < chartKnownData.MAs.length; c++){
                        if(areaF.data.selectedManagementArea._id === chartKnownData.MAs[c]._id){
                            tt = chartKnownData.MAs[c].ttYTD;
                            user = chartKnownData.MAs[c].userYTD;
                            lit = chartKnownData.MAs[c].litYTD;
                        }
                    }
                    break;
                case 'ma':
                    known = areaF.data.selectedManagementArea.mYTDknown;
                    unknown = areaF.data.selectedManagementArea.mYTD;
                    for(var c = 0; c < chartKnownData.MAs.length; c++) {
                        if (areaF.data.selectedManagementArea._id === chartKnownData.MAs[c]._id) {
                            tt = chartKnownData.MAs[c].ttYTD;
                            user = chartKnownData.MAs[c].userYTD;
                            lit = chartKnownData.MAs[c].litYTD;
                        }
                    }
                    break;
                default:
                    known = service.data.countCompareAll.knownYtd;
                    unknown = service.data.countCompareAll.unknownYtd;
                    tt      =   service.data.countCompareAll.ttYTD;
                    user    =   service.data.countCompareAll.userYTD;
                    lit     =   service.data.litYTD;
            }

            service.data.chartMomData   = [
                ['MomType', 'Count'],
                ['Known',known || 0],
                ['Unknown',unknown || 0]
            ];
            service.data.chartKnownData = [
                ['CauseType', 'Count'],
                ['TT',tt || 0],
                ['User',user || 0],
                ['Lightning',lit || 0]
            ];
        }

    }

    function getCountTotals(mArray){
        // function getCountTotals(mArray, type, totalsArray){
        //pass array to total, mostSpecificSelectionType , countCompare Array
        //if type = none, ma, sub, feeder - use most specific selection type?
        var totalsArray;
        var sumKnown=0;
        var sumUnknown=0;
        mArray.MAs.forEach(function(item){
            //get
            if(item.YTD){sumUnknown +=item.YTD}
        });
        mArray.known.MAs.forEach(function(item){
            if(item.YTD){sumKnown +=item.YTD}
        });
        totalsArray = {knownYtd: sumKnown, unknownYtd:sumUnknown};
        return totalsArray;
    }

    function updateSelectedMom(mom,edits){
        mom.causeLocation = edits.causeLocation;
        mom.causeCode = edits.causeCode;
        mom.updatedBy = edits.updatedBy;
        mom.lastUpdated = edits.lastUpdated;
        mom.Status = edits.Status;
        if(edits.causeComments){
            mom.causeComments = edits.causeComments;
        }
    }

    function addKnownCountToArea(area, knownCount, id){
        if(id == area._id){
            if(knownCount.YTD){
                area.mYTDknown = knownCount.YTD;
            }else {area.mYTDknown = 0}
            if (knownCount.twelvemoe){
                area.m12MoeKnown = knownCount.twelvemoe;
            }else{area.m12MoeKnown=0}
        }
    }

    function isDateInArray(date,array){
        for (var i = 0; i < array.length; i++) {
            if (date.getTime() === array[i].getTime()) {
                return true;
            }
        }
        return false;
    }






})();