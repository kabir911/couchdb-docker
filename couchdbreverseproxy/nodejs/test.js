#!/usr/bin/node

const axios = require('axios');

axios({
    method: 'GET',
    url: 'http://localhost:5984/ssd/'+encodeURIComponent('37308420-a443-11e7-84f2-1d56464f14c81')
})
.then(response => {
    console.log(typeof response.data);    
})
.catch(error => {
    console.log(error);
});
