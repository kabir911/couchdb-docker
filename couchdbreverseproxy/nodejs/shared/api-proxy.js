var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer();

module.exports = {
    proxy: apiProxy
}
