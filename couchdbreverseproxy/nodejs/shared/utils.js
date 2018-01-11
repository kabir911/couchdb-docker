var url = require('url');

module.exports = {    
    getEndURL: function (request) {            
        var u = url.parse(request.url);        
        const end = u.pathname.substr(u.pathname.lastIndexOf('/') + 1);        
        return end;    
    },

    getPreEndURL: function (request) {    
        var u = url.parse(request.url);
        const preend = u.pathname.substr(0, u.pathname.lastIndexOf('/'));
        const end = preend.substr(preend.lastIndexOf('/') + 1);
        return end;    
    }
};