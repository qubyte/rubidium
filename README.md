# rubidium

Rubidium is a one-time task emitter, inspired by the unix `at` utility. This module is a minimal implementation. It exports a constructor. Instances of the constructor are event emitters, with methods to add and remove job specifications. A job consists of a due time and a message.

## Usage

```javascript
var Rubidium = require('rubidium');

var rb = new Rubidium();

// Add a job to be emitted in 5 seconds time.
rb.add({ time: Date.now() + 5000, message: '5 seconds has passes.' });
```

The simplicity of the interface hides the complexity needed in managing the list of jobs and timeouts.

## Example

If you want to build a daemon like service, you can provide routes for adding jobs, and a callback URL to send jobs to when they are emitted. For example:

```javascript
var express = require('express');
var request = require('request');
var Rubidium = require('../');

var app = express();
var rb = new Rubidium();

app.use(express.json());

// In this case, the body is the message and it includes a callback URL.
app.post('/add/:timestamp', function (req, res) {
    'use strict';

    rb.add(parseInt(req.params.timestamp, 10), req.body);
    res.send(202);
});

// When the job is emitted, send it back to the callback URL.
rb.on('job', function (job) {
    'use strict';

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
    'use strict';

    console.log('At server running on port 8080.');
});
```
