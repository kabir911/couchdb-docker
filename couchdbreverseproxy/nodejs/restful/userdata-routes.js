var express = require('express');
var utils = require('../shared/utils.js');
var btoa = require('btoa');
var atob = require('atob');
var config  = require('../configuration/config');
var security = require('../shared/security.js');
var apiProxy = require('../shared/api-proxy.js');
var bodyParser  = require('body-parser');
const axios = require('axios');

var app = module.exports = express.Router();

app.get('/userdata/getAllDocs/*', function(request, response) {
    var company = utils.getEndURL(request);
    response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
    response.status(201).send(btoa("{}"));
});

app.get('/userdata/*', security.jwtCheck, function(request, response) {
    var key = utils.getEndURL(request);
    var uri = config.TARGET + 'general/'+encodeURIComponent(atob(key));
    console.log('ENCODED GET', uri);
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});
});

app.put('/userdata/*', security.jwtCheck, function(request, response) {
    const key = utils.getEndURL(request);
    var uri = config.TARGET + 'general/'+encodeURIComponent(atob(key));    
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});        
});

app.delete('/userdata/*', security.jwtCheck, function(request, response) {
    request.method = "DELETE";
    response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
    const key = utils.getPreEndURL(request);
    var uri = config.TARGET + 'general/'+encodeURIComponent(atob(key));
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});    
});

