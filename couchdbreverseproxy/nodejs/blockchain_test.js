#!/usr/bin/node

var Web3 = require('web3');
var config  = require('./configuration/config');

// const web3 = new Web3(new Web3.providers.WebsocketProvider(config.WSBURL));
const web3 = new Web3(new Web3.providers.HttpProvider(config.BURL));   

web3.eth.getAccounts()
.then(acctArray => {
    console.log(acctArray);
})
.catch(e => {
    console.log("FAILED to connect to blockchain on " + config.BURL);
    console.log(e);        
});
