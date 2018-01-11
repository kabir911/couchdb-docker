var deploy  = require('/tmp/deploy');
var platform = require('/tmp/platform');

module.exports = {
    getDeploy: function () {
        return deploy;
    },

    getControllerFromUser: function (user) {
        // console.log( 'getControllerFromUser', user);
        var ret = null;
        Object.keys(deploy).forEach(key => {
            const data = deploy[key];
            const bankName = key;
            const controller = data.controllerAddress;
            const proxy = data.idProxyAddress;
            Object.keys(data.members).forEach( member => {
                const memberData = data.members[member];
                if (memberData.address.toUpperCase() == user.toUpperCase() ) {
                    // console.log( bankName, controller, proxy, member, memberData.address);
                    ret = controller;
                }
            });    
        });
        return ret;
    },

    getCompaniesJSON: function () {
        // console.log( 'getControllerFromUser', user);
        var ret = new Array();
        Object.keys(deploy).forEach(key => {
            const data = deploy[key];
            const bankName = key;
            const controller = data.controllerAddress;
            const proxy = data.idProxyAddress;
            ret.push({
                'Lei': bankName,
                'ControllerID': controller,
                'CompanyID': proxy
            })
        });
        return ret;
    },
    
    getProxyFromUser: function (user) {
        // console.log( 'getControllerFromUser', user);
        var ret = null;
        Object.keys(deploy).forEach(key => {
            const data = deploy[key];
            const bankName = key;
            const controller = data.controllerAddress;
            const proxy = data.idProxyAddress;
            Object.keys(data.members).forEach( member => {
                const memberData = data.members[member];
                if (memberData.address.toUpperCase() == user.toUpperCase()) {
                    // console.log( bankName, controller, proxy, member, memberData.address);
                    ret = proxy;
                }
            });    
        });
        return ret;
    },

    getSSDManagerFromPlatform: function () {
        var ret = null;
        Object.keys(platform).forEach(key => {
            const data = platform[key];
            if (key == 'ssdMgr') {
                ret = data;
            }            
        });
        return ret;
    },
};
