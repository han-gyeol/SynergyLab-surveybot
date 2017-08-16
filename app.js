'use strict'

const token = process.env.FB_PAGE_ACCESS_TOKEN
const vtoken = process.env.FB_VERIFY_ACCESS_TOKEN

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
const config = require('./config.js');

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    console.log('request received');
	res.send('Hello world, I am a chat bot');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === vtoken) {
		res.send(req.query['hub.challenge']);
	}
	res.send('Error, wrong token');
})

// Spin up the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
})