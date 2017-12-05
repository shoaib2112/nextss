/**
 * Created by ajh0e3s on 6/30/2016.
 */
(function(){
    angular.module('nextGrid').controller('showMatrixCtrl', function ($scope, $uibModalInstance, DataModel,controlPanelSelection, areaF, managementArea, loadScreen, stemNGS, $cookies ) {
        //$scope.matrixOk = function () { $uibModalInstance.close(); };
        //$scope.createWorkRequest = function(tln) {
        //var resp = DataModel.postWorkOrder(tln);
        // if (resp)
        //     put ok message on screen, grey out button
        // else
        //     put fail message?
        //};

        //substation id with spaces instead of underscores
        $scope.mitSubFilter = '';
        //TODO for old  Management Area Names - remove when fixed in Database
        $scope.mitMAFilter;
        $scope.showFilter = true;
        (function init() {
            $scope.controlPanelSelectionData = controlPanelSelection.data;
            $scope.areaFData = areaF.data;
            $scope.managementAreas = managementArea.data;
            $scope.managementAreaSelected = managementAreaSelected;
            $scope.serviceCenterSelected = serviceCenterSelected;
            $scope.substationSelected = substationSelected;
            $scope.feederSelected = feederSelected;
            $scope.tlnCauses = ["Accidental Contact", "Accidental Fire (forest fires,etc.)", "Bird", "Customer Request", "Equip Failed-OH", "Equip Failed-UG", "FDR Outage", "Improper Installation",
                "Lateral Outage", "Lightning Arrester", "Lightning with equip damage", "Loose Connection", "OCR Outage", "Osprey", "Other (explain)",
                "Other Animal", "Overloaded Normal Conditions", "Slack Conductors", "Squirrel", "Storm w/no equip damage", "Storm/Wind (with equip damage)", "Switching Error", "Tornado",
                "Transformer Outage", "Tree/Limb Preventable", "Tree/Limb Unpreventable", "Unknown", "Vehicle", "Vines/Grass", "Wind (clear day and high winds)"];
            $scope.causeCodes = [
                {"cause_code": "Accidental Contact", "color": "#ff6", "cause_id": "041"},
                {"cause_code": "Accidental Fire (forest fires,etc.)", "color": "#cccc00", "cause_id": "003"},
                {"cause_code": "Bird", "color": "#FFD3AB", "cause_id": "009"},
                {"cause_code": "Customer Request", "color": "#8C1844", "cause_id": "193"},
                {"cause_code": "Equip Failed-OH", "color": "#393b79", "cause_id": "188"},
                {"cause_code": "Equip Failed-UG", "color": "#5254a3", "cause_id": "189"},
                {"cause_code": "FDR Outage", "color": "#f00", "cause_id": ""},
                {"cause_code": "Improper Installation", "color": "#A85D7B", "cause_id": "183"},
                {"cause_code": "Lateral Outage", "color": "#6b6ecf", "cause_id": ""},
                {"cause_code": "Lightning Arrester", "color": "#787bd3", "cause_id": "085"},
                {"cause_code": "Lightning with equip damage", "color": "#b3e7ff", "cause_id": "001"},
                {"cause_code": "Loose Connection", "color": "#9e9ac8", "cause_id": "202"},
                {"cause_code": "OCR Outage", "color": "#AF1420", "cause_id": ""},
                {"cause_code": "Osprey", "color": "#ffbb80", "cause_id": "017"},
                {"cause_code": "Other (explain)", "color": "#B4B4B4", "cause_id": "197"},
                {"cause_code": "Other Animal", "color": "#ff9233", "cause_id": "011"},
                {"cause_code": "Overloaded Normal Conditions", "color": "#C18FA3", "cause_id": "172"},
                {"cause_code": "Slack Conductors", "color": "#bcbddc", "cause_id": "196"},
                {"cause_code": "Squirrel", "color": "#e66b00", "cause_id": "007"},
                {"cause_code": "Storm w/no equip damage", "color": "#0096db", "cause_id": "002"},
                {"cause_code": "Storm/Wind (with equip damage)", "color": "#33beff", "cause_id": "006"},
                {"cause_code": "Switching Error", "color": "#ea6e77", "cause_id": "046"},
                {"cause_code": "Tornado", "color": "#7594a3", "cause_id": "013"},
                {"cause_code": "Transformer Outage", "color": "#dadaeb", "cause_id": "094"},
                {"cause_code": "Tree/Limb Preventable", "color": "#2ca02c", "cause_id": "020"},
                {"cause_code": "Tree/Limb Unpreventable", "color": "#98df8a", "cause_id": "021"},
                {"cause_code": "Unknown", "color": "#454545", "cause_id": "190"},
                {"cause_code": "Vehicle", "color": "#720934", "cause_id": "040"},
                {"cause_code": "Vines/Grass", "color": "#5fd35f", "cause_id": "025"},
                {"cause_code": "Wind (clear day and high winds)", "color": "#007ab3", "cause_id": "005"}
            ];

            $scope.investigationStatus = ['Explained', 'Unknown'];

            $scope.controlPanelSelectionData = controlPanelSelection.data;
            $scope.areaFData = areaF.data;
            managementAreaSelected();
            switch (areaF.data.mostSpecificSelectionType) {
                case 'feeder':
                    substationSelected();
                    feederSelected();
                    break;
                case 'sub':
                    substationSelected();
                    break;
                case 'sc':
                    serviceCenterSelected();
                    break;
                case 'ma':
                    managementAreaSelected();
                    break;
            }

        })();

        $scope.mitMatrixCurrentPage = 1;
        $scope.mitInvestigationReportCurrentPage = 1;

        //OLD ONE
        //determines which CSV buttons and pagination controls show in the MIT footer
        $scope.showMitBtns = 'matrix';
        //Sort key and order for MIT tables and MIT Investigation Report
        $scope.mitSort = {sortMit: '', sortIR: 'date', reverse: false};

        //CSV Export Variables - Columns to export and headers
        $scope.mitCsvColumns = ['AREA', 'SUBSTATION', 'FDR_NUM', 'MCOUNT', 'FDR_M_YTD', 'FDR_M_12MOE', 'FDR_N_YTD', 'INTERRUPTIONS',
            'LAT_N_YTD', 'LAT_N_12MOE', 'RELAYTYPE', 'GIGX', 'gigx_change', 'toggle', 'FIS', 'VEG_FEEDER', 'VEG_LATERAL',
            'fci', 'cfci', 'AFS', 'ALS', 'HARDENING', 'LAST_THERMOINSPECTION', 'LAST_INSPECTIONDATE', 'THERMO', 'PRIORITY_FDR', 'POLE', 'psc', 'FEEDEROH', 'LATERALOH', 'CUSTOMERS'];
        $scope.mitCsvExportHeaders = ['MA', 'Substation', 'Feeder', 'MOMs Today', 'M YTD', 'M 12 Month Ending', 'Int FDR YTD', 'Int FDR 12 MOE',
            'Int Lat YTD', 'Int Lat 12 MOE', 'Relay', 'GI-GX', 'GI-GX Change', 'Toggle', 'FIS', 'Trim Fdr', 'Trim Lat',
            'FCIs', 'cFCIs', 'AFS', 'ALS', 'Harden Date', 'Thermo Date', 'Visual Insp Date', 'OHLI Insp', 'PF', 'Pole Insp', 'PSC Cust', 'OH Fdr Miles', 'OH Lat Miles', 'Customers'];
        $scope.mitIrCsvColumns = ['ma', 'substation', 'fdr_num', 'fdr_n_ystd', 'lat_n_ystd', 'mom_ystd', 'twlv_moe', 'date', 'event_dttm', 'accuracy', 'status_code', 'comments',
            'cause_code', 'event_info', 'tln', 'trbl_tckt_num', 'irpt_caus_code', 'tckt_type_code', 'weather', 'investigation_wr'];
        $scope.mitIrCsvExportHeaders = ['MA', 'Substation', 'Feeder', 'Fdr N YTD', 'Lat N YTD', 'Fdr M YTD', 'Fdr M 12 MOE', 'Date', 'SCADA Time', 'Fault Map?', 'Investigation Status',
            'Comments', 'Cause', 'Event Info', 'TLN-FPLID Cause Location', 'TCMS Ticker #', 'TCMS Cause Code', 'Ticket Type', 'weather', 'Active TT#', 'TT Status'];

        function managementAreaSelected() {
            stemNGS.initiateClearSubstationMoms();
            stemNGS.initiateSubstationGridClear();
            areaF.managementAreaSelected();
            stemNGS.initiateMapSubstationMoms();
            stemNGS.setBounds();
            var tempSubstationList=[];
            if ($scope.areaFData.selectedManagementArea._id === 'All') {
                $scope.clearMIT();
                $scope.mitMAFilter = 'All';
            }
            else {
                $scope.serviceCentersList = $scope.areaFData.selectedManagementArea.serviceCenters;
                for (var key in $scope.areaFData.selectedManagementArea.serviceCenters) {
                    if ($scope.areaFData.selectedManagementArea.serviceCenters.hasOwnProperty(key)) {
                        angular.merge(tempSubstationList, $scope.areaFData.selectedManagementArea.serviceCenters[key].substations);
                    }
                }
                $scope.mitMAFilter = $scope.areaFData.selectedManagementArea._id;
                $scope.substationsList = tempSubstationList;
                areaF.setMostSpecificSelectionAndType();
                $scope.mitSubFilter = '';
            }
            console.log('mit MA filter   ', $scope.mitMAFilter);
        }

        function serviceCenterSelected() {
            stemNGS.initiateSubstationGridClear();
            areaF.serviceCenterSelected();
            stemNGS.mapSubstationMoms();
            stemNGS.setBounds();

            areaF.setMostSpecificSelectionAndType();
            $scope.mitSubFilter = '';
            $scope.mitMAFilter = $scope.areaFData.selectedManagementArea._id;
        }

        function substationSelected() {

            areaF.substationSelected();
            areaF.setMostSpecificSelectionAndType();
            stemNGS.initiateSubstationGridClear();
            stemNGS.initiateSubstationGridDraw();
            stemNGS.setBounds();

            $scope.mitMAFilter = $scope.areaFData.selectedManagementArea._id;
            $scope.mitSubFilter = $scope.areaFData.selectedSubstation._id.replace(/_/g, " ");
        }

        // function managementAreaSelected() {
        //     //     //TODO For old Management Area Names - remove when fixed in the back end
        //     //     if ($scope.controlPanelSelectionData.selectedManagementArea._id == "CB") {
        //     //         $scope.mitMAFilter = 'WG';
        //     //     } else if ($scope.controlPanelSelectionData.selectedManagementArea._id == "CD") {
        //     //         $scope.mitMAFilter = 'CE';
        //     //     } else if ($scope.controlPanelSelectionData.selectedManagementArea._id == "NB") {
        //     //         $scope.mitMAFilter = 'PM';
        //     //     } else if ($scope.controlPanelSelectionData.selectedManagementArea._id == "SB") {
        //     //         $scope.mitMAFilter = 'GS';
        //     //     } else {
        //     //         $scope.mitMAFilter = $scope.controlPanelSelectionData.selectedManagementArea._id
        //     //     }
        //     //
        //     // }
        // }

        // function serviceCenterSelected() {
        //     if ($scope.controlPanelSelectionData.selectedServiceCenter !== null) {
        //         $scope.controlPanelSelectionData.selectedManagementArea = $scope.managementAreas[$scope.controlPanelSelectionData.selectedServiceCenter.substations[Object.keys($scope.controlPanelSelectionData.selectedServiceCenter.substations)[0]].ma]
        //         $scope.substationsList = $scope.controlPanelSelectionData.selectedServiceCenter.substations;
        //
        //         controlPanelSelection.setMostSpecificSelectionAndType();
        //         $scope.mitSubFilter = '';
        //         $scope.mitMAFilter = $scope.controlPanelSelectionData.selectedManagementArea._id;
        //     }
        // }


        // function substationSelected() {
        //     if ($scope.controlPanelSelectionData.selectedSubstation !== null) {
        //         //debugger;
        //         $scope.controlPanelSelectionData.selectedManagementArea = $scope.managementAreas[$scope.controlPanelSelectionData.selectedSubstation.ma];
        //         $scope.serviceCentersList = $scope.controlPanelSelectionData.selectedManagementArea.serviceCenters;
        //         $scope.controlPanelSelectionData.selectedServiceCenter = $scope.managementAreas[$scope.controlPanelSelectionData.selectedSubstation.ma].serviceCenters[$scope.controlPanelSelectionData.selectedSubstation.sc];
        //         $scope.substationsList = $scope.controlPanelSelectionData.selectedServiceCenter.substations;
        //         $scope.controlPanelSelectionData.selectedSubstation = $scope.substationsList[$scope.controlPanelSelectionData.selectedSubstation._id];
        //
        //         controlPanelSelection.setMostSpecificSelectionAndType();
        //         //stemNGS.initiateSubstationGridClear();
        //         //stemNGS.initiateSubstationGridDraw();
        //         $scope.mitMAFilter = $scope.controlPanelSelectionData.selectedManagementArea._id;
        //         $scope.mitSubFilter = $scope.controlPanelSelectionData.selectedSubstation._id.replace(/_/g, " ");
        //     }
        // }

        $scope.clearMIT = function () {
            // controlPanelSelection.data.selectedManagementArea = $scope.managementAreas['all'];
            areaF.data.selectedServiceCenter = null;
            areaF.data.selectedSubstation = null;
            areaF.data.selectedFeeder = null;
            $scope.areaFData.selectedManagementArea = $scope.managementAreas['all'];
            $scope.serviceCentersList = $scope.areaFData.serviceCentersList;
            $scope.substationsList = $scope.areaFData.substationsList;
            $scope.mitTxtFilter = null;                                                              //  (+)(+)
            $scope.mitSubFilter='';                                                                  // /      \
                                                                                                    // \ -==- /
                                                                                                    //  \    /
                                                                                                    // <\/\/\/>
                                                                                                    // /      \
        };

        function feederSelected() {
            areaF.feederSelected();
            stemNGS.highlightSelectedFeeder();
            stemNGS.setBounds();
            $scope.mitMAFilter = $scope.areaFData.selectedManagementArea._id;
            areaF.setMostSpecificSelectionAndType();

            DataModel.getCEMI(areaF.data.selectedFeeder.name).then(function (data) {

                //get substation from feeder
                if (data.length) {
                    $scope.cemi = {};
                    $scope.cemi.ytd = data[0].CEMIYTD;
                    $scope.cemi.twmoe = data[0].CEMI12MOE;
                }
                else
                    $scope.cemi = { ytd : 0, twmoe: 0 };

            });

            if ($scope.showMitBtns !== 'investigation' ||
                !controlPanelSelection.data.selectedFeeder ||
                controlPanelSelection.data.selectedFeeder.name === '')
                    return;

            $scope.matchTickets();
        }

        //for sorting the tables
        $scope.mitKey = function (key) {
            $scope.mitSort.sortMit = key;   //set the sortKey to the param passed
            $scope.mitSort.reverse = !$scope.mitSort.reverse; //if true make it false and vice versa
            //console.log($scope.mitSort);
        };
        $scope.mitIrKey = function (key) {
            $scope.mitSort.sortIR = key;   //set the sortKey to the param passed
            $scope.mitSort.reverse = !$scope.mitSort.reverse; //if true make it false and vice versa
        };
        $scope.getWeather = function (cat, str) {
            if (!str || str === 'NULL' || str === 'Clr')
                return 'N';
            return (str.indexOf(cat) !== -1 ? 'Y' : 'N');
        };
        var swapClass = function (divA, divR, theClass) {
            $(divA).addClass(theClass);
            $(divR).removeClass(theClass);
        };

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

        $scope.matchTickets = function () {
            var fdr = controlPanelSelection.data.selectedFeeder.name;
            var r = $scope.momsIR;

            // var cnt = _.countBy(r, function (item) {
            //     return item.fdr_num == fdr;
            // });
            //
            // if (!cnt.true >= 1)
            //     return;

            showGridNotification();
            DataModel.getFeederTickets(fdr).then(function (tickets) {
                for (var i = 0, len = r.length; i < len; i++) {
                    if (r[i].fdr_num == $scope.controlPanelSelectionData.selectedFeeder.name) {
                        for (var t in tickets) {

                            try {
                                var mom = moment(r[i].event_dttm);
                                //console.log(String(Math.abs(mom.diff(tickets[t].TCKT_CRTE_DTTM, 'minutes'))) + "<=30==" + String(Math.abs(mom.diff(tickets[t].TCKT_CRTE_DTTM, 'minutes')) <= 30));

                                if (Math.abs(mom.diff(tickets[t].TCKT_CRTE_DTTM, 'minutes')) <= 30) {
                                    r[i].trbl_tckt_num = tickets[t].TRBL_TCKT_NUM;
                                    r[i].irpt_caus_code = tickets[t].IRPT_CAUS_CODE;
                                    r[i].tckt_type_code = tickets[t].TCKT_TYPE_CODE;
                                    r[i].irpt_caus_ds = tickets[t].IRPT_CAUS_DS;
                                    //console.log(r[i].fdr_num + ' matched');
                                    break;
                                }
                            }
                            catch (er) {
                                console.log(er);
                            }

                        }
                    }
                    if (r[i].trbl_tckt_num !== '' | r[i].weather !== null && r[i].weather !== 'Clr') {
                        r[i].status_code = 'Explained';
                    }
                    else
                        r[i].status_code = 'Unexplained';

                }
                $('.notifyjs-wrapper').trigger('notify-hide');

            });
        };

        // $scope.showEdit = function (comments, tln) {
        //     $('#txtComments').text(comments);
        //     $('#txtTLN').text(tln);
        //     setTimeout(function () {
        //         $.blockUI({ message: $('#editMOMForm') });
        //     }, 1000);
        //
        // };

        $scope.saveMom = function (rid, comments, tln, cause_code) {
            var payload = {
                rid: rid,
                slid: $scope.usr.slid || $cookies.get('nextGrid_slid'),
                comments: comments,
                tln: tln,
                cause_code: cause_code
            };

            DataModel.setInvReport(payload).then(function (data) {
                $.growlUI(data.message);
            });
        };

        $scope.changeMIT = function (btn) {
            $scope.showMitBtns = btn;
            $scope.showFilter = true;
            if ($scope.showMitBtns == 'matrix') {
                $('#mitTable').addClass('active in');
                $('#mitInvReport').removeClass('active in');
                $('#mitDashboard').removeClass('active in');
                $('#mitTabLink').addClass('active');
                $('#mitDashLink').removeClass('active');
                $('#mitIRLink').removeClass('active');
                $scope.momsIR = [];
                swapClass('#mitTable', '#mitInvReport', 'active in');
                swapClass('#mitTabLink', '#mitIRLink', 'active');

                if ($scope.mitmatrix.length == 0)
                    openMatrixModal();
            }
            else if ($scope.showMitBtns == 'investigation') {
                $scope.showFilter = false;
                if ($scope.feeder === '') {
                    $.growlUI('Please pick a Feeder.');
                    return;
                }

                loadScreen.showWait();
                var dt = new Date();
                dt.setDate(dt.getDate() + 1);
                var mit = {
                    dtbegin: new Date().getFullYear() + '-01-01',    // '2016-01-01',
                    dtend: dt.toISOString().split('T')[0], //'2016-01-05',
                    feeder_num: $scope.feeder
                };

                DataModel.getInvReport(mit).then(function (data) {
                    $scope.momsIR = [];
                    $scope.momsIR = data;
                    $.unblockUI();//- Buttons are now disabled if no resutls
                })
                    .then(function (data) {
                        $scope.matchTickets();
                    });

                swapClass('#mitInvReport', '#mitTable', 'active in');
                swapClass('#mitIRLink', '#mitTabLink', 'active');
                $('#mitDashboard').removeClass('active in');
                $('#mitDashLink').removeClass('active');
            }
            else if ($scope.showMitBtns == 'dashboard') {
                $('#mitDashboard').addClass('active in');
                $('#mitTable').removeClass('active in');
                $('#mitInvReport').removeClass('active in');
                $('#mitDashLink').addClass('active');
                $('#mitIRLink').removeClass('active');
                $('#mitTabLink').removeClass('active');
            }

            $('#mitTxtFilter').val("");
            $scope.mitSort = {sortMit: '', sortIR: 'date_time', reverse: false};
        };

        $scope.matrixClose = function () {
            $uibModalInstance.dismiss('cancel');
        };
        //TODO check cause column and change Investigation status to explained/unknown as needed call in page with onbeforesave="function()"
        //TODO save data
        //get cause (and cause ID code).
        //get comments value
        //get TLN or FPLID Cause Location
        //required format?
        //regex - format?

        //TODO Add in the pie charts
        //pie chart options
        var pieHeight = 250;
        var pieWidth = 250;
        var padding = 20;
        var height = pieHeight + padding + padding;
        var width = pieWidth + padding + padding;

        $scope.pieOptions = {
            "type": "pieChart",
            "height": height,
            "showLabels": true,
            "duration": 500,
            "labelThreshold": 0.01,
            "labelSunbeamLayout": true,
            "legend": {
                "margin": {
                    "top": 5,
                    "right": 0,
                    "bottom": 5,
                    "left": -250
                }
            }
        }
    });

})();