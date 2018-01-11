#!/bin/bash

PORT=$1

# HSH_MEMBER
# -X POST -d '{ "UserID" : "0xfcD2Af6C2343Fe2f7E5EaF0cBaf256F6E0CA4910", "CompanyID" : "0x7fda01c30dfc41249f35d86b776d9871f43a3049", "CompanyController": "0x24d190429eedcc4cbefab5032be78ed395527960" }' \
# DEKA MEMEBER
# -X POST -d '{ "UserID" : "0x0086765a09cf664ebe2f8b7324f222efaed1d871", "CompanyID" : "0x7bc56a07b095dc3ca7dad4c6a3be4279c361b8da", "CompanyController": "0x62eec4181d9f5645f518c9bd84b664e430cded27" }' \

curl -i -k \
    -H "content-type: application/json" \
    -H "Allow-type: application/json" \
    -H "Accept: */*" \
    -X POST -d '{ "UserID" : "0x0086765a09cf664ebe2f8b7324f222efaed1d871", "CompanyID" : "0x7bc56a07b095dc3ca7dad4c6a3be4279c361b8da", "CompanyController": "0x62eec4181d9f5645f518c9bd84b664e430cded27" }' \
    https://localhost:$PORT/login
