/**
 * Created by MXG0RYP on 5/25/2016.
 */
(function() {
    angular.module('nextGrid').service('stemNGS', stem);

    function stem(mapFactory, controlPanelSelection, areaF, DataModel, faults, gridsF,
                  gridDemoF,
                  lightningsF,
                  investigationsF,
                  fciF, feederFailPointF, managementArea, troubleTicketsF,
                  vinesF, knownMomentariesFeederOutagesF, openConditionAssessmentF, alsEventsF, highVoltTxF,
                  palmsBamboosF, dateUtilities, lightningsYTDF, complaintsF, momCountsF, loadScreen, $rootScope) {
        //feederFailPointF
        return {
            getMrkrByPropValue: getMrkrByPropValue,
            highlightMrkrByPropValue: highlightMrkrByPropValue,
            removeClassFromDivMarker: removeClassFromDivMarker,
            deviceZoom: deviceZoom,
            // drawHeatmapData:drawHeatmapData,
            initiateFaultsDrawing: initiateFaultsDrawing,
            drawFaults: drawFaults,
            initiateFaultsClear: initiateFaultsClear,
            drawFault: drawFault,
            initiateSubstationGridDraw: initiateSubstationGridDraw,
            initiateSubstationGridDrawVertice: initiateSubstationGridDrawVertice,
            initiateSubstationGridClear: initiateSubstationGridClear,
            initiateLightningDayDrawing: initiateLightningDayDrawing,
            initiateLightningDayClear: initiateLightningDayClear,
            initiateTroubleTicketsDrawing: initiateTroubleTicketsDrawing,
            initiateTroubleTicketsClear: initiateTroubleTicketsClear,
            initiateVinesDrawing: initiateVinesDrawing,
            initiateVinesClear: initiateVinesClear,
            initiateKnownMomentariesFeederOutagesDrawing: initiateKnownMomentariesFeederOutagesDrawing,
            initiateKnownMomentariesFeederOutagesClear: initiateKnownMomentariesFeederOutagesClear,
            initiateOpenConditionAssessmentsDrawing: initiateOpenConditionAssessmentsDrawing,
            initiateOpenConditionAssessmentsClear: initiateOpenConditionAssessmentsClear,
            initiatePalmsBamboosDrawing: initiatePalmsBamboosDrawing,
            initiatePalmsBamboosClear: initiatePalmsBamboosClear,
            initiateLightningYTDDrawing: initiateLightningYTDDrawing,
            initiateLightningYTDClear: initiateLightningYTDClear,
            initiateFeederFailurePoints: initiateFeederFailurePoints,
            initiateFeederFailurePointsClear: initiateFeederFailurePointsClear,
            initiateComplaintsDrawing: initiateComplaintsDrawing,
            initiateComplaintsClear: initiateComplaintsClear,
            initiateALSInvestigationDrawing: initiateALSInvestigationDrawing,
            initiateALSInvestigationClear: initiateALSInvestigationClear,
            setBounds: setBounds,
            removeLayersFromMap: removeLayersFromMap,
            addLayersToMap: addLayersToMap,
            initiateFCIFaultDrawing: initiateFCIFaultDrawing,
            initiateClearFciFaults:initiateClearFciFaults,
            highlightSelectedFeeder: highlightSelectedFeeder,
            drawAreaPolygons: drawAreaPolygons,
            drawPolyline: drawPolyline,
            clearDemo: clearDemo,
            initiateMapSubstationMoms: initiateMapSubstationMoms,
            initiateClearSubstationMoms: initiateClearSubstationMoms,
            //mapEZLightning:mapEZLightning
            drawCircleWithColor: drawCircleWithColor,
            initiateHvtInvestigationDrawing: initiateHvtInvestigationDrawing,
            initiateHvtInvestigationClear: initiateHvtInvestigationClear,
            setAsCauseLocation: setAsCauseLocation,
            initiateSubstationHeatMap: initiateSubstationHeatMap,
            //initiateSubstationHeatMap: initiateSubstationHeatMap,
            initiateSubstationHeatMapClear: initiateSubstationHeatMapClear,
            TTfilter: TTfilter,
            haloGridLines:haloGridLines,
            clearLayerGrpFromMap:clearLayerGrpFromMap
        };

        function highlightMrkrByPropValue(property, value) {
            //only one highlighted at a time
            removerMarkerHighlights();
            var marker = getMrkrByPropValue(property, value);
            addClassToDivMarker(marker, " di-highlight");
            panToMarker(marker);
        }

        function getMrkrByPropValue(property, value) {
            //only one marker highlighted at a time
            var layers = mapFactory.data.map._layers;//object
            var marker;
            for (var i in layers) {
                if (layers[i].options[property] == value) {
                    marker = layers[i];
                    break;
                }
            }
            return marker;
        }

        function panToMarker(marker) {
            var zoomLevel = mapFactory.data.map.getZoom();
            if (zoomLevel < 16) {
                mapFactory.data.map.setView(marker._latlng, 16);
            } else {
                mapFactory.data.map.panTo(marker._latlng);
            }
        }

        function addClassToDivMarker(marker, cssClass) {
            marker._icon.className += cssClass;
        }

        function removeClassFromDivMarker(marker, cssClass) {
            var classString = marker._icon.className;
            // if( classString.includes(cssClass) ){ IE IS SO DUMB IT CAN'T USE "INCLUDES" :‑|
            if (classString.indexOf(cssClass) > -1) {
                var index = classString.indexOf(cssClass);
                marker._icon.className = classString.slice(0, index);
            }
        }

        function removerMarkerHighlights() {
            var layers = mapFactory.data.map._layers;//object
            for (var i in layers) {
                var marker = layers[i];
                //for each marker in layers
                if (marker._icon) {
                    removeClassFromDivMarker(marker, 'di-highlight');
                    // var className = marker._icon.className;
                    // if( className.includes('di-highlight') ){
                    //     var index = className.indexOf('di-highlight');
                    //     marker._icon.className = className.slice(0, index);
                    // }
                }
            }
        }

        function drawGeoJLines(geoJson, layerGroup){
            //pushes each line segment into the layer group
            //DOES NOT add the layergroup to the map
            var lines = [];
            L.geoJSON(geoJson, {
                onEachFeature: function (feature, layer) {
                    // faults.data.network.push(feature); //populates variable for fixing fault lines
                    // console.log(feature.geometry.coordinates);

                    // layer.options.color = 'yellow';
                    // layer.options.weight = 12;
                    // layer.options.opacity = 0.5;
                    // layerGroup.addLayer(layer); //add line segment to
                    var coords=[];
                    feature.geometry.coordinates.forEach(function(point){
                        // point={lat:point[1], lng:point[0]};
                        coords.push({lat:point[1], lng:point[0]})
                    });
                    lines.push(coords);
                }

            });
            console.log(lines);
            layerGroup.addLayer(L.polyline(lines, {color: 'red', weight:15, opacity:0.5, interactive:false}));
            // L.polyline(lines, {color: 'red', weight:15, opacity:0.5}).addTo(mapFactory.data.map)
        }

        function clearLayerGrpFromMap(layer) {
            if (mapFactory.data.map.hasLayer(layer)) {
                layer.clearLayers();
                //mapFactory.data.overlays.Events.removeFrom(mapFactory.data.map);
                mapFactory.data.map.removeLayer(layer);
                layer = L.layerGroup([]);
            }
        }

        function haloGridLines(geoJson){
            // mapFactory.data.invesLineTrace.clearLayers();
            clearLayerGrpFromMap(mapFactory.data.invesLineTrace);
            var map = mapFactory.data.map;
            var traceLines = mapFactory.data.invesLineTrace;
            removeLayerGroupsFromMap([mapFactory.data.invesLineTrace]);

            // if(map.hasLayer(mapFactory.data.invesLineTrace)){
            //     map.removeLayer(mapFactory.data.invesLineTrace);
            //     mapFactory.data.invesLineTrace.clearLayers();
            // }
            mapFactory.data.invesLineTrace = L.featureGroup([], {makeBoundsAware: true, minZoom:12});

            drawGeoJLines(geoJson, mapFactory.data.invesLineTrace);
            map.addLayer(mapFactory.data.invesLineTrace);
            // console.log('segments', Object.keys(mapFactory.data.invesLineTrace._layers).length);
            map.fitBounds(mapFactory.data.invesLineTrace.getBounds());
        }

        function drawCircleWithColor() {
            var m = mapFactory.data.map;
            L.circle(cords, {radius: 5, color: color}).on('mouseover', function (e) {
                popup = L.popup()
                    .setLatLng(e.latlng)
                    .setContent('<h3>Lateral ' + LatCMEData.lat_fplid + '<hr> Feeder ' + LatCMEData.feeder + ': </h3><hr><b>Customer Count:</b> ' + LatCMEData.custCount + '<hr><b>Momentary Count: </b>' + LatCMEData.momCount + '<hr><b>Lateral CME: </b>' + LatCMEData.CME)
                    .openOn(mapFactory.data.map)
                    .on('mouseout', function (e) {
                        mapFactory.data.map.closePopup(popup); //popup = null;
                    });
            }).addTo(m);
        }

        function setAsCauseLocation(id) {
            console.log('DING in stemNGS');
            console.log('fpl ID ' + id);
            getDeviceById(id);
        }

        function clearDemo() {
            var m = mapFactory.data.map;
            for (var i in m._layers) {
                if (m._layers[i]._path != undefined) {
                    try {
                        m.removeLayer(m._layers[i]);
                    }
                    catch (e) {
                        console.log("problem with " + e + m._layers[i]);
                    }
                }
            }
        }

        function drawPolyline(cords, color) {
            var pointList = [];
            for (var i = 0; i < cords.length; i++) {
                var point = new L.LatLng(cords[i][1], cords[i][0]);
                pointList.push(point);
            }
            // console.log(JSON.stringify(pointList));

            if (typeof color === 'undefined') {
                color = "red";
            }
            new L.polyline(pointList, {
                color: color,
                weight: 2,
                smoothFactor: 1

            }).addTo(mapFactory.data.map);
        }

        function drawRawLightningYTD(data) {
            data.forEach(function (set) {
                set.push(0.1);
            });
            var heatOptions = {
                radius: 25, blur: 15, opacity: 0.7, minOpacity: 0.5,
                // example sent blur = 10
                gradient: {
                    0.25: '#45B6F7',
                    0.5: '#598EEA',
                    0.75: '#403BCE',
                    1.0: '#410D9B'
                    // 0.25:'#66E5FF',
                    // 0.5:'#00D4FF',
                    // 0.75:'#0088CC',
                    // 1.0:'#003366'
                }
            };
            // console.log(data);
            // drawHeatmapData(mapFactory.data.lightningYTDHeatMap, data, heatOptions );
            mapFactory.data.lightningYTDHeatMap = L.heatLayer(data, heatOptions);
            mapFactory.data.lightningYTDHeatMap.addTo(mapFactory.data.map);
        }

        function initiateLightningYTDClear() {
            mapFactory.data.map.removeLayer(mapFactory.data.lightningYTDHeatMap);
        }

        function initiateLightningYTDDrawing() {
            var litSelection = areaF.data.selectedSubstation.sub;
            var tl = L.point(litSelection.tly, litSelection.tlx);
            var br = L.point(litSelection.bry, litSelection.brx);
            var bbox = L.bounds(tl, br);
            // console.log(bbox);

            lightningsYTDF.getDataFromServer(tl, br)
                .then(function (data) {


                    var originalCords = data[0];
                    cords = [];
                    for (var i = 0; i < originalCords.length; i++) {
                        if (bbox.contains([originalCords[i].Lat, originalCords[i].Lng])) {
                            //console.log('DING!');
                            cords.push([originalCords[i].Lat, originalCords[i].Lng]);
                        }
                        //cords.push([originalCords[i].Lat,originalCords[i].Lng]);
                    }
                    drawRawLightningYTD(cords);
                });
        }

        function initiateKnownMomentariesFeederOutagesDrawing() {

            knownMomentariesFeederOutagesF.getDataFromServer()
                .then(function (data) {
                    drawKnownMomentariesFeederOutages(data);
                })
        }

        function drawKnownMomentariesFeederOutages(events) {
            clearEvents();
            var popup = null;
            var array=[];
            var iconA = L.icon({
                iconUrl: 'images/icon-alert.png',
                iconSize: [25, 25],
                iconAnchor: [12, 12],
                riseOnHover: false
            });
            _.forEach(events, function (ev) {
                var content = '<h3>' + ev.event + '</h3><hr>';
                content += '<b>Date: </b>' + ev.date;
                if(ev.trouble) { content += '<br><b>Cause: </b>' + ev.trouble; }
                if(ev.tln){ content += '<b>TLN: </b>' + ev.tln; }
                if(ev.ticketNumber){ content += '<br><b>Ticket #: </b>' + ev.ticketNumber; }
                var e1 = L.marker([ev.lat, ev.lng], {icon: iconA, zIndexOffset: 1})
                    .bindPopup(content);
                array.push(e1);
            });
            mapFactory.data.overlays.Events = L.layerGroup(array)
                .addTo(mapFactory.data.map);
        }

        function initiatePalmsBamboosDrawing() {
            palmsBamboosF.getDataFromServer().then(function (data) {

                drawPalms(data);
            });

        }

        function drawPalms(palms) {
            if (!palms)
                initiatePalmsBamboosClear();
            if (!palms.length)
                return;
            var iconL = L.icon({
                iconUrl: 'images/icon-palm.png',
                iconSize: [30, 30],
                iconAnchor: [15, 15],
                riseOnHover: false
            });
            _.forEach(palms, function (palm) {
                var e1 = L.marker([palm.lat, palm.long], {icon: iconL, zIndexOffset: mapFactory.data.topIndex})
                    .on('mouseover', function (e) {
                        popup = L.popup()
                            .setLatLng(e.latlng)
                            .setContent('<h3>Palms</h3><hr><b>Species:</b> ' + palm.SPECIES + '<br><b>Location:</b> ' + palm.LOCATION + '<br><b>palm.CITY:</b>')
                            .openOn(mapFactory.data.map)
                            .on('mouseout', function (e) {
                                mapFactory.data.map.closePopup(popup); //popup = null;
                            });
                    })
                    .addTo(mapFactory.data.map);
                mapFactory.data.overlays.Palms.push(e1);
            });

        }

        function initiatePalmsBamboosClear() {
            _.forEach(mapFactory.data.overlays.Palms, function (layer) {
                mapFactory.data.map.removeLayer(layer);
            });
            mapFactory.data.overlays.Palms = [];
            palmsBamboosF.clearData();
            //console.log('No Palms!');

        }

        function clearEvents() {
            if (mapFactory.data.map.hasLayer(mapFactory.data.overlays.Events)) {
                mapFactory.data.overlays.Events.clearLayers();
                // mapFactory.data.overlays.Events.removeFrom(mapFactory.data.map);
                mapFactory.data.map.removeLayer(mapFactory.data.overlays.Events);
                mapFactory.data.overlays.Events = L.layerGroup([]);
            }
        }

        function initiateOpenConditionAssessmentsClear() {
            //AJHEDIT Start
            //_.forEach(overlays.Cond, function(layer) {$scope.map.removeLayer(layer);});
            //overlays.Cond = [];
            clearOpenConditionAssessments();

        }

        function initiateOpenConditionAssessmentsDrawing() {
            initiateOpenConditionAssessmentsClear();
            openConditionAssessmentF.getDataFromServer().then(function (data) {
                // console.log('open condition assessments: ', data);
                drawOpenConditionAssessments(data);
            });
        }

        function drawOpenConditionAssessments(openConditionAssessments) {
            clearOpenConditionAssessments();
            var CA0 = [],
                CA1 = [],
                CA2 = [],
                CA3 = [],
                CA4 = [],
                CA5 = [];
            if (!openConditionAssessments) return;
            if (!openConditionAssessments.length) return;
            var popup = null;

            // $scope.condKeys = Object.keys($scope.cond[0]);

            openConditionAssessments.forEach(function (ca) {
                mapFactory.data.omsCA = new OverlappingMarkerSpiderfier(mapFactory.data.map);
                var imgRef='';
                if (ca.image1 == null) {
                    imgRef = 'no image';
                }
                else{
                    imgRef = '<a href="' + ca.image1 + '" target="blank"><img src="' + ca.image1 + '" width="100" height="100" alt="condition image" /></a>';
                    // imgRef = '<img src="' + ca.image1 + '" width="100" height="100" alt="condition image" />';
                    if(ca.image2){
                        imgRef += ' <a href="' + ca.image2 + '" target="blank"><img src="' + ca.image2 + '" width="100" height="100" alt="condition image 2" /></a>';
                    }
                    if(ca.severity==3 && ca.object_type=='insulator' ){console.log(ca)}
                }

                var e1 = L.marker([ca.latlng_y, ca.latlng_x], {
                    icon: colorCond(ca.severity),
                    zIndexOffset: mapFactory.data.topIndex,
                    riseOnHover: true,
                    TRAN_DTL_ID: ca.TRAN_DTL_ID
                }).bindPopup(
                    '<h3>Condition Assessment</h3>'
                    + '<b>Device:</b> ' + ca.object_type
                    + '<br><b>Issue:</b> ' + ca.issue
                    + '<br><b>Severity:</b> ' + ca.severity
                    + '<br><b>Address:</b> ' + ca.address
                    + '<br>' + imgRef
                );
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
                mapFactory.data.overlays.Cond.push(e1);
            });
            mapFactory.data.condLayer0 = L.layerGroup(CA0);
            mapFactory.data.condLayer1 = L.layerGroup(CA1);
            mapFactory.data.condLayer2 = L.layerGroup(CA2);
            mapFactory.data.condLayer3 = L.layerGroup(CA3);
            mapFactory.data.condLayer4 = L.layerGroup(CA4);
            mapFactory.data.condLayer5 = L.layerGroup(CA5);
            //debugger;
            //AJHEDIT Start
            //Define the object to be used in the addLayerTo.... function belowbelow
            mapFactory.data.groupedOverlays["Open Condition Assessment"] = {};
            //!!!lgEmptyOverlay in Utility functions has been edited as well  !!!!
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Open Condition Assessment',
                mapFactory.data.condLayer0, '<img src="../images/icon_ca0.png" class="legendIcon" style="height:20px;"/> CA Score 0');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Open Condition Assessment',
                mapFactory.data.condLayer1, '<img src="../images/icon_ca1.png" class="legendIcon" style="height:20px;"/> CA Score 1');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Open Condition Assessment',
                mapFactory.data.condLayer2, '<img src="../images/icon_ca2.png" class="legendIcon" style="height:20px;"/> CA Score 2');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Open Condition Assessment',
                mapFactory.data.condLayer3, '<img src="../images/icon_ca3.png" class="legendIcon" style="height:20px;"/> CA Score 3');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Open Condition Assessment',
                mapFactory.data.condLayer4, '<img src="../images/icon_ca4.png" class="legendIcon" style="height:20px;"/> CA Score 4');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Open Condition Assessment',
                mapFactory.data.condLayer5, '<img src="../images/icon_ca5.png" class="legendIcon" style="height:20px;"/> CA Score 5');

            //caControl = L.control.layers(null, overlayMapsB);//.addOverlay(condLayer1, 'CA1');
            //caControl.addTo(map);
            //AJHEDIT End
            //$("img[src='../images/icon_ca2.png']").parent().parent().parent().parent().siblings('a').css("background-color", "#fdb382");
            mapFactory.data.groupedMapLayerControl.remove();
            mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
            mapFactory.data.groupedMapLayerControl.addTo(mapFactory.data.map);
            mapFactory.data.groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";

            addLayerGroupToOMS([mapFactory.data.condLayer0, mapFactory.data.condLayer1,mapFactory.data.condLayer2,mapFactory.data.condLayer3, mapFactory.data.condLayer4,mapFactory.data.condLayer5],
                    mapFactory.data.omsCA);
        }

        function clearOpenConditionAssessments() {
            var o = mapFactory.data.overlays;
            if (mapFactory.data.groupedOverlays["Open Condition Assessment"]) {
                mapFactory.data.condLayer0.clearLayers();
                mapFactory.data.condLayer1.clearLayers();
                mapFactory.data.condLayer2.clearLayers();
                mapFactory.data.condLayer3.clearLayers();
                mapFactory.data.condLayer4.clearLayers();
                mapFactory.data.condLayer5.clearLayers();

                delete mapFactory.data.groupedOverlays["Open Condition Assessment"];
                mapFactory.data.groupedMapLayerControl.remove();
                mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                addGroupedLayerControlIfNotEmpty();
            }

        }

        function colorCond(sev) {
            var ike;
            switch (sev) {
                case 5:
                    ike = L.icon({
                        iconUrl: 'images/icon_ca5.png',
                        iconSize: [17, 26],
                        iconAnchor: [7, 26],
                        riseOnHover: false
                    });
                    break;
                case 4:
                    ike = L.icon({
                        iconUrl: 'images/icon_ca4.png',
                        iconSize: [17, 26],
                        iconAnchor: [7, 26],
                        riseOnHover: false
                    });
                    break;
                case 3:
                    ike = L.icon({
                        iconUrl: 'images/icon_ca3.png',
                        iconSize: [17, 26],
                        iconAnchor: [7, 26],
                        riseOnHover: false
                    });
                    break;
                case 2:
                    ike = L.icon({
                        iconUrl: 'images/icon_ca2.png',
                        iconSize: [17, 26],
                        iconAnchor: [7, 26],
                        riseOnHover: false
                    });
                    break;
                case 1:
                    ike = L.icon({
                        iconUrl: 'images/icon_ca1.png',
                        iconSize: [17, 26],
                        iconAnchor: [7, 26],
                        riseOnHover: false
                    });
                    break;
                case 0:
                default:
                    ike = L.icon({
                        iconUrl: 'images/icon_ca0.png',
                        iconSize: [17, 26],
                        iconAnchor: [7, 26],
                        riseOnHover: false
                    });
            }
            return ike;
        }

        // moved to stem.service.js : New version of lgEmptyOverlay for GROUPED layer control
        function addLayerToGroupedControl(groupArray, groupTitle, layergroup, string) {
            var key = string;
            //if layerGroup._layers
            if ($.isEmptyObject(layergroup._layers) == false) {
                //groupedOverlays["Open Condition Assessment"]['<img src="../images/icon_ca0.png" class="legendIcon" style="height:20px;"/> low'] =  : condLayer0,
                //debugger;
                groupArray[groupTitle][key] = layergroup;
                layergroup.addTo(mapFactory.data.map);
            } else {
                groupArray[groupTitle][key + '<span class="muted">(0)</span>'] = layergroup;
            }
        }

        function initiateKnownMomentariesFeederOutagesClear() {
            clearEvents();
            knownMomentariesFeederOutagesF.clearKnownMomentariesFeederOutages();
        }

        /*
         * Vines Investigation
         * */
        function initiateVinesDrawing(vineEditFunction) {
            clearStats();
            initiateVinesClear();
            vinesF.getDataFromServer().then(function (data) {
                drawVines(data, vineEditFunction);
            });
            // showWait();
            // setBounds($scope, DataModel);
            // $scope.activeLevel = 'vines';
            // $('#vinesBtn').addClass('active');
            // $scope.then = dateMinus($scope.daysBackVines.value);
            // DataModel.getVine($scope.selectionType, $scope.selection, $scope.then, $scope.now)
            //     .then(function (data) {
            //         $scope.vines = data;
            //         drawVines($scope);
            //         drawVinesDashboard();
            //         $.unblockUI();
            //         setTimeout(function () {
            //             $("#tab-wrapper").removeClass("tabHide hide").addClass("tabShow");
            //             swapClass('#chartTab, #vineTablink', '#faultsTab, #EquipLog, #tktTab', 'active');
            //             $("#vineTabLink, #vineBars").removeClass("hide");
            //             checkTab();
            //
            //         }, 500);
            //     });
        }

        function initiateVinesClear() {
            mapFactory.data.overlays.Vines.forEach(function (layer) {
                mapFactory.data.map.removeLayer(layer);
            });
            mapFactory.data.overlays.Vines = [];
            vinesF.clearVines();
        }

        function drawVines(vines, vineEditFunction) {
            var lastMid = 0;
            vines.forEach(function (vine) {
                if (vine.mid !== lastMid) {  // eliminate duplicates
                    lastMid = vine.mid;
                    vine.sentDate = new Date(vine.sentDate);
                    vine.disabled = true;
                    colorVine(vine);
                    var popup = null;
                    var c1 = L.marker([vine.latitude, vine.longitude], {icon: vine.icon}).addTo(mapFactory.data.map)
                    //var c1 = L.circle([vine.latitude, vine.longitude], 250, myCircleOptions(vine.col))
                        .on('mouseover', function (e) {
                            //e.latlng.lat += .002;
                            popup = L.popup({offset: [0, -5]})
                                .setLatLng(e.latlng)
                                .setContent(renderPopText(vine))
                                .openOn(mapFactory.data.map)
                                .on('mouseout', function (e) {
                                    mapFactory.data.map.closePopup(popup); //popup = null;
                                });
                        })
                        .on('click', function (e) {
                            vineEditFunction(vine);
                        })
                        .addTo(mapFactory.data.map);
                    mapFactory.data.overlays.Vines.push(c1);
                }
            });

            // $scope.vines = _($scope.vines).chain().sortBy('sort2').reverse().sortBy('sort1').value();
            // $scope.stats = stats;
        }

        function colorVine(vine) {
            if (vine.ticketDate === null) {
                vine.ticketStatus = "New";
                vine.disabled = false;
            }
            else {
                var sqlDate = vine.ticketDate;
                vine.ticketDate = new Date();
                vine.ticketDate.setTime(Date.parse(sqlDate));
            }

            if (vine.ticketStatus === "New") {
                vine.col = "blue";
                vine.sort1 = "0";
                vine.sort2 = vine.sentDate;
                mapFactory.data.stats.vines.blue++;
                vine.icon = mapFactory.data.iconVinesBlue;
            }
            else if (vine.ticketStatus === "Ticketed" && dateUtilities.getISODate(vine.ticketDate) < dateUtilities.getISODate(dateUtilities.dateMinus(30))) {
                vine.col = 'red';
                vine.sort1 = "1";
                vine.sort2 = vine.ticketDate;
                mapFactory.data.stats.vines.red++;
                vine.icon = mapFactory.data.iconVinesRed;
            }
            else if (vine.ticketStatus === "Ticketed" && dateUtilities.getISODate(vine.ticketDate) < dateUtilities.getISODate(dateUtilities.dateMinus(15))) {
                vine.col = 'orange';
                vine.sort1 = "2";
                vine.sort2 = vine.ticketDate;
                mapFactory.data.stats.vines.orange++;
                vine.icon = mapFactory.data.iconVinesOrange;
            }
            else if (vine.ticketStatus === "Sprayed") {
                vine.col = 'green';
                vine.sort1 = "3";
                vine.sort2 = vine.ticketDate;
                mapFactory.data.stats.vines.green++;
                vine.icon = mapFactory.data.iconVinesGrey;
            }
            else if (vine.ticketStatus === "Held") {
                vine.col = 'grey';
                vine.sort1 = "4";
                vine.sort2 = vine.ticketDate;
                mapFactory.data.stats.vines.grey++;
                vine.icon = mapFactory.data.iconVinesGreen;
            }
            else if (vine.ticketStatus === "Complete") {
                vine.col = 'green';
                vine.sort1 = "5";
                vine.sort2 = vine.ticketDate;
                mapFactory.data.stats.vines.green++;
                vine.icon = mapFactory.data.iconVinesGreen;
            }
            else {
                vine.col = 'yellow';
                vine.sort1 = "6";
                vine.sort2 = vine.ticketDate;
                mapFactory.data.stats.vines.yellow++;
                vine.icon = mapFactory.data.iconVinesYellow;
            }
        }

        // function myCircleOptions(color){
        //     return {
        //         color: color,
        //         opacity:.9,
        //         weight: 1,
        //         fillColor: color,
        //         fillOpacity:.5
        //     };
        // }

        function renderPopText(vine) {
            var str = '<h3>Vines</h3>';
            str += '<b>' + vine.sentDate.toLocaleDateString() + ' ' + vine.sentDate.toLocaleTimeString();
            str += '</b><hr>';
            str += vine.from + '<br>';
            str += vine.comments + '<br>';
            // str += '<button style="color: dodgerblue">More Info</button>';
            return str;
        }

        function clearStats() {
            mapFactory.data.stats.vines.blue = 0;
            mapFactory.data.stats.vines.red = 0;
            mapFactory.data.stats.vines.yellow = 0;
            mapFactory.data.stats.vines.orange = 0;
            mapFactory.data.stats.vines.green = 0;
            mapFactory.data.stats.vines.grey = 0;
        }

        /*
         * Faults Investigation
         * */
        function initiateFaultsDrawing() {
            setBounds();
//AJH - NOTE: doesn't seem to work, because gets new data??? Currently I am just calling drawFaults() from ControlPaneldirective
            faults.getDataFromServer(function (data) {
                drawFaults(data);
            });
        }

        function initiateFaultsClear() {
            clearFaults();
        }


        /*
         * Trouble Tickets Investigation
         * */
        function initiateTroubleTicketsDrawing() {
            troubleTicketsF.getDataFromServer().then(function (data) {
                //console.log(data);
                drawTroubleTicketsToMap(data);
            })
        }

        function initiateTroubleTicketsClear() {
            troubleTicketsF.clearTroubleTickets();
            clearTroubleTicketsFromMap();
            troubleTicketsF.data.ticketArray = ['FDR', 'OCR', 'LAT', 'TX', 'SEC', 'MTR', 'NLS', 'SV'];
        }

        function drawTroubleTicketsToMap(data) {
            //mapFactory.data.omsTickets = OverlappingMarkerSpiderfier(mapFactory.data.map);
            //temporary arrays
            var ttArrFDR = [],
                ttArrOCR = [],
                ttArrLAT = [],
                ttArrTX = [],
                ttArrSEC = [],
                ttArrMTR = [],
                ttArrNLS = [],
                ttArrSV = [];

            for (var i = 0; i < data.length; i++) {
                var t = data[i];
                var mapIcon;
                var groupArray;
                var ttMarker;
                //designate icon & array based on interruption type
                switch (t.IRPT_TYPE_CODE) {

                    case 'FDR':
                        mapIcon = mapFactory.data.iconTTicketFdr;
                        groupArray = ttArrFDR;
                        break;
                    case 'OCR':
                        mapIcon = mapFactory.data.iconTTicketOcr;
                        groupArray = ttArrOCR;
                        break;
                    case 'LAT':
                        mapIcon = mapFactory.data.iconTTicketLat;
                        groupArray = ttArrLAT;
                        break;
                    case 'TX':
                        mapIcon = mapFactory.data.iconTTicketTx;
                        groupArray = ttArrTX;
                        break;
                    case 'MTR':
                        mapIcon = mapFactory.data.iconTTicketMtr;
                        groupArray = ttArrMTR;
                        break;
                    case 'SEC':
                        mapIcon = mapFactory.data.iconTTicketSec;
                        groupArray = ttArrSEC;
                        break;
                    case 'NLS':
                        mapIcon = mapFactory.data.iconTTicketNls;
                        groupArray = ttArrNLS;
                        break;
                    case 'SV':
                        mapIcon = mapFactory.data.iconTTicketSv;
                        groupArray = ttArrSV;
                        break;
                }
                //TODO In the Original database the Lat & Long Are Reversed: Fix this later - switch in Factory?
                // format.TCKT_CRTE_DTTM to local time zone
                var localTime = moment(t.TCKT_CRTE_DTTM).format("MM/DD/YYYY- hh:mm:ss A");
                // console.log('ticket creation date');
                // console.log(typeof localTime._d);
                // console.log(localTime);
                // console.log(localTime.format("MM/DD/YYYY- hh:mm:ss A"));

                ttMarker = L.marker({lat: t.lng, lng: t.lat}, {
                    icon: mapIcon,
                    alt: t.IRPT_TYPE_CODE,
                    riseOnHover: true,
                    TRBL_TCKT_NUM: t.TRBL_TCKT_NUM,
                    zIndexOffset: mapFactory.data.topIndex
                })
                    .bindPopup(
                        //with binded popup
                        '<strong>Ticket #: </strong>' + t.TRBL_TCKT_NUM +
                        '<br /><strong>Interruption Type: </strong>' + t.IRPT_TYPE_CODE +
                        '<br /><strong>Ticket Type: </strong>' + t.TCKT_TYPE_CODE +
                        '<br /><strong>Creation Date: </strong>' + localTime + /* TODO might need to format the date*/
                        '<br /><strong>Ticket Status: </strong>' + t.TCKT_STAT_CODE
                    );
                groupArray.push(ttMarker);
                //push to specified array
            }
//create LayerGroups from each array
            //TroubleTicketFDR = L.featureGroup(array);
            mapFactory.data.TTfeatureGrpFdr = L.featureGroup(ttArrFDR);
            mapFactory.data.TTfeatureGrpOcr = L.featureGroup(ttArrOCR);
            mapFactory.data.TTfeatureGrpLat = L.featureGroup(ttArrLAT);
            mapFactory.data.TTfeatureGrpTx = L.featureGroup(ttArrTX);
            mapFactory.data.TTfeatureGrpSec = L.featureGroup(ttArrSEC);
            mapFactory.data.TTfeatureGrpMtr = L.featureGroup(ttArrMTR);
            mapFactory.data.TTfeatureGrpNls = L.featureGroup(ttArrNLS);
            mapFactory.data.TTfeatureGrpSv = L.featureGroup(ttArrSV);
//add layerGroups to control
            mapFactory.data.groupedOverlays["Trouble Tickets"] = {};

            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpFdr, '<span class="glyphicon glyphicon-tag txt-tckt7"></span> FDR');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpOcr, '<span class="glyphicon glyphicon-tag txt-tckt6"></span> OCR');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpLat, '<span class="glyphicon glyphicon-tag txt-tckt5"></span> LAT');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpTx, '<span class="glyphicon glyphicon-tag txt-tckt4"></span> TX');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpSec, '<span class="glyphicon glyphicon-tag txt-tckt3"></span> SEC');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpMtr, '<span class="glyphicon glyphicon-tag txt-tckt3"></span> MTR');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpNls, '<span class="glyphicon glyphicon-tag txt-tckt2"></span> NLS');
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Trouble Tickets', mapFactory.data.TTfeatureGrpSv, '<span class="glyphicon glyphicon-tag txt-tckt2"></span> SV');

            mapFactory.data.groupedMapLayerControl.remove();
            mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
            mapFactory.data.groupedMapLayerControl.addTo(mapFactory.data.map);
            mapFactory.data.groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";

            mapFactory.data.omsTickets = new OverlappingMarkerSpiderfier(mapFactory.data.map);
            //console.log(mapFactory.data.omsTickets);
            addLayerGroupToOMS([mapFactory.data.TTfeatureGrpFdr, mapFactory.data.TTfeatureGrpOcr, mapFactory.data.TTfeatureGrpLat, mapFactory.data.TTfeatureGrpTx,
                    mapFactory.data.TTfeatureGrpSec, mapFactory.data.TTfeatureGrpMtr, mapFactory.data.TTfeatureGrpNls, mapFactory.data.TTfeatureGrpSv],
                mapFactory.data.omsTickets);
            //console.log(mapFactory.data.groupedMapLayerControl);

            $('a.investigation-control-layers-toggle ~form .leaflet-control-layers-selector').on('click', function () {
                var string = this.nextSibling.innerHTML;
                // console.log('box clicked is checked', this.checked);
                string = string.slice(57);
                TTfilter(string, this.checked);
            })
        }

        function TTfilter(string, isChecked) {
            console.log('stem TTfilter');
            var ticketArray = troubleTicketsF.data.ticketArray;
            if (string.indexOf('muted') > -1) {
                string = string.slice(0, 3);
                if (string.indexOf('<') > -1) {
                    string = string.slice(0, 2);
                }
            }
            // console.log(string);

            if (isChecked === false && ticketArray.indexOf(string) > -1) {
                //get index of string in ticketArray
                var index = ticketArray.indexOf(string);
                //remove string from array
                ticketArray.splice(index, 1);
            } else if (isChecked === true && !(ticketArray.indexOf(string) > -1)) {
                ticketArray.push(string);
            }
            $rootScope.$digest();
        }

        function clearTroubleTicketsFromMap() {
            // var o = mapFactory.data.overlays;
            if (mapFactory.data.groupedOverlays["Trouble Tickets"]) {

                mapFactory.data.TTfeatureGrpFdr.clearLayers();
                mapFactory.data.TTfeatureGrpOcr.clearLayers();
                mapFactory.data.TTfeatureGrpLat.clearLayers();
                mapFactory.data.TTfeatureGrpTx.clearLayers();
                mapFactory.data.TTfeatureGrpSec.clearLayers();
                mapFactory.data.TTfeatureGrpMtr.clearLayers();
                mapFactory.data.TTfeatureGrpNls.clearLayers();
                mapFactory.data.TTfeatureGrpSv.clearLayers();

                delete mapFactory.data.groupedOverlays["Trouble Tickets"];
                mapFactory.data.groupedMapLayerControl.remove();
                mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                //     .addTo(mapFactory.data.map);
                // mapFactory.data.groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";
                addGroupedLayerControlIfNotEmpty();
            }

        }


        /*
         * Lightning
         * */
        function initiateLightningDayClear() {
            clearLightningDaily();
        }

        function initiateLightningDayDrawing() {
            lightningsF.getDataFromServer().then(function (data) {
                // $scope.poles = data;
                //console.log( data);
                drawLightningDaily(data);
            });
            // investigationsF.data.litDay.getData();
            // setTimeout(function(){
            //     console.log(investigationsF.data.litDay)
            // },150);
        }

        function drawLightningDaily(poles) {
            //console.log(poles);
            var litArray = [];
            if (!poles.length)
                return;

            clearLightningDaily();
            var iconL = mapFactory.data.iconLit;

            _.forEach(poles, function (pole) {
                var e1 = L.marker([pole.lat, pole.lng], {icon: iconL, zIndexOffset: mapFactory.data.topIndex})
                    .bindPopup('<h5>Lightning strike</h5><hr>'
                        + '<b>Date:</b> ' + moment(pole.datetime).format('MMMM Do YYYY, h:mm:ss a').toString() + '<br>'
                        + '<b>FPLid:</b> ' + pole.fplid
                        //    + '<br><b>Hits:</b> ' + pole.hits
                        + '<br>').openPopup();
                litArray.push(e1);


            });
            mapFactory.data.overlays.LightningDaily = L.layerGroup(litArray);
            mapFactory.data.overlays.LightningDaily.addTo(mapFactory.data.map);

            mapFactory.data.groupedOverlays["Weather"] = {};

            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Weather', mapFactory.data.overlays.LightningDaily, 'Lightning');
            mapFactory.data.groupedMapLayerControl.remove();
            mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
            mapFactory.data.groupedMapLayerControl.addTo(mapFactory.data.map);
            mapFactory.data.groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";

        }

        function clearLightningDaily() {
            // _.forEach(mapFactory.data.overlays.LightningDaily, function(layer) {mapFactory.data.map.removeLayer(layer);});
            // mapFactory.data.overlays.LightningDaily = [];
            if (mapFactory.data.map.hasLayer(mapFactory.data.overlays.LightningDaily)) {
                mapFactory.data.overlays.LightningDaily.clearLayers();

                delete mapFactory.data.groupedOverlays["Weather"];
                mapFactory.data.groupedMapLayerControl.remove();
                mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                addGroupedLayerControlIfNotEmpty();
            }
            // mapFactory.data.overlays.LightningDaily.removeFrom(mapFactory.damapFactory.data.groupedMapLayerControl.remove();

            // mapFactory.data.overlays.LightningDaily = L.layerGroup([]);
        }

        /*
         * Substation Grid Draw
         * */
        function initiateSubstationGridDraw() {
            setBounds();

            // if (!mapFactory.data.spanArr.length) {
                getNetworkAndDraw();
                getDevicesAndDraw();
            // }
        }


        var gridLines = undefined;
        var fciMkrs = undefined;

        function clearGridVerticeLayers(){
            // console.log('clear vertice');
            removeLayerGroupsFromMap([mapFactory.data.gridsLayer, mapFactory.data.devGroupFci, mapFactory.data.invesLineTrace]);
            // mapFactory.data.map.removeLayer();
            // mapFactory.data.map.removeLayer();
            mapFactory.data.gridsLayer = L.layerGroup([], {makeBoundsAware: true, minZoom:10});
            // mapFactory.data.devGroupFci = L.layerGroup([], {makeBoundsAware: true, minZoom:12});

            delete mapFactory.data.deviceOverlays["Smart Devices"]["<img src='images/icon_fci.svg' height='15'/> FCI"];
            // mapFactory.data.deviceOverlays["Smart Devices"]["<img src='images/icon_fci.svg' height='15'/> FCI"] = mapFactory.data.devGroupFci;
        }

        function initiateSubstationGridDrawVertice() {
            var map = mapFactory.data.map;
            clearGridVerticeLayers();

            if (typeof gridLines !== 'undefined') map.removeLayer(gridLines);
            if (typeof fciMkrs !== 'undefined') map.removeLayer(fciMkrs);

            // console.log('LOAD verticies grid!');
            setBounds();
            gridDemoF.getDataFromServer().then(function (data) {
                var geoJSON = [];
                var fciJson = [];
                clearGrid(); //clears current map layers (that are set up in mapFactory)
                mapFactory.data.gridsLayer = L.layerGroup([], {makeBoundsAware: true, minZoom: 11}).addTo(map); // Currently used Layer for Feeder Lines - Define & make sure it's clear
                // mapFactory.data.devGroupFci = L.geoJSON(fciJson , {makeBoundsAware: true, minZoom: 13}).addTo(map);  // Currently used Layer for FCIs - Define & make sure it's clear
                for (var i = 0; i < data.length; i++) {
                    geoJSON.push(data[i].geoJSON);
                    if(data[i].geoJSON.properties.fplClass === 'fault_indicator'){
                        fciJson.push(data[i].geoJSON)
                    }
                }
                // console.log('geoJson ', geoJSON);
                // console.log('fciJson ', fciJson);
 //TODO ALEX TESTING GEOJSON layer IN LAYER CONTROL
                mapFactory.data.smartDevFci = L.geoJson(fciJson,{
                    onEachFeature:function (feature, layer) {
                        var icon;
                        layer.options.feederNumber = feature.properties.feederNum;
                        var popupContent = '<h4>'+feature.properties.fplClass
                            +'</h4> <strong>Feeder: </strong> '+ layer.options.feederNumber
                            +'<strong>Switch#: </strong>'+feature.properties.switch;
                        //attach feederNumber to all devices
                        layer.options.icon = mapFactory.data.iFG;
                        layer.options.switch = feature.properties.switch;
                        layer.bindPopup(popupContent);

                        layer.options.makeBoundsAware = true;
                        layer.options.minZoom= 12;
                    }
                });
                console.log(mapFactory.data.smartDevFci);

                gridLines = L.geoJSON(geoJSON, {
                    onEachFeature: function (feature, layer) {     //will go through each geoJson feature and create a leaflet layer
                        // console.log('class: '+ feature.properties.fplClass);
                        if (feature.geometry.type == "LineString") {
                            // faults.data.network.push(feature); //populates variable for fixing fault lines
                            layer.options.color = feature.properties.fplDefaultColor;
                            layer.options.fdrColor = feature.properties.fplDefaultColor;
                            layer.options.feederNumber = feature.properties.feederNum;  //'feederNumber' used to show/hide feeders when individual feeders are selected
                            layer.options.weight = 2.5;
                            layer.options.zIndexOffset = mapFactory.data.gridIndex;

                            layer.bindPopup('<strong>feeder:</strong> ' + feature.properties.feederNum +
                                '<br /><strong>fplID:</strong> ' + feature.properties.fplID); //+
                            mapFactory.data.gridsLayer.addLayer(layer); //add line segment to
                        }
                        // if (feature.geometry.type == "Point") {
                        //     // console.log(feature.geometry.coordinates);
                        //     var icon;
                        //     var layerGroup;
                        //     //Basic content for popup, additional info will be added in for each class as needed
                        //     var popupContent = '<h4>'+feature.properties.fplClass+'</h4> <strong>Feeder: </strong> '+ layer.options.feederNumber;
                        //     //attach feederNumber to all devices
                        //     layer.options.feederNumber = feature.properties.feederNum;
                        //
                        //     if (feature.properties.fplClass === 'fault_indicator') {
                        //         layer.options.icon = mapFactory.data.iFG;
                        //         layer.options.switch = feature.properties.switch;
                        //         layerGroup = mapFactory.data.devGroupFci;
                        //     }
                        //     layer.bindPopup(popupContent);
                        //     layerGroup.addLayer(layer);
                        // }

                    }
                    // style: function(feature){
                    //     return {color: feature.properties.fplDefaultColor, weight: 1};
                    // },
                    // pointToLayer: function(feature,latlng){
                    //     if(feature.properties.fplClass === 'fault_indicator'){
                    //         var marker = L.marker(latlng, {
                    //             icon: mapFactory.data.iFG,
                    //             feederNum : feature.properties.feederNum,
                    //             switch : feature.properties.switch
                    //             // radius: 8,
                    //             // fillColor: feature.properties.fplDefaultColor,
                    //             // weight: 2,
                    //             // opacity: 1,
                    //             // fillOpacity: 1
                    //         }).bindPopup('Feeder: ' + feature.properties.feederNum +  ' Switch: ' + feature.properties.switch + ' Phase: ' + feature.properties.phase);
                    //
                    //         return marker;
                    //     }
                    // }
                })//.addTo(map);
                // for(var i = 0; i < data.length; i++){
                //     gridLines.addData(data[i].geoJSON);
                // }

                //console.log('FCI ', Object.keys(mapFactory.data.devGroupFci._layers));
                // if (tempArrayFCI.length) {
                mapFactory.data.gridsLayer.addTo(mapFactory.data.map);
                // console.log(mapFactory.data.deviceOverlays);
                // mapFactory.data.smartDevFci.addTo(mapFactory.data.map);
                // mapFactory.data.deviceOverlays["Smart Devices"]["<img src='images/icon_fci.svg' height='15'/> FCI"] = fciMkrs;
                // }
            })
        }

        function initiateSubstationGridClear() {
            clearGrid();
            clearGridVerticeLayers();
            clearDevices();
        }

        function getNetworkAndDraw() {
            loadScreen.showWait('Loading grid data', false);
            // console.log('get network');
            gridsF.getGridDataFromServer(areaF.data.selectedSubstation, areaF.data.selectedFeeder).then(function (data) {
                // faults.data.network = data;
                drawNetwork(data);
            });
        }

        function drawNetwork(rows) {
            clearGrid();
            initiateSubstationGridDrawVertice();
            var map = mapFactory.data.map;
            //console.log('Draw grid');
            var node = null;
            var feederHash = {};
            var fdrSpans = [];
            // var tempArray = [];
            // var fdrCheck = "";
            // var lastColor = "";
            // var arrTransformer = [];
            var arrSwitchOpen = [];
            var arrSwitchClose = [];
            var arrFuse = [];
            var arrALS = [];
            var arrOtherDev = [];
            //var line;
            var linesToMap = [];
            // var colorList = ["#847262", "#416161", "#1313ba", "#993dea", "#22aa36", "#007070", "#754c24", "#658569", "#78568f", "#c4773d", "#2e81b8", "#4f3b5e"];
            DataModel.getALScount(areaF.data.selectedSubstation._id).then(function (countData) {
                for (var i = 0, len = rows.length; i < len; i++) {
                    var row = rows[i];

                    // if (row.type === "ACLineSegment" && row.phase === "N") {
                    //     //only draws the Neutral phase, other phases would produce duplicate lines on the map
                    //     // //AJH later make lines into groups - per feeder, one for Feeder Lines one for Lat Lines
                    //     // line = drawLine(row, colorList, feederHash);
                    //     // fdrSpans.push(line);
                    //     linesToMap.push(row);
                    //     if (row.feederName in feederHash) {
                    //         color = feederHash[row.feederName];
                    //     } else {
                    //         color = colorList[_.size(feederHash)];
                    //         feederHash[row.feederName] = color;
                    //     }
                    // }
                    // else if (row.type === "ACLineSegment" && row.phase !== "N") {
                    if (row.type === "ACLineSegment" || row.type ==="Feature") {
                        //do nothing!!!
                        //console.log('FPL Class: ' + row.fplClass);
                    }

                    else if (row.type === "Jumper" || row.type === "Breaker" || row.type === "Compensator") {
                        node = drawNode(row, null);
                        arrOtherDev.push(node);
                    }
                    else if (row.type === "Switch - Open" || row.type === "Switch - Closed") {
                        // if(row.fplClass !== "elbow" && row.fplClass !=="ug_xfrmr"){
                        if (row.fplClass !== "elbow") {
                            node = drawNode(row, null);
                            if (row.type === "Switch - Open") {
                                arrSwitchOpen.push(node);
                            }
                            if (row.type === "Switch - Closed") {
                                arrSwitchClose.push(node);
                            }
                            if (row.fplClass == "regulator") {
                                arrOtherDev.push(node)
                            }
                        }
                    }
                    else if (row.type === "Fuse") {
                        node = drawNode(row, countData);
                        if (row.assetType == "TS2") {
                            arrALS.push(node);
                        } else {
                            arrFuse.push(node);
                        }
                    }
                    else {
                        node = drawNode(row);
                        mapFactory.data.deviceArr.push(node);
                        // console.log('other type = '+row.type);
                    }
                }

                //_.sortBy(( _.sortBy(linesToMap, 'feederName')), 'fplClass');
                //later change fplClass to parentType - to dot laterals vs solid Feeders
                // console.log(linesToMap[0]);
                // var feederArr = [];
                // var latArr = [];
                // var keys = Object.keys(feederHash);
                // // console.log(linesToMap);
                // for (var i = 0; i < keys.length; i++) {
                //     linesToMap.forEach(function (seg) {
                //
                //         if (seg.type == "ACLineSegment") {
                //             try {
                //                 if (seg.feederName == keys[i]) {
                //                     _.forEach(seg.points, function (pt) {
                //                         var temp = pt[0];
                //                         pt[0] = pt[1];
                //                         pt[1] = temp;
                //                     });
                //                     feederArr.push(seg.points);
                //                     //if type
                //                     // if (seg.parentType == 'Feeder') {
                //                     //     feederArr.push(seg.points);
                //                     // } else {
                //                     //     if(seg.points) {
                //                     //         latArr.push(seg.points);
                //                     //     }
                //                     // }
                //                     //push to array
                //                 }
                //             } catch (err) {
                //                 console.log(err.message);
                //                 console.log(seg)
                //             }
                //         }
                //
                //
                //     });
                //     var keyName = keys[i];
                //     //color is that for feeder from Hash feederHash[keyName]
                //     //create polylines
                //     var feeders = L.polyline(feederArr, {
                //         color: feederHash[keyName],
                //         "feederNumber": keys[i],
                //         weight: 3,
                //         opacity: 0.5,
                //         fdrColor: feederHash[keyName]
                //     });
                //     // var lats = L.polyline(latArr, {color: feederHash[keyName], "feederNumber": keys[i], dashArray:"4,7", weight:3, opacity:0.5});
                //     fdrSpans.push(feeders);
                //     // fdrSpans.push(lats);
                //     latArr = [];
                //     feederArr = [];
                // }
                // mapFactory.data.gridsLayer = {};
                // mapFactory.data.gridsLayer = L.layerGroup(fdrSpans, { makeBoundsAware: true, minZoom:9  }).addTo(map);
                // mapFactory.data.gridsLayer = L.layerGroup(fdrSpans, {makeBoundsAware: true, minZoom: 11}).addTo(map);
                // mapFactory.data.gridsLayer.addTo(mapFactory.data.map);
                // console.log(mapFactory.data.gridsLayer);
                fdrSpans = [];
                mapFactory.data.devGroupSwitchOpen = L.layerGroup(arrSwitchOpen, { makeBoundsAware: true, minZoom: 14 });
                mapFactory.data.devGroupSwitchClosed = L.layerGroup(arrSwitchClose, { makeBoundsAware: true,  minZoom: 14 });
                mapFactory.data.devGroupALS = L.layerGroup(arrALS, {makeBoundsAware: true, minZoom: 14});
                mapFactory.data.devGroupFuse = L.layerGroup(arrFuse, {makeBoundsAware: true, minZoom: 15});
                //mapFactory.data.devGroupTransformer = L.layerGroup(arrTransformer);
                mapFactory.data.devGroupOther = L.layerGroup(arrOtherDev, { makeBoundsAware: true, minZoom: 15});

                //addGridDevicesToMap();

                mapFactory.data.deviceOverlays["Grid"] = {};
                mapFactory.data.deviceOverlays["Grid"]["Line Spans"] = mapFactory.data.gridsLayer;
                mapFactory.data.deviceOverlays["Grid"]["<div class='di-SwitchOpen di-legend '></div>Switch: Open"] = mapFactory.data.devGroupSwitchOpen;
                mapFactory.data.deviceOverlays["Grid"]["<div class='di-SwitchClosed di-legend '></div>Switch: Closed"] = mapFactory.data.devGroupSwitchClosed;
                mapFactory.data.deviceOverlays["Grid"]["<div class='di-legend '><img src='images/icon_ALS.svg' height='15'/></div></div> ALS"] = mapFactory.data.devGroupALS;
                mapFactory.data.deviceOverlays["Grid"]["<div class='di-legend'><img src='images/icon_fuse.png' height='15'/></div>Fuse"] = mapFactory.data.devGroupFuse;
                mapFactory.data.deviceOverlays["Grid"]["<div class='di-Other di-legend '></div> Other Devices"] = mapFactory.data.devGroupOther;
                mapFactory.data.deviceOverlays["Smart Devices"]["<img src='images/icon_fci.svg' height='15'/> FCI"] = mapFactory.data.smartDevFci;

                mapFactory.data.deviceLayer = L.layerGroup(mapFactory.data.deviceArr, { makeBoundsAware: true, minZoom: 11})
                    .addTo(map);
                mapFactory.data.deviceLayer14 = L.layerGroup(mapFactory.data.deviceArr14);
                mapFactory.data.deviceLayer17 = L.layerGroup(mapFactory.data.deviceArr17);
                // console.log(mapFactory.data.subMoms);
                // console.log(map);
                if (mapFactory.data.subMoms._map) {
                    mapFactory.data.subMoms.removeFrom(mapFactory.data.map);
                }

                //turns off substation mom count icons
                // console.log('Finished Mapping '+ moment().format('h:mm:ss'));
                updateDeviceLayerControl();
            });
        }

        function addGridDevicesToMap(){
            var map = mapFactory.data.map;
            var deviceLayers = [
                mapFactory.data.devGroupSwitchOpen,
                mapFactory.data.devGroupSwitchClosed,
                mapFactory.data.devGroupALS,
                mapFactory.data.devGroupFuse,
                // mapFactory.data.devGroupTransformer,
                mapFactory.data.devGroupOther,
                mapFactory.data.smartDevAfs,
                // mapFactory.data.smartDevAfs,
                mapFactory.data.smartDevFci
                ];
                removeLayerGroupsFromMap(deviceLayers);
                deviceLayers.forEach(function (layer) {
                if(layer !==mapFactory.data.devGroupOther){
                    layer.addTo(map);
                }
            });
        }

        function removeLayerGroupsFromMap(layerArray){
            var map = mapFactory.data.map;
            layerArray.forEach(function(layer){
                if (map.hasLayer(layer)) {
                    map.removeLayer(layer);
                }
            })

        }

        /**
         * highlightSelectedFeeder()
         * When a user selects a feeder off of the Substation the selected feeder becomes more solid
         * other feeders and devices become more transparent
         */
        function highlightSelectedFeeder() {

            var deviceLayers = [mapFactory.data.devGroupSwitchOpen, mapFactory.data.devGroupSwitchClosed, mapFactory.data.devGroupALS,
                mapFactory.data.devGroupFuse, mapFactory.data.devGroupOther, mapFactory.data.smartDevAfs, mapFactory.data.smartDevFci];

            mapFactory.data.gridsLayer.eachLayer(function (layer) {
                var fdr = layer.options.feederNumber;
                if (areaF.data.mostSpecificSelectionType == 'feeder') {
                    if (fdr == areaF.data.mostSpecificSelection.name) {
                        layer.options.opacity = 1;
                        layer.options.color = "#003bff";
                        //getFeederBounds(fdr);
                        // console.log('line options', layer.options);
                    } else {
                        layer.options.opacity = 0.1;
                        layer.options.color = layer.options.fdrColor;
                    }
                } else {
                    layer.options.color = layer.options.fdrColor;
                    layer.options.opacity = 1;
                }
            });

            deviceLayers.forEach(function (layer) {
                    layer.eachLayer(function (marker) {
                        hideOtherFdrDevices(marker);
                });

            });

            if (areaF.data.mostSpecificSelectionType == 'feeder') {
                addGridDevicesToMap();
            }if (areaF.data.mostSpecificSelectionType == 'sub'){
                console.log('REMOVE');
                removeLayerGroupsFromMap(deviceLayers);
            }
            mapFactory.data.gridsLayer.removeFrom(mapFactory.data.map);
            mapFactory.data.gridsLayer.addTo(mapFactory.data.map);
        }

        function hideOtherFdrDevices(marker){
            // console.log('hideOtherFdrDevices');
            // console.log(areaF.data.mostSpecificSelectionType);
            if (areaF.data.mostSpecificSelectionType == 'feeder') {
                if (marker.options.feederNumber == areaF.data.mostSpecificSelection.name) {
                    marker.options.opacity = 1;
                } else {
                    marker.options.opacity = 0.1;
                }
            } else {
                marker.options.opacity = 1;
            }
        }

        function getFeederBounds(feederName) {
            var fdrLayer;
            mapFactory.data.gridsLayer.eachLayer(function (layer) {
                if (layer.options.feederNumber == controlPanelSelection.data.mostSpecificSelection.name) {
                    fdrLayer = layer;
                }
            });
            //console.log(fdrLayer.getBounds());
            return fdrLayer.getBounds();
        }

        function updateDeviceLayerControl() {
            mapFactory.data.mapLayerControl.remove();
            mapFactory.data.mapLayerControl = L.control.groupedLayers(null, mapFactory.data.deviceOverlays);
            mapFactory.data.mapLayerControl.addTo(mapFactory.data.map);
            mapFactory.data.mapLayerControl._container.className += ' leaflet-grid-devices-control';
            $.unblockUI();
        }

        function getDevicesAndDraw() {
            var selectionType = areaF.data.mostSpecificSelectionType,
                selectionIdentifier = areaF.getDataIdentifierByType(selectionType);

            DataModel.getDevice(selectionType, selectionIdentifier).then(function (data) {
                drawDevices(data);
            });

            //fciF.getParentsFromData(fciF.getDataFromServer());

        }

        function initiateFCIFaultDrawing() {
            //make sure zindexoffset is set above that of regular AFS & FCI
            clearFciFaults();
            // mapFactory.data.overlays.Devices.AFS = [];
            // mapFactory.data.overlays.Devices.FCI = [];
            var afsArray = [];
            var fciArray = [];
            var selectionType = areaF.data.mostSpecificSelectionType,
                selectionIdentifier = areaF.getDataIdentifierByType(selectionType);

            // DataModel.getDevice(selectionType, selectionIdentifier).then(function (data) {
                var thisIcon;
                // _.forEach(data.afs, function (afs) {
                //     if (afs.type == "Scada-mate") {
                //         thisIcon = mapFactory.data.iAScada;
                //     }
                //     if (afs.type == "INTELLIRUPTER") {
                //         thisIcon = mapFactory.data.iAIntel;
                //     }
                //     if (data) {
                //         // thisIcon = iAG;
                //         _.forEach(data, function (d) {
                //             if (d.type === 'AFS' && d.info[0] === afs.switch)
                //                 thisIcon = mapFactory.data.iA;
                //         });
                //     }
                //     var e1 = L.marker([afs.latitude, afs.longitude], {
                //         icon: thisIcon,
                //         zIndexOffset: mapFactory.data.topIndex - 200,
                //         alt: afs.switch
                //     })
                //         .on('mouseover', function (e) {
                //             popup = L.popup()
                //                 .setLatLng(e.latlng)
                //                 .setContent('<h3>AFS</h3>'
                //                     + '<hr><b>Switch:</b> ' + afs.switch
                //                     + '<br><b>Type:</b> ' + afs.type
                //                     + '<br><b>Function:</b> ' + afs.deviceFunction)
                //                 .openOn(mapFactory.data.map)
                //                 .on('mouseout', function (e) {
                //                     mapFactory.data.map.closePopup(popup);
                //                 });
                //         });
                //     afsArray.push(e1);
                // });

                //TODO redo this as a for geoJSON onEachProperty
                _.forEach(fciF.data.devices, function (fci) {
                    thisIcon = mapFactory.data.iF;
                    if(fci.properties.hasFaults == true){
                        var content = '<h3>FCI</h3>' + '<b>FPL ID: </b> ' + fci.properties.fplID + '<br /><b>Switch: </b> ' + fci.properties.switch;
                        //future: add TLN #, Phase

                        var lat= fci.geometry.coordinates[1];
                        var lng = fci.geometry.coordinates[0];
                        var mkr = L.marker([lat, lng], {
                            icon: thisIcon,
                            zIndexOffset: mapFactory.data.topIndex + 200,
                            alt: fci.switchNumber
                        }).bindPopup(content);
                        fciArray.push(mkr);
                    }
                });

                // mapFactory.data.invesGroupALS = L.layerGroup(afsArray, {makeBoundsAware: true, minZoom: 12});
                // mapFactory.data.invesGroupALS.addTo(mapFactory.data.map);
                // if (afsArray.length) {
                //     mapFactory.data.groupedOverlays["Smart Devices"]["<img src='images/icon_afs.svg' height='15'/> AFS"] = mapFactory.data.invesGroupALS;
                // }
                // console.log('array', fciArray);
                mapFactory.data.invesGroupFCI = L.layerGroup(fciArray, {makeBoundsAware: true, minZoom: 12});
                mapFactory.data.invesGroupFCI.addTo(mapFactory.data.map);

                mapFactory.data.groupedOverlays["Smart Device Faults"] = {};
                if (fciArray.length) {
                    mapFactory.data.groupedOverlays["Smart Device Faults"]["<img src='images/icon_fci.svg' height='15'/> FCI"] = mapFactory.data.invesGroupFCI;
                }

                refreshInvesLayerControl();
            // });

        }

        function initiateClearFciFaults(){
            clearFciFaults();
        }

        function clearFciFaults(){
            removeLayerGroupsFromMap([mapFactory.data.invesLineTrace, mapFactory.data.invesGroupALS, mapFactory.data.invesGroupFCI]);
            mapFactory.data.invesGroupALS = L.featureGroup([], {makeBoundsAware: true, minZoom:12});
            mapFactory.data.invesGroupFCI = L.featureGroup([], {makeBoundsAware: true, minZoom:12});
            
            delete mapFactory.data.groupedOverlays["Smart Device Faults"];
            refreshInvesLayerControl();
        }

        function drawDevices(devices) {
            clearDevices();
            // console.log('draw smart devices');
            mapFactory.data.overlays.Devices.AFS = [];
            var tempArrayFCI = [];
            var thisIcon;
            // console.log(devices);
            _.forEach(devices.afs, function (afs) {
                //thisIcon = mapFactory.data.iA;
                //TODO change icon based on AFS type
                if (afs.type == "Scada-mate") {
                    thisIcon = mapFactory.data.iAG;
                }
                if (afs.type == "INTELLIRUPTER") {
                    thisIcon = mapFactory.data.iAIntelG;
                }
                //console.log(afs);
                if (devices) {
                    // thisIcon = iAG;
                    _.forEach(devices, function (d) {
                        if (d.type === 'AFS' && d.info[0] === afs.switch)
                            thisIcon = mapFactory.data.iA;
                    });
                }
                var content = '<h3>AFS</h3>'
                    + '<hr><b>Switch:</b> ' + afs.switch
                    + '<br><b>Type:</b> ' + afs.type
                    + '<br><b>Function:</b> ' + afs.deviceFunction;
                var e1 = L.marker([afs.latitude, afs.longitude], {
                    icon: thisIcon,
                    zIndexOffset: mapFactory.data.topIndex - 100,
                    alt: afs.switch,
                    fplID: afs.fpl_id,
                    feederNumber: afs.feeder,
                    type: afs.type
                })
                    .bindPopup(content);
                mapFactory.data.overlays.Devices.AFS.push(e1);
            });
            _.forEach(devices.fci, function (fci) {
                thisIcon = mapFactory.data.iF;
                if (devices) {
                    thisIcon = mapFactory.data.iFG;
                    _.forEach(devices, function (d) {
                        if (d.type === 'FCI' && d.info === fci.SWITCH_NUM)
                            thisIcon = mapFactory.data.iF;
                    });
                }
                var e1 = L.marker([fci.latitude, fci.longitude], {
                    icon: thisIcon,
                    zIndexOffset: mapFactory.data.topIndex,
                    alt: fci.SWITCH_NUM,
                    fplID: fci.P_fplid,
                    feederNumber: fci.feeder
                });
                e1.bindPopup('<h3>FCI</h3>' + '<hr><b>Switch:</b> ' + fci.SWITCH_NUM + '<br><b>FPL ID:</b> ' + fci.P_fplid);
                tempArrayFCI.push(e1);
                // mapFactory.data.overlays.Devices.FCI.push(e1);
            });
            // mapFactory.data.groupedOverlays["Grid"] = {};
            // console.log(tempArrayFCI);
            mapFactory.data.smartDevAfs = L.layerGroup(mapFactory.data.overlays.Devices.AFS, {makeBoundsAware: true, minZoom: 13});
            // mapFactory.data.devGroupFci = L.layerGroup(tempArrayFCI, { makeBoundsAware: true,minZoom: 13})//.addTo(mapFactory.data.map);

            // if (areaF.data.mostSpecificSelectionType =='feeder'){
            // mapFactory.data.smartDevAfs.addTo(mapFactory.data.map);
            // mapFactory.data.devGroupFci.addTo(mapFactory.data.map);
            // }

            if (mapFactory.data.overlays.Devices.AFS.length) {
                mapFactory.data.deviceOverlays["Smart Devices"]["<img src='images/icon_afs.svg' height='15'/> AFS"] = mapFactory.data.smartDevAfs;
            }

            // if (tempArrayFCI.length) {
            //     mapFactory.data.deviceOverlays["Smart Devices"]["<img src='images/icon_fci.svg' height='15'/> FCI"] = mapFactory.data.devGroupFci;
            // }
            // updateDeviceLayerControl();
        }

        function drawLine(asset, colorList, feederHash) {
            var color;
            // var dash=null;
            var weight = 3;
            var opacity = 0.5;
            var fdrNum = asset.feederName;

            if (fdrNum in feederHash) {
                color = feederHash[asset.feederName];
            } else {
                color = colorList[_.size(feederHash)];
                feederHash[fdrNum] = color;
            }
            //fix points (x y reversed)
            _.forEach(asset.points, function (pt) {
                var temp = pt[0];
                pt[0] = pt[1];
                pt[1] = temp;
            });

            //var lineOptions = { "color": color, "fdrindex":_.size(feederHash)-1, "dashArray":dash,"weight":weight, "opacity":opacity};
            // return lineOptions;
            var line = L.polyline(asset.points, {
                "color": color,
                "feederNumber": fdrNum,
                "weight": weight,
                "opacity": opacity
            });//.bindPopup('feederNumber: '+fdrNum);
            return line;

        }

        function drawNode(asset, countData) {
            // console.log(asset);
            var points = []; // = asset.points[0];
            // fix points (x y reversed)
            points[0] = asset.points[0][1];
            points[1] = asset.points[0][0];
            var marker = null;
            var currentYear = new Date().getFullYear();
            var lastYear = (new Date().getFullYear() - 1);
            //TODO ask Alex what the icons array is for
            // $scope.icons.push({x: points[0], y: points[1], id: asset.id});
            switch (asset.type) {
                case 'Feeder':
                    marker = L.marker(points, {
                        icon: mapFactory.data.iconFeederHead,
                        zIndexOffset: mapFactory.data.gridIndex
                    });//.addTo($scope.map);
                    marker.bindPopup('FPL ID: ' + asset.fplID).openPopup();
                    return marker;
                case 'Switch - Open':
                    marker = L.marker(points, {
                        icon: mapFactory.data.iconSwitchOpen,
                        zIndexOffset: mapFactory.data.gridIndex + 1,
                        feederNumber: asset.feederName,
                        fplID: asset.fplID
                    });
                    //add to popup when we have the data - 'Normal Open: '+ asset.normalOpen
                    if (asset.fplClass == 'regulator') {
                        marker = L.marker(points, {
                            icon: mapFactory.data.iconRegulator,
                            zIndexOffset: mapFactory.data.gridIndex,
                            feederNumber: asset.feederName,
                            fplID: asset.fplID
                        });
                        return marker;
                    }
                    var content = 'FPL ID: ' + asset.fplID + '<br /> fpl Class: ' + asset.fplClass;
                    // content+= '<br /><button onClick="setAsCauseLocation('+asset.fplID+')">test button</button> <button onClick="popUpTest()">Other</button>';
                    marker.bindPopup(content).openPopup();
                    return marker;
                case 'Switch - Closed':
                    marker = L.marker(points, {
                        icon: mapFactory.data.iconSwitchClosed,
                        zIndexOffset: mapFactory.data.gridIndex + 1,
                        feederNumber: asset.feederName,
                        fplID: asset.fplID
                    });
                    var content = 'FPL ID: ' + asset.fplID + '<br /> fpl Class: ' + asset.fplClass;
                    //add to popup when we have the data - 'Normal Open: '+ asset.normalOpen
                    if (asset.fplClass == 'regulator') {
                        marker = L.marker(points, {
                            icon: mapFactory.data.iconRegulator,
                            zIndexOffset: mapFactory.data.gridIndex,
                            feederNumber: asset.feederName,
                            fplID: asset.fplID
                        });
                        return marker;
                    }
                    marker.bindPopup(content).openPopup();
                    return marker;
                case 'Jumper':
                    marker = L.marker(points, {
                        icon: mapFactory.data.iconJumper,
                        zIndexOffset: mapFactory.data.gridIndex,
                        feederNumber: asset.feederName,
                        fplID: asset.fplID
                    });
                    marker.bindPopup('FPL ID: ' + asset.fplID).openPopup();
                    return marker;
                case 'Breaker':
                    marker = L.marker(points, {
                        icon: mapFactory.data.iconRecloser,
                        zIndexOffset: mapFactory.data.gridIndex,
                        feederNumber: asset.feederName,
                        fplID: asset.fplID
                    });
                    var content = 'FPL ID: ' + asset.fplID + '<br /> fpl Class: ' + asset.fplClass;
                    marker.bindPopup(content).openPopup();
                    return marker;
                case 'Compensator':
                    marker = L.marker(points, {
                        icon: mapFactory.data.iconCapacitor,
                        zIndexOffset: mapFactory.data.gridIndex,
                        feederNumber: asset.feederName,
                        fplID: asset.fplID
                    });
                    var content = 'FPL ID: ' + asset.fplID + '<br /> fpl Class: ' + asset.fplClass;
                    marker.bindPopup(content).openPopup();
                    return marker;
                // case 'regulator':
                //     marker = L.marker(points, { icon: mapFactory.data.iconRegulator, zIndexOffset: mapFactory.data.gridIndex,feederNumber:asset.feederName, fplID:asset.fplID });
                //     return marker;
                // case 'TransformerWinding':
                //     marker = L.marker(points, { icon: mapFactory.data.iconTransformerWinding, zIndexOffset: mapFactory.data.gridIndex });
                //     console.log(asset.type);
                case 'Fuse':
                    if (asset.assetType == "TS2") {
                        countData[0].forEach(function (count) {
                            if (count.ts_parent_fpl_id.toString() == asset.fplAltID) {
                                asset.counts = count;
                            }
                        });
                        var content;
                        if (asset.counts) {
                            content = '<strong>Feeder:</strong>: ' + asset.feederName +
                                '<br /><strong>FPL ID</strong>: ' + asset.counts.ts_parent_fpl_id +
                                '<table class="txt-center" style="margin-right:15px;"><thead><tr>' +
                                '<th>Phase</th><th>A</th>        <th>B</th>     <th>C</th></tr></thead>' +
                                '<tbody>' +
                                '<tr><td><strong>' + currentYear + '</strong></td>  <td>' + asset.counts.aYTDCurrent + '</td>   <td>' + asset.counts.bYTDCurrent + '</td> <td>' + asset.counts.cYTDCurrent + '</td> </tr>' +
                                '<tr><td><strong>' + lastYear + '</strong></td>  <td>' + asset.counts.aYTDPrev + '</td>   <td>' + asset.counts.bYTDPrev + '</td> <td>' + asset.counts.cYTDPrev + '</td> </tr>' +
                                '</tbody></table>';
                        } else {
                            content = '<strong>Feeder: </strong>' + asset.feederName +
                                '<br /><strong>FPL ID</strong>: ' + asset.fplAltID +
                                '<br />no count data for this ALS';
                        }

                        marker = L.marker(points, {
                            icon: mapFactory.data.iconALSDrk, zIndexOffset: mapFactory.data.gridIndex + 100,
                            feederNumber: asset.feederName, fplID: asset.fplID, parentID: asset.fplAltID,
                            fuseType: asset.assetType,
                            events: [],
                            origContent: content
                        }).bindPopup(content, {maxHeight: 400, maxWidth: 300});
                        if (asset.counts) {
                            marker.options.aYTD = asset.counts.aYTDCurrent;
                            marker.options.aPrev = asset.counts.aYTDPrev;
                            marker.options.bYTD = asset.counts.bYTDCurrent;
                            marker.options.bPrev = asset.counts.bYTDPrev;
                            marker.options.cYTD = asset.counts.cYTDCurrent;
                            marker.options.cPrev = asset.counts.cYTDPrev;
                        }
                        //mapFactory.data.devGroupALS.addLayer(marker);
                        return marker;

                    } else {
                        marker = L.marker(points, {
                            icon: mapFactory.data.iconFuse,
                            zIndexOffset: mapFactory.data.gridIndex,
                            feederNumber: asset.feederName,
                            fplID: asset.fplID
                        });
                        //mapFactory.data.devGroupFuse.addLayer(marker);
                        marker.bindPopup('FPL ID: ' + asset.fplID).openPopup();
                        return marker;
                    }
                    break;

                default:
                    marker = L.marker(points, {
                        icon: mapFactory.data.iconOther,
                        zIndexOffset: mapFactory.data.gridIndex,
                        feederNumber: asset.feederName,
                        fplID: asset.fplID
                    })
                        .bindPopup(asset.type + '<br/>FPL ID: ' + asset.fplID).openPopup();
                    return marker;
            }
        }

        function initiateALSInvestigationDrawing() {
            // console.log('als Ding');
            alsEventsF.getDataFromServer().then(function () {
                updateALSMarkers(alsEventsF.data.alsMapping);
            });
        }

        function initiateALSInvestigationClear() {
            clearALSMarkers();
        }

        function updateALSMarkers(data) {
            // console.log('ALS Markers ');
            // console.log(data);
            // console.log('grid markers', mapFactory.data.devGroupALS._layers);
            //get mapped ALS icons
            clearALSMarkers();
            var alsEvents = data;
            var array = [];
            if (areaF.data.mostSpecificSelectionType == 'feeder') {
                alsEvents = data.filter(
                    function (item) {
                        return item.feeder == areaF.data.mostSpecificSelectionIdentifier;
                    }
                );
            }
            alsEvents.forEach(function (result) {

                var id = result.ts_parent_fpl_id;
                var content='';
                var marker = L.marker([result.lat, result.lng]);
                // var marker = L.marker(fuse._latlng);

                mapFactory.data.devGroupALS.eachLayer(function (fuse) {
                    if (fuse.options.parentID == id) {
                        marker.options = fuse.options;
                        content = fuse.options.origContent.replace("</tbody></table>", "");
                        // console.log('options', fuse.options);
                    }else{
                    }

                });
                if (content ==''){
                    content+='<strong>Feeder:</strong>: ' + result.feeder +
                        '<br /><strong>FPL ID</strong>: ' + result.ts_parent_fpl_id +
                        '<table class="txt-center" style="margin-right:15px;"><thead><tr>' +
                        '<th>Phase</th><th>A</th>        <th>B</th>     <th>C</th></tr></thead>' +
                        '<tbody>'
                }
                marker.options.events = result.events;
                marker.options.icon = mapFactory.data.iconALS;
                marker.options.zIndexOffset = 5000;
                marker.options.events.forEach(function (ev) {
                    content += '<tr class="grey1">' +
                        '<td><strong>' + ev.EventDay + '</strong></td>' +
                        '<td>' + ev.countA + '</td>' +
                        '<td>' + ev.countB + '</td>' +
                        '<td>' + ev.countC + '</td>' + '</tr>'
                });
                content += '</tbody></table>';
                marker.bindPopup(content);
                array.push(marker);
            });
            // console.log('ALS Markers ', array);

            mapFactory.data.invesGroupALS = L.featureGroup(array, {makeBoundsAware: true, minZoom: 12});
            console.log(mapFactory.data.invesGroupALS);
            mapFactory.data.invesGroupALS.addTo(mapFactory.data.map);
            console.log();

            mapFactory.data.groupedOverlays["Smart Dev Events"]={};
            addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Smart Dev Events', mapFactory.data.overlays.ALS,
                '<img src="../images/icon_ALS.svg" class="legendIcon" style="height:20px;"/> ALS');

            mapFactory.data.groupedMapLayerControl.remove();
            mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
            // mapFactory.data.groupedMapLayerControl.addTo(mapFactory.data.map);
            // mapFactory.data.groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";
            addGroupedLayerControlIfNotEmpty();
        }

        function clearALSMarkers() {
            if (mapFactory.data.invesGroupALS !== null) {
                mapFactory.data.invesGroupALS.removeFrom(mapFactory.data.map);
                mapFactory.data.invesGroupALS.clearLayers();
            }
        }

        function setBounds() {
            // sets map size, then for sub/feeder draws grid and devices
            var selectionType = areaF.data.mostSpecificSelectionType,
                selection = areaF.data.mostSpecificSelection,
                mapBoundingBox = [];
            if (selectionType === null || selectionType === '') {
                mapBoundingBox = [[30.52441, -83.86963], [25.0856, -79.14551]];
            }
            else if (selectionType === 'ma') {
                mapBoundingBox = selection.bbox;
                // mapBoundingBox = selection.leafletPoly.getBounds();
            }
            else if (selectionType === 'sc') {
                mapBoundingBox = selection.bbox;
                //AJH added selectionType==null/"ALL" selection in SVC - change to MA bbox
                if (selection._id === null || selection._id === 'All') {
                    mapBoundingBox = controlPanelSelection.data.selectedManagementArea.bbox;
                }

            }
            else if (selectionType === 'sub') {
                mapBoundingBox = [[selection.sub.tly, selection.sub.tlx], [selection.sub.bry, selection.sub.brx]];

            }
            else if (selectionType === 'feeder') {
                mapBoundingBox = [[selection.tly, selection.tlx], [selection.bry, selection.brx]];
            }

            if (mapBoundingBox === null) {
                alert('unrecognized selection');
            }
            else {
                mapFactory.data.map.fitBounds(mapBoundingBox);
            }
            //console.log('set ' +selection._id);
            var zoomLevel = mapFactory.data.map.getZoom();
            // deviceZoom(zoomLevel);
        }

        function clearDevices() {
            // _.forEach(mapFactory.data.overlays.Devices, function(layer) {$scope.map.removeLayer(layer);});
            //$scope.map.removeLayer(mapFactory.data.smartDev);
            if (mapFactory.data.map.hasLayer(mapFactory.data.smartDevAfs)) {
                mapFactory.data.smartDevAfs.clearLayers();
                // console.log('clear afs');
                // console.log(mapFactory.data.overlays.Devices.AFS);
                mapFactory.data.overlays.Devices.AFS = [];
            }
            if (mapFactory.data.map.hasLayer(mapFactory.data.devGroupFci)) {
                mapFactory.data.devGroupFci.clearLayers();
                mapFactory.data.overlays.Devices.FCI = [];
            }
            mapFactory.data.deviceOverlays["Smart Devices"] = {};
        }

        function clearGrid() {
            // console.log('Clear Grid');
            if (mapFactory.data.deviceArr.length >= 1) {
                //map.eachLayer(function (layer) {if (layerGroup){$scope.map.removeLayer(layer)}});
                //var myVar =  mapFactory.data.map.removeLayer(mapFactory.data.gridsLayer);

                var removeLayers = [
                    mapFactory.data.gridsLayer,
                    mapFactory.data.deviceLayer,
                    mapFactory.data.deviceLayer14,
                    // mapFactory.data.deviceLayer15,
                    // mapFactory.data.deviceLayer16,
                    mapFactory.data.deviceLayer17,
                    mapFactory.data.smartDev,
                    mapFactory.data.devGroupSwitchOpen,
                    mapFactory.data.devGroupSwitchClosed,
                    mapFactory.data.devGroupALS,
                    mapFactory.data.devGroupFuse,
                    mapFactory.data.devGroupOther
                ];
                removeLayersFromMap(mapFactory.data.map, removeLayers);

                mapFactory.data.overlays.Devices = [];
                mapFactory.data.deviceOverlays["Grid"] = [];
                mapFactory.data.deviceArr = [];
                mapFactory.data.deviceArr14 = [];
                // mapFactory.data.deviceArr15 = [];
                // mapFactory.data.deviceArr16 = [];
                mapFactory.data.deviceArr17 = [];
                fdrSpans = [];


                /**TODO AJH for clean up change all layerGroup clearing to mapFactory.data.LAYER.clearLayers();
                 * in mapfactory add to all initiated Layer groups {makeBoundsAware: true, minZoom:XX}
                 * Will then be able to remove the related zoom show/hide function.
                 */
                mapFactory.data.smartDev = L.layerGroup(mapFactory.data.overlays.Devices); //AFS FCI
                mapFactory.data.deviceLayer = L.layerGroup(mapFactory.data.deviceArr);
                mapFactory.data.deviceLayer14 = L.layerGroup(mapFactory.data.deviceArr14);
                // mapFactory.data.deviceLayer15 = L.layerGroup(mapFactory.data.deviceArr15);
                // mapFactory.data.deviceLayer16 = L.layerGroup(mapFactory.data.deviceArr16);
                mapFactory.data.deviceLayer17 = L.layerGroup(mapFactory.data.deviceArr17);
                mapFactory.data.gridsLayer = L.layerGroup(fdrSpans);
                mapFactory.data.devGroupSwitchOpen = L.layerGroup();
                mapFactory.data.devGroupSwitchClosed = L.layerGroup();
                mapFactory.data.devGroupFuse = L.layerGroup();
                mapFactory.data.devGroupALS = L.layerGroup();
                mapFactory.data.devGroupOther = L.layerGroup();
            }
        }

        function clearFaults() {

            //AJHEdit START ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            //modified to suit new drawfaults.
            //_.forEach($scope.mapFactory.data.faultMap, function (layer) { $scope.map.removeLayer(layer); });
            if (mapFactory.data.faultMap) {
                mapFactory.data.map.removeLayer(mapFactory.data.faultMap);
            }
            //AJHEdit End ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
            mapFactory.data.faultMap = [];
        }

        function populateColorPointsWithFaultData(fault, colorPoints) {
            fault.segments.forEach(function (segment) {
                var color = segment.color;
                var options = {color: color, opacity: 0.8, weight: 5};
                colorPoints.push(L.polyline(segment.points, options).bindPopup('id: ' + segment.sect));
                //+'<br />points: '+segment.points
                //ajh Makes each color a single line group
                // if (segment.color === "Yellow") {	colorPoints.yellowPoints.push(segment.points);	}
                // if (segment.color === "Orange") { 	colorPoints.orangePoints.push(segment.points);	}
                // if (segment.color === "Red")	{ 	colorPoints.redPoints.push(segment.points);
            });
            return colorPoints
        }

        function drawLinesToMapWithColorPoints(colorPoints, deviceMarker) {
            clearFaults();
            // console.log(deviceMarker);
            //add polylines to $scope.mapFactory.data.faultMap, add it to the map, and re-center the map on the mapFactory.data.faultMap.
            //mapFactory.data.faultMap = L.featureGroup([yelLine, orLine, redLine]);
            mapFactory.data.faultMap = L.featureGroup(colorPoints);
            if (deviceMarker !== null || deviceMarker !==[]) {
                deviceMarker.forEach(function(dev){
                    // for (var i = 0; i < deviceMarker.length; i++) {
                    //     if (dev !== undefined || dev !== null) {
                            // console.log('nothing!');
                    if (dev._latlng !== undefined) {
                            mapFactory.data.faultMap.addLayer(dev);
                        }

                        // }
                        // else {
                        //     mapFactory.data.faultMap.addLayer(deviceMarker[i]);
                        // }
                    // }
                });

            }
            mapFactory.data.faultMap.addTo(mapFactory.data.map);
            mapFactory.data.map.fitBounds(mapFactory.data.faultMap.getBounds());
            //console.log(mapFactory.data.faultMap);
        }

        function drawFault(fault) {
            var colorPoints = [];
            // var colorPoints = {yellowPoints: [],orangePoints: [],redPoints: []};
            var devMarker = [];
            if (fault.combinedFault) {
                colorPoints = lineSegmentsToPolyline(generateCombinedFaultMap(fault.groupedF));
                //populateColorPointsWithFaultData(generateCombinedFaultMap(fault.groupedF), colorPoints);
                fault.groupedF.forEach(function (grouped) {
                    devMarker.push(getFaultDevicePoint(grouped))
                });
            } else {
                populateColorPointsWithFaultData(fault, colorPoints);
                devMarker.push(getFaultDevicePoint(fault));
                // console.log('single  ', colorPoints[0]);
            }
            // colorPoints = populateColorPointsWithFaultData(fault, colorPoints);
            //console.log(colorPoints);
            // var devMarker = [getFaultDevicePoint(fault)];
            drawLinesToMapWithColorPoints(colorPoints, devMarker);
        }

        function drawFaults(faults) {
            // console.log('faults ',faults);
            //in map factory - create true/false for marker map/heat map
            if (!mapFactory.data.showHeatMap) {
                var colorPoints = [];
                var devMarker = [];

                faults.forEach(function (fault) {
                    if (fault.isActive) {
                        if (fault.combinedFault) {
                            colorPoints = lineSegmentsToPolyline(generateCombinedFaultMap(fault.groupedF));
                            //populateColorPointsWithFaultData(generateCombinedFaultMap(fault.groupedF));
                            fault.groupedF.forEach(function (cfault) {
                                // console.log(cfault);
                                var dev = getFaultDevicePoint(cfault);
                                if(dev !== undefined){
                                    devMarker.push(getFaultDevicePoint(cfault));
                                }
                            });
                            // console.log('combined  ', cfault);
                        } else {
                            populateColorPointsWithFaultData(fault, colorPoints);
                            devMarker.push(getFaultDevicePoint(fault));
                            // console.log('single  ', fault);
                        }
                        
                        //DataModel.getLinesToEnd(highestFci.fplID).then(function(data){}
                    }
                });
                drawLinesToMapWithColorPoints(colorPoints, devMarker);
            } else {
                drawFaultHeatMap(faults);
            }
        }

        function getFaultDevicePoint(fault) {
            // console.log('fault', fault);
            // console.log('smart devices', gridDemoF.data.smartDevs);
            var icon;
            if (fault.devices[0].type === "FCI" || fault.devices[0].type === "AFS") {
                var devType = fault.devices[0].type;
                if (fault.devices[0].type === "FCI"){
                    icon = mapFactory.data.iFHighlight;
                }
                if (fault.devices[0].type === "AFS") {
                    icon = mapFactory.data.iAHighlight;
                }
                //search mapFactory.data.overlays.Devices by alt key for fault.devices[0].info
                if (gridDemoF.data.smartDevs.length > 0) {
                    for (var i = 0; i < gridDemoF.data.smartDevs.length; i++) {
                        var device = gridDemoF.data.smartDevs[i];
                        if (device.properties.switch === fault.devices[0].info) {
                            console.log(device.properties);
                            fault.devices[0].latlng = [device.geometry.coordinates[1], device.geometry.coordinates[0]];
                            //add FPL id to the fault
                            fault.devices[0].fplID = gridDemoF.data.smartDevs[i].properties.fplID;
                            fault.devices[0].connectionLengthToFeederHead = gridDemoF.data.smartDevs[i].properties.connectionLengthToFeederHead;
                        }
                    }
                    // console.log('Latlng', fault.devices[0]);
                    var marker = L.marker(fault.devices[0].latlng, {
                        icon: icon,
                        zIndexOffset: 7000
                    }).bindPopup("<h5>Switch#: " + fault.devices[0].info + "</h5>Fault ID: " + fault.id);
                    return marker;
                }
                else if (fault.devices[0].type === "Breaker") {
                    //breaker is at the substation
                    //fault.devices[0].info is the feeder number....
                    //search current mapFactory.data.devGroupOther for same latlong?
                    return undefined;
                }

            }
        }
        
            // TODO AJH-Should be taken care of with new minZoom and MaxZoom properties on layerGroups/Featuregroups should be able to remove
        function deviceZoom(zoomLevel) {
                // console.log(mapFactory.data.map.getZoom());

                var removeLayers = [];
                var addLayers = [];
                //console.log(mapFactory.data.map);
                // console.log(mapFactory.data.devGroupSwitchOpen);
                if (zoomLevel < 13) {//hide
                    addLayers = [
                        // mapFactory.data.deviceLayer,
                        mapFactory.data.smartDev
                    ];
                    removeLayers = [
                        mapFactory.data.deviceLayer14,
                        //mapFactory.data.deviceLayer15,
                        // mapFactory.data.devGroupSwitchOpen,
                        // mapFactory.data.devGroupSwitchClosed,
                        // mapFactory.data.devGroupFuse,
                        // mapFactory.data.devGroupOther,
                        //mapFactory.data.deviceLayer16,
                        // mapFactory.data.devGroupTransformer,
                        mapFactory.data.deviceLayer17
                    ];
                }
                else if (zoomLevel == 13) {//show
                    addLayers = [
                        // mapFactory.data.deviceLayer,
                        // mapFactory.data.smartDev,
                        // mapFactory.data.smartDevAfs,
                        // mapFactory.data.smartDevFci,
                        mapFactory.data.deviceLayer14
                    ];
                    removeLayers = [
                        //mapFactory.data.deviceLayer15,
                        // mapFactory.data.devGroupSwitchOpen,
                        // mapFactory.data.devGroupSwitchClosed,
                        // mapFactory.data.devGroupFuse,
                        // mapFactory.data.devGroupOther,
                        //mapFactory.data.deviceLayer16,
                        //mapFactory.data.devGroupTransformer,
                        mapFactory.data.deviceLayer17
                    ];
                }
                else if (zoomLevel == 14) {//show

                    addLayers = [
                        // mapFactory.data.deviceLayer,
                        // mapFactory.data.smartDev,
                        // mapFactory.data.smartDevAfs,
                        // mapFactory.data.smartDevFci,
                        mapFactory.data.deviceLayer14
                        //mapFactory.data.deviceLayer15
                    ];
                    removeLayers = [
                        // mapFactory.data.devGroupSwitchOpen,
                        // mapFactory.data.devGroupSwitchClosed,
                        // mapFactory.data.devGroupFuse,
                        // mapFactory.data.devGroupOther,
                        //mapFactory.data.deviceLayer16,
                        //mapFactory.data.devGroupTransformer,
                        mapFactory.data.deviceLayer17
                    ];
                }
                else if (zoomLevel == 15) {//show
                    addLayers = [
                        // mapFactory.data.deviceLayer,
                        // mapFactory.data.smartDev,
                        mapFactory.data.smartDevAfs,
                        mapFactory.data.smartDevFci,
                        mapFactory.data.deviceLayer14
                        // mapFactory.data.devGroupSwitchOpen
                        //mapFactory.data.deviceLayer15
                    ];
                    removeLayers = [
                        // mapFactory.data.devGroupSwitchClosed,
                        // mapFactory.data.devGroupFuse,
                        // mapFactory.data.devGroupOther,
                        // mapFactory.data.deviceLayer16,
                        //mapFactory.data.devGroupTransformer,
                        mapFactory.data.deviceLayer17
                    ];
                    //console.log(mapFactory.data.mapLayerControl);
                }
                else if (zoomLevel == 16) {
                    addLayers = [
                        // mapFactory.data.deviceLayer,
                        // mapFactory.data.smartDev,
                        // mapFactory.data.smartDevAfs,
                        // mapFactory.data.smartDevFci,
                        mapFactory.data.deviceLayer14
                        //mapFactory.data.deviceLayer15,
                        // mapFactory.data.devGroupSwitchOpen,
                        // mapFactory.data.devGroupSwitchClosed,
                        // mapFactory.data.devGroupOther
                        //mapFactory.data.deviceLayer16,
                        //mapFactory.data.devGroupTransformer
                    ];
                    removeLayers = [

                        // mapFactory.data.devGroupFuse,
                        mapFactory.data.deviceLayer17
                    ];
                    //     //console.log('Switches');
                }
                else if (zoomLevel == 17) {
                    addLayers = [
                        // mapFactory.data.deviceLayer,
                        // mapFactory.data.smartDev,
                        // mapFactory.data.smartDevAfs,
                        // mapFactory.data.smartDevFci,
                        mapFactory.data.deviceLayer14,
                        //mapFactory.data.deviceLayer15,
                        // mapFactory.data.devGroupFuse,
                        // mapFactory.data.devGroupOther,
                        // mapFactory.data.deviceLayer16,
                        //mapFactory.data.devGroupTransformer,
                        mapFactory.data.deviceLayer17
                    ];
                    //     removeLayers=[];
                    //     //console.log('Jumper | Breaker| Compensator');
                }
                removeLayersFromMap(mapFactory.data.map, removeLayers);
                addLayersToMap(mapFactory.data.map, addLayers);
            }

            //for matching fault line segments
        function setIdForFaultMap(lineSegment) {
                //lineSegment.fplId
            }

            /**
             * FAULT CONSOLIDATION Starts here: Functions used to create Leaflet object for Combined Fault maps
             */

            /**
             * lineSegmentsToPolyline(segArray)
             * Called in drawFaults
             * Pass the segments inside a fault, returns it as an array of leaflet polylines
             */
        function lineSegmentsToPolyline(segArray) {
                var tempArr = [];
                for (var x = 0; x < segArray.length; x++) {
                    tempArr.push(L.polyline(segArray[x].points, {
                        color: segArray[x].color,
                        // opacity: 0.7,
                        weight: 5
                    }).bindPopup('id: ' + segArray[x].sect + '\n value: ' + segArray[x].setValue));
                }
                return tempArr;
            }

        function getColorValue(color) {
                var pointsYel = 1;
                var pointsOr = 2;
                var pointsRed = 3;
                var colorPoints;
                if (color == "Yellow") {
                    colorPoints = pointsYel;
                } else if (color == "Orange") {
                    colorPoints = pointsOr;
                } else if (color == "Red") {
                    colorPoints = pointsRed;
                } else {
                    console.log('huh?')
                }
                //returns color
                return colorPoints;
            }

        function combineFaultSegmentArrs(arr, prop) {
                var combinedArray = [];
                arr.forEach(function (fault) {
                    for (var i = 0; i < fault[prop].length; i++) {
                        combinedArray.push(fault[prop][i]);
                    }
                });
                return combinedArray;
            }

//NOTE! segments.sect is a unique ID
//sortArrByProp('sect',combinedSegments);
        function sortArrByProp(arr, prop) {
//copied from StackOverflow
                prop = prop.split('.');
                var len = prop.length;

                arr.sort(function (a, b) {
                    var i = 0;
                    while (i < len) {
                        a = a[prop[i]];
                        b = b[prop[i]];
                        i++;
                    }
                    if (a < b) {
                        return -1;
                    } else if (a > b) {
                        return 1;
                    } else {
                        return 0;
                        //console.log('ding');
                    }
                });
                return arr;
            }

        function combineBySegment(array) {
                var tempArray = [];
                //color string becomes array of colors
                //compare 'sect' to next
                for (var x = 0; x < array.length; x++) {
                    var segment = array[x];
                    var sectionID = array[x].sect;
                    var filtered = tempArray.filter(function (item) {
                        return item.sect === sectionID
                    });
                    if (filtered.length === 0) {
                        //add segment to array
                        tempArray.push(segment);
                        segment.colors = [segment.color];
                    }
                    else {
                        //get matching segment
                        var segIndex = findWithAttr(tempArray, 'sect', sectionID);
                        tempArray[segIndex].colors.push(segment.color);
                    }
                }
                return tempArray;
            }

        function removeSegmentsByCountnColor(array, faultCount) {
                //TODO These Variables are "undefined" when put outside of this function
                var yelMin = 0.74;
                var orMin = 1.6;
                var redMin = 2.6;
                // console.log(faultCount);
                for (var x = 0; x < array.length; x++) {
                    var segment = array[x];
                    for (var y = 0; y < segment.colors.length; y++) {
                        var num = getColorValue(segment.colors[y]);
                        segment.setValue += num;
                    }
                    segment.setValue = segment.setValue / faultCount;
                    //don't need the array anymore
                    delete segment["colors"];
                    segment.setValue = 0;
                }
                var filtered = [];
                // var filtered = array.filter(function(item){ return item.setValue > yelMin });
                for (var x = 0; x < array.length; x++) {
                    var segment = array[x];
                    // if(segment.setValue >= yelMin){
                    if (segment.setValue >= yelMin && segment.setValue < orMin) {
                        segment.color = "Yellow";
                    }
                    else if (segment.setValue >= orMin && segment.setValue < redMin) {
                        segment.color = "Orange";
                    }
                    else if (segment.setValue >= redMin) {
                        segment.color = "Red";
                    }
                    filtered.push(array[x]);
                    // }
                    // console.log(segment.color);
                }
                // console.log('thing', filtered[100].setValue);
                // console.log('removeSegmentsByCountnColor  ', filtered.length);
                return filtered;
            }

            /**
             * generateCombinedFaultMap(fArray)
             * Called in drawFaults() for combined Faults.
             * fArray is an array of faults grouped together to be combined
             * This function gathers all of the segments from the faults,
             * calculates the values color of each line segment (depending on how many times each segment occurs in the various faults)
             * and returns the array to be mapped.
             */
        function generateCombinedFaultMap(fArray) {
                var count = 0;
                var combineArray = [];
                var combinedSegments = [];
                var combinedFaultMap = [];
                //TODO if FCI strip out segments not in Traceback array
                    //to recieve list of line segments downstream of most downstream device.
                    //do not add any line segments that are not in that array.

                // console.log('array ', fArray[0].segments[0].sect,'  :',fArray[0].segments[0].setValue );
                fArray.forEach(function (fault) {
                    for (var i = 0; i < fault.segments.length; i++) {
                        fault.segments[i].setValue = undefined;
                    }
                });
                fArray.forEach(function (fault) {
                    if (fault.includeFault) {
                        count++;
                        combineArray.push(fault);
                    }
                });
                var combinedSegments = sortArrByProp(combineFaultSegmentArrs(combineArray, 'segments'), 'sect');
                var combinedFaultMap = combineBySegment(combinedSegments);
                combinedFaultMap = removeSegmentsByCountnColor(combinedFaultMap, count);
                return combinedFaultMap;
            }

        function findWithAttr(array, attr, value) {
                for (var i = 0; i < array.length; i += 1) {
                    if (array[i][attr] === value) {
                        return i;
                    }
                }
                return -1;
            }

        function getAllEventsForHeatMap() {
                //save arrays
                //set true/false for checkboxes
                var lightningArray = [];
                var fciEventsArray = [];
                var troubleTicketArray = [];
                var vinesArray = [];
                var palmBambooArray = [];
                var openCaArray = [];
                var allArrays = [lightningArray, fciEventsArray, troubleTicketArray, vinesArray, palmBambooArray, openCaArray];
                var arrayToMap = [];

                //get each type of data (date/time & area)
                //put each point as latlng into their respective arrays
                allArrays.forEach(function (array) {
                    if (checkbox == true) {
                        for (i = 0; i < array.length; i++) {
                            arrayToMap.push(array[i]);
                        }
                    }
                });

                return arrayToMap;
            }

        function drawFaultHeatMap(faults) {
                //console.log(faults);
                var combinedArray = [];
                var tempArr = [];
                var colorPoints = [];
                var totalFaults = 0;
                faults.forEach(function (fault) {
                    //combine all segments into one array
                    // if(fault.isActive){
                    if (fault.combinedFault) {
                        fault.groupedF.forEach(function (cfault) {
                            if (cfault.includeFault) {
                                for (var i = 0; i < cfault.segments.length; i++) {
                                    combinedArray.push(cfault.segments[i]);
                                }
                                totalFaults++
                            }
                        });
                    } else {
                        for (var j = 0; j < fault.segments.length; j++) {
                            combinedArray.push(fault.segments[j]);
                        }
                        totalFaults++
                    }
                    // }
                    // combinedArray = sortArrByProp(combinedArray,'sect');
                });
                var per20 = totalFaults * 0.2;
                var per40 = totalFaults * 0.4;
                var per60 = totalFaults * 0.6;
                var per80 = totalFaults * 0.8;
                combinedArray.forEach(function (segment) {
                    var sectionID = segment.sect;
                    var filtered = combinedArray.filter(function (item) {
                        return item.sect === sectionID
                    });
                    segment.count = filtered.length;
                    var green;
                    if (totalFaults == 1) {
                        segment.color = 'Yellow';
                        colorPoints.push(L.polyline(segment.points, {color: segment.color, opacity: 0.75, weight: 7}));
                    } else if (totalFaults <= 5) {
                        if (segment.count == 1) {
                            segment.color = 'Yellow';
                            tempArr.push(segment);
                        } else if (!isObjectInArrayByProp(segment, tempArr, 'sect')) {
                            if (segment.count == 2) {
                                segment.color = 'rgb(255,195,0)';
                            }
                            else if (segment.count == 3) {
                                segment.color = 'rgb(255,135,0)';
                            }
                            else if (segment.count == 4) {
                                segment.color = 'rgb(255,75,0)';
                            }
                            else if (segment.count == 5) {
                                segment.color = 'rgb(255,0,0)';
                            }
                            tempArr.push(segment);
                        }
                    } else if (totalFaults > 5) {
                        if (segment.count <= per20) {
                            segment.color = 'Yellow';
                            tempArr.push(segment);
                        } else if (!isObjectInArrayByProp(segment, tempArr, 'sect')) {
                            if (segment.count > per20 && segment.count <= per40) {
                                segment.color = 'rgb(255,195,0)';
                            }
                            else if (segment.count > per40 && segment.count <= per60) {
                                segment.color = 'rgb(255,135,0)';
                            }
                            else if (segment.count > per60 && segment.count <= per80) {
                                segment.color = 'rgb(255,75,0)';
                            }
                            else if (segment.count > per80) {
                                segment.color = 'rgb(255,0,0)';
                            }
                            tempArr.push(segment);
                        }
                    }
                    // }
                });
                //for each segment in temp array push to colorpoints
                tempArr.forEach(function (segment) {
                    colorPoints.push(L.polyline(segment.points, {color: segment.color, opacity: 0.75, weight: 7}));
                });
                drawLinesToMapWithColorPoints(colorPoints, null);
            }

            // function formatFaultPointsForHeatMap(fault){
            //     //for each fault.points
            // }
        function isObjectInArrayByProp(obj, array, prop) {
                var count = 0;
                array.forEach(function (item) {
                    if (obj[prop] == item[prop]) {
                        count++
                    }
                });
                if (count === 0) {
                    return false
                } else {
                    return true
                }
            }

            // function stitchSegmentsTogether(segArray){
            //     for(var i=0; i < segArray.length; i++){
            //         //console.log(segArray[i]);
            //         var lastPointIndex = segArray[i].points.length-1;
            //         var point = segArray[i].points[lastPointIndex];
            //         for(var j=i+1; j< segArray.length; j++) {
            //             if (segArray[j].count === segArray[i].count && segArray[j].points[0] === point) {
            //                 segArray[i].points.push(segArray[j].points);
            //                 segArray[j].remove = true;
            //                 console.log('stitched',segArray[j]);
            //                 lastPointIndex = segArray[i].length-1;
            //                 point = segArray[i][lastPointIndex];
            //             }
            //         }
            //     }
            //
            //     var combined = segArray.filter(function(item){ return item.remove === false });
            //     //console.log(combined);
            //     return combined;
            // }

            //used for spiderfying markers...
        function addLayerGroupToOMS(layerGroups, omsObj) {

                layerGroups.forEach(function (layerGroup) {
                    var mkrArr = layerGroup._layers;
                    var mkrKeys = Object.keys(mkrArr);

                    for (var i = 0; i < mkrKeys.length; i++) {
                        var marker = layerGroup._layers[mkrKeys[i]];
                        omsObj.addMarker(marker);
                    }

                    omsObj.addListener('spiderfy', function (markers) {
                        for (var i = 0, len = markers.length; i < len; i++) markers[i];
                        mapFactory.data.map.closePopup();
                    });
                    omsObj.addListener('unspiderfy', function (markers) {
                        for (var i = 0, len = markers.length; i < len; i++) markers[i];
                    });
                });

            }


            /*
             * Trouble Ticket investigation
             * Feeder Failure points - move fdr ticket to cause location
             * */
        function initiateFeederFailurePoints() {
                feederFailPointF.getDataFromServer().then(function (data) {
                    drawFeederFailurePoints(data);
                });
            }

        function initiateFeederFailurePointsClear() {
                clearFeederFailurePoints();
            }

        function drawFeederFailurePoints(failPoints) {
                //console.log('ding');
                clearFeederFailurePoints();
                var tempArray = [];
                for (var i = 0; i < failPoints.length; i++) {

                    failPoints[i].truck_lat = failPoints[i].trucks[failPoints[i].trucks.length - 1].lat;
                    failPoints[i].truck_lng = failPoints[i].trucks[failPoints[i].trucks.length - 1].lng;

                    //set pop-up content
                    var popUpContent = "<b>ticket Num: </b>" + failPoints[i].TRBL_TCKT_NUM + "<br/><b>Feeder: </b>" + failPoints[i].FDR_NUM
                        + "<br/><b>Power Off Time: </b>" + failPoints[i].PWR_OFF_DTTM;
                    //TODO Currently mapping last truck point
                    var marker = L.marker([failPoints[i].truck_lat, failPoints[i].truck_lng], {
                        icon: mapFactory.data.iconAlert,
                        zIndexOffset: 999999
                    }).bindPopup(popUpContent);
                    //add to array
                    tempArray.push(marker);
                }

                mapFactory.data.groupedOverlays["Fail Points"] = {};
                //create layerGroup from array
                mapFactory.data.overlays.FailPoints = L.layerGroup(tempArray);
                //add to map
                mapFactory.data.overlays.FailPoints.addTo(mapFactory.data.map);
                //add to control panel
                addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Fail Points', mapFactory.data.overlays.FailPoints, '<img src="../images/icon_failure_alert.svg" class="legendIcon" style="height:20px;"/> Feeder Fail Point');

                mapFactory.data.groupedMapLayerControl.remove();
                mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                addGroupedLayerControlIfNotEmpty();
            }

        function clearFeederFailurePoints() {
                if (mapFactory.data.map.hasLayer(mapFactory.data.overlays.FailPoints)) {
                    mapFactory.data.overlays.FailPoints.clearLayers();

                    delete mapFactory.data.groupedOverlays["Fail Points"];
                    mapFactory.data.groupedMapLayerControl.remove();
                    mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                    addGroupedLayerControlIfNotEmpty();
                }
                mapFactory.data.FailPoints = [];
            }

            /*
             * Complaints Investigation
             * */
        function initiateComplaintsDrawing() {
            complaintsF.getDataFromServer().then(function (data) {
                    //console.log(controlPanelSelection.data.mostSpecificSelectionType);
                    if (areaF.data.mostSpecificSelectionType === 'sc' || areaF.data.mostSpecificSelectionType === 'ma') {
                        drawComplaintsHeatMap(data);
                    }
                    else {
                        drawComplaints(data)
                    }
                });
        }

        function initiateComplaintsClear() {
                clearComplaints();
            }

        function drawComplaints(complaints) {
                mapFactory.data.omsComplaints = new OverlappingMarkerSpiderfier(mapFactory.data.map);
                // console.log('Draw complaints');
                clearComplaints();
                var icon;
                var tempArray = [];
                var popUpContent;
                //console.log(complaints);
                for (var i = 0; i < complaints.length; i++) {
                    var c = complaints[i];
                    if (c.MajorCat == "Physical Facilities") {
                        icon = mapFactory.data.iconComplaint1
                    }
                    if (c.MajorCat == "Service Interruptions") {
                        icon = mapFactory.data.iconComplaint2
                    }
                    if (c.MajorCat == "Interference") {
                        icon = mapFactory.data.iconComplaint3
                    }
                    if (c.location.coordinates[1] !== null && c.location.coordinates[0] !== null) {
                        //set pop-up content
                        popUpContent = "<table class='table table-condensed'><tbody>" +
                            "<tr class='grey1'><td><strong>Inquiry Type:</strong></td><td>" + c.inquiryType + "</td></tr>" +
                            "<tr class='grey1'><td><strong>A Ticket Criteria:</strong></td><td>" + (c.aTcktCritera || '') + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Major Category:</strong></td><td>" + c.MajorCat + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Sub Category</strong></td><td>" + c.SubCat + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Cause Code:</strong></td><td>" + (c.CauseCode || '') + "</td></tr>" +
                            "<tr class='grey1'><td><strong>FPL Log Number:</strong></td><td>" + c.fplLogNo + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Date Received:</strong></td><td>" + c.inquiryDate + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Service Address:</strong></td><td>" + c.serviceAddr + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Received By:</strong></td><td>" + c.compRecievedBy + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Handle Group:</strong></td><td>" + c.comHandleGroup + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Handle Rep:</strong></td><td>" + (c.compHandleRep || '') + "</td></tr>" +
                            "<tr class='teal1'><td><strong>Region:</strong></td><td>" + c.region + "</td></tr>" +
                            "<tr class='teal1'><td><strong>Management Area:</strong></td><td>" + c.ma + "</td></tr>" +
                            "<tr class='teal1'><td><strong>Service Center:</strong></td><td>" + c.SRV_CTR_CODE + " | " + c.SRV_CTR_NAME + "</td></tr>" +
                            "<tr class='teal1'><td><strong>Feeder Number:</strong></td><td>" + c.feederNum + "</td></tr>" +
                            "<tr class='teal1'><td><strong>FPL ID:</strong></td><td>" + c.fplid + "</td></tr>" +
                            "<tr class='teal1'><td><strong>TLN Number:</strong></td><td>" + c.tln + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Premise Number:</strong></td><td>" + c.premiseNum + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Account Number:</strong></td><td>" + c.acctNum + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Customer Last Name:</strong></td><td>" + c.custLastName + "</td></tr>" +
                            "<tr class='grey1'><td><strong>Address:</strong></td><td>" + (c.custAddr || '') + "</td></tr></tbody></table>";

                        //TODO Currently mapping last truck point
                        var marker = L.marker([c.location.coordinates[1], c.location.coordinates[0]], {
                            icon: icon,
                            zIndexOffset: 999999
                        }).bindPopup(popUpContent, {maxHeight: 450});
                        //add to array
                        tempArray.push(marker);
                        //console.log(marker);
                    }//else{console.log(c)}
                }
                //mapFactory.data.overlays.Complaints = L.layerGroup();
                mapFactory.data.groupedOverlays["Complaints"] = {};
                mapFactory.data.overlays.Complaints = L.layerGroup(tempArray, {makeBoundsAware: true});
                //add to map
                mapFactory.data.overlays.Complaints.addTo(mapFactory.data.map);
                //add to control panel
                addLayerGroupToOMS([mapFactory.data.overlays.Complaints], mapFactory.data.omsComplaints);
                addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Complaints', mapFactory.data.overlays.Complaints,
                    '<img src="../images/icon_complaint2.svg" class="legendIcon" style="height:20px;"/> Cust Complaints');
                mapFactory.data.groupedMapLayerControl.remove();
                mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                addGroupedLayerControlIfNotEmpty();
                //console.log(complaintsF.data.complaints);
            }

        function drawComplaintsHeatMap(complaints) {
                var coordinatesArray = [];
                //console.log(complaints[0].location.coordinates);
                var location = [];
                complaints.forEach(function (complaint) {
                    if (complaint.location.coordinates[0] !== null || complaint.location.coordinates[1] !== null) {
                        location = [complaint.location.coordinates[1], complaint.location.coordinates[0]];
                        coordinatesArray.push(location);
                    }
                });
                var heatOptions = {
                    radius: 25, blur: 15, opacity: 0.7, minOpacity: 0.5,
                    // example sent blur = 10
                    gradient: {
                        0.25: '#90FF00',
                        0.5: '#FFF200',
                        0.75: '#FF8C00',
                        1.0: '#DB2B2B'
                    }
                };
                // drawHeatmap(coordinatesArray, heatOptions, mapFactory.data.overlays.ComplaintsHeat);
                mapFactory.data.overlays.ComplaintsHeat = L.heatLayer(coordinatesArray, heatOptions).addTo(mapFactory.data.map);
                //console.log(mapFactory.data.overlays.ComplaintsHeat);
                mapFactory.data.groupedOverlays["Complaints"] = {};
                //add to control panel
                addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Complaints', mapFactory.data.overlays.ComplaintsHeat,
                    '<img src="../images/icon_complaint2.svg" class="legendIcon" style="height:20px;"/> Cust Complaints');
                refreshInvesLayerControl();
            }

        function clearComplaints() {
                if (mapFactory.data.map.hasLayer(mapFactory.data.overlays.Complaints)) {
                    mapFactory.data.overlays.Complaints.clearLayers();
                    mapFactory.data.overlays.Complaints = L.layerGroup();
                    //console.log('overlays ',mapFactory.data.overlays.Complaints);
                    delete mapFactory.data.groupedOverlays["Complaints"];

                    refreshInvesLayerControl();
                }
                mapFactory.data.map.removeLayer(mapFactory.data.overlays.ComplaintsHeat);
            }

        function removeLayersFromMap(theMap, layersArray) {
//pass an array of layers to remove them from map (does not erase items in the layer)
                for (var i = 0; i < layersArray.length; i++) {
                    theMap.removeLayer(layersArray[i]);
                }
            }

        function addLayersToMap(map, layersArray) {
//pass an array of layers to add them to map
                for (var i = 0, len = layersArray.length; i < len; i++) {
                    map.addLayer(layersArray[i]);
                }
            }

        function refreshInvesLayerControl(){
            mapFactory.data.groupedMapLayerControl.remove();
            mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
            addGroupedLayerControlIfNotEmpty();
        }

        function addGroupedLayerControlIfNotEmpty() {
                //console.log(Object.keys(mapFactory.data.groupedOverlays).length);
                //console.log(mapFactory.data.groupedOverlays);
                if (Object.getOwnPropertyNames(mapFactory.data.groupedOverlays).length !== 0) {
                    mapFactory.data.groupedMapLayerControl.addTo(mapFactory.data.map);
                    mapFactory.data.groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";
                }
            }

            /*
             * Management Area Polygons
             * */
        function drawAreaPolygons() {
                DataModel.getPolyMA().then(function (data) {
                    momCountsF.getDataFromServer().then(function (counts) {
                        createLPolygon(data);
                    });

                    // createLPolygon(areaF.data.managementAreaData);
                });
            }

        function createLPolygon(data) {//pass points array, polyOptions
                var momCount = momCountsF.data.maCounts;
                // console.log(momCount);
                // console.log(momCountsF.data.maCounts);
                var maData = areaF.data.managementAreaData;
                mapFactory.data.maLabels.clearLayers();

                var mgmtArea;
                var MAs = _.values(maData);
                var style = {
                    "color": "#ff7800",
                    "weight": 3,
                    "opacity": 0.75,
                    "fill": "#ff7800",
                    "fillOpacity": 0.3
                };

                function makePopUp(feature, layer) {
                    layer.on('click', function (feature) {
                        // var thisMA = MAs.filter(function (obj) {
                        //     return obj._id == layer.feature.properties.ma;
                        // });
                        // thisMA = thisMA[0];
                        var maId = layer.feature.properties.ma;
                        var id = layer.feature.properties.ma;
                        selectMAfromPoly(maId);
                        mapFactory.data.map.fitBounds(layer.getBounds());
                    });

                    var labelLoc; //latlng for placing MA label
                    if (layer.feature.properties.ma == 'WD') {
                        labelLoc = [25.8321, -80.3797];
                    }
                    else if (layer.feature.properties.ma == 'CD') {
                        labelLoc = [25.8084, -80.1758];
                    }
                    else if (layer.feature.properties.ma == 'ND') {
                        labelLoc = [25.9296, -80.2095];
                    }
                    else if (layer.feature.properties.ma == 'SD') {
                        labelLoc = [25.5269, -80.4540];
                    }
                    else if (layer.feature.properties.ma == 'CB') {
                        labelLoc = [26.1398, -80.1972];
                    }
                    // else if (layer.feature.properties.ma =='BR'){labelLoc=[26.5787,-80.7111];}
                    else {
                        labelLoc = layer.getBounds().getCenter();
                    }
                    if (feature.properties.ytd == undefined) {
                        feature.properties.ytd = 0
                    }
                    if (feature.properties.moe12 == undefined) {
                        feature.properties.moe12 = 0
                    }
                    var label = L.marker(labelLoc, {
                        icon: L.divIcon({
                            className: 'label',
                            html: feature.properties.ma + '<br />' + feature.properties.ytd,
                            iconSize: [34, 34],
                            iconAnchor: [17, 17],
                            zIndexOffset: mapFactory.data.gridIndex
                        })
                    })
                        .on('click', function (feature) {
                            var MAs = _.values(managementArea.data);
                            // var thisMA = MAs.filter(function (obj) {
                            //     return obj._id == layer.feature.properties.ma;
                            // });
                            // thisMA = thisMA[0];
                            var maId = layer.feature.properties.ma;
                            selectMAfromPoly(maId);
                        });
                    mapFactory.data.maPolygon.addLayer(label);
                }

                //TODO remove addTo map later & return the polygon object

                data.forEach(function (ma) {
                    momCount.forEach(function (mom) {
                        if (mom._id == ma.properties.ma) {
                            ma.properties.ytd = mom.YTD;
                            ma.properties.moe12 = mom.twelvemoe;
                        }
                    });
                    // console.log(ma.properties);
                    try {
                        if (ma.properties.ma == "CF") {
                            ma.geometry.geometries[3].coordinates = [ma.geometry.geometries[3].coordinates];
                            // console.log(ma);
                        }
                        if (ma.properties.ma !== "TB" && ma.properties.ma !== "BR" && ma.properties.ma !== "NF" && ma.properties.ma !== "CF") {
                            ma.geometry.type = "Polygon";
                        }
                        mgmtArea = L.geoJson(ma, {style: style, onEachFeature: makePopUp});
                        mapFactory.data.maPolygon.addLayer(mgmtArea);
                        ma.leafletPoly = mgmtArea;
                        var thisMA = MAs.filter(function (obj) {
                            return obj._id == ma.properties.ma;
                        });
                        // console.log(MAs._id == ma.properties.ma);
                        // thisMA = thisMA[0];
                        thisMA.leafletPoly = mgmtArea;
                        // console.log('check');
                    } catch (e) {
                        console.log(e.message);
                        console.log('MA: ', ma.properties.ma);
                    }
                });

                mapFactory.data.maPolygon.addTo(mapFactory.data.map);
                mapFactory.data.maLabels.addTo(mapFactory.data.map);
                mapFactory.data.deviceOverlays["Areas"]["Polygons"] = mapFactory.data.maPolygon;
                updateDeviceLayerControl();
            }

            // function maSelectedStem(){
            //     // if(controlPanelSelection.data.selectedManagementArea._id === 'All'){
            //     //     showAllManagementAreasServiceCentersSubstations();
            //     //     controlPanelSelection.data.selectedServiceCenter = null;
            //     //     controlPanelSelection.data.selectedSubstation = null;
            //     //     controlPanelSelection.data.mostSpecificSelectionType= '';
            //     // }
            //     // else {
            //     //     updateSubstationSelectionListForServiceCenterAll();
            //     // }
            //
            //     initiateClearSubstationMoms();
            //     areaF.managementAreaSelected();
            //     //turnAllInvestigationLayersOff();
            //     initiateSubstationGridClear();
            //     initiateMapSubstationMoms();
            //     setBounds();
            // }

        function showAllManagementAreasServiceCentersSubstations() {
                controlPanelSelection.data.selectedManagementArea = scope.managementAreas['all'];
                controlPanelSelection.data.selectedManagementArea.serviceCenters = scope.managementAreas['all'].serviceCenters;
                controlPanelSelection.data.selectedServiceCenter.substations = scope.managementAreas['all'].serviceCenters['all'].substations;
            }

        function updateSubstationSelectionListForServiceCenterAll() {
                var tempSubstationList = {};
                //console.log(controlPanelSelection.data.selectedManagementArea);
                // controlPanelSelection.data.selectedManagementArea.serviceCenters
                for (var key in controlPanelSelection.data.selectedManagementArea.serviceCenters) {
                    if (controlPanelSelection.data.selectedManagementArea.serviceCenters.hasOwnProperty(key)) {
                        angular.merge(tempSubstationList, controlPanelSelection.data.selectedManagementArea.serviceCenters[key].substations);
                    }
                }
                // controlPanelSelection.data.selectedServiceCenter.substations = tempSubstationList;
                // console.log(controlPanelSelection.data.selectedServiceCenter);
                // controlPanelSelection.data.selectedServiceCenter = null;
                // controlPanelSelection.data.selectedSubstation = null;
                controlPanelSelection.setMostSpecificSelectionAndType();
            }

        function turnAllInvestigationLayersOff() {
                controlPanelSelection.turnAllInvestigationLayersOff();
                toggleFaults();
                toggleVines();
                togglePalmsBamboos();
                toggleLightningDay();
                toggleTroubleTickets();
                toggleOpenConditionAssessmentsChecked();
                toggleKnownMomentariesFeederOutagesChecked();
                toggleLightningYTD();
                toggleFCIs();
                toggleFeederFailurePoints();
                toggleComplaints();
                toggleALSChecked();
                toggleHvtChecked();
            }

        function serviceCenterSelected() {
                if (controlPanelSelection.data.selectedServiceCenter !== null) {
                    controlPanelSelection.data.selectedManagementArea =
                        managementAreas.data[controlPanelSelection.data.selectedServiceCenter.substations[Object.keys(controlPanelSelection.data.selectedServiceCenter.substations)[0]].ma];
                    controlPanelSelection.data.substationsList = controlPanelSelection.data.selectedServiceCenter.substations;
                    controlPanelSelection.data.selectedSubstation = null;

                    controlPanelSelection.data.selectedSubstation = null;
                    turnAllInvestigationLayersOff();
                    stemNGS.initiateSubstationGridClear();
                    controlPanelSelection.setMostSpecificSelectionAndType();
                }

                else {
                    updateSubstationSelectionListForServiceCenterAll()
                }

                stemNGS.setBounds();
            }

            /*
             * Draw Substation Momentary Points
             * */
        function initiateMapSubstationMoms() {
                // console.log('layer array BEFORE',mapFactory.data.mapLayerControl);
                // console.log('layer control BEFORE',mapFactory.data.deviceOverlays);
                drawSubstationMoms();
            }

        function initiateClearSubstationMoms() {
                clearSubstationMoms();
            }

        function drawSubstationMoms() {
                clearSubstationMoms();
                if (areaF.data.selectedManagementArea._id !== "All") {
                    var subs = areaF.data.substationsList;
                    // console.log('STEM ', subs["ACME"]);
                    var rangeArray = setColorRanges(getHighestValueInRange(subs, 'mYTD'));
                    var colorClass = '';
                    var mkrArray = [];
                    //divide by 5

                    for (var key in subs) {
                        var sub = subs[key];
                        // console.log('sub ' + sub._id+ '    key: '+ key);
                        var marker;
                        var icon;

                        //Use YTD number to determine value of colorClass
                        if (sub.mYTD == undefined) {
                            sub.mYTD = 0
                        }
                        if (sub.mYTD > rangeArray[1]) {
                            colorClass = 'di-substation bg-red'
                        }
                        else if (sub.mYTD > rangeArray[2] && sub.mYTD < rangeArray[1]) {
                            colorClass = 'di-substation bg-orange'
                        }
                        else if (sub.mYTD > rangeArray[3] && sub.mYTD < rangeArray[2]) {
                            colorClass = 'di-substation bg-yellow'
                        }
                        else if (sub.mYTD > rangeArray[4] && sub.mYTD < rangeArray[3]) {
                            colorClass = 'di-substation nee-green'
                        }
                        else if (sub.mYTD < rangeArray[4]) {
                            colorClass = 'di-substation fpl-blue'
                        }

                        if (sub.points) {
                            icon = L.divIcon({
                                className: colorClass,
                                iconSize: [30, 25],
                                iconAnchor: [16, 12],
                                popupAnchor: [0, -15],
                                html: '<span>' + sub.mYTD + '</span>'
                            });
                            marker = L.marker([sub.points[0][1], sub.points[0][0]], {
                                icon: icon,
                                sub: key,
                                riseOnHover: true
                            });
                            // console.log('marker ', marker.options.sub);
                            marker.bindPopup('<h6>' + sub._id + '</h6>');
                            marker.on('mouseover', function (e) {
                                this.openPopup();
                            });
                            marker.on('mouseout', function (e) {
                                this.closePopup();
                            });
                            marker.on('click', function (feature) {
                                var subId = feature.target.options.sub;
                                selectSubFromIcon(subId);
                                // areaF.setSubstation(subId);
                                // momCountsF.getMomDetailsFromServer();
                                // initiateSubstationGridDraw();
                                // setBounds();
                                // turnAllInvestigationLayersOff();
                            });

                            mkrArray.push(marker);
                        } else {
                            // console.log('Missing points ', sub._id);
                        }
                    }
                    mapFactory.data.subMoms = L.layerGroup(mkrArray, {makeBoundsAware: true, minZoom: 5, maxZoom: 13});
                    mapFactory.data.subMoms.addTo(mapFactory.data.map);
                    // console.log('draw sub moms', mapFactory.data.subMoms);

                    // addLayerGroupToOMS(mapFactory.data.subMoms,mapFactory.data.omsSubstations);
                    mapFactory.data.deviceOverlays["Areas"]["Subs Icons"] = mapFactory.data.subMoms;
                    updateDeviceLayerControl();
                    // console.log('layer Control', mapFactory.data.deviceLayerControl);
                }
            }

        function clearSubstationMoms() {
                // console.log('Clear sub markers');
                mapFactory.data.subMoms.clearLayers();
                mapFactory.data.subMoms.removeFrom(mapFactory.data.map);
            }

        function selectMAfromPoly(maId) {
                initiateSubstationHeatMapClear();
                initiateClearSubstationMoms();
                momCountsF.data.momCountCurrentPg = 1;
                areaF.setManagementArea(maId);
                // console.log(areaF.data.selectedManagementArea);
                areaF.managementAreaSelected();
                momCountsF.updateSubsWithMoms();
                momCountsF.getMomsForMa(areaF.data.selectedManagementArea);
                momCountsF.drawKnownMomChart();
                turnSubHeatMapOff();
                turnAllInvestigationLayersOff();
                initiateSubstationGridClear();
                initiateMapSubstationMoms();
                initiateFaultsClear();
                setBounds();
            }

        function selectSubFromIcon(subId) {
                areaF.setSubstation(subId);
                momCountsF.data.momCountCurrentPg = 1;
                momCountsF.updateSubsWithMoms();
                momCountsF.getMomDetailsFromServer();
                momCountsF.drawKnownMomChart();
                turnSubHeatMapOff();
                turnAllInvestigationLayersOff();
                initiateSubstationGridClear();
                initiateSubstationGridDraw();
                initiateSubstationHeatMap();
                setBounds();
            }

            /*
             * High Voltage Transformer Investigation
             * */
        function initiateHvtInvestigationDrawing() {
                // console.log('HVT ding');
            highVoltTxF.getDataFromServer().then(function(data){
                drawHvtLayer(highVoltTxF.data.HvtList);
            })
        }

        function initiateHvtInvestigationClear() {
                clearHvtLayer();
            }

        function drawHvtLayer(data) {
            clearHvtLayer();
            var hvtArray = [];
            var icon = mapFactory.data.iconHvtYellow;
            var marker;
            // console.log('stem drawHvtLayer');
            // console.log(data);
            // console.log(areaF.data.mostSpecificSelectionIdentifier);
            data.forEach(function (hvt) {
                    if(hvt.daysOld < 25 ) {icon = mapFactory.data.iconHvtYellow;}
                    else if(hvt.daysOld >= 25 && hvt.daysOld < 35 ){ icon = mapFactory.data.iconHvtOrange; }
                    else if(hvt.daysOld >= 35 ){ icon = mapFactory.data.iconHvtRed; }
                    marker = L.marker([hvt.latitude, hvt.longitude], {icon: icon, fplId: hvt.fplId});
                    marker.bindPopup('<h5>High Voltage TX</h5>'
                        + '<strong>Fpl ID:</strong> ' + hvt.fplId
                        + '<br/><strong>DDB:</strong> ' + hvt.lateral_ddb_long
                        + '<br/><strong>phase:</strong> ' + hvt.phase
                        + '<br /> <strong>Max Reading:</strong> ' + hvt.maxReading
                        + '<br /> <strong>Min Reading:</strong> '+ hvt.minReading
                        + '<br /> <strong>Days Flagged:</strong> '+ hvt.daysOld
                    );
                    hvtArray.push(marker);
                });

                mapFactory.data.overlays.highVoltTx = L.layerGroup(hvtArray);
                mapFactory.data.overlays.highVoltTx.addTo(mapFactory.data.map);

                mapFactory.data.groupedOverlays["Equipment"] = {};

                addLayerToGroupedControl(mapFactory.data.groupedOverlays, 'Equipment', mapFactory.data.overlays.highVoltTx, 'High Voltage');
                mapFactory.data.groupedMapLayerControl.remove();
                mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                mapFactory.data.groupedMapLayerControl.addTo(mapFactory.data.map);
                mapFactory.data.groupedMapLayerControl._layersLink.className = "leaflet-control-layers-toggle investigation-control-layers-toggle";
            }

        function clearHvtLayer() {
                if (mapFactory.data.map.hasLayer(mapFactory.data.overlays.highVoltTx)) {
                    mapFactory.data.overlays.highVoltTx.clearLayers();

                    delete mapFactory.data.groupedOverlays["Equipment"];
                    mapFactory.data.groupedMapLayerControl.remove();
                    mapFactory.data.groupedMapLayerControl = L.control.groupedLayers(null, mapFactory.data.groupedOverlays);
                    addGroupedLayerControlIfNotEmpty();
                }
            }

            //*  SUBSTATION HEATMAP*//
        function initiateSubstationHeatMap() {

            setTimeout(function(){
                // console.log(momCountsF.data.heatEvents);
                initiateSubstationHeatMapClear();
                drawSubHeatMap();
            }, 1000);
            // momCountsF.getEventsFromServer().then(function(){
            //     drawSubHeatMap();
            // });

            }

        function initiateSubstationHeatMapClear() {
                clearSubHeatMap();
                // console.log('initiateSubstationHeatMapClear', mapFactory.data.substationHeatMap);
            }

        function drawSubHeatMap() {
            // console.log('drawSubHeatMap');
            // areaF.data.selectedCalendarDate = momCountsF.data.firstMomDate;
            // areaF.data.selectedCalendarEndDate = momCountsF.data.lastMomDate;
            var heatData = momCountsF.data.heatEvents;
            var heatOptions = {
                radius: 15, blur: 10, opacity: 0.7, minOpacity: 0.5,
                // example sent blur = 10
                gradient: {
                    0.1: '#bf00ff',
                    0.2: '#0066ff',
                    0.4: '#00ff09',
                    0.6: '#f7ff00',
                    0.8: '#fcb500',
                    1.0: '#d60000'
                }
            };

            mapFactory.data.substationHeatMap = L.heatLayer(heatData, heatOptions);
            mapFactory.data.substationHeatMap.addTo(mapFactory.data.map);
            momCountsF.data.subMapIsActive = true;
        }

        function clearSubHeatMap() {
            // console.log('CLEAR!');
                if (mapFactory.data.substationHeatMap) {
                    mapFactory.data.map.removeLayer(mapFactory.data.substationHeatMap);
                }
            }

            //use if substation is changed
        function clearSubHeatMapdata() {
                mapFactory.data.substationHeatMap = {};
                momCountsF.data.heatEvents = [];
            }

        function turnSubHeatMapOff() {
                // console.log('toggleSubHeatMap');
                momCountsF.data.subMapIsActive = false;
                initiateSubstationHeatMapClear();
            }

            /**
             * TOGGLE INVESTIGATION FUNCTIONS
             */
        function toggleFaults() {
                if (controlPanelSelection.data.isFaultsChecked) {
                    if (controlPanelSelection.data.selectedCalendarDate === '') {
                        //TODO look into having the popup show on the bottom right of the app as opposed to the top right
                        $.growlUI('Please pick a date.');
                        // controlPanelSelection.data.checkBoxes.isFaultsChecked = false;
                        // return;
                    }
                    // if(scope.selectAreaIsOpen){
                    //     scope.selectAreaIsOpen = false;
                    // }
                    initiateFaultsClear();
                    initiateFaultsDrawing();
                }
                else {
                    initiateFaultsClear();
                }
            }

        function toggleLightningDay() {
                if (controlPanelSelection.data.checkBoxes.isLightningDayChecked) {
                    if (controlPanelSelection.data.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        // controlPanelSelection.data.checkBoxes.isLightningDayChecked = false;
                        // return;
                    }
                    initiateLightningDayDrawing();
                    // setTimeout(function(){scope.lightningData = lightningsF.data;}, 100);
                    // if(scope.selectAreaIsOpen){
                    //     scope.selectAreaIsOpen = false;
                    // }
                }
                else {
                    initiateLightningDayClear();
                }
            }

        function toggleTroubleTickets() {
                if (controlPanelSelection.data.checkBoxes.isTroubleTicketsChecked) {
                    if (controlPanelSelection.data.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        // controlPanelSelection.data.checkBoxes.isTroubleTicketsChecked = false;
                        // return;
                    }
                    initiateTroubleTicketsDrawing();
                }
                else {
                    initiateTroubleTicketsClear();
                }
            }

        function toggleFCIs() {
                if (controlPanelSelection.data.checkBoxes.isFCIChecked) {
                    // fciF.getDataFromServer();
                    // setTimeout(function(){
                    //     console.log('fci data: ' ,fciF.data);
                    initiateFCIFaultDrawing();
                    // }, 5000);
                } else {
                    initiateFaultsClear();
                }
            }

        function togglePalmsBamboos() {
                if (controlPanelSelection.data.checkBoxes.isPalmsBamboosChecked) {
                    initiatePalmsBamboosDrawing();
                    // setTimeout(function(){scope.palmsBambooData = palmsBamboosF.data;}, 100);
                    // if(scope.selectAreaIsOpen){
                    //     scope.selectAreaIsOpen = false;
                    // }
                }
                else {
                    initiatePalmsBamboosClear();
                }
            }

        function toggleVines() {
                if (controlPanelSelection.data.checkBoxes.isVinesChecked) {
                    if (controlPanelSelection.data.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        // scope.checkBoxes.isVinesChecked = false;
                        return;
                    }
                    initiateVinesDrawing(vineEdit);
                    // if(scope.selectAreaIsOpen){
                    //     scope.selectAreaIsOpen = false;
                    // }
                }
                else {
                    initiateVinesClear();
                }
            }

        function toggleKnownMomentariesFeederOutagesChecked() {
                if (controlPanelSelection.data.checkBoxes.isKnownMomentariesFeederOutagesChecked) {
                    if (scope.controlPanelSelectionData.selectedCalendarDate === '') {
                        $.growlUI('Please pick a date');
                        controlPanelSelection.data.checkBoxes.isKnownMomentariesFeederOutagesChecked = false;
                        // setTimeout(function(){scope.knownMomentariesFeederOutagesData = knownMomentariesFeederOutagesF.data;},100);
                        return;
                    }
                    initiateKnownMomentariesFeederOutagesDrawing();

                    // if(scope.selectAreaIsOpen){
                    //     scope.selectAreaIsOpen = false;
                    // }
                }
                else {
                    initiateKnownMomentariesFeederOutagesClear();
                }
            }

        function toggleFeederFailurePoints() {
                if (controlPanelSelection.data.checkBoxes.isFeederFailurePointsChecked) {
                    initiateFeederFailurePoints();
                }
                else {
                    initiateFeederFailurePointsClear();
                }
            }

        function toggleOpenConditionAssessmentsChecked() {
                if (controlPanelSelection.data.checkBoxes.isOpenConditionAssessmentsChecked) {
                    initiateOpenConditionAssessmentsDrawing();
                    // setTimeout(function(){scope.openConditionAssessmentData = openConditionAssessmentF.data;}, 100);
                    // if(scope.selectAreaIsOpen){
                    //     scope.selectAreaIsOpen = false;
                    // }
                }
                else {
                    initiateOpenConditionAssessmentsClear();
                }
            }

        function toggleLightningYTD() {
                if (controlPanelSelection.data.checkBoxes.isLightningYTDChecked) {
                    if (controlPanelSelection.data.controlPanelSelectionData.selectedCalendarDate === '') {
                        //TODO look into having the popup show on the bottom right of the app as opposed to the top right
                        $.growlUI('Please pick a date.');
                        // scope.checkBoxes.isLightningYTDChecked = false;
                        // return;
                    }
                    initiateLightningYTDDrawing();
                    // if(scope.selectAreaIsOpen){
                    //     scope.selectAreaIsOpen = false;
                    // }
                }
                else {
                    initiateLightningYTDClear();
                }
            }

        function toggleComplaints() {
                // console.log('toggle complaints');
                if (controlPanelSelection.data.checkBoxes.isComplaintsChecked) {
                    initiateComplaintsDrawing();
                }
                else {
                    initiateComplaintsClear();
                }
            }

        function toggleALSChecked() {
                if (controlPanelSelection.data.checkBoxes.isALSChecked) {
                    initiateALSInvestigationDrawing();
                }
                else {
                    initiateALSInvestigationClear();
                }
            }

        function toggleHvtChecked() {
                if (controlPanelSelection.data.checkBoxes.isHvtChecked) {
                    initiateHvtInvestigationDrawing();
                }
                else {
                    initiateHvtInvestigationClear();
                }
            }

    }

    function getHighestValueInRange(objArray, prop) {
        var obj;
        var highestNum = 0;
        for (var key in objArray) {
            if (objArray[key]) {
                if (objArray[key][prop] > highestNum) {
                    highestNum = objArray[key][prop]
                }
            }
        }
        return highestNum;
    }

    function setColorRanges(num) {
        var numArray = [];
        var fifth = num / 5;
        numArray = [num,
            (fifth) * 4,
            (fifth) * 3,
            (fifth) * 2,
            (fifth) * 1];
        // console.log(numArray);
        return numArray;
    }

//}


})();