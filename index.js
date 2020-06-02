const express = require('express');
const packageInfo = require('./package.json');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

require('./bot');

const port = process.env.PORT || 3000

const app = express();

app.get('/', function(req, res) {
    res.json(packageInfo.version);
});

const server = app.listen(port, function() {
    console.log('Launch');
});
