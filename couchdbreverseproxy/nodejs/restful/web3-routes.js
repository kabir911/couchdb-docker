var express = require('express');
var config  = require('../configuration/config');
var security = require('../shared/security.js');
// var Web3 = require('web3');
var apiProxy = require('../shared/api-proxy.js');
var url = require('url');

var app = module.exports = express.Router();

app.get('/web3*', security.jwtCheck, function(request, response) {
    var uri = url.parse(request.url);
    uri = config.BURL + uri.pathname.substring(config.WEB3PREFIX.length - 1) + (uri.search || '');
    
    console.log('PROXY ' + request.method + ' ' + uri);        
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});         
});

app.post('/web3*', security.jwtCheck, function(request, response) {
    var uri = url.parse(request.url);
    uri = config.BURL + uri.pathname.substring(config.WEB3PREFIX.length - 1) + (uri.search || '');
    
    console.log('PROXY ' + request.method + ' ' + uri);        
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});         
});

app.put('/web3*', security.jwtCheck, function(request, response) {
    var uri = url.parse(request.url);
    uri = config.BURL + uri.pathname.substring(config.WEB3PREFIX.length - 1) + (uri.search || '');
    
    console.log('PROXY ' + request.method + ' ' + uri);        
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});         
});

