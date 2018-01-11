const fs = require('fs');

module.exports = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
}