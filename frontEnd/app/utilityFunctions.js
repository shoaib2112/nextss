// this file is not added to the build ///////////////////////////////////////////
function initializeScope($scope) {
    $scope.usr = {
        slid: null,
        password: null,
        name_first: null,
        name_last: null,
        fpl_email: null,
        name_formatted: null,
        security : {}
    };
    $scope.now = new Date();
    $scope.then = dateMinus(1);
    $scope.daysBackVines = { value: 365 };
    $scope.fault_date = new Date();
    $scope.selectionType = "ma";
    $scope.metadata = [];
    $scope.areas = [];
    $scope.scs = [];
    $scope.ma = "";
    $scope.sc = "";
    $scope.selection = "";
    $scope.areas = [];
    $scope.subs = [];
    $scope.mas = [];
    $scope.maboxes = [];
    $scope.scboxes = [];
    $scope.scs = [];
	$scope.feeders = [];
	$scope.chosenFeeders = []; //When sub is selected this populates with feeder OBJECTS
    $scope.inspect = "mominvest";
	$scope.zoomLevel = $scope.map.getZoom();
	$scope.sFilter = '';
    $scope.boxes = {
        faultsChecked : null,
        lightningChecked: null,
        afsChecked: null,
        fciChecked: null,
        ecallsChecked: null,
        tticketsChecked: null,
        openelChecked: null,
        opencaChecked: null,
        momChecked: null,
        liveChecked: null
    };
    $scope.dates = {
        oneDate: moment().subtract(23, 'day').toDate(),
        localFormat: function (dt) {
            return moment().format('MM/DD/YYYY HH:MM:ss');
        }
    };
	$scope.oneDate = moment($scope.then);//.format('MM/DD/YYYY');
    $scope.fromdate = $scope.then;
    $scope.todate = $scope.now;
    $scope.showMitBtns = 'matrix';//or 'investigation' for MIT pagination tab visibility
	$scope.mitSort = { sortMit: '', sortIR: 'date', reverse: false };
	$scope.vinesSort= { key: '', reverse: false };
    $scope.currentPage = 1;
    $scope.tlnCauses = ["Accidental Contact", "Accidental Fire (forest fires,etc.)", "Bird", "Customer Request", "Equip Failed-OH", "Equip Failed-UG", "FDR Outage", "Improper Installation",
        "Lateral Outage", "Lightning Arrester", "Lightning with equip damage", "Loose Connection", "OCR Outage", "Osprey", "Other (explain)",
        "Other Animal", "Overloaded Normal Conditions", "Slack Conductors", "Squirrel", "Storm w/no equip damage", "Storm/Wind (with equip damage)", "Switching Error", "Tornado",
        "Transformer Outage", "Tree/Limb Preventable", "Tree/Limb Unpreventable", "Unknown", "Vehicle", "Vines/Grass", "Wind (clear day and high winds)"];
    $scope.investigationStatus = ['Explained', 'Unknown'];
    $scope.mitSub = "";
    $scope.cemi = {
        ytd: 0,
        twmoe: 0
    };    
    $("#day").datepicker({
        onSelect: function (dateText, inst) {
            var dateAsString = dateText;
            $scope.oneDate = $(this).datepicker('getDate');
            //console.log($scope.oneDate);
        }
	});
}

//moved to broker service
function buildQueryString(urlBase, obj){
    return urlBase + _(obj).map(function(value, key){return key + '=' + value}).reduce(function(memo, item){return memo + '&' + item});
}
//end of move

//moved to shared/services/dataUtilities.service.js
function getISODate(dt) {
    var mm = (1 + dt.getMonth()).toString();
    if (mm.length === 1)
        mm = '0' + mm;
    var dd = dt.getDate().toString();
    if (dd.length === 1)
        dd = '0' + dd;
    return dt.getFullYear().toString() + "-" + mm  + "-" + dd;
}

function getQuotedISODate(dt) {
    var mm = (1 + dt.getMonth()).toString();
    if (mm.length === 1)
        mm = '0' + mm;
    var dd = dt.getDate().toString();
    if (dd.length === 1)
        dd = '0' + dd;
    return "'" + dt.getFullYear().toString() + "-" + mm  + "-" + dd + "'";
}

function dateMinus(days) {
    var now = new Date();
    var then = new Date();
    then.setDate(now.getDate() - days);
    return then;
}
// end of move



//moved to app/shared/services/loadScreen.service.js
function showWait(msg, hidegif) {
    //setTimeout(function() {
        $.blockUI({
            css: {
                border: 'none',
                padding: '4px',
                backgroundColor: '#000',
                '-webkit-border-radius': '10px',
                '-moz-border-radius': '10px',
                opacity: .5,
                color: '#fff',
                baseZ: 200000
            },
            theme: false,
            title: 'NextGrid',
            message: '<h1><b>' + (msg || 'Loading') + '&nbsp;' + (!hidegif ? '<img src="images/ajax-loader.gif"/>' : '') + '</b></h1>'
        });
    //}, 0);
}
//end of move

function showNotification(msg) {
    var opts = {
        // whether to hide the notification on click
        clickToHide: false,
        // whether to auto-hide the notification
        autoHide: false,
        arrowShow: true,
        // arrow size in pixels
        arrowSize: 5,
        // position defines the notification position though uses the defaults below
        position: 'top center',
        // default positions
        globalPosition: 'top center',
        // default style
        style: 'bootstrap',
        // default class (string or [string])
        //className: 'biggerinfo',
        // show animation
        showAnimation: 'slideDown',
        // show animation duration
        showDuration: 150,
        // hide animation
        hideAnimation: 'slideUp',
        // hide animation duration
        hideDuration: 50,
        // padding between element and notification
        gap: 2
    };
    $.notify(msg || 'Please wait...', opts);
}

function showGridNotification(msg) {
    //$.notify("Access granted", "success");
    var opts = {
        // whether to hide the notification on click
        clickToHide: false,
        // whether to auto-hide the notification
        autoHide: false,
        arrowShow: true,
        // arrow size in pixels
        arrowSize: 5,
        // position defines the notification position though uses the defaults below
        position: 'top center',
        // default positions
        elementPosition: 'right',
        globalPosition: 'top center',
        // default style
        style: 'bootstrap',
        // default class (string or [string])
        className: 'biggerinfo',
        // show animation
        showAnimation: 'slideDown',
        // show animation duration
        showDuration: 400,
        // hide animation
        hideAnimation: 'slideUp',
        // hide animation duration
        hideDuration: 200,
        // padding between element and notification
        gap: 2
    };
    //$('#mitIRLink')
    //    .notify('Matching Tickets...', opts);
    $.notify(msg || 'Matching Tickets...', opts);
}

var labelFormatter = function (context) {
    var label = context.label;

    if (context.section === 'inner') {
        return label.toFixed(1) + '%';
    }
    return label;
};

function setIconColor(pole){
    if (pole.ytdHits > 0)
        if (pole.ytdHits < 6)
            return L.icon({iconUrl: 'images/ico_lit-heat_2.png', iconSize: [12,19], iconAnchor: [6,9], riseOnHover:false});
        else if (pole.ytdHits < 16)
            return L.icon({iconUrl: 'images/ico_lit-heat_3.png', iconSize: [12,19], iconAnchor: [6,9], riseOnHover:false});
        else
            return L.icon({iconUrl: 'images/ico_lit-heat_5.png', iconSize: [12,19], iconAnchor: [6,9], riseOnHover:false});
}

//moved to leaflet.directive.js
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
// end of move

//moved to leaflet.directive.js
function getCursorPos($scope, e){
    var latlng = $scope.map.mouseEventToLatLng(e);
    $scope.lat = latlng.lat;
    $scope.long = latlng.lng;
}
//end of move

function colorCond(sev){
    var ike;
    switch(sev){
        case 5: ike = L.icon({iconUrl: 'images/icon_ca5.png', iconSize: [17,26], iconAnchor: [7,26], riseOnHover:false}); break;
        case 4: ike = L.icon({iconUrl: 'images/icon_ca4.png', iconSize: [17,26], iconAnchor: [7,26], riseOnHover:false}); break;
        case 3: ike = L.icon({iconUrl: 'images/icon_ca3.png', iconSize: [17,26], iconAnchor: [7,26], riseOnHover:false}); break;
        case 2: ike = L.icon({iconUrl: 'images/icon_ca2.png', iconSize: [17,26], iconAnchor: [7,26], riseOnHover:false}); break;
        case 1: ike = L.icon({iconUrl: 'images/icon_ca1.png', iconSize: [17,26], iconAnchor: [7,26], riseOnHover:false}); break;
        case 0:
        default:ike = L.icon({iconUrl: 'images/icon_ca0.png', iconSize: [17,26], iconAnchor: [7,26], riseOnHover:false});
    }
    return ike;
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
    };

    if (vine.ticketStatus === "New") {
        vine.col = "blue";
        vine.sort1 = "0";
        vine.sort2 = vine.sentDate;
        stats.vines.blue++;
    }
    else if (vine.ticketStatus === "Ticketed" && getISODate(vine.ticketDate) < getISODate(dateMinus(30))){
        vine.col = 'red';
        vine.sort1 = "1";
        vine.sort2 = vine.ticketDate;
        stats.vines.red++;
    }
    else if (vine.ticketStatus === "Ticketed" && getISODate(vine.ticketDate) < getISODate(dateMinus(15))){
        vine.col = 'orange';
        vine.sort1 = "2";
        vine.sort2 = vine.ticketDate;
        stats.vines.orange++;
    }
    else if (vine.ticketStatus === "Sprayed"){
        vine.col = 'green';
        vine.sort1 = "3";
        vine.sort2 = vine.ticketDate;
        stats.vines.green++;
    }
    else if (vine.ticketStatus === "Held"){
        vine.col = 'grey';
        vine.sort1 = "4";
        vine.sort2 = vine.ticketDate;
        stats.vines.grey++;
    }
    else if (vine.ticketStatus === "Complete"){
        vine.col = 'green';
        vine.sort1 = "5";
        vine.sort2 = vine.ticketDate;
        stats.vines.green++;
    }
    else{
        vine.col = 'yellow';
        vine.sort1 = "6";
        vine.sort2 = vine.ticketDate;
        stats.vines.yellow++;
    }
}

function findVine($scope){
    var sos;
    var closest = 1000;
    var closeVine;
    _.forEach($scope.vines, function(vine) {
        sos = Math.pow($scope.lat - vine.latitude, 2) + Math.pow($scope.long - vine.longitude, 2);
        if (sos < closest){
            closest = sos;
            closeVine = vine;
        }
    });
    if (closest < .00002)
        return closeVine;
    else
        return null;
}

function renderPopText(vine) {
    var str = '<h3>Vines</h3>';
    str += '<b>' + vine.sentDate.toLocaleDateString() + ' ' + vine.sentDate.toLocaleTimeString();
    str += '</b><hr>';
    str += vine.from + '<br>';
    str += vine.comments || '';
    return str;
}

function myCircleOptions(color){
    return {
        color: color,
        opacity:.9,
        weight: 1,
        fillColor: color,
        fillOpacity:.5
    };
}

function getMapBounds($scope){
    var bounds = $scope.map.getBounds();
    $scope.south = bounds.getSouth();
    $scope.north = bounds.getNorth();
    $scope.west = bounds.getWest();
    $scope.east = bounds.getEast();
}


//moved to stem.service.js
var lgEmptyOverlay = function (control, layergroup, string) {
	var key = string;
	//key is a string that will be rendered in the html
    if ($.isEmptyObject(layergroup._layers) == false) {
		layergroup.addTo(map);
		control.addOverlay(layergroup, key);
		control[key] = layergroup;
		
	} else {
		control[key + '<span class="muted">(none)</span>'] = layergroup;
		control.addOverlay(layergroup, key + '<span class="muted">(none)</span>');
	}
};
//end of move

// moved to stem.service.js : New version of lgEmptyOverlay for GROUPED layer control
var addLayerToGroupedControl = function(groupArray, groupTitle, layergroup, string){
    var key = string;
    //if layerGroup._layers
    if ($.isEmptyObject(layergroup._layers) == false) {
        //groupedOverlays["Open Condition Assessment"]['<img src="../images/icon_ca0.png" class="legendIcon" style="height:20px;"/> low'] =  : condLayer0,
        groupArray[groupTitle][key] = layergroup;
        layergroup.addTo(map);
    } else {
        groupArray[groupTitle][key+ '<span class="muted">(none)</span>'] = layergroup;
    }
}


//**sideTabs Functions - opening & closing
function tabToggle() {
	//$("#tabCollapse").on('click', function () {
		//console.log("Ding");
		$("#tab-wrapper").toggleClass("tabHide tabShow");
		$("#tabClose").toggleClass("show hide");
		$("#tabOpen").toggleClass("show hide");
	//});
};
	//***switch between tabs
$("#sideTabMenu").children('li.tab').click(function () {
	//var child = event.target;
	console.log(this.id);
	if ($("#tab-wrapper").hasClass("tabHide")) {
		$("#tab-wrapper").toggleClass("tabHide tabShow");
		checkTab();
	}
	if (this.id == "vineTabLink") {
		tabsFix($("#vineTabLink"), $("#chartTab"));
	}
	if (this.id == "faultTablink") {
		tabsFix($("#faultTablink"), $("#faultsTab"));
	}
	if (this.id == "elTabLink") {
		tabsFix($("#elTabLink"), $("#EquipLog"));
	}
	if (this.id == "tktTabLink") {
		tabsFix($("#tktTabLink"), $("#tktTab"));
	}
});
	
function tabsFix(tabLink, tabPane) {
		$("#vineTabLink,#faultTablink, #elTabLink,#tktTabLink ").removeClass("active");
		$("#chartTab,#faultsTab,#EquipLog,#tktTab").removeClass("active");
		tabLink.addClass("active");
		tabPane.addClass("active");
}

var checkTab = function () {
	if ($("#tab-wrapper").hasClass("tabShow")) {
		$("#tabClose").removeClass("hide").addClass("show");
		$("#tabOpen").removeClass("show").addClass("hide");
	}
	else {
		$("#tabClose").removeClass("hide").addClass("show");
		$("#tabOpen").removeClass("show").addClass("hide");
	}
};
// ************** unused **********************
function matchOnPhase($scope, i){
    var phase = $scope.rows[i].phase;
    if (phase in $scope.phases)
        if ($scope.phases[phase])
            return true;

    return false;
}

function matchOnFeeder($scope, i){
    for (var f = 0; f < $scope.feeders.length; f++){
        if ($scope.rows[i].feederName === $scope.feeders[f].f)
            if ($scope.feeders[f].state === true)
                return true;
    }
    return false;
}

function setFilters($scope) {
    $scope.phases = {};
    $scope.phases["A"] = true;
    $scope.phases["B"] = true;
    $scope.phases["C"] = true;

    $scope.feeders = [];
    for (i = 0; i < $scope.rows.length; i++){
        if ($scope.rows[i].type === 'Feeder' && $scope.rows[i].phase === 'A'){
            var fdr = {f: $scope.rows[i].feederName, state: true};
            $scope.feeders.push(fdr);
        }
    }
}

function drawBackPath($scope){
// for each item in the path list back to the feeder, draw it highlighted
// if there is a previous highlighted path redraw it first
    var path;
    var obj = null;
    var row = null;
    if ($scope.lastPath) {
        path = $scope.lastPath;
        for (var i = path.length; i > 0; i--) {
            row = findRow(path[i], $scope);
            if (row)
                if (row.type === "ACLineSegment")
                    obj = drawLine(row, $scope);
                else
                    obj = drawNode(row, $scope, false);
            overlays.Path.push(obj);
        }
    }
    path = $scope.lcRow.pathBack;
    $scope.lastPath = path;
    var red = 'rgb(255,0,0)';
    for (var i = path.length; i > 0; i--){
        row = findRow(path[i], $scope);
        if (row)
            if (row.type === "ACLineSegment")
                obj = L.polyline(row.points, {weight: 2, color: red}).addTo($scope.map);
            else
                obj = drawNodeColored(row, $scope, red);
        overlays.Path.push(obj);
    }
}

function drawForwardPath($scope){
// forward path is all the assets that have us in their path
// first we need to get rid of the last one we drew by drawing over it
    var obj = null;
    var row = null;
    if ($scope.lastPathF) {
        for (var i = 0; i < $scope.lastPathF.length; i++){
            row = findRow($scope.lastPathF[i], $scope);
            if (row)
                if (row.type === "ACLineSegment")
                    obj = drawLine(row, $scope);
                else
                    obj = drawNode(row, $scope, false);
            overlays.Path.push(obj);
        }
    }
    $scope.lastPathF = [];
    var orange = 'rgb(255,165,0)';
    for (i = 0; i < $scope.rows.length; i++){
        row = $scope.rows[i];
        for (var j = 0; j < row.pathBack.length; j++){
            if (row.pathBack[j] === $scope.lcRow.id){
                $scope.lastPathF.push(row.id);
                if (row.type === "ACLineSegment")
                    obj = L.polyline(row.points, {weight: 2, color: orange}).addTo($scope.map);
                else
                    obj = drawNodeColored(row, $scope, orange);
            }
        }
    }
}

function drawNodeColored(asset, $scope, color){
    var node = null;
    try {
        var points = setPoint(asset.points[0][0], asset.points[0][1], $scope);
    }catch(e){
        return;
    }
    var scale = (($scope.zoomLevel - 10) / 6);

    if (asset.type === 'Feeder')
        node = DrawCircleFilled(20 * scale, color, points, $scope.map, 1);
    else if (asset.type === 'Switch - Open' || asset.type === 'Switch - Closed')
        node = DrawCircleFilled(8 * scale, color, points, $scope.map, 1);
    else if (asset.type === 'TransformerWinding')
        node = DrawCircleFilled(7 * scale, color, points, $scope.map, 1);
    else if (asset.type === 'Fuse')
        node = DrawCircleFilled(7 * scale, color, points, $scope.map, 1);
    else
        node = DrawCircleFilled(7 * scale, color, points, $scope.map, 1);

    return node;
};

var checkTab = function () {
	if ($("#tab-wrapper").hasClass("tabShow")) {
		$("#tabClose").removeClass("hide").addClass("show");
		$("#tabOpen").removeClass("show").addClass("hide");
	}
	else {
		$("#tabClose").removeClass("hide").addClass("show");
		$("#tabOpen").removeClass("show").addClass("hide");
	}
};


var swapClass = function (divA, divR, theClass) {
	$(divA).addClass(theClass);
	$(divR).removeClass(theClass);
};

function findWithAttr(array, attr, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i][attr] === value) {
			return i;
			break;
		}
	}
}