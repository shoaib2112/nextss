/**
 * Created by MXG0RYP on 5/26/2016.
 */
(function(){
    angular.module('nextGrid').factory('gridsF', grids);

    function grids(DataModel, areaF){
        var service= {
            data: {
                grids: {}
            },
            getGridDataFromServer: getGridDataFromServer
        };

        function getGridDataFromServer(substationObj, feederObj){
            // DataModel.getGrid(controlPanelSelection.getDataIdentifierByType('sub'), controlPanelSelection.getDataIdentifierByType('feeder')).then(function (data) {
            var substationID = "",
                feederName = "";

            if(substationObj.hasOwnProperty('_id')) {
                substationID = substationObj._id;
            }
            else substationID = undefined;

            if(feederName.hasOwnProperty('name')){
                feederName = feederObj.name;
            }
            else feederName = undefined;

            // console.log('DataModel.getGrid START '+ moment().format('h:mm:ss'));
            return DataModel.getGrid(substationID, feederName).then(function (data) {
                service.data.grids[substationID] = data;

                // console.log('DataModel.getGrid End '+ moment().format('h:mm:ss'));
                return service.data.grids[substationID];
                // return data;
            })
        }

        return service;


        function getALSData(subData, subName){
            //get only ALS's
            // var arrALS = subData.filter(function(item){return item.assetType =="TS2"});

            //get Count Data
            DataModel.getALScount(subName).then(function(countData){
                subData.forEach(function(device){
                    if(device.assetType=="TS2"){
                        countData[0].forEach(function(count){
                            var altID = count.ts_parent_fpl_id.toString();
                            if(altID == device.fplAltID){
                                console.log('ding');
                                device.count = count;
                            }
                        })
                    }
                });
                console.log(arrALS);
            });

        }

    //    TESTING TO GEOJ
    //     function makeFdrGeoJson(){
    //         var feederList=[];
    //         var subFdrs = areaF.data.selectedSubstation.feeders;
    //         for(var i = 0; i<subFdrs.length; i++){
    //             var fdrCollection = {
    //                 "type" :"FeatureCollection",
    //                 "properties" : {"feederNum":subFdrs[i].name},
    //                 "features":[]
    //             };
    //             feederList.push(fdrCollection);
    //         }
    //         return feederList;
    //     }
    //
    //     function populateFdrGeoJson(fdrArray, data){
    //         console.log('feeder Array', fdrArray);
    //         data.forEach(function(device){
    //             var devFdr = device.feederName;
    //             //get matching fdr collection by devFdr
    //             //fdrCollection.properties.feederNum
    //             var fdrCol;//equals the above
    //             var devGeoJ;
    //             for(var i = 0; i<fdrArray.length; i++){
    //                 if(fdrArray[i].properties.feederNum == devFdr){
    //                     fdrCol = fdrArray[i];
    //                     // console.log('BOOP');
    //                     if (device.type =="ACLineSegment" ){
    //                         if(device.phase=="N"){
    //                             devGeoJ = turnLineObjToGeojFeature(device);
    //                         }
    //                     } else{
    //                         devGeoJ = turnPtObjToGeojFeature(device);
    //                     }
    //                     fdrCol.features.push(devGeoJ);
    //                 }
    //
    //             }
    //         });
    //     }

        function turnPtObjToGeojFeature(obj){
            var feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": []
                },
                "properties": {}
            };

            feature.geometry.coordinates = obj.points;
            feature.properties = obj;
            delete feature.properties.points;

            return feature;
        }

        function turnLineObjToGeojFeature(line){
            var feature = {
                "type": "Feature",
                "geometry": {
                    "type": "LineString",
                    "coordinates": []
                },
                "properties": {}
            };

            //might be
            // feature.geometry.coordinates = [line.points];
            feature.geometry.coordinates = line.points;
            feature.properties = line;
            delete feature.properties.points;

            return feature;
        }


    }

    function createParentObj(array){

    }

    function getLineParentsFromData(data){ //Works, but takes too long on the front end.... then still need to
        var parentArray=[];
        var newParent;
        var lineSegmentArray = data.filter(function(item){return item.type=="ACLineSegment"});
        console.log('before ',lineSegmentArray.length);
        // console.log('before ',lineSegmentArray[0]);

        lineSegmentArray.forEach(function(line){
            var thing = line.fplID.split("+");
            if(thing.length>1){
                line.p_fplId=thing[0];
                line.fplIDb=thing[1];
            }
        });
        var less = _.uniq(lineSegmentArray, 'p_fplId');
        less.forEach(function(s){
            newParent={
                sub     :s.sub,
                feederName: s.feederName,
                fplId   : s.p_fplId,
                fplAltId: s.assetType,
                fplClass: s.fplClass,
                points  : s.points,
                type    : s.type,
                children:[]
            };
            parentArray.push(newParent);
        });

        //add children to parent
        parentArray.forEach(function(par){
            var child;
            lineSegmentArray.forEach(function(line){
                if(line.p_fplId==par.fplId){
                    child={
                        fplID:line.fplIDb,
                        phase:line.phase
                    };
                    par.children.push(child);
                }
            })
        });

    }

    function arrayObjectIndexOf(myArray, searchTerm, property) {
        for(var i = 0; i < myArray.length; i++) {
            if (myArray[i][property] === searchTerm) return i;
            break;
        }
        return -1;
    }

    function isObjectInArrayByProp(obj,array,prop){
        var count=0;
        array.forEach(function(item){
            if(obj[prop]== item[prop]){count++}
        });
        if(count===0){
            return false
        }else{
            console.log('here');
            return true
        }
    }

    function isPointMatch(obj1,obj2,pointKey){
        if(obj1[pointKey][0]== obj2[pointKey][0] && obj1[pointKey][1]== obj2[pointKey][1]){
            return true;
        }else{
            return false;
        }
    }


})();