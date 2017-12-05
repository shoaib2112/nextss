/**
 * Created by MXG0RYP on 5/16/2016.
 */
(function(){
    angular.module('nextGrid').directive('leaflet', leaflet);

    function leaflet(mapFactory, stemNGS){
        var directive = {
            link: link,
            templateUrl: 'app/components/map/directives/leaflet.view.html',
            restrict: 'E',
            //might not need this scope control two way binding
            scope: {
                control: '='
            }
        };
        return directive;
        function link(scope, element, attrs) {
            // binding control functions accessible to the controller
            // scope.control.drawFaults = drawFaults;
            // scope.control.toggleFaults = toggleFaults;

            //functions bounded to the interface
            scope.doClick = handleMapLeftClick;
            scope.doRightClick = handleMapRightClick;

            scope.test = function(){
                alert('worked');
            };
            
            (function init() {
                // console.log('LEAFLET DIRECTIVE');
                mapFactory.data.map = L.map('leaflet', {
                    center: [27, -82.8],
                    zoom: 7,
                    zoomControl: false,
                    layers: []//[ytdLayer1, ytdLayer2, ytdLayer3]
                });
                directive.scope.setAsCauseLocation= stemNGS.setAsCauseLocation;

                // console.log(directive.scope.setAsCauseLocation);
                //adding street tiles to the map
                L.tileLayer('http://{s}.tiles.mapbox.com/v3/' + mapFactory.data.mapId + '/{z}/{x}/{y}.png', {attribution: mapFactory.data.mba}).addTo(mapFactory.data.map);
                // // powerGrid = new L.LayerGroup().addTo(map);
                // // weather = new L.LayerGroup().addTo(map);
                // // make a layer group which will have the map and our diagram
                //
                // //Vines = new L.LayerGroup().addTo(map);
                L.control.scale().addTo(mapFactory.data.map);
                $(window).on("resize", function() {
                    $("#map").height($(window).height()).width($(window).width());
                    mapFactory.data. map.invalidateSize();
                }).trigger("resize");

                L.control.zoom({position:'topright'}).addTo(mapFactory.data.map);
                mapFactory.data.map.on("zoomend", zoomend);
				mapFactory.data.mapLayerControl.addTo(mapFactory.data.map);
                mapFactory.data.iconBaseControl.addTo(mapFactory.data.map);
                stemNGS.drawAreaPolygons();

            })();
            
            function handleMapLeftClick (e) {
                getCursorPos(scope, e);
                if (scope.activeLevel === 'vines') {
                    scope.vine = findVine(scope);
                    if (scope.vine !== null)
                        $uibModal.open({
                            animation: scope.animationsEnabled,
                            templateUrl: '/modals/editVines.html?bust=' + Math.random().toString(36).slice(2),
                            controller: 'editVineCtrl',
                            scope: scope,
                            size: 'me'
                        });
                }
                else { //default to grid
                    scope.rcRow = findIcon(scope);
                    if (scope.rcRow !== null)
                        $uibModal.open({
                            animation: scope.animationsEnabled,
                            templateUrl: '/modals/showAsset.html?bust=' + Math.random().toString(36).slice(2),
                            controller: 'assetCtrl',
                            scope: scope,
                            size: 'sm'
                        });
                }
            }

            function handleMapRightClick(e) {
                getCursorPos(scope, e);
                if (scope.activeLevel === 'cond') {
                    scope.rcRow = findIcon(scope);
                    $uibModal.open({
                        animation: scope.animationsEnabled,
                        templateUrl: '/modals/condAss.html?bust=' + Math.random().toString(36).slice(2),
                        controller: 'condCtrl',
                        scope: scope,
                        size: 'me'
                    });
                }
            };

            //TODO ask Alex what icons are ...maybe should be a factory?
            function findIcon($scope){
                _.forEach($scope.icons, function (box) {
                    closeBox = box;
                    if ($scope.lat <= box.x + 0.001 && $scope.lat >= box.x - 0.001 && $scope.long >= box.y - 0.001 && $scope.long <= box.y + 0.001) {
                        $scope.box = box;
                        return _.find($scope.rows, function (row) {
                            return row.id === box.id;
                        });
                    }
                });
                return null;
            }

            function getCursorPos (scope, e) {
                var latlng = mapFactory.data.map.mouseEventToLatLng(e);
                scope.lat = latlng.lat;
                scope.long = latlng.lng;
            }

            //TODO revisit this may be better in a service
            function zoomend (e) {
                zoomLevel = mapFactory.data.map.getZoom();
                // console.log(zoomLevel);
                stemNGS.deviceZoom(zoomLevel);
            }

            function setAsCauseLocation(id){
                console.log('DING in directive');
                console.log(id);
                // getDeviceById(id);
            }

            function getDeviceById(id){
                console.log('getDeviceById');
                console.log(mapFactory.data.spanArr);

            }
            
        }


    }
})();
