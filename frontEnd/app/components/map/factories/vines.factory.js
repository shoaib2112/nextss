/**
 * Created by MXB0A19 on 6/2/2016.
 */
(function() {
    
    angular.module("nextGrid")
        .factory('vinesF', vines);
    
    function vines(loadScreen, DataModel, controlPanelSelection, dateUtilities, areaF) {
        var service = {
            data: {
                vines: [],
                blueVines: [],
                redVines: [],
                orangeVines: [],
                greenVines: [],
                greyVines: [],
                yellowVines: []
            },
            getDataFromServer: getDataFromServer,
            clearVines: clearVines
        };
        
        function getDataFromServer() {
            loadScreen.showWait('Loading Vines...', true);

            var mostSpecifiedSelectionType = areaF.getMostSpecificSelectionType(),
                selection = areaF.getDataIdentifierByType(mostSpecifiedSelectionType),
                // selectedCalendarDate = areaF.data.selectedCalendarDate,
                today = new Date(),
                oneYearBack = dateUtilities.dateMinusFromSelectedDate(today, 365);
            console.log(oneYearBack);
            console.log(today);

            // return DataModel.getVine(mostSpecifiedSelectionType, selection, oneYearBack, selectedCalendarDate)
            return DataModel.getVine(mostSpecifiedSelectionType, selection, oneYearBack, today)
                .then(function (data) {
                    //console.log(data);
                    $.unblockUI();
                    service.data.vines = data;
                    categorizeVinesIntoColors(data);
                    //console.log(service.data);
                    return service.data.vines;
                });
        }
        
        function clearVines() {
            service.data.vines = [];
            service.data.blueVines = [];
            service.data.redVines = [];
            service.data.orangeVines = [];
            service.data.greenVines = [];
            service.data.greyVines = [];
            service.data.yellowVines = [];
        }

        function categorizeVinesIntoColors(vines) {
            if(vines.length >0){
                // console.log(vines[0].sentDate);
                var vineDate;
                vines.forEach(function(vine){
                    //console.log(vine.ticketStatus);
                    // vineDate = new Date(vine.ticketDate);
                    // if(vine.ticketDate === null) {
                    //     vineDate = new Date(vine.sentDate);
                    // }
                    if(vine.ticketDate === null) {
                        vine.ticketStatus = "New";
                    }
                    else {
                        var sqlDate = vine.ticketDate;
                        vine.ticketDate = new Date();
                        vine.ticketDate.setTime(Date.parse(sqlDate));
                    }
                    switch(vine.ticketStatus) {
                        case "New":
                            service.data.blueVines.push(vine);
                            break;
                        case "Ticketed":
                            if(dateUtilities.getISODate(vine.ticketDate) < dateUtilities.getISODate(dateUtilities.dateMinus(30))) {
                                service.data.redVines.push(vine);
                            }
                            else if(dateUtilities.getISODate(vine.ticketDate) < dateUtilities.getISODate(dateUtilities.dateMinus(15))) {
                                service.data.orangeVines.push(vine);
                            }
                            break;
                        case "Sprayed":
                            service.data.greenVines.push(vine);
                            break;
                        case "Held":
                            service.data.greyVines.push(vine);
                            break;
                        case "Complete":
                            service.data.greenVines.push(vine);
                            break;
                        default:
                            service.data.yellowVines.push(vine);
                    }
                })
            }else{
                console.log('no vines results')
            }
        }

        return service;
    }
})();
