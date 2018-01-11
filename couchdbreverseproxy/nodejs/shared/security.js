var expressjwt    = require('express-jwt');
var jwt     = require('jsonwebtoken');
var config  = require('../configuration/config');
var _ = require('lodash');
var ethUtil = require('ethereumjs-util');

function genJti() {
    let jti = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 16; i++) {
        jti += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return jti;
};

module.exports = {
    // TODO: Plugin in check against blockchain security model
    jwtCheck : expressjwt({            
            secret: config.secret,
            audience: config.audience,
            issuer: config.issuer,
            getToken: function fromHeaderOrQuerystring (req) {
                const authorizationHeader = req.headers.authorization;
                if (authorizationHeader && authorizationHeader.split(' ')[0] === 'Bearer') {                    
                        return authorizationHeader.split(' ')[1];
                } else if (req.query && req.query.token) {
                        return req.query.token;
                }
                return null;
            }
    }),

    getUserFromToken: function (req) {
        const authorizationHeader = req.headers.authorization;
        if (authorizationHeader && authorizationHeader.split(' ')[0] === 'Bearer') {
            return jwt.decode(authorizationHeader.split(' ')[1]).user;
        } else {
            return null;
        }
    },

    verifySignature: function (userId, sgn) {
             
        try {
            /*
            if (userId.indexOf('0x') == 0) {
                userId = userId.substring(2);
            }
            */
           
            const r = ethUtil.toBuffer(sgn.slice(0, 66));
            const s = ethUtil.toBuffer('0x' + sgn.slice(66, 130));
            const v = parseInt(sgn.slice(130, 132), 16);
            
            // const r = ethUtil.toBuffer(sgn.slice(0,66));
            // const s = ethUtil.toBuffer('0x' + sgn.slice(66,130));
            // const v = ethUtil.bufferToInt(ethUtil.toBuffer('0x' + sgn.slice(130,132)));

            const data = Buffer.from(userId.toUpperCase());
            const sha3 = ethUtil.sha3(data);
           
            const pubKey = ethUtil.ecrecover(sha3, v, r, s);
            const addrBuf = ethUtil.pubToAddress(pubKey);
            const addr = ethUtil.bufferToHex(addrBuf);
                    
            console.log( 'USER, CALC', userId, addr);

            return userId == addr;            
        } catch (e) {
            console.log(e);
        }
        return true;
    },
    
    checkLoginSignature: function (web3, signedData, user) {
        if (signedData) {
            const signedUserID = web3.eth.accounts.recoverTransaction(signedData);
            console.log( 'Comparing ', signedUserID, user);
            return (signedUserID.toUpperCase() == user.toUpperCase())
        }

        return false;
    },
    
    createIdToken : function (user) {
        return jwt.sign(_.omit(user, 'password'), config.secret, { expiresIn: 60*60*5 });
    },
        
    createAccessToken : function (user) {
        return jwt.sign({
            iss: config.issuer,
            aud: config.audience,
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            scope: 'full_access',
            sub: "lalaland|gonto",
            jti: genJti(),
            alg: 'HS256',
            user: user
        }, config.secret);        
    }    
};