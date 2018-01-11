#!/usr/bin/node

var Web3 = require('web3');
var config  = require('./configuration/config');
var SSDManager = require('./configuration/SSDManager.json');

const web3 = new Web3(new Web3.providers.WebsocketProvider(config.WSBURL));

web3.eth.getAccounts()
.then(o => {
    console.log(o);

    console.log('Connection to contract');        
    var contract = new web3.eth.Contract(SSDManager.abi, config.MANAGER);
                    
    console.log('Listening for events ...');
    contract.getPastEvents('SSDEvent', {
        fromBlock: 0,
        toBlock: 'latest'
    })
    .then(function(events) {
        console.log('All past events ...', events.length);
        events.forEach( event => {
            console.log(event.blockNumber, event.transactionHash) // same results as the optional callback above
        })        
    });
})
.catch(e => {
    console.log("FAILED to connect to blockchain on " + config.BURL);
    console.log(e);        
});
