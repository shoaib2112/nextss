/**
 * Created by AJH0E3s on 4/27/2017.
 */
(function(){
    angular.module('nextGrid').factory('alsEventsF', alsEvents);

    function alsEvents(controlPanelSelection, areaF, loadScreen, DataModel){
        var service = {
            data: {
                alsEvents: [],
                alsMapping:[]
            },
            getDataFromServer: getDataFromServer//,
            //clearAlsEvents: clearAlsEvents
        };

        var networkLines=[];

        return service;
 
        function getDataFromServer(){
            // loadScreen.showWait('Loading Faults...', true);

            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType();
            if(mostSpecificSelectionType=='feeder'){
                mostSpecificSelectionType='sub'
            }
            var selection = areaF.getDataIdentifierByType(mostSpecificSelectionType),
                selectedCalendarDate = areaF.data.selectedCalendarDate;
                // nextDayAfterSelectedCalendarDate = moment(selectedCalendarDate).add(1, 'day').toDate();
            var endDate = areaF.data.selectedCalendarEndDate;

            //(subName, bdate, edate)
            return DataModel.getALScountDetail(selection, selectedCalendarDate, endDate, null)
                .then(function (data) {
                    // $.unblockUI();

                    service.data.alsEvents = data;
                    service.data.alsMapping=[];
                    if (data.length==0){
                        service.data.alsEvents.status =0;
                    }else {
                        data.forEach(function(event){
                            event.EventDayMoment = moment(event.EventDay, "YYYY-MM-DD");
                            event.EventDay = event.EventDayMoment.format('MM/DD/YYYY');

                            var eventsByAls= {};
                            if(!isObjectInArrayByProp(event, service.data.alsMapping, 'ts_parent_fpl_id')){
                                //create new
                                eventsByAls={
                                    ts_parent_fpl_id : event.ts_parent_fpl_id,
                                    dvc_coor:   event.dvc_coor,
                                    feeder  :   event.feeder,
                                    lat     :   event.lng,
                                    lng     :   event.lat,
                                    events  :   [{
                                        EventDay    : event.EventDay,
                                        EventDayMoment : event.EventDayMoment,
                                        xfrmr_phase : event.xfrmr_phase,
                                        count   :   event.count,
                                        countA  :   event.countA,
                                        countB  :   event.countB,
                                        countC  :   event.countC
                                    }]
                                };
                                service.data.alsMapping.push(eventsByAls);
                            }else{
                                for(var i=0; i<service.data.alsMapping.length; i++){
                                    if(service.data.alsMapping[i].ts_parent_fpl_id == event.ts_parent_fpl_id){
                                        // console.log(event.ts_parent_fpl_id);
                                        // console.log('parent', service.data.alsMapping[i]);
                                        var newEv = { EventDay    : event.EventDay,
                                          EventDayMoment : event.EventDayMoment,
                                          xfrmr_phase : event.xfrmr_phase,
                                          count   :   event.count,
                                          countA  :   event.countA,
                                          countB  :   event.countB,
                                          countC  :   event.countC
                                        };
                                        service.data.alsMapping[i].events.push(newEv);
                                        break;
                                    }
                                }
                            }
                        });
                    }

                    console.log(service.data.alsMapping);
                    return service.data.alsEvents;
                });
        }

        function isObjectInArrayByProp(obj, array, prop) {
            var count = 0;
            array.forEach(function (item) {
                if (obj[prop] == item[prop]) {
                    count++
                }
            });
            if (count === 0) {
                return false
            } else {
                return true
            }
        }
    }
})();