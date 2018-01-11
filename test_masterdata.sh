#!/bin/bash

PORT=$1
# -d '{ "JsonData" : { \"CompanyID\" : \"0x7bc56a07b095dc3ca7dad4c6a3be4279c361b8da\", \"CompanyController\": \"0x62eec4181d9f5645f518c9bd84b664e430cded27\" } }' \
# -d '{ "JsonData" :  "Kabir" }' \

echo "PUT https://localhost:$PORT/masterdata/test"
curl -k -H "content-type: application/json" -X PUT \
-d '{ "JsonData" : { \"CompanyID\" : \"0x7bc56a07b095dc3ca7dad4c6a3be4279c361b8da\", \"CompanyController\": \"0x62eec4181d9f5645f518c9bd84b664e430cded27\" } }' \
    https://localhost:$PORT/masterdata/test

echo "GET https://localhost:$PORT/masterdata/test"
curl -k  -H "content-type: application/json" -X GET https://localhost:$PORT/masterdata/test
