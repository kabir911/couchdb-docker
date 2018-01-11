#!/bin/bash

AU=${COUCHDB_USER}
AP=${COUCHDB_PASSWORD}

HOST="http://${AU}:${AP}@127.0.0.1:5984"
echo `date`" Post initialisation ${HOST} ..."
for DATABASE in _global_changes _metadata _replicator _users ssd user general ssd_hsh_nord ssd_nord_hsh audit events
do
    if [ $((`curl -s ${HOST}/${DATABASE} | grep -ic "error"`)) -eq 1 ]
    then
        echo "Creating database ${DATABASE} ..."
        curl -X PUT ${HOST}/${DATABASE}
    fi
done
