#!/bin/bash

if [ "${1}" == "" ] || [ "${2}" == "" ] || [ "${3}" == "" ] || [ "${4}" == "" ] || [ "${5}" == "" ]
then
	echo "USAGE: $0 <company name> (Must match global master data e.g 'HSH Nordbank' or 'Deka Bank') <couchdb admin user> <couchdb admin password> <https server port e.g 8443> <couchdb port e.g 5984> <(optional) run reverseproxy outside docker - development>"
	exit 1
fi

COMPANY_NAME=${1}
COUCHDB_USER=${2}
COUCHDB_PASSWORD=${3}
HTTPS_PORT=$4
COUCHDB_PORT=$5
REVERSE_PROXY=${6}

if [ "${COMPANY_NAME}" != "HSH Nordbank" ] && [ "${COMPANY_NAME}" != "Deka Bank" ]
then
echo "Company name must be 'HSH Nordbank' or 'Deka Bank'!"
exit 1
else
COMPANY_NAME=`echo ${COMPANY_NAME} | sed "s| ||g"`
fi

PSALL_CONTAINER_ID=`docker ps --all --filter=label='server-${COMPANY_NAME}' --format="{{.ID}}"`
CONTAINER_ID=`docker ps --filter=label='server-${COMPANY_NAME}' --format="{{.ID}}"`
if [ "${CONTAINER_ID}" == "" ]
then
	docker rm -f ${PSALL_CONTAINER_ID}
else
	if [ "${REVERSE_PROXY}" == "" ]
	then
		docker rm -f ${PSALL_CONTAINER_ID}	
	fi
fi

IMAGE_ID=`docker images --filter=reference='couchdb*' --format="{{.ID}}"`

if [ ! -d ${pwd}/data/"${COMPANY_NAME}" ]
then
mkdir -p ${pwd}/data/"${COMPANY_NAME}"
fi

# docker run -d --cidfile /tmp/$$docker.cid -p 5984:5984 -p 6984:6984 -v $(pwd)/data:/opt/couchdb/data --label couchdb="couchdb" --name couchdb ${IMAGE_ID} -e COUCHDB_USER=${COUCHDB_USER} -e COUCHDB_PASSWORD=${COUCHDB_PASSWORD}
if [ "${REVERSE_PROXY}" == "" ]
then
	echo `date`" Couchdb db and reverse proxy running in Docker. Use docker logs <container id> to inspect container logs ..."
#	docker run -d -p 443:8443 -p 5986:5986 -p 6984:6984 -p 3306:3306 \
	docker run -d -p $HTTPS_PORT:8443 \
	-v $(pwd)/data/"${COMPANY_NAME}":/opt/couchdb/data \
	--label couchdb="server-${COMPANY_NAME}" \
	-e NODENAME="${COMPANY_NAME}" -e COUCHDB_USER="${COUCHDB_USER}" -e COUCHDB_PASSWORD="${COUCHDB_PASSWORD}" \
	--name "server-${COMPANY_NAME}" ${IMAGE_ID}
else
	if [ "${CONTAINER_ID}" == "" ]
	then
		echo `date`" Couchdb db running in Docker ..."
# docker run -d -p 5984:5984 -p 3306:3306 \
		docker run -d -p $COUCHDB_PORT:5984 \
		-v $(pwd)/data/"${COMPANY_NAME}":/opt/couchdb/data \
		--label couchdb="server-${COMPANY_NAME}" \
		-e NODENAME="${COMPANY_NAME}" -e COUCHDB_USER="${COUCHDB_USER}" -e COUCHDB_PASSWORD="${COUCHDB_PASSWORD}" \
		--name "server-${COMPANY_NAME}" ${IMAGE_ID}
	fi
	export NODE_PATH=./couchdbreverseproxy/nodejs/node_modules
	echo `date`" Running event listener ..."	
	./couchdbreverseproxy/nodejs/eventlistener.js --company=${COMPANY_NAME} &
	echo `date`" Running reverse proxy ..."	
	./couchdbreverseproxy/nodejs/couchdbreverseproxy.js --company=${COMPANY_NAME} --port=$HTTPS_PORT
fi


# CONTAINER_ID=`cat /tmp/$$docker.cid | cut -c1-12`
# rm -f /tmp/$$*
# echo "{ \"HOST\" : \"`docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_ID}`\", \"container_id\" : \"${CONTAINER_ID}\" }"
	
