'use strict';

var express = require('express');
var request = require('request');
var Rubidium = require('../');

var app = express();
var rb = new Rubidium();

app.use(express.json());

// In this case, the body is the message and it includes a callback URL.
app.post('/add/:timestamp', function (req, res) {
	rb.add(parseInt(req.params.timestamp, 10), req.body);
	res.send(202);
});

// When the job is emitted, send it back to the callback URL.
rb.on('job', function (job) {
	var req;

	// Protect against 'Invalid Request' errors.
	try {
		req = request({ url: job.message.callbackUrl, method: 'POST', json: job.message });
	} catch (err) {
		console.error(err.stack || err.message);
	}

	req.on('error', function (err) {
		console.error(err.stack || err.message);
	});
});

app.listen(8080, function () {
	console.log('At server running on port 8080.');
});
