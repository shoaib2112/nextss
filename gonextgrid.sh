#!/bin/bash
Defaults:nextgridapp !requiretty
. /opt/rh/rh-nodejs4/enable
export NODE_ENV=production
nohup node nextGrid.js &
#
#