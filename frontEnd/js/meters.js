var realtimeAmiOutageLayer;
var amsLayer;

$(document).ready(function() {
    var now = new Date();
    $("#mEndDate").val(now);
    var start = new Date();
    start.setMinutes(now.getMinutes() - 20);
    $("#mStartDate").val(start);
})

function fixDivs() {
    $("#map_canvas").height($(window).height());
    $("#menuDiv").height($(window).height());
    $("#map_canvas").width($(window).width() - ($("#menuDiv").width() + 15));
}

function callBeforeMapsInitialize() {
    fixDivs();
    $(window).resize(function () {
        fixDivs();
    });
}

function callAfterMapsInitialize() {
    realtimeAmiOutageLayer = createAMIRealTimeOutageLayer(map);
    amsLayer = createAMSDeviceLayer(map);

    realtimeAmiOutageLayer.options = new AMIRealTimeOutageLayerOptions(
        $("#mShowPowerRestores").attr('checked'),
        $("#mShowLastGasps").attr('checked'),
        $("#mStartDate").val(),
        $("#mEndDate").val(),
        $("#mFeederNumber").val()
    );
    realtimeAmiOutageLayer.show();
    amsLayer.show();
    setRefreshInterval();
}

function changeLookBack() {
    realtimeAmiOutageLayer.hide();
    realtimeAmiOutageLayer.clearAMIRealTimeOutageLayerCache();
    realtimeAmiOutageLayer.options = new AMIRealTimeOutageLayerOptions(
        $("#mShowPowerRestores").attr('checked'),
        $("#mShowLastGasps").attr('checked'),
        $("#mStartDate").val(),
        $("#mEndDate").val(),
        $("#mFeederNumber").val()
    );
    realtimeAmiOutageLayer.show();
}
var timeOutInterval;

function setRefreshInterval() {
    if (timeOutInterval) {
        window.clearInterval(timeOutInterval);
    }
    if ($("#refreshInterval").val() != "null") {
        timeOutInterval = setTimeout(RefreshAMIOutage, $("#refreshInterval").val() * 60000);
    }
}

function RefreshAMIOutage() {
    // Only call this method from setRefreshInterval
    realtimeAmiOutageLayer.hide();
    realtimeAmiOutageLayer.clearAMIRealTimeOutageLayerCache();
    realtimeAmiOutageLayer.show();
    if ($("#refreshInterval").val() != "null") {
        timeOutInterval = setTimeout(RefreshAMIOutage, $("#refreshInterval").val() * 60000);
    }
}

function slideBack() {
    var startDate = $("#mStartDate").val();
    var endDate = $("#mEndDate").val();
    $.ajax({
        url: "//dpdcapps/net/iMVP/RealTimeAMIOutage.ashx?slideBack=slideBack&startDate=" + startDate + "&endDate=" + endDate,
        context: document.body,
        dataType: "json",
        error: function (xhr, message, exception) {
            alert(exception + ": " + xhr.responseText);
        },
        success: function (result, status, xhr) {
            startDate = result[0];
            endDate = result[1];
            $("#mStartDate").val(result[0]);
            $("#mEndDate").val(result[1]);
            changeLookBack();
        }
    });
}

function slideForward() {
    var startDate = $("#mStartDate").val();
    var endDate = $("#mEndDate").val();
    $.ajax({
        url: "//dpdcapps/net/iMVP/RealTimeAMIOutage.ashx?slideForward=slideForward&startDate=" + startDate + "&endDate=" + endDate,
        context: document.body,
        dataType: "json",
        error: function (xhr, message, exception) {
            alert(exception + ": " + xhr.responseText);
        },
        success: function (result, status, xhr) {
            startDate = result[0];
            endDate = result[1];
            $("#mStartDate").val(result[0]);
            $("#mEndDate").val(result[1]);
            changeLookBack();
        }
    });
}