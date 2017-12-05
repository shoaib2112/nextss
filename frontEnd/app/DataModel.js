angular.module('nextGrid').service('DataModel', function ($http, broker, dateUtilities) {
    var url = null;
    var port = NEXTGRID_WEBSERVER_PORT;

    this.authenticate = function (usr) {
        url = "http://" + window.location.hostname + ":" + port + "/authenticate";
        return $http.post(url, JSON.stringify(usr) ).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getGroups = function (usr) {
        url = "http://" + window.location.hostname + ":" + port + "/authenticate/groups/" + usr;
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };


    this.getGridLines = function(sub) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/grid/?", {sub: sub._id});
        // url = "http://" + window.location.hostname + ":" + port + "/grid";

        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                console.log('problem with call to ' + url);
            }
        )
    };

    this.getGrid = function(sub, feeder) {
        // Get data from the REST service for the given ID.
        // For now, id is either sub or feeder, the API will decide
        if (!feeder) feeder = 'xxx';
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/assets/?", {sub: sub, feeder: feeder});
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                console.log("problem with call to " + url);
            }
        );
    };

    this.getLinesToEnd = function(fplid){
        url = "http://" + window.location.hostname + ":" + port + "/toEnd/"+fplid;
        console.log(url);
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                console.log("problem with call to " + url);
            }
        );
    };

    this.getALScount = function (subName){
        subName = subName.replace(/_/g, ' ');
        //console.log(subName);
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/devices/als/2yr?", {sub: subName});
        // console.log(url);
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                console.log("problem with call to " + url);
            }
        );
    };

    this.getALScountDetail = function (subName, bdate, edate, filterDates){
        // console.log(filterDates);
        subName = subName.replace(/_/g, ' ');
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/devices/als/count?", {sub: subName, bdate: dateUtilities.getQuotedISODate(bdate), edate: dateUtilities.getQuotedISODate(edate)});
        url = url.replace(/'/g, '');
        if(filterDates === null){}
        else if(filterDates !== null || filterDates !== undefined){
            // console.log('DING');
            url += "&dates="+filterDates;
        }
        // console.log(url);
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                console.log("problem with call to " + url);
            }
        );
    };

    this.getVine = function(type, value, then, now) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/vines?", {from: dateUtilities.getQuotedISODate(then), to: dateUtilities.getQuotedISODate(now), type: type, value: value});
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.putVine = function(vine) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/vines?", {aid: vine.aid, tdate: dateUtilities.getQuotedISODate(vine.ticketDate), action: vine.action, number: vine.ticketNumber, comm: vine.comments});
        return $http.put(url).then(
            function (response) {
                if (response.data.error){
                    alert(response.data.error);
                    return({status: 0});
                }
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
                return({status: 0});
            }
        );
    };

    this.getLtgDay = function (type, value, bdate, edate, filterDates) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/lightning/Daily?", {date: dateUtilities.getISODate(bdate),edate: dateUtilities.getISODate(edate), type: type, value: value});
        if(filterDates !==null){
            url += "&dates="+filterDates;
        }
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    //$.growlUI('Note:', response.data.error);
                    return({status: 0});
                };
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getSubLocations = function(){
        // console.log('getSubLocations');
        var url= "http://" + window.location.hostname + ":" + port + "/sublocation";
        // console.log(url);
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                }
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getLtgYTD = function (type, value) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/lightning/YTD?", {type: type, value: value});
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                };
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getRawLtgYTD = function (year, tl ,br) {

        url ="http://" + window.location.hostname + ":" + port + "/lightning/YTD_Raw/"+year+"/"+tl.x+"/"+tl.y+"/"+br.x+"/"+br.y;
        //console.log('raw lighting ytd url : ', url);
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                };
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getEvent = function (type, value) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/events?", {type: type, value: value});
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                };
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getTicket = function (type, value, startDate,endDate, filterDates) {
        // url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/tickets?", {type: type, value: value});
        if(startDate==endDate){
            url = "http://" + window.location.hostname + ":" + port + "/tickets/"+type+"/"+value+"/"+startDate;
        }else(
            url = "http://" + window.location.hostname + ":" + port + "/tickets/"+type+"/"+value+"/"+startDate+"/"+endDate
        );
        if(filterDates !==null){
            url += "?dates="+filterDates;
        }
        // console.log('TT url '+ url);
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                };
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
            
        );
        
    };

    this.getfeederFailurePoints = function (type, value) {
        // url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/tickets?", {type: type, value: value});
        var url = "http://" + window.location.hostname + ":" + port + "/tickets/trucks/11141066";
        return $http.get(url).then(
            function (response) {
                //console.log(response.data);
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );

    };

    this.getComplaints = function (type, value) {
        // url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/tickets?", {type: type, value: value});
        var url = "http://" + window.location.hostname + ":" + port + "/complaints?" + type + "=" + value;
    //console.log(url);
            return $http.get(url).then(
            function (response) {
                //console.log(response.data);
                var data= response.data;
                return data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );

    };

    this.getPolyMA = function () {
        var url = "http://" + window.location.hostname + ":" + port + "/polygonMgmtArea";
        // console.log(url);
        return $http.get(url).then(
            function (response) {
                //console.log(response.data);
                var data= response.data;
                return data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );

    };

    this.getEquip = function (type, value) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/equipLog?", {type: type, value: value});
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                }
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getCondDemo = function (type, value) { // Demo

        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/condAssess/demo" );

        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return ({ status: 0 });
                }
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    }; ///////////////////////////////////////////////

    this.getCond = function (type, value) {
        var values = "/condassess?" + type + "=" + value;
        url = "http://" + window.location.hostname + ":" + port + values;
        // console.log(url);
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                }
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getDevice = function (type, value) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/devices?", {type: type, value: value});
        // console.log(url);
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                }

                var afs = response.data.afs;
                return response.data;
            },
            function (data) {
                $.growlUI("problem " + data + " with call to " + url);
            }
        );
    };


    this.getPalm = function (type, value) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/palm?", {type: type, value: value});
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    //$.growlUI('Note:', response.data.error);
                    return({status: 0});
                }
                return response.data;
            },
            function (data) {
                $.growlUI("problem " + data + " with call to " + url);
            }
        );
    };

    this.getFault = function(selType, selValue, then, now) {
        url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/fault/maps?", {from: dateUtilities.getQuotedISODate(then), to: dateUtilities.getQuotedISODate(now), type: selType, value: selValue});
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                $.growlUI("problem " + data + " with call to " + url);
            }
        );
    };
    
    this.getExtendedId = function(subID, feederID){
        var posturl;

        if(typeof feederID !== 'undefined')
            posturl = "http://" + window.location.hostname + ":" + port + "/mongodevices/extendedids/" + subID + "/" + feederID;
        else
        posturl = "http://" + window.location.hostname + ":" + port + "/mongodevices/extendedids/" + subID;

        //console.log(posturl);
        return $http.get(posturl).then(
            function(response){
            return response.data;
        }
        )
    };


    this.getFAMP = function(subID, feederID){
        var geturl;

        if(typeof feederID!== 'undefined'){
            geturl = "http://" + window.location.hostname + ":" + port + "/FAMP/" + subID + "/" + feederID;
        }
        else {
            geturl = "http://" + window.location.hostname + ":" + port + "/FAMP/" + subID;
        }

        return $http.get(geturl).then(
            function(response){
                return response.data;
            }
        )
    };

    this.getCMEData = function(startDate, endDate, substation){
        var geturl;
        geturl = "http://" + window.location.hostname + ":" + port + "/cme?startDate=" + startDate +"&endDate=" + endDate + "&substation=" + substation;

        return $http.get(geturl).then(
            function(response){
                return response.data;
            }
        )
    };

    this.getGridData = function(){
        var posturl;
        posturl = "http://" + window.location.hostname + ":" + port + "/grid";

        return $http.get(posturl).then(
            function(response){
                return response.data;
            }
        )
    };

    this.getCropGridData = function(){

        var posturl;
        posturl = "http://" + window.location.hostname + ":" + port + "/cropGrid";

        return $http.get(posturl).then(
            function(response){
                return response.data;
            }
        )
    };
    this.getNav = function() {
        url = "http://" + window.location.hostname + ":" + port + "/metadata/";
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };
    
    // this.getCEMI = function (fdr) {
    //     var url = "http://" + window.location.hostname + ":" + port + "/cemi/" + fdr;
    //     return $http.get(url).then(
    //         function (response) {
    //             return response.data;
    //         },
    //         function (data) {
    //             alert("problem with call to " + url);
    //         }
    //     );
    // };
    
    this.getFeederTickets = function (fdr) {
        var url = "http://" + window.location.hostname + ":" + port + "/feedertickets/" + fdr;
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    // this.getMomentariesByMA = function () {
    //     var url = "http://" + window.location.hostname + ":" + port + "/momentaries/byma";
    //     return $http.get(url).then(
    //         function (response) {
    //             return response.data;
    //         },
    //         function (data) {
    //             alert("problem with call to " + url);
    //         }
    //     );
    // };
    this.getMomentaryCounts= function () {
        var url = "http://" + window.location.hostname + ":" + port + "/momentaries/aggregates";
        return $http.get(url).then(
            function (response) {
                // console.log('mom aggregates', response.data);
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getKnownMomentaryCounts= function () {
        var url = "http://" + window.location.hostname + ":" + port + "/momentaries/aggregates_by_type";
        return $http.get(url).then(
            function (response) {
                // console.log('mom type counts', response.data);
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getMomDetails = function(selType,id,startDate, endDate){
        id=id.replace(/_/g,' ');
        var url = "http://" + window.location.hostname + ":" + port + "/momentaries/"+ selType + "/"+ id +"?dtbegin="+startDate+"&dtend="+endDate;
        // console.log('url', url);
        return $http.get(url).then(
            function (response) {
                // console.log('mom aggregates for ' + id +' ',response.data);
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
        

        // http://localhost:8080/momentaries/feeder/810063?dtbegin=2017-01-07&dtend=2017-05-07
        // http://localhost:8080/momentaries/sub/alexander?dtbegin=2017-01-07&dtend=2017-05-07
    };

    this.getHvtCurrent = function(date){
        //http://localhost:8080/work/hvt?date=2017-08-21
        var url = "http://" + window.location.hostname + ":" + port +"/work/hvt?" + "date=" + date;
        console.log('hvt request: ' + url);
        return $http.get(url).then(
            function (response) {
                // console.log('Current HVT' + id +' ',response.data);
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };
    
    
    this.getInvReport = function (mit) {
        var url = "http://" + window.location.hostname + ":" + port + "/invreport/?dtbegin=" + mit.dtbegin + "&dtend=" + mit.dtend + "&feeder_num=" + mit.feeder_num;
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.setInvReport = function (mit) {
        var url = "http://" + window.location.hostname + ":" + port + "/invreport";
        return $http.post(url, JSON.stringify(mit)).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.getMatrix = function (mit) {
        url = "http://" + window.location.hostname + ":" + port + "/mitmatrix/?dtbegin=" + mit.dtbegin + "&dtend=" + mit.dtend + "&feeder_num=" + mit.feeder_num;
        return $http.get(url).then(
            function (response) {
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
            }
        );
    };

    this.postWorkOrder = function(equipId) {
        url = buildQueryString("http://" + window.location.hostname + ":" + port + "/work?", {equipId: equipId});
        return $http.post(url).then(
            function (response) {
                if (response.data.error){
                    alert(response.data.error);
                    return({status: 0});
                }
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
                return({status: 0});
            }
        );
    };

    this.postMomEdit = function(edits){
        url = "http://" + window.location.hostname + ":" + port + "/momentaries";
        return $http.post(url, JSON.stringify(edits)).then(
            function (response) {
                // console.log('RESPONSE', response);
                if (response.data.error) {
                    alert(response.data.error);
                    return null;
                }
                return response.config.data;
            }
        );
    };
//copy of getEvents
    this.getFeederFailurePoints = function () { //type, value
        //TODO need to get URL & Parameters
        //url = broker.buildQueryString("http://" + window.location.hostname + ":" + port + "/events?", {type: type, value: value});
        return $http.get(url).then(
            function (response) {
                if (response.data.error) {
                    $.unblockUI();
                    $.growlUI('Note:', response.data.error);
                    return({status: 0});
                }
                return response.data;
            },
            function (data) {
                alert("problem with call to " + url);
                return({status: 0});
            }
        );
    };
});

