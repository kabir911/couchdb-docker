#!/usr/bin/node

var Web3 = require('web3');
var btoa = require('btoa');
var config  = require('./configuration/config');
var SSDManager = require('./configuration/SSDManager.json');
const fs = require('fs');
const axios = require('axios');
var deploy = require('./shared/deploy.js');
const minimist = require('minimist');

let args = minimist(process.argv.slice(2), {  
    default: {
        company: 'HSHNordbank'
    },
});

var ON_DEATH = require('death'); //this is intentionally ugly 

ON_DEATH(function(signal, err) {
    console.log( 'EXISTING event listener', args.company);
    process.exit();
})

const web3 = new Web3(new Web3.providers.WebsocketProvider(config.WSBURL));
// const web3 = new Web3(new Web3.providers.HttpProvider(config.BURL));   

function getHeadDocRev(docID) {
    return axios({
        method: 'HEAD',
        url: config.TARGET + 'events/'+docID
    })
    .then((response) => {
        // console.log('RESPONSE', response.headers);
        const _rev = response.headers.etag.replace(/"(.+)"/g, '$1');
        // console.log('Found event', _rev);            
        return _rev;
    })
    .catch(error => {
        // console.log('Event not found', docID);                       
        return null;
    });
}

web3.eth.getAccounts()
.then(acctArray => {
    console.log(acctArray);

    const ssdManagerAddress = deploy.getSSDManagerFromPlatform();
    console.log('Connect to the SSDManager contract @', ssdManagerAddress);        
    var contract = new web3.eth.Contract(SSDManager.abi, ssdManagerAddress);
                    
    // Read the block number to start from
    var startBlock = 0;
    try {
        startBlock = Number(fs.readFileSync('./data/' + args.company + '/last_block_event.txt', { 'encoding': 'utf8' })) + 1;
    } catch (e) {}
    console.log('Listening for SSDEvent(s) on SSDManager @', ssdManagerAddress, 'from block', startBlock);
    
    contract.events.SSDEvent({        
        fromBlock: startBlock
    })
    .on('data', function(event) {
        const ssdEvent = {
            address: event.address,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            transactionIndex: event.transacctionIndex,
            blockHash: event.blockHash,
            logIndex: event.logIndex,
            removed: event.removed,
            id: event.id,
            url: event.returnValues.url,
            hash: event.returnValues.hash,
            seller: event.returnValues.seller,
            buyer: event.returnValues.buyer,
            state: event.returnValues.state,
            reasonHash: event.returnValues.reasonHash
        };
        // console.log('Event received', ssdEvent);

        ssdEvent._id = ssdEvent.url + btoa(ssdEvent.seller);
        
        Promise.resolve(getHeadDocRev(ssdEvent._id))
        .then((response) => {
            if (response) {
                console.log('SET _rev', response);
                ssdEvent._rev = response;
            }
            
            console.log( 'Event', ssdEvent );
            axios({
                method: 'PUT',
                url: config.TARGET + 'events/'+ssdEvent._id,
                data: ssdEvent
            })
            .then((response) => {
                
                // Update the bcstate of the SSD in the offchain database
                // First get the corresponding SSD document
                axios({
                    method: 'GET',
                    url: config.TARGET + 'ssd/'+ssdEvent.url
                })
                .then((response) => {
                    const doc = response.data;
                    if (doc) {
                        doc.status.bcstate = event.returnValues.state;
                        console.log('Offchain doc read ...');
                        axios({
                            method: 'PUT',
                            url: config.TARGET + 'ssd/'+ssdEvent.url,
                            data: doc
                        })
                        .then(response => {
                            console.log('Offchain doc updated ...');                    
                            // Write the last successful block processed to the offchain database
                            // If there were any failures then re-running this script will start from the last successfully processed block + 1
                            try {
                                fs.writeFileSync('./data/' + args.company + '/last_block_event.txt', event.blockNumber);
                            } catch (e) {}
                        })
                        .catch(error => {
                            console.log(error);
                        });
                    }
                })
                .catch(error => {
                    console.log('Local SSD not found for', ssdEvent.url);
                });
        
            })
            .catch(error => {
                console.log('Event CREATE/UPDATE persistence failed');
            });            
        })
        .catch(error => {
            console.log( 'Event getDocHead failed', ssdEvent._id );                
        });                
    })
    .on('changed', function(event) {
        // remove event from local database
    })
    .on('error', console.error);
})
.catch(e => {
    console.log("FAILED to connect to blockchain on " + config.BURL);
    console.log(e);        
});
