/**
 * Created by MXG0RYP on 4/16/2017.
 */
(function(){
    angular.module('nextGrid').factory('gridDemoF', gridDemoF);

    function gridDemoF(controlPanelSelection, areaF,
                       faults, loadScreen, DataModel, $http){

        var service = {
            data: {
                traceLines:{
                    fciTrace:[]
                },
                smartDevs:[] //AFS & FCI
            },
            getDataFromServer: getDataFromServer,
            getCropDataFromServer: getCropDataFromServer,
            getMostDownStreamDevID:getMostDownStreamDevID
        };

        return service;

        function getDataFromServer(){
            return DataModel.getGridLines(areaF.data.selectedSubstation).then(function (data) {
                // console.log(data);
                for (var i = 0; i < data.length; i++) {
                    data[i].geoJSON.properties.fplDefaultColor= changeLineColor(data[i]);
                    var feature = data[i].geoJSON;
                    if (feature.geometry.type == "LineString") {
                        faults.data.network.push(feature); //populates variable for fixing fault lines
                    }
                    else if (feature.geometry.type == "Point") {
                        if (feature.properties.fplClass === 'fault_indicator') {
                            // console.log(feature);
                            // fciF.data.devices.push(feature);
                            service.data.smartDevs.push(feature);
                        }
                    }
                }
                // console.log(fciF.data.devices);
                return data;
            });

        }
        
        function getCropDataFromServer(){

            return DataModel.getCropGridData().then(function(resp){
                return resp;
            });
        }

        function getMostDownStreamDevID(devArr, lengthField, idField){
            //pass an array and the field ID that holds the connectionLengthToFeederHead. Highest number will furthest downstream
            //returns fplID of most downstream Device
            var fplIDofDownstream;
            var connections = 0;
            devArr.forEach(function(device){
                // console.log(fci);
                if (device[lengthField] > connections || connections == 0){
                    connections = device[lengthField];
                    fplIDofDownstream = device[idField];
                }
            });
            return  fplIDofDownstream;
        }
        
        function changeLineColor(line){
            // for GeoJSON from vertices data
            switch (line.geoJSON.properties.fplDefaultColor) {
                case 'Olive Green':
                    return 'DarkOliveGreen';
                    break;
                case 'Canary Yellow':
                    return 'gold';
                    // data[i].geoJSON.properties.fplDefaultColor = 'khaki';
                    break;
                case 'Indian Red' :
                    return 'IndianRed';
                    break;
                case 'Cyan Blue':
                    return 'darkcyan';
                    break;
                case 'NA':
                    return 'NAVY';
                    break;
                case 'Fuscia':
                    return 'mediumvioletred';
                    break;
                case 'Dark Green':
                    return 'darkgreen';
                    break;
                case 'Sky Blue':
                    return 'skyblue';
                    break;
                case 'Mauve':
                    return 'rosybrown';
                    break;
                case 'Yellow Ochre':
                    return 'GoldenRod';
                    // data[i].geoJSON.properties.fplDefaultColor = 'greenyellow';
                    break;
                case 'Emerald Green':
                    return 'limegreen';
                    break;
                case 'Cold Blue':
                    return 'royalblue';
                    break;
                case 'Deep Yellow':
                    return 'darkkhaki';
                    break;
                case 'Pink':
                    return 'DeepPink';
                    break;
                case 'Lavender':
                    return 'Thistle';
                    break;
                case 'Red':
                    return 'DarkRed';
                    //color changed so that when fault maps are mapped you can see the difference
                    break;
                default :
                    return line.geoJSON.properties.fplDefaultColor;
            }
        }

    }

})();