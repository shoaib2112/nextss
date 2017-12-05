#!/bin/bash
kill -9 $(ps aux | grep '/var/node/nextgrid')
sleep 2
./gonextgrid.sh