#!/bin/bash

set -e

cleanup ()                                                                 
{                                                                          
  kill -s SIGTERM $!                                                         
  exit 0                                                                     
}                              

/mysqld.sh &
PID_LIST=$!
echo "Waiting 10 seconds before deploying schema ..."
sleep 10
cat /init.sql | mysql --host=127.0.0.1 --port=3306 -uroot -A
                                            
if [ "$1" = '/opt/couchdb/bin/couchdb' ]; then
	# we need to set the permissions here because docker mounts volumes as root
	chown -R couchdb:couchdb /opt/couchdb

	chmod -R 0770 /opt/couchdb/data

	chmod 664 /opt/couchdb/etc/*.ini
	chmod 664 /opt/couchdb/etc/local.d/*.ini
	chmod 775 /opt/couchdb/etc/*.d

	if [ ! -z "${NODENAME}" ] && ! grep "couchdb@" /opt/couchdb/etc/vm.args; then
		echo "-name couchdb@${NODENAME}" >> /opt/couchdb/etc/vm.args
	fi

	if [ "$COUCHDB_USER" ] && [ "$COUCHDB_PASSWORD" ]; then
		# Create admin
		printf "[admins]\n%s = %s\n" "$COUCHDB_USER" "$COUCHDB_PASSWORD" > /opt/couchdb/etc/local.d/docker.ini
		chown couchdb:couchdb /opt/couchdb/etc/local.d/docker.ini
	fi

	# if we don't find an [admins] section followed by a non-comment, display a warning
	if ! grep -Pzoqr '\[admins\]\n[^;]\w+' /opt/couchdb/etc/local.d/*.ini; then
		# The - option suppresses leading tabs but *not* spaces. :)
		cat >&2 <<-'EOWARN'
			****************************************************
			WARNING: CouchDB is running in Admin Party mode.
			         This will allow anyone with access to the
			         CouchDB port to access your database. In
			         Docker's default configuration, this is
			         effectively any other container on the same
			         system.
			         Use "-e COUCHDB_USER=admin -e COUCHDB_PASSWORD=password"
			         to set it in "docker run".
			****************************************************
		EOWARN
	fi

	echo `date`" vmargs ..."
	cat /opt/couchdb/etc/vm.args
	echo `date`" docker.ini ..."
	cat /opt/couchdb/etc/local.d/docker.ini
	echo `date`" exec gosu couchdb ..."
	exec gosu couchdb "$@" &
	
	echo `date`" Waiting 5 seconds before post setup..."
	sleep 5
	/post.sh
                                                                           
	trap cleanup SIGINT SIGTERM                                                
                                                                           
	while [ 1 ]                                                                
	do                                                                         
		sleep 60 &                                                             
		wait $!                                                                
	done
fi

exec "$@"