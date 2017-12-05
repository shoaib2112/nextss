//Map Configurations
//map attribution

//moved to leaflet.directive.js
var mba = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery &copy; <a href="http://mapbox.com">Mapbox</a>';

var mapId = 'fpl2014.hokb35jg';//map ID for tiles

var map = L.map('leaflet', {
	center: [27, -81],
	zoom: 7,
	layers: []
});


var overlays = {
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
	// 'CA0': [],
	// 'CA1': [],
	// 'CA2': [],
	// 'CA3': [],
	// 'CA4': [],
	// 'CA5': []
};

var groupedOverlays = {};

var stats = {
    vines : {
        blue: 0,
        red: 0,
        orange: 0,
        green: 0,
        grey: 0,
        yellow: 0
    }
};

var gridIndex = 1;
var ytdIndex = 2000;
var topIndex = 5000;

// var ytdLv1 = [],
// 	ytdLv2 = [],
// 	ytdLv3 = [];

var ytdLayer1 = L.layerGroup(),
	ytdLayer2 = L.layerGroup(),
	ytdLayer3 = L.layerGroup();

var condLayer0 = L.layerGroup(),
	condLayer1 = L.layerGroup(),
	condLayer2 = L.layerGroup(),
	condLayer3 = L.layerGroup(),
	condLayer4 = L.layerGroup(),
	condLayer5 = L.layerGroup();

var deviceArr = [], 
	deviceArr14 = [], 
	deviceArr15 = [], 
	deviceArr16 = [], 
	deviceArr17 = [];
var deviceLayer = L.layerGroup(deviceArr);
var deviceLayer14 = L.layerGroup(deviceArr14);
var deviceLayer15 = L.layerGroup(deviceArr15);
var deviceLayer16 = L.layerGroup(deviceArr16);
var deviceLayer17 = L.layerGroup(deviceArr17);
var smartDev = L.layerGroup(overlays.Devices);

var spanLayer = L.layerGroup(spanArr);
var spanArr = [];

var spanMulti = L.polyline(spanArr);//.setLatLngs(spanArr);

//var overlayMapsB = {};
//var baseMaps = {};
//var litControl = L.control.layers();
//var caControl = L.control.layers();


var streets = L.tileLayer('http://{s}.tiles.mapbox.com/v3/' + mapId + '/{z}/{x}/{y}.png', { attribution: mba })
var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
				maxZoom: 16
});

var Stamen_TonerLite = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//baselayer = map tiles
var baselayers = {
	"Map View": streets,
	"Grayscale": Esri_WorldGrayCanvas,
	"Toner Lite": Stamen_TonerLite,
}

var baselayersIcon =[
    {
        title:  'Map View',
        layer:  streets,
        icon:   'images/icon-mapbox-streets.jpg'},
    {
        title:'Grayscale',
        layer: Esri_WorldGrayCanvas,
        icon:  'images/icon-esri-worldgrey.jpg'
    },
    {
        title:  'Toner Lite',
        layer:  Stamen_TonerLite,
        icon:   'images/icon-stamen-toner-lite.jpg'
        }
    ];


//all overlays
var overlayMaps = {
	"Grid": {}
};
var iconBaseControl = L.control.iconLayers(baselayersIcon, { position: 'bottomleft', maxLayersInRow: 5});
var mapLayerControl = L.control.groupedLayers(null, overlayMaps, { hideSingleBase: false});
var groupedMapLayerControl = L.control.groupedLayers(null, groupedOverlays);
// mapLayerControl.addTo(map);
iconBaseControl.addTo(map);


function setupLeaflet($scope) {
    // make a layer group which will have the map and our diagram
    $scope.curX = 0;
    $scope.curY = 0;
    streets.addTo(map);
    var powerGrid = new L.LayerGroup().addTo(map);
    var weather = new L.LayerGroup().addTo(map);
    //Vines = new L.LayerGroup().addTo(map);
    L.control.scale().addTo(map);
    $scope.map = map;
    $(window).on("resize", function() {
        $("#map").height($(window).height()).width($(window).width());
        map.invalidateSize();
    }).trigger("resize");
}

//end of move to leaflet.directive.js


//moved to stem service
function drawLightningDaily($scope){
    if (!$scope.poles.length)
        return;

    clearLightningDaily($scope);
    var popup = null;
    var iconL = L.icon({iconUrl: 'images/icon-lightning.png', iconSize: [22,30], iconAnchor: [11,15], riseOnHover:false});

	_.forEach($scope.poles, function (pole) {
		//marker = L.marker(points, { icon: iconOther, zIndexOffset: gridIndex }).bindPopup(asset.type).openPopup();
		var e1 = L.marker([pole.lat, pole.lng], { icon: iconL, zIndexOffset: topIndex });
			e1.bindPopup('<h5>Poles</h5><hr>' 
                + '<b>FPLid:</b> ' + pole.fplid 
                + '<br><b>Hits:</b> ' + pole.hits + '<br>').openPopup().addTo($scope.map);
//           e1.on('mouseover', function (e) {
//				popup = L.popup()
 //                   .setLatLng(e.latlng)
 //                   .setContent('<h5>Poles</h5><hr>' 
 //                       + '<b>FPLid:</b> ' + pole.fplid 
 //                       + '<br><b>Hits:</b> ' + pole.hits + '<br>')
 //                   .openOn($scope.map)
 //                   .on('mouseout', function (e) {
	//			$scope.map.closePopup(popup); //popup = null;
	//		});
	//}).addTo($scope.map);
		
        
        overlays.LightningDaily.push(e1);
    });
    //$('#divPie')
    //    .empty()
    //    .html('<h4>' + $scope.poles.length + ' poles possibly struck.</h4>');
}
//end of move

function drawLightningYTD($scope){
    if (!$scope.ypoles.length)
        return;
    //AJHEdit added local variables
    //local Variables
    var ytdLv1=[],
        ytdLv2 =[],
        ytdLv3=[];

    clearLightningYTD($scope);
    var popup = null;
    _.forEach($scope.ypoles, function(pole) {
        var iconL = setIconColor(pole);
        var e1 = L.marker([pole.lat, pole.lng], { icon: iconL, zIndexOffset: ytdIndex })
            .on('mouseover', function (e) {
            popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent('<h5>Poles</h5><hr><b>FPLid:</b> ' + pole.fplid + '<br><b>YTD:</b> ' + pole.ytdHits + '<br>')
                    .openOn($scope.map);
			popup.on('mouseout', function (e) { //closes on mousing out of the PopUp, not the icon
				this.closePopup(popup); popup = null;
			});   
        });
        var iurl = e1.options.icon.options.iconUrl;
        //console.log(iurl);
        if (iurl === 'images/ico_lit-heat_2.png'){
            ytdLv1.push(e1);           
        } else if (iurl === 'images/ico_lit-heat_3.png') {
			ytdLv2.push(e1);
        } else if (iurl === 'images/ico_lit-heat_5.png') {
			ytdLv3.push(e1);
        }
        overlays.LightningYTD.push(e1);
    });
    ytdLayer1 = L.layerGroup(ytdLv1);
    ytdLayer2 = L.layerGroup(ytdLv2);
    ytdLayer3 = L.layerGroup(ytdLv3);

//AJHEdit Lit YTDlayercontrols START

    groupedOverlays["Lightning YTD"] = {};
    addLayerToGroupedControl(groupedOverlays, 'Lightning YTD', ytdLayer1, '<img src="../images/ico_lit-heat_2.png" class="legendIcon" /> < 5 hits');
    addLayerToGroupedControl(groupedOverlays, 'Lightning YTD', ytdLayer2, '<img src="../images/ico_lit-heat_3.png" class="legendIcon" /> 5-15 hits');
    addLayerToGroupedControl(groupedOverlays, 'Lightning YTD', ytdLayer3, '<img src="../images/ico_lit-heat_5.png" class="legendIcon" /> 15+ hits');


	groupedMapLayerControl.remove();
	groupedMapLayerControl = L.control.groupedLayers(null, groupedOverlays).addTo(map);
	groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";
//AJHEdit Lit YTDlayercontrols END
}

function drawEvents($scope){
    if (!$scope.events.length)
        return;

    clearEvents($scope);
    var popup = null;
    var iconA = L.icon({iconUrl: 'images/icon-alert.png', iconSize: [25,25], iconAnchor: [12,12], riseOnHover:false});
    _.forEach($scope.events, function(ev) {
        var e1 = L.marker([ev.lat, ev.lng], {icon: iconA, zIndexOffset: 1})
            .on('mouseover', function (e) {
                popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent('<h3>' + ev.event + '</h3><hr>'
                        + '<b>TLN: </b>' + ev.tln
                        + '<br><b>Date: </b>' + ev.date + ': ' + ev.ticketNumber
                        + '<br><b>Cause: </b>' + ev.trouble)
                    .openOn($scope.map);
            })
            .addTo($scope.map);
        overlays.Events.push(e1);
    });
}

function drawTickets($scope){
    if (!$scope.tickets.length)
        return;

    clearTickets($scope);
}

function drawEquipmentLog($scope){
    if (!$scope.equip.length)
        return;
    // it gets drawn in the modal
    clearEquip($scope);
}

function drawPalms($scope){
    if (!$scope.palms)
        clearPalms($scope);
        if (!$scope.palms.length)
            return;
    var iconL = L.icon({iconUrl: 'images/icon-palm.png', iconSize: [30,30], iconAnchor: [15,15], riseOnHover:false});
    _.forEach($scope.palms, function(palm) {
        var e1 = L.marker([palm.lat, palm.long], {icon: iconL, zIndexOffset: topIndex})
            .on('mouseover', function (e) {
                popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent('<h3>Palms</h3><hr><b>Species:</b> ' + palm.SPECIES + '<br><b>Location:</b> ' + palm.LOCATION + '<br><b>palm.CITY:</b>')
                    .openOn($scope.map)
                    .on('mouseout', function (e) {
                        $scope.map.closePopup(popup); //popup = null;
                    });
            })
            .addTo($scope.map);
        overlays.Palms.push(e1);
    });
}

//moved to stem.service.js
function drawCond($scope){
    if (!$scope.cond) return;
    if (!$scope.cond.length) return;
    var popup = null;

    var CA0 = [],
        CA1 = [],
        CA2 = [],
        CA3 = [],
        CA4 = [],
        CA5 = []

    clearCond($scope);
    $scope.condKeys = Object.keys($scope.cond[0]);
    _.forEach($scope.cond, function(ca) {
        var imgRef;
        if (ca.IMAGE1 === null)
            imgRef = 'no image';
        else
            imgRef = '<img src="' + ca.IMAGE1 + '" width="100" height="100" alt="condition image" />';

		var e1 = L.marker([ca.LATLNG_Y, ca.LATLNG_X], { icon: colorCond(ca.SEVERITY), zIndexOffset: topIndex })
            .on('mouseover', function (e) {
			popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent('<h3>Condition Assessment</h3>' 
                        + '<b>Device:</b> ' + ca.OBJECT_TYPE 
                        + '<br><b>Issue:</b> ' + ca.ISSUE 
                        + '<br><b>Severity:</b> ' + ca.SEVERITY 
                        + '<br><b>Address:</b> ' + ca.ADDRESS 
                        + '<br>' + imgRef)
                    .openOn($scope.map)
                    .on('mouseout', function (e) {
				$scope.map.closePopup(popup); //popup = null;
			});
		});
        var iurl = e1.options.icon.options.iconUrl;
        if (iurl == 'images/icon_ca0.png') {
            CA0.push(e1);
        } else if (iurl == 'images/icon_ca1.png') {
			CA1.push(e1);
        } else if (iurl == 'images/icon_ca2.png') {
			CA2.push(e1);
        } else if (iurl == 'images/icon_ca3.png') {
			CA3.push(e1);
        } else if (iurl == 'images/icon_ca4.png') {
			CA4.push(e1);
        } else if (iurl == 'images/icon_ca5.png') {
			CA5.push(e1);
        }
        overlays.Cond.push(e1);
    });
    condLayer0 = L.layerGroup(CA0);
    condLayer1 = L.layerGroup(CA1);
    condLayer2 = L.layerGroup(CA2);
    condLayer3 = L.layerGroup(CA3);
    condLayer4 = L.layerGroup(CA4);
	condLayer5 = L.layerGroup(CA5);

//RO MOVED TO stem.service,js
    groupedOverlays["Open Condition Assessment"] = {};
    addLayerToGroupedControl(groupedOverlays, 'Open Condition Assessment', condLayer0, '<img src="../images/icon_ca0.png" class="legendIcon" style="height:20px;"/> low');
    addLayerToGroupedControl(groupedOverlays, 'Open Condition Assessment', condLayer1, '<img src="../images/icon_ca1.png" class="legendIcon" style="height:20px;"/> Lv1');
    addLayerToGroupedControl(groupedOverlays, 'Open Condition Assessment', condLayer2, '<img src="../images/icon_ca2.png" class="legendIcon" style="height:20px;"/> Lv2');
    addLayerToGroupedControl(groupedOverlays, 'Open Condition Assessment', condLayer3, '<img src="../images/icon_ca3.png" class="legendIcon" style="height:20px;"/> Lv3');
    addLayerToGroupedControl(groupedOverlays, 'Open Condition Assessment', condLayer4, '<img src="../images/icon_ca4.png" class="legendIcon" style="height:20px;"/> Lv4');
    addLayerToGroupedControl(groupedOverlays, 'Open Condition Assessment', condLayer5, '<img src="../images/icon_ca5.png" class="legendIcon" style="height:20px;"/> high');

	groupedMapLayerControl.remove();
	groupedMapLayerControl = L.control.groupedLayers(null, groupedOverlays).addTo(map);
	groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";
}
// end of move

function drawVines($scope){
    clearStats();
    clearVines($scope);
    var lastMid = 0;
	_.forEach($scope.vines, function (vine) {
		if (vine.mid !== lastMid) {  // eliminate duplicates
            lastMid = vine.mid;
            vine.sentDate = new Date(vine.sentDate);
            vine.disabled = true;
            colorVine(vine);
            var popup = null;
            var c1 = L.circle([vine.latitude, vine.longitude], 250, myCircleOptions(vine.col))
                .on('mouseover', function (e) {
                    popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent(renderPopText(vine))
                        .openOn($scope.map)
                        .on('mouseout', function (e) {
                        $scope.map.closePopup(popup); //popup = null;
                    });
                }).addTo($scope.map);
            overlays.Vines.push(c1);
        }
    });

    $scope.vines = _($scope.vines).chain().sortBy('sort2').reverse().sortBy('sort1').value();
	$scope.stats = stats;

}

//moved to leaflet.directive.js
function drawFault($scope, id) {
	//AJHEdit START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	var yelPtArr = [], orPtArr = [], redPtArr = [];

    clearFaults($scope);
    var fault = _.find($scope.faults, function (fault) {
        if (fault.id === id) return fault;
	});

	_.forEach(fault.segments, function (segment) {
//ajh !!! do not remove this yet, until we are sure we don't need it for fault map combinations!!
		//$scope.faultMap.push(L.polyline(segment.points, {
		//    color: segment.color,
		//    opacity: 1,
		//    weight: 4
		//}).addTo($scope.map));

//ajh Makes each color a single line segment
		if (segment.color === "Yellow") {	yelPtArr.push(segment.points);	}
		if (segment.color === "Orange") { 	orPtArr.push(segment.points);	}
		if (segment.color === "Red")	{ 	redPtArr.push(segment.points);	}
		    });
	//console.log(fault.devices.length + " devices: " + fault.devices[0].type + '/' + fault.devices[0].info);
	var yelLine = L.polyline(yelPtArr, { color: "yellow", opacity: 1, weight: 4 });
	var orLine = L.polyline(orPtArr, { color: "orange", opacity: 1, weight: 4 });
	var redLine = L.polyline(redPtArr, { color: "red", opacity: 1, weight: 4 });
	
	//add polylines to $scope.faultMap, add it to the map, and re-center the map on the faultMap.
	$scope.faultMap = L.featureGroup([yelLine, orLine, redLine]);
	$scope.faultMap.addTo(map);
	map.fitBounds($scope.faultMap.getBounds());
//AJHEdit END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    fault.devices[0].type = fault.faultType;
	drawDevices($scope, fault.devices);
}
//end of move

//moved to leaflet directive
//if device is not null this colors specially for fault map
//AFS & FCI
function drawDevices($scope, devices) {
    clearDevices($scope);

    var thisIcon;

    _.forEach($scope.devices.afs, function(afs) {
        thisIcon = iA;
        if (devices){
            thisIcon = iAG;
			_.forEach(devices, function (d) {
				if (d.type === 'AFS' && d.info[0] === afs.switch)
					thisIcon = iA;
			});
        }
		var e1 = L.marker([afs.latitude, afs.longitude], { icon: thisIcon, zIndexOffset: topIndex })
            .on('mouseover', function (e) {
			popup = L.popup()
                .setLatLng(e.latlng)
                .setContent('<h3>AFS</h3>' 
                    + '<hr><b>Switch:</b> ' + afs.switch 
                    + '<br><b>Type:</b> ' + afs.type 
                    + '<br><b>Function:</b> ' + afs.deviceFunction)
                .openOn($scope.map)
                .on('mouseout', function (e) {
				$scope.map.closePopup(popup);
			});
		});
            //.addTo($scope.map);
        overlays.Devices.push(e1);
    });

    _.forEach($scope.devices.fci, function(fci) {
        thisIcon = iF;
        if (devices) {
            thisIcon = iFG;
			_.forEach(devices, function (d) {
				if (d.type === 'FCI' && d.info === fci.SWITCH_NUM)
					thisIcon = iF;
			});
        }
		var e1 = L.marker([fci.latitude, fci.longitude], { icon: thisIcon, zIndexOffset: topIndex })
            .on('mouseover', function (e) {
			popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent('<h3>FCI</h3>' 
                        + '<hr><b>Switch:</b> ' + fci.SWITCH_NUM 
                        + '<br><b>FPL ID:</b> ' + fci.P_fplid)
                    .openOn($scope.map)
                    .on('mouseout', function (e) {
				$scope.map.closePopup(popup);
			});
		});
            //.addTo($scope.map);
        overlays.Devices.push(e1);
	});

	smartDev = L.layerGroup(overlays.Devices);
	smartDev.addTo($scope.map);
	mapLayerControl.addOverlay(smartDev, "Smart Dev");
}
//end of move

//AJH - make d3 chart here
function drawVinesDashboard() {
    var vtypes = [];
    vtypes[0] = { label: 'New', value: stats.vines.blue, color: 'blue' };
    vtypes[1] = { label: '30+ Days', value: stats.vines.red, color: 'red' };
    vtypes[2] = { label: '15+ Days', value: stats.vines.orange, color: 'orange' };
    vtypes[3] = { label: 'Sprayed', value: stats.vines.green, color: 'green' };
    vtypes[4] = { label: 'Held', value: stats.vines.grey, color: 'grey' };
    vtypes[5] = { label: 'Other', value: stats.vines.yellow, color: 'yellow' };

    // d3pie doesn't like 0 vals
    vtypes = _.filter(vtypes, function (item) {
        return item.value !== 0;
    });
	
	/*
    $('#divPie').empty();

    if (!vtypes.length) {
        $('#divPie').html('<h4>No Vines data for this date</h4>');
        return;
    }

    var pie = new d3pie("divPie", {
        header: {
            title: {
                text: "Vines Frequency (" + (stats.vines.blue + stats.vines.red + stats.vines.green + stats.vines.grey + stats.vines.orange + stats.vines.yellow) + " total)" ,
                fontSize: 20
            }
        },
        size: {
            canvasHeight: 300,
            canvasWidth: 300,
            pieOuterRadius: "35%",
            pieInnerRadius: "50%"
        },
        labels: {
            formatter: labelFormatter,
            inner: {
                format: "value"
            }
        },
        data: {
            content: vtypes
        },
        tooltips: {
            enabled: true,
            type: "placeholder",
            string: "{label} {percentage}%"
        }
	});
	  */
	var total = stats.vines.blue + stats.vines.red + stats.vines.green + stats.vines.grey + stats.vines.orange + stats.vines.yellow;

		document.getElementById('vblue').setAttribute("style", "width:"+(stats.vines.blue / total) * 100 + "%");
	   document.getElementById('vgreen').setAttribute("style", "width:"+(stats.vines.green / total) * 100 + "%");
	  document.getElementById('vorange').setAttribute("style", "width:"+(stats.vines.orange / total) * 100 + "%");
	     document.getElementById('vred').setAttribute("style", "width:"+(stats.vines.red / total) * 100 + "%");
	    document.getElementById('vgrey').setAttribute("style", "width:"+(stats.vines.grey / total) * 100 + "%");
	  document.getElementById('vyellow').setAttribute("style", "width:"+(stats.vines.yellow / total) * 100 + "%");
	
	
}

function clearVines($scope) {
    _.forEach(overlays.Vines, function(layer) {$scope.map.removeLayer(layer);});
    overlays.Vines = [];
}

//moved to leaflet directive
function clearDevices($scope) {
	// _.forEach(overlays.Devices, function(layer) {$scope.map.removeLayer(layer);});
	//$scope.map.removeLayer(smartDev);
	$scope.map.removeLayer(smartDev);
	overlays.Devices = [];
	smartDev = L.layerGroup(overlays.Devices);
}
//end of move

function clearLightningDaily($scope) {
    _.forEach(overlays.LightningDaily, function(layer) {$scope.map.removeLayer(layer);});
    overlays.LightningDaily = [];
}


function clearLightningYTD($scope) {
    //_.forEach(overlays.LightningYTD, function(layer) {$scope.map.removeLayer(layer);});

    if (groupedOverlays["Lightning YTD"]){
        ytdLayer1.clearLayers();
        ytdLayer2.clearLayers();
		ytdLayer3.clearLayers();

// AJHEdit remove Lit YTD from layercontrols START
		delete groupedOverlays["Lightning YTD"];
		groupedMapLayerControl.remove();
		groupedMapLayerControl = L.control.groupedLayers(null, groupedOverlays).addTo(map);
// AJHEdit Lit YTD CLEAR layercontrols END
	}
	overlays.LightningYTD = [];
}

function clearEvents($scope) {
    _.forEach(overlays.Events, function(layer) {$scope.map.removeLayer(layer);});
    overlays.Events = [];
}

function clearEquip($scope) {
    _.forEach(overlays.Equip, function(layer) {$scope.map.removeLayer(layer);});
    overlays.Equip = [];
}

function clearPalms($scope) {
    _.forEach(overlays.Palms, function(layer) {$scope.map.removeLayer(layer);});
    overlays.Palms = [];
    $scope.palms = [];
    //console.log('No Palms!');
}

function clearCond($scope) {
	
	// var o = overlays;
    if (groupedOverlays["Open Condition Assessment"]) {
        // o.CA0 = [];
        // o.CA1 = [];
        // o.CA2 = [];
        // o.CA3 = [];
        // o.CA4 = [];
        // o.CA5 = [];
        condLayer0.clearLayers();
        condLayer1.clearLayers();
        condLayer2.clearLayers();
        condLayer3.clearLayers();
        condLayer4.clearLayers();
		condLayer5.clearLayers();
		
		//AJHEDIT Start for Grouped Layer Controls
		delete groupedOverlays["Open Condition Assessment"]
		groupedMapLayerControl.remove();
		groupedMapLayerControl = L.control.groupedLayers(null, groupedOverlays).addTo(map);
        groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";
		//AJHEDIT End
	}

}
function clearGrid($scope) {
	if (spanLayer.getLayers().length>0) {
		
		//Remove each layer from the map
		$scope.map.removeLayer(spanLayer);
		$scope.map.removeLayer(deviceLayer);
		$scope.map.removeLayer(deviceLayer14);
		$scope.map.removeLayer(deviceLayer15);
		$scope.map.removeLayer(deviceLayer16);
		$scope.map.removeLayer(deviceLayer17);
		$scope.map.removeLayer(smartDev);
		
		//clear out each array that the layers are made from
		overlays.Devices = [];
		deviceArr = [];
		deviceArr14 = [];
		deviceArr15 = [];
		deviceArr16 = [];
		deviceArr17 = [];
		fdrSpans = [];
		spanLayer.clearLayers();
		deviceLayer.clearLayers();
		deviceLayer14.clearLayers();
		deviceLayer15.clearLayers();
		deviceLayer16.clearLayers();
		deviceLayer17.clearLayers();
		smartDev.clearLayers();
		
	
		//smartDev = L.layerGroup(overlays.Devices); //AFS FCI
		//AJHEdit START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		//deviceLayer = L.layerGroup(deviceArr);
		//deviceLayer14 = L.layerGroup(deviceArr14);
		//deviceLayer15 = L.layerGroup(deviceArr15);
		//deviceLayer16 = L.layerGroup(deviceArr16);
		//deviceLayer17 = L.layerGroup(deviceArr17);
		try {
			mapLayerControl.removeLayer(deviceLayer);
			mapLayerControl.removeLayer(deviceLayer15);
			mapLayerControl.removeLayer(deviceLayer16);
		//AJHEdit End ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		
		}
            catch (e) {
			console.log(e);
		}
		spanLayer = L.layerGroup(fdrSpans);
		
	}
}

function clearPath($scope){
    _.forEach(overlays.Path, function(layer) {$scope.map.removeLayer(layer);});
    overlays.Path = [];
}

function clearTickets($scope){
    _.forEach(overlays.Tickets, function(layer) {$scope.map.removeLayer(layer);});
    overlays.Tickets = [];
}

//moved to leaflet directive
function clearFaults($scope){
	//AJHEdit START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//modified to suit new drawfaults.
	//_.forEach($scope.faultMap, function (layer) { $scope.map.removeLayer(layer); });
	if ($scope.faultMap) {
		$scope.map.removeLayer($scope.faultMap);
	}
	//AJHEdit End ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    $scope.faultMap = [];
}
//end of move

function clearStats() {
    stats.vines.blue = 0;
    stats.vines.red = 0;
    stats.vines.yellow = 0;
    stats.vines.orange = 0;
    stats.vines.green = 0;
    stats.vines.grey = 0;
}

//Moved to leaflet directive
function setBounds($scope, DataModel) {
    // sets map size, then for sub/feeder draws grid and devices
    $scope.bbox = null;

    if ($scope.selectionType === 'ma'){
        $scope.ma = $scope.selection;
        _.forEach($scope.areas, function (area) {
            if (area.ma === $scope.ma)
				$scope.bbox = area.bbox;
        });
	}
	else if ($scope.selectionType === 'sc') {
		$scope.sc = $scope.selection;
		//$scope.bbox = $scope.metadata[$scope.sc].bbox;
		_.forEach($scope.scs, function (box) {
			if (box.name === $scope.sc)
				$scope.bbox = box.bbox;
		});
	}
    else if ($scope.selectionType === 'sub') {
		$scope.sub = $scope.selection;
		var subsarr = $scope.subs;
		var subIndex = findWithAttr(subsarr, 'sub', $scope.sub);
		$scope.feedersForSub = [];
		$scope.bbox = $scope.subs[subIndex].box;//s.box;
		//console.log($scope.subs[subIndex]);
		//console.log($scope.bbox);
		for (var i = 0, len = $scope.chosenFeeders.length; i < len; i++) {
			$scope.feedersForSub.push($scope.chosenFeeders[i].f);
		}
//AJHEDIT IF STATEMENT
		//if no grid is drawn, draw it
		if (!spanLayer.getLayers().length)
            drawGrid($scope, DataModel);
	}
	//if the selection is a feeder use the feeder's bounding box.
	else if ($scope.selectionType === 'feeder') {
        var fdrIndex = findWithAttr($scope.chosenFeeders, 'f', $scope.selection);
		$scope.bbox = $scope.chosenFeeders[fdrIndex].bbox;
//AJHEDIT IF STATEMENT
        if (!spanLayer.getLayers().length) 
			drawGrid($scope, DataModel);
    }

    if ($scope.bbox === null)
        alert('unrecognized selection');
    else{
        $scope.map.fitBounds($scope.bbox);
        //$.unblockUI(); //
		$scope.zoomLevel = 10;
	}

	zoomLevel = map.getZoom();
	deviceZoom(zoomLevel);
	//console.log($scope.bbox);
}
//end of move

//moved to leaflet directive
function drawGrid($scope, DataModel){
    //clearGrid($scope);
    DataModel.getGrid($scope.sub, $scope.feeder).then(function (data) {
        $scope.rows = data;
        //drawNetwork($scope); /////////////////////////////////////////////
    })
    .then(function () {
        drawNetwork($scope);
    })
    .then(function () {
        DataModel.getDevice($scope.selectionType, $scope.selection).then(function (data) {
            $scope.devices = data;
            drawDevices($scope, null);
        });
    });
}
//end of move


//moved to leaflet directive
function drawNetwork($scope){
    getMapBounds($scope);
    $scope.xFactor = 1;
    $scope.yFactor = 1;
    $scope.icons = [];
    var node = null;
	$scope.feederHash = {};
	var fdrSpans = [];
	var tempArray = [];
	var fdrCheck = "";
	var lastColor = "";
	//AJHEdit changed up color list
	var colorList = ["#847262","#508181","#c4773d","#7070a1","#6dbf79","#a491b2","#754c24","#155e5e","#ad6565","#658569","#707000","#4f3b5e"];
    for (var i = 0, len = $scope.rows.length; i < len; i++) {
		var row = $scope.rows[i];
//AJHEdit --START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		if (row.type === "ACLineSegment" && row.phase === "N") {
			//only draws the Nuetral phase, other phases will produce duplicate lines on the map
			node = drawLine(row, $scope, colorList);
			if (row.feederName === fdrCheck || fdrCheck === "") {
				//add to temp array
				tempArray.push(row.points);
				lastColor = colorList[node.fdrindex];
				if (fdrCheck === "") {
					fdrCheck = row.feederName;
				}
			} else if (row.feederName !== fdrCheck) {
				//create L.polyline from temp array //push L.polyline to fdrSpans
				fdrSpans.push(L.polyline(tempArray, { weight: 3, color: colorList[node.fdrindex-1], opacity:0.75 }));
				//clear temp array
				tempArray = [];
				//push to temp array 
				tempArray.push(row.points);
				fdrCheck = row.feederName;
			} 
						
		} else if (row.type === "ACLineSegment" && row.phase !== "N") {
			//do nothing!!!
		}
	//AJH* Sort Devices into different layers
	//Layers added to map in on.zoomend at the bottom
	//if remove feeder lines do so at <12
		else if (row.type === "TransformerWinding") {
			node = drawNode(row, $scope);
			deviceArr17.push(node);
		}
		else if (row.type === "Jumper" || row.type === "Breaker" || row.type === "Compensator") {
			node = drawNode(row, $scope);
			deviceArr16.push(node);
		}else if (row.type === "Switch - Open" || row.type === "Switch - Closed") {
			node = drawNode(row, $scope);
			deviceArr15.push(node);
		}else if (row.type === "Fuse"){ 
			node = drawNode(row, $scope);
			deviceArr16.push(node);
		} else {
			node = drawNode(row, $scope);
			deviceArr.push(node);
		}
    }

	if (tempArray.length) { 
		fdrSpans.push(L.polyline(tempArray, { weight: 3, color: lastColor, opacity: 0.75 }));
	}

	//console.log($scope.icons);

	spanLayer = L.layerGroup(fdrSpans);
	spanLayer.addTo($scope.map);
	fdrSpans = [];
//AJHEdit -- End ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	deviceLayer = L.layerGroup(deviceArr);
	deviceLayer14 = L.layerGroup(deviceArr14);
	deviceLayer15 = L.layerGroup(deviceArr15);
	deviceLayer16 = L.layerGroup(deviceArr16);
	deviceLayer17 = L.layerGroup(deviceArr17);
	deviceLayer.addTo($scope.map);

//AJHEdit LABELS
	mapLayerControl.addOverlay(deviceLayer15, 'Switches');
	mapLayerControl.addOverlay(deviceLayer16, '<img src="../images/icon_fuse.png" class="legendIcon" style="height:15px;"/> Fuses +');
	mapLayerControl.addOverlay(deviceLayer, '<span class="di-feeder-head" style="padding: 0 4px; color:#999">F</span> Feeder Head');
}
//end of move

//move to leaflet directive
function drawNode(asset, $scope){
	var points = []; // = [asset.points[1], asset.points[0]];
    // fix points (x y reversed)
    points[0] = asset.points[0][1];
	points[1] = asset.points[0][0];
	//console.log(points);
    var marker = null;

   $scope.icons.push({x: points[0], y: points[1], id: asset.id});
	
    switch (asset.type) {
		case 'Feeder':
			marker = L.marker(points, { icon: iconFeederHead, zIndexOffset: gridIndex });//.addTo($scope.map);
			//console.log(asset.type);

            return marker;
        case 'Switch - Open':
            marker = L.marker(points, { icon: iconSwitchOpen, zIndexOffset: gridIndex+1 });
            return marker;
        case 'Switch - Closed':
            marker = L.marker(points, { icon: iconSwitchClosed, zIndexOffset: gridIndex+1 });
            return marker;
		case 'TransformerWinding':
			marker = L.marker(points, { icon: iconTransformer, zIndexOffset: gridIndex });
			//console.log(asset.type);
            return marker;
        case 'Fuse':
			marker = L.marker(points, { icon: iconFuse, zIndexOffset: gridIndex });
            return marker;
        default:
			marker = L.marker(points, { icon: iconOther, zIndexOffset: gridIndex }).bindPopup(asset.type).openPopup();
			//console.log(asset.type);
            return marker;
	}
	
}
//end of move


//moved to leaflet directive
function drawLine(asset, $scope, colorList){
	var color;
    if (asset.feederName in $scope.feederHash)
        color = $scope.feederHash[asset.feederName];
    else{
        color = colorList[_.size($scope.feederHash)];
        $scope.feederHash[asset.feederName] = color;
    }
     //fix points (x y reversed)
    _.forEach(asset.points, function (pt) {
        var temp = pt[0];
        pt[0] = pt[1];
		pt[1] = temp;
	});
//AJHEdit --START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//AJH change to return.... 
	var thing = { "color": color, "fdrindex":_.size($scope.feederHash)-1};
	return thing;
//AJHEdit --END ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	//return L.polyline(asset.points, { weight: 3, color: color });//.addTo($scope.map);	
}
// end of move


//moved to leaflet.directive.js
map.on("zoomend", function (e) {
	zoomLevel = map.getZoom();
	//console.log(zoomLevel);
	deviceZoom(zoomLevel);
});
// end of move


//moved to leaflet.directive.js
function deviceZoom(zoomLevel) {
	if (zoomLevel < 13) {//hide
		map.addLayer(deviceLayer);
		map.removeLayer(smartDev);
		map.removeLayer(deviceLayer14);
		map.removeLayer(deviceLayer15);
		map.removeLayer(deviceLayer16);
		map.removeLayer(deviceLayer17);
			//console.log('FeederHead');
	} else if (zoomLevel == 13) {//show
		map.addLayer(deviceLayer);
		map.addLayer(smartDev);
		map.removeLayer(deviceLayer14);
		map.removeLayer(deviceLayer15);
		map.removeLayer(deviceLayer16);
		map.removeLayer(deviceLayer17);
			//console.log('FeederHead');
	}
	else if (zoomLevel == 14) {//show
		map.addLayer(smartDev);
		map.addLayer(deviceLayer14);
		map.removeLayer(deviceLayer15);
		map.removeLayer(deviceLayer16);
		map.removeLayer(deviceLayer17);
			//console.log('Fuses');
	} else if (zoomLevel == 15) {//show
		map.addLayer(deviceLayer);
		map.addLayer(smartDev);
		map.addLayer(deviceLayer14);
		map.addLayer(deviceLayer15);
		map.removeLayer(deviceLayer16);
		map.removeLayer(deviceLayer17);
			//console.log('Fuses');
	} else if (zoomLevel == 16) {
		map.addLayer(deviceLayer);
		map.addLayer(smartDev);
		map.addLayer(deviceLayer14);
		map.addLayer(deviceLayer15);
		map.addLayer(deviceLayer16);
		map.removeLayer(deviceLayer17);
			//console.log('Switches');
	} else if (zoomLevel == 17) {
		map.addLayer(deviceLayer);
		map.addLayer(smartDev);
		map.addLayer(deviceLayer14);
		map.addLayer(deviceLayer15);
		map.addLayer(deviceLayer16);
		map.addLayer(deviceLayer17);
			//console.log('Jumper | Breaker| Compensator');
	}
}


var iconTTicket = L.divIcon({ className: 'glyphicon glyphicon-tag', iconSize: [25, 25], iconAnchor: [10, 10], riseOnHover: false });
var iconWorkOrder = L.divIcon({ className: 'glyphicon glyphicon-wrench', iconSize: [25, 25], iconAnchor: [10, 10], riseOnHover: false });

//var divIconTest =		L.divIcon({ className: 'iconTest' });
var iconSwitchClosed = L.divIcon({ className: 'di-SwitchClosed lazyload', riseOnHover: false, iconSize: [10, 10] });
var iconSwitchOpen = L.divIcon({ className: 'di-SwitchOpen lazyload', riseOnHover: false, iconSize: [10, 10] });
var iconFeederHead = L.divIcon({ className: 'di-feeder-head lazyload', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: true, riseOffset: 3000, html: "F" });
var iconTransformer = L.icon({ iconUrl: 'images/icon_xfrmr.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
var iconFuse = L.icon({ iconUrl: 'images/icon_fuse.png', riseOnHover: false, iconSize: [13, 13], iconAnchor: [6, 6] });
var iconOther = L.divIcon({ className: 'di-Other lazyload', riseOnHover: false });

var iA = L.icon({ iconUrl: 'images/afs_icon.png', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
var iF = L.icon({ iconUrl: 'images/icon_fci.png', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
var iAG = L.icon({ iconUrl: 'images/afs_iconGREY.png', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
var iFG = L.icon({ iconUrl: 'images/icon_fci-GREY.png', iconSize: [20, 20], iconAnchor: [10, 10], riseOnHover: false });
//end of move

//new Icons
//var iconSubstation = L.icon({ iconUrl: 'images/icon_substation.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
//var iconUGTransformer = L.icon({ iconUrl: 'images/icon_xfrmr_ug.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
//var iconAutoTX = L.icon({ iconUrl: 'images/icon_autotx-stepdown.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
//var iconVaultTX = L.icon({ iconUrl: 'images/icon_xfrmr_vault.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
//var iconRegulator = L.icon({ iconUrl: 'images/icon_regulator.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });
//var iconCapacitor = L.icon({ iconUrl: 'images/icon_capacitor.png', iconSize: [12, 12], iconAnchor: [6, 6], riseOnHover: false });

//var iconRecloser = L.icon({ iconUrl: 'images/icon_recloser.png', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false });
//var iconRecloserERopen = L.divIcon({ className: 'di-open', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "ER" });
//var iconRecloserIRopen = L.divIcon({ className: 'di-open', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "IR" });
//var iconAFSopen = L.divIcon({ className: 'diopen', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "A" });
//var iconRecloserERclosed = L.divIcon({ className: 'di-closed', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "ER" });
//var iconRecloserIRclosed = L.divIcon({ className: 'di-closed', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "IR" });
//var iconAFSclosed = L.divIcon({ className: 'di-closed', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "A" });
//var iconRecloserR1 = L.divIcon({ className: 'di-orange', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "R1" });
//var iconRecloserR3 = L.divIcon({ className: 'di-orange', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "R3" });
//var iconTripSaver = L.divIcon({ className: 'di-orange', iconSize: [18, 18], iconAnchor: [9, 9], riseOnHover: false, html: "TS" });