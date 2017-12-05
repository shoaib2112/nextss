/**
 * Created by MXG0RYP on 5/17/2016.
 */
(function(){
    angular.module('nextGrid').factory('managementArea', managementArea);

    function managementArea(loadScreen, DataModel, gridsF){
        var service = {
            getDataFromServerAndFormat: getDataFromServerAndFormat
        };

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


            //show the user the loading screen
            loadScreen.showWait('Initializing', false);

            //get management area, service center, substation and feeder data
            //data comes as one big array with types specifying what it is
            //we reorganize it into its hierarchical representation
            return DataModel.getNav()
                .then(function(data){
                    var tempSC = {};

                    data.forEach(function(dataElement, dataIndex, dataArray){

                        if(dataElement.type === 'ma') {
                            // console.log('ma', dataElement);

                            //if else to avoid overwriting
                            if(managementAreaData.hasOwnProperty(dataElement._id)){
                                angular.merge(managementAreaData[dataElement._id], dataElement);
                            }
                            else {
                                managementAreaData[dataElement._id] = dataElement;
                            }
                        }
                        else if(dataElement.type === 'sc') {
                            // console.log('sc' , dataElement);
                            tempSC[dataElement._id] = dataElement;
                        }
                        else if(dataElement.type === 'sub') {
                            // console.log('sub', dataElement);

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

                            managementAreaData.all.serviceCenters.all.substations[dataElement._id] = dataElement;
                        }
                    });

                    // var sorted_keys = Object.keys(managementAreaData).sort()




                    
                    // console.log(managementAreaData);
                    service.data = managementAreaData;
                    //$.unblockUI();
                    return service.data;
                })

        }
    }
})();

