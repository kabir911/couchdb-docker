var express = require('express');
var utils = require('../shared/utils.js');
var config  = require('../configuration/config');
var security = require('../shared/security.js');
const axios = require('axios');
var Web3 = require('web3');
var bodyParser  = require('body-parser');
var SimpleMemberControllerJSON = require('../configuration/SimpleMemberController.json');
var deploy = require('../shared/deploy.js');

var app = module.exports = express.Router();

// Connect to blockchain
var web3 = new Web3(new Web3.providers.HttpProvider(config.BURL));   
web3.eth.getAccounts()
    .then( accts => {
        console.log( accts );      
    })
    .catch(e => {
        console.log("FAILED to connect to blockchain on " + config.BURL);
        console.log(e);    
    });

app.get('/asset/*', security.jwtCheck, function(request, response) {
    const assetURL = utils.getEndURL(request);    

    console.log('Get asset detail for asset',assetURL);
    axios({
        method: 'GET',
        url: config.TARGET + 'ssd/' + assetURL            
    })
    .then(result => {
        let jsonRes = {}
        const doc = result.data;
        jsonRes.JsonData = doc;
        response.status(200).send(JSON.stringify(jsonRes));    
    })
    .catch(() => {
        console.log('REJECT asset not found', assetURL);
        response.status(400).send(error);    
    })
    .catch(error => {
        console.log('ERROR asset not found', assetURL);
        response.status(400).send(error);    
    });
});

function _findByDocURL(asset) {
    return asset.AssetID.toUpperCase() == this.toUpperCase();
};

app.get('/assets/*', security.jwtCheck, function(request, response) {    
    const user = security.getUserFromToken(request);
    if (user) {
        console.log('Get assets for user',user);

        const userProxy = deploy.getProxyFromUser(user);
        console.log('userProxy', userProxy);        

        if (!userProxy) {
            return response.status(400).send('User Proxy not found!');
        }

        response.setHeader('Content-Type', 'application/json');

        axios({
            method: 'GET',
            url: config.TARGET + 'events/_all_docs?include_docs=true'            
        })
        .then(result => {
            const resultData = new Array();
            result.data.rows.forEach( row => {
                const doc = row.doc;
                if ( (doc.seller.toUpperCase() == userProxy.toUpperCase()) || (doc.buyer.toUpperCase() == userProxy.toUpperCase()) )
                {
                    if (resultData.findIndex(_findByDocURL, doc.url) == -1) {
                        resultData.push({'AssetID' : doc.url, 'AssetRef' : doc.buyer })
                    }
                }
            });
            // console.log(resultData);
            response.status(200).send(resultData);    
        })
        .catch(error => {
            console.log(error);
            response.status(400).send(error);    
        });

        /*
        axios({
            method: 'GET',
            url: config.TARGET + 'ssd/_all_docs'            
        })
        .then(result => {
            const resultData = new Array();
            result.data.rows.forEach( row => {
                resultData.push({'AssetID' : row.key, 'AssetRef' : config.PROXY })
            });
            console.log(resultData);
            response.status(200).send(resultData);    
        })
        .catch(error => {
            console.log(error);
            response.status(400).send(error);    
        });
        */                        
    } else {
        response.status(403).send('User not found in token!');    
    }
});

/*
app.post('/asset/*', security.jwtCheck, bodyParser.json(), function(request, response) {
    const offlineTxn = request.body.OfflineTx;
    // const hash = utils.getPreEndURL(request);
    const ssd = request.body.JsonData;    
    const hash = ssd.hash;

    // Write SSD to offchain database
    console.log('Forwarding createSSD raw transaction with hash ' + hash + ' to ' + config.BURL);
    // console.log('Forwarding raw transaction txn ' + offlineTxn);
    web3.eth.sendSignedTransaction(offlineTxn, function (error, transactionHash) {
        if (error) {
            console.log('Error: ', error);            
        } else {
            console.log('Sent CreateSSD - ' + transactionHash + ' to ' + config.BURL);            
            // Send offchain data to couchdb                        
            axios({
                method: 'PUT',
                url: config.TARGET + 'ssd/'+encodeURIComponent(ssd.address),
                data: ssd
            })
            .then(response => {
                console.log('Offchain written ...');
                // console.log(response.data.explanation);
            })
            .catch(error => {
                console.log(error);
            });
        }
    });                     

    console.log('Return success');
    response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
    response.status(200).send("{ success: 1 }");
});
*/

app.put('/asset/*', security.jwtCheck, bodyParser.json(), function(request, response) {
    console.log('CREATE / MODIFY asset', request.body);
    const offlineTxn = request.body.OfflineTx;
    // const hash = utils.getPreEndURL(request);
    const ssd = JSON.parse(request.body.JsonData);    
    // const hash = ssd.hash;

    console.log('Forwarding modifySSD raw transaction ' + ssd.address + ' to ' + config.BURL);
    web3.eth.sendSignedTransaction(offlineTxn, function (error, receipt) {
        if (error) {
            console.log('Error: ', error);            
        } else {
            console.log('Sent Modify SSD with receipt ' + receipt + ' to ' + config.BURL);            
            // Send offchain data to couchdb                        
            axios({
                method: 'PUT',
                url: config.TARGET + 'ssd/'+encodeURIComponent(ssd.address),
                data: request.body.JsonData
            })
            .then(response => {
                console.log('Offchain written ...');
                // console.log(response.data.explanation);
            })
            .catch(error => {
                console.log(error);
            });
        }
    });                     

    console.log('Return success');
    response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
    response.status(200).send("{ success: 1 }");
});
