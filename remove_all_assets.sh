#!/bin/bash

#
# This script removes all docs from the couchdb ssd and event databases
# Just a helper for testing
#

for DATABASE in ssd event
do
echo "CLEANING ${DATABASE}"
curl -o /tmp/$$alldocs http://localhost:5984/${DATABASE}/_all_docs

for DOCLINE in `egrep "^{\"id" /tmp/$$alldocs`
do
    DOCID=`echo ${DOCLINE} | cut -f4 -d'"'`
    DOCREV=`echo ${DOCLINE} | cut -f14 -d'"'`
    echo "Deleting ${DOCID} revision ${DOCREV}"
    curl -X DELETE http://localhost:5984/${DATABASE}/${DOCID}?rev=${DOCREV}
done

rm -f /tmp/$$alldocs
done

echo "CLEANING MYSQL ssd database"

mysql --host=127.0.0.1 --port=3306 -uroot -Dssd -A << _ENDSQL_
TRUNCATE TABLE trades;
TRUNCATE TABLE last_seq;
INSERT INTO last_seq (seq) VALUES ('');
_ENDSQL_


echo "RESETTING start block number"

echo 0 > couchdbreverseproxy/nodejs/last_block_event.txt
