/**
 * Created by AJH0e3s on 5/22/2017.
 */
(function(){
    angular.module('nextGrid').factory('highVoltTxF', highVoltTx);

    function highVoltTx(DataModel, areaF){
        var service = {
            data: {
                currentHvt: [],
                highVTx:[],
                HvtFullList: [],
                HvtList : []
            },
            getDataFromServer: getDataFromServer
        };

        return service;


        function getDataFromServer(){
            //loadScreen.showWait('Loading Complaints...', true);
            //console.log(controlPanelSelection.data.selectedSubstation);
            var mostSpecificSelectionType = areaF.getMostSpecificSelectionType(),
                selectionIdentifier = areaF.getDataIdentifierByType(mostSpecificSelectionType),
                feederList = [];
            var today = moment().add(-1, 'days').format('YYYY-MM-DD');

            var sub;
                if(areaF.data.mostSpecificSelectionType =='sub'){sub = areaF.data.mostSpecificSelectionIdentifier.replace(/_/g, ' ')}
            return DataModel.getHvtCurrent(today).then(function(data){
                service.data.highVTx = data;
                data.transList.forEach(function(tx){
                    tx.insertDate = moment(tx.insertDate).format();
                    //todo remove when the HVT service is updated to include ticket age
                    getHvtAge(tx);
                });
                service.data.HvtFullList= data.transList;
                var txList;
                if(areaF.data.mostSpecificSelectionType =='feeder'){
                    txList=data.transList.filter(function(el){
                        return el.feeder ==  areaF.data.mostSpecificSelectionIdentifier
                    })
                }
                else if(areaF.data.mostSpecificSelectionType =='sub'){
                    txList=data.transList.filter(function(el){
                        return el.substation ==  sub;
                    })
                }
                else if(areaF.data.mostSpecificSelectionType =='ma'){
                    txList=data.transList.filter(function(el){
                        return el.managementArea ==  areaF.data.mostSpecificSelectionIdentifier
                    })
                }
                else{
                    txList = data.transList;
                }
                console.log('tx List', txList);
                service.data.HvtList = txList;
                return service.data.HvtList;
            });

        }

        function clearHvt(){
            service.data.currentHvt = [];
        }

        //todo remove when the HVT service is updated to include ticket age
        function getHvtAge(hvt){
            var today = moment();
            var hvtDate = hvt.insertDate;
            var daysOld = today.diff(hvtDate, 'days');
            hvt.daysOld=daysOld+1;
        }

    }
})();