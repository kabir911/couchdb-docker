var express = require('express');
var config  = require('../configuration/config');
var security = require('../shared/security.js');
var apiProxy = require('../shared/api-proxy.js');
var url = require('url');

var app = module.exports = express.Router();

app.all(config.PREFIX, security.jwtCheck, function(request, response) {

    var uri = url.parse(request.url);
    uri = config.TARGET + uri.pathname.substring(config.PREFIX.length - 1) + (uri.search || '');
    
    console.log('PROXY ' + request.method + ' ' + uri);        
    apiProxy.proxy.web(request, response, {target: uri, changeOrigin: true, ignorePath: true});        
    
});
