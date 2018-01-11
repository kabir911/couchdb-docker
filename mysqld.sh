#!/bin/bash

MYSQL_HOME=/usr
MYSQL_DB_PATH=/var/lib/mysql

if [ ! -d ${MYSQL_DB_PATH}/data ]
then
echo "Initialising server directories ..."
INIT="--initialize-insecure --console"
rm -rf ${MYSQL_DB_PATH}/data/*
rm -rf ${MYSQL_DB_PATH}/log/*
${MYSQL_HOME}/sbin/mysqld $INIT --basedir=${MYSQL_DB_PATH} --datadir=${MYSQL_DB_PATH}/data --plugin-dir=${MYSQL_HOME}/lib/plugin --tmpdir=/tmp --default-time-zone=+00:00 --general-log-file=${MYSQL_DB_PATH}/log/mysql_general.log --slow-query-log-file=${MYSQL_DB_PATH}/log/mysql_slow.log --log-error=${MYSQL_DB_PATH}/log/mysql_error.log --open-files-limit=1024 --pid-file=${MYSQL_DB_PATH}/mysql.pid --socket=${MYSQL_DB_PATH}/mysql.sock --port=3306 --secure-file-priv=${MYSQL_DB_PATH} --lc-messages-dir=/usr/share/mysql/english --user=mysql
else
echo "Running mysqld deamon in background ..."
${MYSQL_HOME}/sbin/mysqld --defaults-file=${MYSQL_DB_PATH}/my.cnf --basedir=${MYSQL_DB_PATH} --datadir=${MYSQL_DB_PATH}/data --plugin-dir=${MYSQL_HOME}/lib/plugin --tmpdir=/tmp --default-time-zone=+00:00 --general-log-file=${MYSQL_DB_PATH}/log/mysql_general.log --slow-query-log-file=${MYSQL_DB_PATH}/log/mysql_slow.log --log-error=${MYSQL_DB_PATH}/log/mysql_error.log --open-files-limit=1024 --pid-file=${MYSQL_DB_PATH}/mysql.pid --socket=${MYSQL_DB_PATH}/mysql.sock --port=3306 --secure-file-priv=${MYSQL_DB_PATH} --lc-messages-dir=/usr/share/mysql/english --user=mysql
fi