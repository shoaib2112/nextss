/**
 * Created by MXG0RYP on 5/24/2016.
 */
(function(){
    angular.module('nextGrid').factory('mapFactory', mapFactory);

    function mapFactory(){
        var service = {
            data: {}
        };
        
        (function init(){
            // service.setAsCauseLocation= setAsCauseLocation;
            service.data.mba = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>';
            service.data.mapId = 'fpl2014.hokb35jg';//map ID for tiles

            service.data.map = {};
            service.data.showHeatMap=false;
            service.data.maLabels = L.layerGroup([],{makeBoundsAware: true, minZoom:7, maxZoom:11}); //for Management Area Labels
            service.data.maPolygon = L.layerGroup([],{makeBoundsAware: true, minZoom:5, maxZoom:11}); //for Management Area Polygons
            service.data.subMoms = L.layerGroup([]); //for substation momentaries.
            service.data.overlays = {
                'Vines': [],
                'LightningDaily': [],
                'Grid': [],
                'Path': [],
                'Palms': [],
                'Events': [],
                'Equip': [],
                'Cond': [],
                'Tickets': [],
                'LightningYTD': [],
                'Devices': [],
                'FailPoints':[],
                'Complaints':[],
                'ComplaintsHeat':[],
                'ALS':[]
            };

            // setInterval(function(){
            //     console.log(service.data.overlays);
            //     console.log(service.data.devGroupFci);
            // }, 5000);
            service.data.stats = {
                vines : {
                    blue: 0,
                    red: 0,
                    orange: 0,
                    green: 0,
                    grey: 0,
                    yellow: 0
                }
            };

            /**
             * Used to set certain items above others on the Map
             */
            service.data.gridIndex = 1;
            service.data.ytdIndex = 2000;
            service.data.topIndex = 5000;

            service.data.deviceArr = [];
            service.data.deviceArr14 = [];
            service.data.deviceArr17 = [];

            /**
             * Pre-defined leaflet layer Groups to put the markers leaflet in
             * Need to be in different groups to be able to turn them on/off in layer control
             */
            //For Condition Assessment markers
            service.data.condLayer0 = L.layerGroup();
            service.data.condLayer1 = L.layerGroup();
            service.data.condLayer2 = L.layerGroup();
            service.data.condLayer3 = L.layerGroup();
            service.data.condLayer4 = L.layerGroup();
            service.data.condLayer5 = L.layerGroup();

            //For Trouble Ticket markers
            service.data.TTfeatureGrpFdr = L.featureGroup();
            service.data.TTfeatureGrpOcr = L.featureGroup();
            service.data.TTfeatureGrpLat = L.featureGroup();
            service.data.TTfeatureGrpTx  = L.featureGroup();
            service.data.TTfeatureGrpSec = L.featureGroup();
            service.data.TTfeatureGrpMtr = L.featureGroup();
            service.data.TTfeatureGrpNls = L.featureGroup();
            service.data.TTfeatureGrpSv  = L.featureGroup();
            //For AFS/FCI fault INVESTIGATION markers
            service.data.invesGroupALS = L.featureGroup([], {makeBoundsAware: true, minZoom:12});
            service.data.invesGroupFCI = L.featureGroup([], {makeBoundsAware: true, minZoom:12});
            service.data.invesLineTrace = L.featureGroup([], {makeBoundsAware: true, minZoom:12});

            //For Grid Markers
            service.data.deviceLayer = L.layerGroup(service.data.deviceArr);
            service.data.deviceLayer14 = L.layerGroup(service.data.deviceArr14);
            service.data.deviceLayer17 = L.layerGroup(service.data.deviceArr17);

            service.data.smartDev = L.layerGroup();
            service.data.smartDevAfs = L.layerGroup();
            service.data.smartDevFci = L.layerGroup();
            service.data.gridsLayer = L.layerGroup(service.data.spanArr);
            
            service.data.devGroupJumper =L.layerGroup();
            // service.data.devGroupTransformer =L.layerGroup();
            service.data.devGroupBreaker =L.layerGroup();
            service.data.devGroupCompensator =L.layerGroup();
            service.data.devGroupSwitchOpen =L.layerGroup();
            service.data.devGroupSwitchClosed =L.layerGroup();
            service.data.devGroupOther =L.layerGroup();
            service.data.devGroupFuse =L.layerGroup();
            service.data.devGroupALS = L.featureGroup([], {makeBoundsAware: true, minZoom:14});
            service.data.deviceLayer = L.featureGroup([], {makeBoundsAware: true, minZoom:12});
            service.data.devGroupAfs =L.layerGroup();
            service.data.devGroupFci =L.layerGroup();

            //For Momentary Markers (for displaying individual known momentaries)
            service.data.momGroup = L.featureGroup([], {makeBoundsAware: true, minZoom:10});
            service.data.momTempMkr = L.marker([],{icon:service.data.icon, zIndexOffset:999999});
            service.data.momTempLitMkr = L.marker([],{icon:service.data.iconLitMom, zIndexOffset:999999});

            // service.data.spanArr = [];
            service.data.faultMap= [];
            service.data.baseMaps = {};
            service.data.overlayMaps = {};

            service.data.lightningYTDHeatMap = {};
            service.data.substationHeatMap = {};
            //service.data.litControl = L.control.layers();
            //service.data.caControl = L.control.layers();

            /**
             * Defines leaflet Icons for usage in the maps
            */
            service.data.icon = L.icon({ iconUrl: 'images/icon_momTckt.svg', iconSize: [35, 35], iconAnchor: [18, 35], riseOnHover: false });
            service.data.iconTTicket = L.divIcon({ className: 'glyphicon glyphicon-tag', iconSize: [25, 25], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iconWorkOrder = L.divIcon({ className: 'glyphicon glyphicon-wrench', iconSize: [25, 25], iconAnchor: [10, 10], riseOnHover: false });

            //var divIconTest =		L.divIcon({ className: 'iconTest' });   iconSwitchClosed = L.divIcon({ className: 'di-SwitchClosed lazyload', riseOnHover: false, iconSize: [10, 10] });
            service.data.iconSwitchClosed = L.divIcon({ className: 'di-SwitchClosed lazyload', riseOnHover: false, iconSize: [10, 10] });
            service.data.iconSwitchOpen = L.divIcon({ className: 'di-SwitchOpen lazyload', riseOnHover: false, iconSize: [10, 10] });
            service.data.iconFeederHead = L.divIcon({ className: 'di-feeder-head lazyload', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: true,  html: "F" });
            service.data.iconTransformer = L.icon({ iconUrl: 'images/icon_xfrmr.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
            // service.data.iconTransformerWinding = L.icon({ iconUrl: 'images/icon_xfrmr-winding.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
            service.data.iconFuse        = L.icon({ iconUrl: 'images/icon_fuse.png', riseOnHover: false, iconSize: [13, 13], iconAnchor: [6, 6] });
            service.data.iconJumper      = L.icon({ iconUrl: 'images/icon_jumper.svg',iconSize: [16,16], iconAnchor: [8,8], popupAnchor:[0,-8] });
            service.data.iconRegulator   = L.icon({ iconUrl: 'images/icon_regulator.svg',iconSize: [16,16], iconAnchor: [8,8], popupAnchor:[0,-8] });
            service.data.iconRecloser    = L.icon({ iconUrl: 'images/icon_recloser.svg',iconSize: [16,16], iconAnchor: [8,8], popupAnchor:[0,-8] });
            service.data.iconOther       = L.divIcon({ className: 'di-Other lazyload', riseOnHover: false });
            service.data.iconALS 	     = L.divIcon({ className: 'glyph', iconSize: [24, 24], iconAnchor: [12, 12], riseOnHover: true, html:'<img src="images/icon_ALS.svg" height="24">'});
            service.data.iconALSDrk      = L.icon({ iconUrl: 'images/icon_ALS-dark.svg', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iconCapacitor   = L.icon({ iconUrl: 'images/icon_capacitor.svg', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });

            //HVT Icons
            service.data.iconHvtRed = L.divIcon({ className: 'glyph', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-red.svg" >'});
            service.data.iconHvtOrange = L.divIcon({ className: 'glyph', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-orange.svg" >'});
            service.data.iconHvtYellow = L.divIcon({ className: 'glyph', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-yellow.svg" >'});
            service.data.iconHvtGreen = L.divIcon({ className: 'glyph', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-green.svg" >'});
            //HVT UndergroundIcons
            service.data.iconHvtRedUG = L.divIcon({ className: 'glyph di-ug', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-red.svg" >'});
            service.data.iconHvtOrangeUG = L.divIcon({ className: 'glyph di-ug', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-orange.svg" >'});
            service.data.iconHvtYellowUG = L.divIcon({ className: 'glyph di-ug', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-yellow.svg" >'});
            service.data.iconHvtGreenUG = L.divIcon({ className: 'glyph di-ug', iconSize: [26, 26], iconAnchor: [13, 13], riseOnHover: true, html:'<img src="images/icon_hvt-green.svg" >'});

            //service.data.iA = L.icon({ iconUrl: 'images/afs_icon.png', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iAG = L.divIcon({ className: 'di-afs-grey', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iAScada = L.divIcon({ className: 'di-afs', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iAIntel = L.divIcon({ className: 'di-afs-intellirupter', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iAIntelG = L.divIcon({ className: 'di-afs-intellirupter-grey', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iF = L.divIcon({ className: 'di-fci', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            // service.data.iAG = L.icon({ iconUrl: 'images/afs_iconGREY.png', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
            service.data.iFG = L.divIcon({ className: 'di-fci-grey', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });

            service.data.iAHighlight = L.divIcon({ className: 'di-afs di-highlight', iconSize: [25, 25], iconAnchor: [12, 12], riseOnHover: false });
            service.data.iFHighlight = L.divIcon({ className: 'di-fci di-highlight', iconSize: [25, 25], iconAnchor: [12, 12], riseOnHover: false });

            //Trouble Ticket Icons
            service.data.iconTTicketFdr 	= L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_fdr.svg" height="22">'});
            service.data.iconTTicketOcr 	= L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_ocr.svg" height="22">'});
            service.data.iconTTicketLat 	= L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_lat.svg" height="22">'});
            service.data.iconTTicketTx 	    = L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_tx.svg" height="22">' });
            service.data.iconTTicketMtr 	= L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_mtr.svg" height="22">'});
            service.data.iconTTicketSec 	= L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_sec.svg" height="22">'});
            service.data.iconTTicketNls 	= L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_nls.svg" height="22">'});
            service.data.iconTTicketSv 	    = L.divIcon({ className: 'glyph', iconSize: [42, 22], iconAnchor: [0, 12], riseOnHover: true, html:'<img src="images/tckt-icon_sv.svg" height="22">' });

            //vines icons
            service.data.iconVinesBlue    = L.divIcon({className:'di-vines vines-blue',   iconSize:[25, 25], iconAnchor:[12, 12], riseOnHover:true, popupAnchor:[0,-50],html:'<span class=" glyphicon glyphicon-leaf"></span>'});
            service.data.iconVinesGreen   = L.divIcon({className:'di-vines vines-green',  iconSize:[25, 25], iconAnchor:[12, 12], riseOnHover:true, popupAnchor:[0,-50],html:'<span class=" glyphicon glyphicon-leaf"></span>'});
            service.data.iconVinesYellow  = L.divIcon({className:'di-vines vines-yellow', iconSize:[25, 25], iconAnchor:[12, 12], riseOnHover:true, popupAnchor:[0,-50],html:'<span class=" glyphicon glyphicon-leaf"></span>'});
            service.data.iconVinesOrange  = L.divIcon({className:'di-vines vines-orange', iconSize:[25, 25], iconAnchor:[12, 12], riseOnHover:true, popupAnchor:[0,-50],html:'<span class=" glyphicon glyphicon-leaf"></span>'});
            service.data.iconVinesRed     = L.divIcon({className:'di-vines vines-red',    iconSize:[25, 25], iconAnchor:[12, 12], riseOnHover:true, popupAnchor:[0,-50],html:'<span class=" glyphicon glyphicon-leaf"></span>'});
            service.data.iconVinesGrey    = L.divIcon({className:'di-vines vines-grey',   iconSize:[25, 25], iconAnchor:[12, 12], riseOnHover:true, popupAnchor:[0,-50],html:'<span class=" glyphicon glyphicon-leaf"></span>'});
            service.data.iconAlert        = L.icon({ iconUrl: 'images/icon_failure_alert.svg', iconSize: [25, 15], iconAnchor: [0, 8], riseOnHover: false });
            service.data.iconComplaint1 	= L.divIcon({ className: 'glyph', iconSize: [25, 25], iconAnchor: [12, 25], riseOnHover: true, html:'<img src="images/icon_complaint1.svg" height="25">'});
            service.data.iconComplaint2 	= L.divIcon({ className: 'glyph', iconSize: [25, 25], iconAnchor: [12, 25], riseOnHover: true, html:'<img src="images/icon_complaint2.svg" height="25">'});
            service.data.iconComplaint3 	= L.divIcon({ className: 'glyph', iconSize: [25, 25], iconAnchor: [12, 25], riseOnHover: true, html:'<img src="images/icon_complaint3.svg" height="25">'});
            service.data.iconLit          =  L.icon({iconUrl: 'images/icon_momLit.svg',  iconSize: [12,25], iconAnchor: [12,25], riseOnHover:false});
            service.data.iconLitMom       =  L.icon({iconUrl: 'images/icon_momLit.svg', iconSize: [20,40], iconAnchor: [10,20], riseOnHover:false});
                //L.icon({ iconUrl: 'images/icon_complaint3.svg', iconSize: [25, 25], iconAnchor: [12, 25], popupAnchor:[0,-25], riseOnHover: false });

            //substation marker with Momentary number
            service.data.iconSubMom    = L.divIcon({className:'di-substation',   iconSize:[25, 25], iconAnchor:[12, 12], riseOnHover:true, popupAnchor:[0,-50]});

			service.data.streets = L.tileLayer('http://{s}.tiles.mapbox.com/v3/' + service.data.mapId + '/{z}/{x}/{y}.png', { attribution: service.data.mba });
            service.data.osm=L.tileLayer('http://{s}.tiles.mapbox.com/v3/fpl2014.hnn845i7/{z}/{x}/{y}.png', { attribution: service.data.mba });
			// service.data.OpenMapSurfer_Grayscale = L.tileLayer('http://{s}.tile.thunderforest.com/spinal-map/{z}/{x}/{y}.png', {
			// 	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			// 	minZoom:7,
			// 	maxZoom: 8
			// });

			service.data.Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
				attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				subdomains: 'abcd',
				minZoom: 0,
				maxZoom: 20,
				ext: 'png'
			});
			
			service.data.Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
				maxZoom: 16
			});


			//baselayer = map tiles
			service.data.baselayers = {
				"Map View": service.data.streets,
				"Satellite": service.data.osm,
				"Esri GrayScale": service.data.Esri_WorldGrayCanvas,
				// "Grayscale": service.data.OpenMapSurfer_Grayscale,
				"Toner Lite": service.data.Stamen_TonerLite
			};
			//all overlays

            service.data.baselayersIcon =[
                {
                    title:  'Map View',
                    layer:  service.data.streets,
                    icon:   'images/icon-mapbox-streets.jpg'},
                {
                    title:  'Satellite',
                    layer:  service.data.osm,
                    icon:   'images/icon-mapbox-osm.jpg'},
                {
                    title:'Grayscale',
                    layer: service.data.Esri_WorldGrayCanvas,
                    icon:  'images/icon-esri-worldgrey.jpg'
                },
                {
                    title:  'Toner Lite',
                    layer:  service.data.Stamen_TonerLite,
                    icon:   'images/icon-stamen-toner-lite.jpg'
                }
            ];

            //service.data.baselayers = {"Map View": service.data.streets};
            //overlayMaps - group for devices
            service.data.overlayMaps = {};
            service.data.deviceOverlays = {
                "Areas":{},
                "Grid":{},
                "Smart Devices":{}
            };
            //for investigation layers
            service.data.groupedOverlays = {} ;

            //for grid
            service.data.mapLayerControl = L.control.groupedLayers(null, service.data.deviceOverlays, {} );
            //for investigations
            service.data.deviceLayerControl = L.control.groupedLayers(null, service.data.groupedOverlays);
            service.data.iconBaseControl = L.control.iconLayers(service.data.baselayersIcon, { position: 'bottomleft', maxLayersInRow: 5});

            service.data.groupedMapLayerControl = L.control.groupedLayers(null, service.data.groupedOverlays);
            service.data.oms={};
            service.data.omsTickets={};
            service.data.omsComplaints={};
            service.data.omsSubstations={};
            service.data.omsCA={};
        })();

        return service;
    }
})();