**Couchdb**

What is couchdb? A restful document database with bi-directional replication/clustering built-in. The prototype currently uses this to sync data between different browser instances. Combined with pouchdb, it has the ability to provide out-of-box offline sync services for the Dapp.
Couchdb provides a Restful interface, syncing and document versioning out-of-the box. Such features are not typical of traditional RDBMS systems.

Have a look here https://pouchdb.com/
Have a look here http://couchdb.apache.org/

**Docker Couchdb with MySQL Reporting and Custom Reverse Proxy**

This sub project provides the necessary files to run a couchdb and mysql instance within a docker container including a custom reverse proxy that provisions our server API.
In order to use this project you need to have docker installed and most likely a linux distribution.

This image is based on debian jesse

The image will be extended to include various customisations

**Prerequisites**

A laptop/machine where you are developing with Linux.
You need to have docker installed. Please go here to get the latest version https://www.docker.com/

**Execution**

build_docker_couchdb.sh - this will build the docker couchdb image

run_docker_couchdb.sh company name admin user admin password - this will run the resulting docker image

e.g run_docker_couchdb.sh HSH admin secret

During development you will want to debug and adapt the reverse proxy so run the reverse proxy outside docker
e.g run_docker_couchdb.sh HSH admin secret DEV
This will automatically start the reverse proxy within the script using stdout

**Nodejs reverse proxy**

Couchdb has a neat feature of being able to run an os deamon as a reverse proxy which allows a completely customisable restful service. This IMPORTANT aspect allows all authorizations to be directed to the blockchain before forwarding the request to couchdb.

curl -k https://localhost:8443/db -> are routed to the couchdb. Other url patterns are handled by the custom API service.

curl -k https://localhost:8443/ssd -> ssd custom API service.

curl -k https://localhost:8443/auth -> auth custom API service.

curl -k https://localhost:8443/masterdata -> masterdata custom API service.

**MySQL as a Replicant**

There is a potential requirement to have a full feldged SQL relational interface to the data. Couchdb is not designed for such things however since replication/sync is built in a dbreplication nodejs deamon syncs the mysql.

**Browser PouchDB authorisation to CouchDB**

Given the idea of the reverse proxy. The SSD client uses pouchdb to receive the server couchdb data. This works out-of-the box and uses the same blockchain authorisation as normal API calls.

**Blockchain node**

The custom API server assumes a blockchain node is running on http://localhost:8545
If this is not the case you will see an error when the reverse proxy runs.

**Blockchain events**

The eventlistener.js deamon listens for blockchain events. When SSDs change status, modified etc. an event is triggered. The listener then makes a http couchdb request to update the corresponding SSDs.

**ssl**

Currently the docker image contains for the moment a self signed certificate for https access.
Please note to use via the browser Dapp you will have to manually accept the certificate in the browser inorder for the Dapp to work.

**Customisations**

The docker image deploys 4 databases ssd, users, general and audit and mysql replicant containing the ssd database for reporting.

**Fauxton**
(Currently DOES not work with the reverse proxy)
Couchdb ships with a futon management interfact this can be accessed via https://localhost:8443/_utils

You need to use the admin user and password to login

Note: Firefox seems to have a issue with Fauxton however chrome works fine.

**Useful Docker Commands**

* docker images - lists all docker installed docker images
* docker rmi imageid - removes an image
* docker ps - lists currently running containers
* docker ps --all - lists all recently run containers
* docker kill containerid - kills a running container
* docker rm containerid - removes a killed container
* docker logs containerid - shows the log output of a container
* docker logs -f containerid - tails the log output of a container
* docker exec -it containerid /bin/bash - provides an interactive bash shell to a running container that has bash installed

 Please consult the online docker documentation for more details.
# couchdb-docker
