var express = require('express');
var utils = require('../shared/utils.js');
var btoa = require('btoa');
var atob = require('atob');
var config  = require('../configuration/config');
var apiProxy = require('../shared/api-proxy.js');
var deploy = require('../shared/deploy.js');

var app = module.exports = express.Router();

app.get('/masterdata/getAllDocs/*', function(request, response) {
    var company = utils.getEndURL(request);
    response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
    response.status(201).send(btoa("{}"));
});

app.get('/masterdata/*', function(request, response) {
    try {
        var key = utils.getEndURL(request);
        if (key == 'Companies') {
            response.status(200).send(JSON.stringify(deploy.getCompaniesJSON()));
        } else {
            var uri = config.TARGET + 'general/'+encodeURIComponent(atob(key));
            console.log('ENCODED GET', uri);
            apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});
        }
    } catch (e) {
        console.log(e);
        response.status(400).send("{}");
    }
});

app.put('/masterdata/*', function(request, response) {
    const key = utils.getEndURL(request);
    var uri = config.TARGET + 'general/'+encodeURIComponent(atob(key));    
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});    
});

app.delete('/masterdata/*', function(request, response) {
    request.method = "DELETE";
    response.setHeader('Content-Type', 'text/plain;charset=UTF-8');
    const key = utils.getPreEndURL(request);
    var uri = config.TARGET + 'general/'+encodeURIComponent(atob(key));
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});    
});

