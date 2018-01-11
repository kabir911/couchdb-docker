var Web3 = require('web3');
var config  = require('../configuration/config');
var SimpleMemberControllerJSON = require('../configuration/SimpleMemberController.json');
var express = require('express');
var utils = require('../shared/utils.js');
var security = require('../shared/security.js');
var deploy = require('../shared/deploy.js');
var bodyParser  = require('body-parser');

var app = module.exports = express.Router();

var web3 = new Web3(new Web3.providers.HttpProvider(config.BURL));

web3.eth.getAccounts()
.then(acctArray => {

    app.post('/login*', bodyParser.json(), function(request, response) {        
        const user = request.body.UserID;    
        const signedUserID = request.body.SignedUserID;    
        const returnResponseBody = request.body.ReturnResponseBody;
        console.log('LOGGING IN', user);
        
        if (!user) {
            return response.status(400).send('UserID must be specified!');
        }

        // if (!security.checkLoginSignature(web3, signedUserID, user)) {
        if (!security.verifySignature(user, signedUserID)) {
            console.log('FAILED signed authorization for', user);
            return response.status(400).send('Signed authorization header must be specified!');
        }
        
        const userController = deploy.getControllerFromUser(user);
        console.log('userController', userController);        

        if (!userController) {
            return response.status(400).send('User Controller not found!');
        }
        
        const SimpleMemberController = new web3.eth.Contract(SimpleMemberControllerJSON.abi, userController);
        console.log('Connect to SimpleMemberControler @', userController);        
        
        SimpleMemberController.methods.checkPrivilegeGranted(config.PRIVILEGE_CONTROLLER_SSD_OPERATIONS, user).call()
        .then( result => {
            console.log( 'Privilege check',config.PRIVILEGE_CONTROLLER_SSD_OPERATIONS, user, result );            
            if (result) { 
                console.log( 'UserID has login privilege.' );
                const bearer = security.createAccessToken(user);
                response.set({        
                    'Content-Type': 'text/plain;charset=UTF-8',        
                    'Authorization': 'Bearer ' + bearer,                 
                    'Set-Cookie': "JSESSIONID="+security.createIdToken(user)
                });
                console.log( "Authorization:", 'Bearer ' + bearer );
                if (returnResponseBody.toUpperCase() == 'TRUE') {
                    console.log( "Controller:", userController );
                    let retJson = {};
                    retJson.ControllerID = userController;
                    // retJson.Companies = deploy.getCompaniesJSON();
                    response.status(200).send(JSON.stringify(retJson));
                } else {
                    response.status(200).send();
                }
            } else {
                return response.status(403).send('User does not have login privilege!');    
            }            
        })
        .catch( error => {
            return response.status(403).send('Failed to check privilege!');
        });
    });

    app.get('/logout*', function(req, res) {
        console.log('LOGOUT - TODO place token on revoke list');
        res.status(200).send('You logged out');
    });

});