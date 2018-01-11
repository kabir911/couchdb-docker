#!/usr/bin/node

const cluster = require('cluster');
// const numCPUs = require('os').cpus().length;
const numCPUs = 1;
var express  = require('express');
var http = require('http');
var https = require('https');
var cors   = require('cors');
var config  = require('./configuration/config');
var httpsKeys  = require('./shared/https-keys.js');
var apiProxy = require('./shared/api-proxy.js');
const minimist = require('minimist');

let args = minimist(process.argv.slice(2), {  
    default: {
        port: 8443
    },
});

console.log('args:', args);  

var app = express();
if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    app.use(cors({
        'origin': '*',
        'credentials': true,
        'exposedHeaders': [ 'Authorization' ]
    }));

    app.use(require('./restful/userdata-routes'));
    app.use(require('./restful/masterdata-routes'));
    app.use(require('./restful/auth-routes'));
    app.use(require('./restful/couchdb-routes'));
    app.use(require('./restful/asset-routes'));
    app.use(require('./restful/web3-routes'));
    
    app.use(function (err, req, res, next) {
        if (err.name === 'UnauthorizedError') {
            res.status(401).send('Unauthorized!');
        }
    });  

    // http.createServer(app).listen(config.PORT);
    https.createServer({
        key: httpsKeys.key,
        cert: httpsKeys.cert
    }, app).listen(args.port);

    // console.log('http proxy ready on port '+config.PORT+'.');
    console.log('https proxy ready on port '+args.port+'.');
}