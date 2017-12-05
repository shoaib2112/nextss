/**
 * Created by MXG0RYP on 5/20/2016.
 */
(function(){
    angular.module('nextGrid').factory('faults', faults);

    function faults(controlPanelSelection, areaF, loadScreen, DataModel,gridsF){
        var service = {
            data: {
                faults: [],
                network:[]
            },
            getDataFromServer: getDataFromServer,
            clearFaults: clearFaults
        };

        var networkLines=[];

        return service;
 
        function getDataFromServer(callback){
            loadScreen.showWait('Loading Faults...', true);

            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selection = areaF.getDataIdentifierByType(mostSpecificSelectionType),
                selectedCalendarDate = areaF.data.selectedCalendarDate;
                // nextDayAfterSelectedCalendarDate = moment(selectedCalendarDate).add(1, 'day').toDate();
            var endDate = areaF.data.selectedCalendarEndDate;
            // console.log(selectedCalendarDate);
            // console.log(endDate);

            if(service.data.hasOwnProperty('dataIdentifiers')){
                if(mostSpecificSelectionType === service.data.dataIdentifiers.mostSpecificSelectionType || selection === service.data.dataIdentifiers.selection || selectedCalendarDate === service.data.dataIdentifiers.selectedCalendarDate) {
                    $.unblockUI();
                    callback(getCombinedFaults(service.data.faults));
                }
            }
            else{
                //TODO look into moving this moment function call in the getFault parameter listing
                DataModel.getFault(mostSpecificSelectionType, selection, selectedCalendarDate, endDate)
                    .then(function (data) {
                        // console.log(!(data.hasOwnProperty('error')));
                        if (data && data.length  && !(data.hasOwnProperty('error'))) {
                            // service.data.faults = data;
                            service.data.faults = getCombinedFaults(data);
                            // console.log( 'combined fault data ', service.data.faults);
                            $.unblockUI();
                        }
                        else {
                            $.unblockUI();
                            $.growlUI(data.error);
                        }
                        //
                        // //this forEach loop is to make the faults all active on the controlPanelView
                        // service.data.faults.forEach(function(element){
                        //     element.isActive = true;
                        // });

                        //This is for future use to see if we have this data active so we can pull locally instead of from the server
                        service.data.dataIdentifiers = {
                            mostSpecificSelectionType: mostSpecificSelectionType,
                            selection: selection,
                            selectedCalendarDate: selectedCalendarDate
                        };


                       // callback(service.data.faults);
                    });
            }
        }

        function clearFaults(){
            service.data.faults = [];
            delete service.data.dataIdentifiers;
        }

        //AJH Combined fault map logic
        //Format for combined faults after getCombinedFaults()
            //ex: combinedFaultArrays =[
            // {combinedFault=true, faults:[{fault-A},{fault-B}]},
            // {combinedFault=true, faults:[{fault-1},{fault-2}]},
            // {(single fault object with-- combinedFault=false)}
            //

        /**
         * updateFaultMapPoints(fArray)
         * called in getCombinedFaults(faultArray)
         * The fault maps from the SQL source do not have all of the points for some laterals, especially underground ones
         * This function compares unique values to replace the points for the line segments so that the fault maps follow the actual lines
         */
        function updateFaultMapPoints(fArray){
            // getNetworkDataToCompare();
            networkLines = service.data.network; //set on data call in stemNGS.initiateSubstationGridDrawVertice()
            // console.log(networkLines);
            fArray.forEach(function(fault){
                spliceFplIdFromSect(fault);
                // spliceIDFromNetwork(networkLines);
                replaceSegmentPointsWithNetwork(fault);
            });
            return fArray;
        }

        function spliceFplIdFromSect(fault){
            //adds a property to be compared to the network lines - containerAltId
            fault.segments.forEach(function(seg){
                //var underscoreIndex=seg.sect.indexOf("_");
                var idPortions=seg.sect.split("_");
                seg.containerAltId=idPortions[0];
                seg.containerFPLid=idPortions[1];
                //console.log('fpl alt ', idPortions[0], '-- fpl id ', idPortions[1], ' -third- ', idPortions[2]);
                // if(idPortions[0]=='9760344'){
                //     console.log(seg);
                // }
            });
        }
        function spliceIDFromNetwork(network){
            network.forEach(function(device){
                var thing = device.fplID.split("+");
                if(thing.length>1){
                    device.containerFPLid=thing[0];
                    device.segmentFplID=thing[1];
                }
            });
        }
        function getNetworkDataToCompare(fArray){
            networkLines = service.data.network.filter(function(item){
                    return item.type === "ACLineSegment" && item.phase === "N";
            //console.log('netLines',networkLines);
            })

        }
        function replaceSegmentPointsWithNetwork(fault){
            // console.log('replaceSegmentPointsWithNetwork');
            var networkLines = service.data.network;
            if(fault.segments){
                fault.segments.forEach(function(seg){
                    for(var i=0;i<networkLines.length; i++){
                        if(seg.containerAltId ==  networkLines[i].properties.parentID && seg.containerFPLid == networkLines[i].properties.fplID) {
                            if(networkLines[i].geometry.coordinates !== undefined) {
                                var points = networkLines[i].geometry.coordinates;
                                var pointArray=[];
                                points.forEach(function(pt){
                                    pointArray.push([pt[1],pt[0]])
                                });
                                seg.points =  pointArray;
                                break;
                            }
                        }
                    }
                });
            }

        }
        // var next;
        //also declared in getCombinedFaults - below
        var combinedFaultsArray;
        var firstFaultTime;
        var maxTime;
        //TODO these are declared again in getCombinedFaults
        var seconds= 5*60;
        var milSec = seconds*1000;
        // To calculate fault segment values, numbers may change later
            //moved to top for easy access


        function defineTimeWindow(fault){
            // console.log(seconds);
            firstFaultTime = moment(fault.faultDate, moment.ISO_8601);
            maxTime = firstFaultTime.clone().add(seconds,'s');
            // console.log('first '+ firstFaultTime.format('HH:mm:ss'));
            // console.log('max ' + maxTime.format('HH:mm:ss'));
        }

//See if the passed fault is within the time window
        function withinTime(fault) {
            var faultTime = moment(fault.faultDate, moment.ISO_8601);
            // if(firstFaultTime.diff(faultTime)< milSec && firstFaultTime.diff(faultTime)>=0){
            if(faultTime.isBetween(firstFaultTime, maxTime)){
                // console.log('WT-t');
                return true;
            }else{
                return false;
            }
        }

        function getCombinedFaults(faultArray){
            updateFaultMapPoints(faultArray);
            //this runs again when multiple faults are selected, the below IF line fixes that
            if (faultArray[0].combinedFault){return faultArray;}
            //temp array for putting in the combined faults
            var sortedFaults = sortArrByProp(faultArray,'faultDate');
            seconds= 5*60;
            milSec = seconds*1000;
            var tempArray=[];
            var singleFaultArray=[];
            var group =0;
            tempArray[group]={combinedFault:true, groupedF:[]};
            for(var i=0; i< sortedFaults.length; i++){
                //console.log(sortedFaults[i]);
                var addInToFaultGroup=false;
                var alreadyUsed=false;
                //check to see first or make sure the fault is NOT in the ANY Group/Array
                tempArray.forEach(function(combos){
                    if(objectInArrayByProp(sortedFaults[i],combos.groupedF,'id')>0){
                        alreadyUsed = true;
                    }
                });
                if(alreadyUsed==false){
                    defineTimeWindow(sortedFaults[i]);
                    for(var j=0; j< faultArray.length; j++) {
                        //check if each other fault is in the time range and if the same feeder
                        if (withinTime(faultArray[j]) && faultArray[j].feederNumber == sortedFaults[i].feederNumber && faultArray[j].id !== sortedFaults[i].id){
                            //if true, push current fault to temp array
                            //add include true for turning individual faults inside On & Off later
                            faultArray[j].includeFault=true;
                            tempArray[group].groupedF.push(faultArray[j]);
                            addInToFaultGroup = true;
                        }
                    }
                    // console.log(tempArray[group].groupedF);
                }
                if(alreadyUsed==true && addInToFaultGroup==false){
                    //nothing
                    //console.log('used & not in group ', sortedFaults[i].id);
                }
                else if(addInToFaultGroup===true){
                    //push original item to the group
                    sortedFaults[i].includeFault=true;
                    tempArray[group].startTime =sortedFaults[i].faultDate;
                    tempArray[group].faultDate=tempArray[group].startTime;
                    tempArray[group].endTime=maxTime.format();
                    tempArray[group].groupedF.push(sortedFaults[i]);
                    //start a new array once there are no other faults that fit in the timeframe
                    group+=1;
                    tempArray[group]={combinedFault:true, groupedF:[]};
                    // addInToFaultGroup=false;
                }else{
                    //uncombined faults get pushed as individual objects into a separate Array;
                    sortedFaults[i].combinedFault=false;
                    singleFaultArray.push(sortedFaults[i]);
                }
            }
            for(var x=0; x< tempArray.length; x++){
                if(Array.isArray(tempArray[x].groupedF)){
                    if(tempArray[x].groupedF.length==0){
                        tempArray.splice(x,1)
                    }
                }
            }
            singleFaultArray.forEach(function(item){
                tempArray.push(item);
            });
            // console.log('singles ');
            // console.log(singleFaultArray);
            combinedFaultsArray= tempArray;
            return combinedFaultsArray;
        }

        function sortArrByProp(arr,prop) {
//copied from StackOverflow
            prop = prop.split('.');
            var len = prop.length;

            arr.sort(function (a, b) {
                var i = 0;
                while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                } else {
                    return 0;
                    //console.log('ding');
                }
            });
            return arr;
        }
        function objectInArrayByProp(obj,array,prop){
            var count=0;
            array.forEach(function(item){
                if(obj[prop]== item[prop]){count++}
            });
            return count;
        }


    }
})();