/**
 * Created by AJH0e3s on 4/24/2017.
 * Currently not implemented at all
 */
(function(mapFactory){
    angular.module('nextGrid').factory('investigationsF', investigations);

    function investigations(loadScreen,
                            DataModel,
                            areaF,
                            mapFactory,
                            lightningsF){
        var service = {
            data: {
                checkboxes:{}
                // investigations: {
                // // "title": { isChecked: false}
                //     faultMaps        :{isChecked: false},
                //     litDay           :{isChecked: false},
                //     litYTD           :{isChecked: false},
                //     vines            :{isChecked: false},
                //     palmsBamboo      :{isChecked: false},
                //     openCondAssess   :{isChecked: false},
                //     complaints       :{isChecked: false},
                //     fci              :{isChecked: false},
                //     trblTicktes      :{isChecked: false},
                //     openEquip        :{isChecked: false},
                //     knownMomOutages  :{isChecked: false}
                // }
            },
            turnAllInvestigationLayersOff : turnAllInvestigationLayersOff
            // toggleInvestigation : toggleInvestigation,
            // toggleFault : toggleFault,
            // toggleCombinedFault : toggleCombinedFault,
            // toggleLightningDay : toggleLightningDay,
            // toggleLightningYTD : toggleLightningYTD,
            // toggleTroubleTickets : toggleTroubleTickets,
            // toggleEquipmentLog : toggleEquipmentLog,
            // toggleVines : toggleVines,
            // toggleKnownMomentariesFeederOutagesChecked : toggleKnownMomentariesFeederOutagesChecked,
            // toggleOpenConditionAssessmentsChecked : toggleOpenConditionAssessmentsChecked,
            // togglePalmsBamboos : togglePalmsBamboos,
            // toggleFCIs : toggleFCIs,
            // toggleComplaints : toggleComplaints,
            // toggleFeederFailurePoints : toggleFeederFailurePoints,
            // toggleDemoGrid : toggleDemoGrid,
            // toggleDemoCropGrid : toggleDemoCropGrid
            
        };

        var Investigation= {
            name                :   '',
            isChecked           :   false,     //boolean
            data                :   [],        // array or obj (pick one) of investigation results from the server - result of getData
            toggle              :   function(){toggleInvestigation(this)},

            //Investigations that Map Need
            iconField           : "type",   //name of field in data used to for selecting an icon: for Grid will be type
            icon                :[
                {type:'fuse',   lat:26.925, long:-81.0},
                {type:'fuse',   lat:26.870, long:-81.3},
                {type:'switch', lat:26.925, long:-80.0},
                {type:'switch', lat:26.925, long:-81.5},
                {type:'switch', lat:26.960, long:-81.3}],   //mapFactory.data.iconABC
            latField            :   'lat',
            lngField            :   'lng',
            lArray              :   [], //array of leaflet markers
            lLayerGroup         :   L.layerGroup(),//reference mapFactory layerGroup
            lLayerControl       :   '',//reference mapFactory ex: .data.groupedOverlays
            lLayerGroupOptions  :   { makeBoundsAware: true, minZoom : 10, maxZoom : 20 },//pass when creating the layerGroup
            formatHeatData      :   function(){
                getHeatMapData(this, heatDataArray);
            },
            getData             :   function(){
                //area selection
                //dataModel.getData().then(formatData(data){
                // var formattedData
                // this.data = formattedData})
            },
            mapInves            :   function(){mapDiffIconInvesPoints(this)},
            //create generic mapping functions to link here... can link to stemNGS?
            //will need to reference this.data & this.iconField and other mapping objects
            clearInves        :   function(){clearInvesFromMap(this)},
            //how to do popup content....
            popUp               :function(data){
                var string = '<h5>ID: '+ data.fplid +'</h5> '+data.text;
                return string;
            }
        };

        (function init(){
            // console.log('init inves factory');
            service.data.litDay = Object.create(Investigation);
            service.data.litDay.name = "lightning";
            service.data.litDay.icon = L.icon({iconUrl: 'images/icon-lightning.png', iconSize: [11,15], iconAnchor: [11,15], riseOnHover:false});
            service.data.litDay.latField = "lat";
            service.data.litDay.lngField = "lng";
            service.data.litDay.lLayerGroupOptions = { makeBoundsAware: true, minZoom : 10, maxZoom : 20 };
            service.data.litDay.getData = function(){
                service.data.litDay.data = lightningsF.getDataFromServer();
                // console.log('Lit in Factory', service.data.litDay.data);
            };
            // service.data.litDay.getData();
            // console.log('Lit in Factory', service.data.litDay.data);
        })();

        return service;
        //investigations.data.inves.title.isChecked
        //
        // for scope set up something like scope.investigation = service.data.investigations
        //for easier reference ex: investigation.litDay


        //
        /** Object Prototype for Investigation should include
         *
         */

        function getHeatMapData(data, heatDataArray){
            var heatPoint;
            data.forEach(function(d){
                heatPoint = {
                    x:'',
                    y:'',
                    value: 1
                };
                heatDataArray.push(heatPoint);
            });
            
        }

        //pass investigation object
        //move to Stem.services when
        function mapSingleIconInvesPoints(inves){
            var icon;
            var marker;
            var lat;
            var lng;
            inves.data.forEach(function(d){
                lat = d[inves.latField];
                lng = d[inves.lngField];
                icon = inves.icon;
                marker = L.marker([lat, lng], {icon: icon});
                inves.lArray.push(marker);
            });
            inves.lLayerGroup = L.layerGroup(inves.lArray,inves.lLayerGroupOptions);
            inves.lLayerGroup.addTo(mapFactory.data.map);
        }

        function mapDiffIconInvesPoints(inves){
            var icon;
            var marker;
            var lat;
            var lng;
            inves.data.forEach(function(d){
                lat = d[inves.latField];
                lng = d[inves.lngField];
                icon = getIconForDataPoint(inves, d);
                marker = L.marker([lat, lng], {icon: icon});
                //marker.bindPopup(d[inves.iconField]);
                inves.lArray.push(marker);
            });

            inves.lLayerGroup = L.layerGroup(inves.lArray,inves.lLayerGroupOptions);
            inves.lLayerGroup.addTo(mapFactory.data.map);
        }

        function clearInvesFromMap(inves){
            map.removeLayer(inves.lLayerGroup);
        }
        
        function getIconForData(inves, dataItem){
            var icons = inves.icon;
            var field = dataItem[inves.iconField];
            var icon = icons[field];

            return icon;
        }

        function toggleAllInvestigationsOff(){
            //for inv in service.data.investigations
            //var inv =  service.data.investigations[inv]
            //if (inv.isChecked == true) {
                //then make inv.isChecked = false
                //then inv.clearInves();
            // }
        }

        function turnAllInvestigationLayersOff(){
        //     for(var i=0; i<service.data.inves.length; i++){
        //         var investigation = service.data.inves[i];
        //         investigation.isChecked = false;
        //     }
            service.data.checkBoxes.isFaultsChecked = false;
            toggleFaults();

            service.data.checkBoxes.isVinesChecked = false;
            toggleVines();

            service.data.checkBoxes.isPalmsBamboosChecked = false;
            togglePalmsBamboos();

            service.data.checkBoxes.isLightningDayChecked = false;
            toggleLightningDay();

            service.data.checkBoxes.isTroubleTicketsChecked = false;
            toggleTroubleTickets();

            service.data.checkBoxes.isEquipmentLogChecked = false;
            toggleEquipmentLog();

            service.data.checkBoxes.isOpenConditionAssessmentsChecked = false;
            toggleOpenConditionAssessmentsChecked();

            service.data.checkBoxes.isKnownMomentariesFeederOutagesChecked = false;
            toggleKnownMomentariesFeederOutagesChecked();

            service.data.checkBoxes.isLightningYTDChecked = false;
            toggleLightningYTD();

            service.data.checkBoxes.isFCIChecked = false;
            toggleFCIs();

            service.data.checkBoxes.isFeederFailurePointsChecked = false;
            toggleFeederFailurePoints();

            service.data.checkBoxes.isComplaintsChecked = false;
            toggleComplaints();
        }
        
        
        //To create later
        // function toggleInvestigation(investigation){
        //     investigation.isChecked==!investigation.isChecked;
        //     if (investigation.isChecked == true){}
        // }


    }
})();