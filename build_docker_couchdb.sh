#!/bin/bash

VERSION=v1

docker build --tag couchdb:${VERSION} \
--build-arg VERSION=${VERSION}.0 \
--file Dockerfile .
