/**
 * Created by mxg0ryp on 10/18/2016.
 */
(function(){
    angular.module('nextGrid').factory('fciF', fciF);

    function fciF(controlPanelSelection, areaF, loadScreen, DataModel, gridDemoF,$http){
        
        var service = {
            data: {
                FAMPs: [],
                devices:[]
            },
            getDataFromServer: getDataFromServer,
            // getParentsFromData:getParentsFromData,
            selectFciFaults:selectFciFaults
        };

        return service;

        function getDataFromServer(){
            // service.data.fci = [];
            // service.data.fciFaultcount = 0;
            // var data;
            var subID = areaF.getDataIdentifierByType('sub');
            var feederID = areaF.getDataIdentifierByType('feeder');
            return DataModel.getFAMP(subID, feederID).then(function(resp){
                service.data.FAMPs = resp;
                console.log(resp);
                var events = service.data.FAMPs;
                // service.data.devices.forEach(function(fci){
                // service.data.devices = gridDemoF.data.smartDevs
                service.data.devices.forEach(function(fci){
                    if(!fci.properties.hasFaults || fci.properties.hasFaults == false){
                        for (var i=0; i< events.length; i++){
                            var ev = events[i];
                            for (var j=0; j< ev.length; j++){
                                if(fci.properties.fplID == ev[j].fplID){
                                    ev[j].connectionLengthToFeederHead = fci.properties.connectionLengthToFeederHead;
                                    fci.properties.hasFaults = true;
                                }
                            }
                        }
                    }
                });
            });
        }

        function selectFciFaults(famp){
            var deviceID;
            if(famp.length==1){
                deviceID =  famp[0].fplID;
            }
            else {
                deviceID = gridDemoF.getMostDownStreamDevID(famp, 'connectionLengthToFeederHead', 'fplID')
            }


            return DataModel.getLinesToEnd(deviceID).then(function(data){
                var geoJson=[];
                for (var i = 0; i < data.length; i++) {
                    // console.log(data[i].primaries.geoJSON);
                    geoJson.push(data[i].primaries.geoJSON);
                }
                data = geoJson;
                console.log('getLinesToEnd ', data);
                return data;
            });
        }
    }

})();