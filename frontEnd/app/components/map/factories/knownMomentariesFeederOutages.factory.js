/**
 * Created by MXG0RYP on 6/2/2016.
 */
(function(){
    angular.module('nextGrid')
        .factory('knownMomentariesFeederOutagesF', knownMomentariesFeederOutages);
    
    function knownMomentariesFeederOutages(loadScreen, controlPanelSelection, DataModel, areaF){
        var service = {
            data: {
                knownMomentariesFeederOutages: []
            },
            getDataFromServer: getDataFromServer,
            clearKnownMomentariesFeederOutages: clearKnownMomentariesFeederOutages
        };
        
        function getDataFromServer(){
            loadScreen.showWait('Loading Known Momentaries & Feeder Outages...', true);

            var mostSpecifiedSelectionType = areaF.getMostSpecificSelectionType(),
                selection = areaF.getDataIdentifierByType(mostSpecifiedSelectionType);


            return DataModel.getEvent(mostSpecifiedSelectionType, selection)
                .then(function (data) {
                    // console.log(data);
                    if(data.status !== 0){
                        data.forEach(function(ev){
                            if (ev.event == 'Feeder'){
                                service.data.knownMomentariesFeederOutages.push(ev);
                            }
                        });
                    }
                    //push in mom data -- areaF.data.mostSpecificSelection.moms
                    // console.log(areaF.data.mostSpecificSelection.moms);
                    if(areaF.data.mostSpecificSelection.moms){
                        areaF.data.mostSpecificSelection.moms.forEach(function(mom){
                            if(mom.Status == "Known"){
                                var date = moment(mom.BKR_OPEN_DTTM);
                                // if (date.isBefore() && date.isAfter()){
                                    var obj={
                                        feeder : mom.FDR_NUM,
                                        substation : mom.SUBSTN_NAME,
                                        date : date.format('YYYY-MM-DD'),
                                        tln : '',
                                        event : 'Momentary',
                                        lng : mom.causeLocation.lng,
                                        lat : mom.causeLocation.lat
                                    };
                                if(mom.Ticket.TRBL_TCKT_NUM){
                                    obj.ticketNumber = mom.Ticket.TRBL_TCKT_NUM;
                                    obj.trouble = mom.IRPT_CAUS_DS;
                                    // console.log(obj.trouble);
                                }else if (!mom.Ticket.TRBL_TCKT_NUM && mom.Lightning.location){
                                    obj.trouble = 'Lightning';
                                    // console.log(obj.trouble);
                                }
                                    service.data.knownMomentariesFeederOutages.push(obj);
                                // }
                            }

                        });
                    }
                    // console.log('Known: '+ service.data.knownMomentariesFeederOutages.length);
                    $.unblockUI();
                    if(data.status === 0) {
                        $.growlUI('No Known Momentaries & Feeder Outages');
                    }
                    return service.data.knownMomentariesFeederOutages;
                });
        }

        function clearKnownMomentariesFeederOutages(){
            service.data.knownMomentariesFeederOutages = [];
        }
        
        return service;
    }
})();