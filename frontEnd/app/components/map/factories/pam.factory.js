/**
 * Created by MXB0A19 on 6/15/2016.
 */

(function() {

    angular.module("nextGrid")
        .factory('pamsF', pams);

    function pams() {
        var service = {
            data: {
                pams: {
                    "feeder_id": 700932,
                    "alert_type": "Orange",
                    "alert_sent_utc": "2016-05-29T14:08:03Z",
                    "model_version": "1.0",
                    "alert_time_utc": "2016-05-29T18:03:00Z",
                    "anomalies": [
                        {
                            "Signal": "HALLANDALE FEEDER 2W85_F0932 BKR CLOSED MAINT By LJA0WSO",
                            "DeviceType": "FEEDER",
                            "DeviceId": "2W85_F0932",
                            "Time": "2016-05-29T18:03:00Z",
                            "Anomaly": "BKR_CLOSE",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE FEEDER 2W85_F0932 BKR CLOSED",
                            "DeviceType": "FEEDER",
                            "DeviceId": "2W85_F0932",
                            "Time": "2016-05-29T17:56:00Z",
                            "Anomaly": "BKR_CLOSE",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE FEEDER 2W85_F0932 BKR CLOSED",
                            "DeviceType": "FEEDER",
                            "DeviceId": "2W85_F0932",
                            "Time": "2016-05-29T17:40:00Z",
                            "Anomaly": "BKR_CLOSE",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE FEEDER 2W85_F0932 BKR OPEN",
                            "DeviceType": "FEEDER",
                            "DeviceId": "2W85_F0932",
                            "Time": "2016-05-29T18:01:00Z",
                            "Anomaly": "BKR_OPEN",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE FEEDER 2W85_F0932 BKR OPEN",
                            "DeviceType": "FEEDER",
                            "DeviceId": "2W85_F0932",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "BKR_OPEN",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE FEEDER 2W85_F0932 BKR OPEN",
                            "DeviceType": "FEEDER",
                            "DeviceId": "2W85_F0932",
                            "Time": "2016-05-29T17:44:00Z",
                            "Anomaly": "BKR_OPEN",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE FDRHD F0932 ENGZ DE-ENERGIZED",
                            "DeviceType": "FDRHD",
                            "DeviceId": "F0932",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "FDRHD_DE_ENERGIZED",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE FDRHD F0932 ENGZ ENERGIZED",
                            "DeviceType": "FDRHD",
                            "DeviceId": "F0932",
                            "Time": "2016-05-29T17:40:00Z",
                            "Anomaly": "FDRHD_ENERGIZED",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.PF.C_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "PF_SPIKES",
                            "DevicePh": "C"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.PF.A_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "PF_SPIKES",
                            "DevicePh": "A"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.PF.B_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "PF_SPIKES",
                            "DevicePh": "B"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.THD_current",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "THD_SPIKES",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.I.A_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "ZERO_CURRENT",
                            "DevicePh": "A"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.I.B_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "ZERO_CURRENT",
                            "DevicePh": "B"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.I.C_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "ZERO_CURRENT",
                            "DevicePh": "C"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.MW",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "ZERO_POWER",
                            "DevicePh": "-"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.V.C_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "ZERO_VOLTAGE",
                            "DevicePh": "C"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.V.B_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "ZERO_VOLTAGE",
                            "DevicePh": "B"
                        },
                        {
                            "Signal": "HALLANDALE.FDR.700932_2W85.V.A_PH",
                            "DeviceType": "PHASER",
                            "DeviceId": "2W85",
                            "Time": "2016-05-29T17:00:00Z",
                            "Anomaly": "ZERO_VOLTAGE",
                            "DevicePh": "A"
                        }
                    ]
                }
            },
            getDataFromServer: getDataFromServer
        };
        
        function getDataFromServer() {
            return service.data.pams;
        }
    }
})();