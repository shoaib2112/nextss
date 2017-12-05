idx_status_ma
{ 
    "BKR_OPEN_DTTM" : 1, 
    "Status" : 1, 
    "MGR_AREA_CODE" : 1
}

idx_status_fdr
{ 
    "BKR_OPEN_DTTM" : 1, 
    "Status" : 1, 
    "FDR_NUM" : 1
}

idx_status_sub
{ 
    "BKR_OPEN_DTTM" : 1, 
    "Status" : 1, 
    "SUBSTN_NAME" : 1
}


idx_tix
{ 
    "TCKT_CRTE_DTTM" : 1, 
    "SUBSTATION" : 1, 
    "FDR_NUM" : 1, 
    "MGR_AREA_CODE" : 1, 
    "TCKT_TYPE_CODE" : 1, 
    "SRV_CTR_NAME" : 1
}


idx_lightning
{ 
    "datetime" : 1, 
    "feeder" : 1, 
    "ma" : 1, 
    "sub" : 1, 
    "sc" : 1
}

dt_1_feeder_1
{ 
    "dt" : 1.0, 
    "feeder" : 1.0
}

Nash_Log
idx_dateTime
{ 
    "dateTime" : -1
}


complaints
idx_fdr
{ 
    "feederNum" : 1, 
    "inquiryDate" : -1
}
idx_ma
{ 
    "ma" : 1, 
    "inquiryDate" : -1
}


users
idx_slid
{ 
    "slid" : 1
}