var express = require('express');
var utils = require('../shared/utils.js');
var btoa = require('btoa');
var atob = require('atob');
var config  = require('../configuration/config');
var apiProxy = require('../shared/api-proxy.js');
var deploy = require('../shared/deploy.js');
var bodyParser  = require('body-parser');
const axios = require('axios');

var app = module.exports = express.Router();

app.get('/configdata/_all_companies', function(request, response) {
    const deployJSON = deploy.getDeploy();
    console.log('CONFIG', deployJSON);
    response.status(200).send(deployJSON); 
});
