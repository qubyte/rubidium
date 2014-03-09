# rubidium

Rubidium is a one-time task emitter, inspired by the unix `at` utility. This module is a minimal implementation. It exports a constructor. Instances of the constructor are event emitters, with methods to add and remove job specifications. A job consists of a due time and a message.

Rubidium is built upon the use of `setTimeout`, so [the usual warnings apply](http://nodejs.org/api/timers.html#timers_settimeout_callback_delay_arg). That said, Rubidium creates a fresh timeout after each job is emitted, so it is self-correcting to within the resolution of a timer.

## Usage

```javascript
var Rubidium = require('rubidium');

var rb = new Rubidium();

// Add a job to be emitted in 5 seconds time.
rb.add({ time: Date.now() + 5000, message: '5 seconds have passed.' });
```

The simplicity of the interface hides the complexity needed in managing the list of jobs and timeouts.

## Example

If you want to build a daemon like service, you can provide a route for adding jobs, and a callback URL to send jobs to when they are emitted. For example:

```javascript
var express = require('express');
var request = require('request');
var Rubidium = require('rubidium');

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

## API

### `new Rubidium([jobs])`

The Rubidium constructor takes an optional array of job specifications. A single specification has the form:

```javascript
var spec = { time: new Date(), message: 'message' };
```

The `time` field may be a either a date object, or a timestamp integer (like `Date.now()`). The `message` field can be anything that may be stringified. Note that this means that functions shouldn't be added as messages. This is to make persistence of a job queue to a database or communication of the job simple. A message may instead be the name of a function (to identify it in a hash for example) and some arguments to pass to it.

### `var hash = rb.add(time, message)`

Add a job. The `time` must be a date object or a timestamp integer (like `Date.now()`) representing the time for the job to be emitted. This method returns a hash string that may be used to find or remove the job from the queue.

### `var removed = rb.remove(hash)`

Remove a job from a Rubidium instance with the job hash. This function returns `true` if the job existed and was removed, or `false` if the job did not exist.

### `var job = rb.find(hash)`

Get a job from the Rubidium instance with the job hash.

### Event: `'job'`

Listeners on the `'job'` event receive a job object containing `time` and `message` fields, where `time` is an integer.

### Event: `'addJob'`

This event is emitted when a new job is added. The job object is passed as an argument to listeners on this event.

### Event: `'removeJob'`

This event is emitted when when a job is removed. The job object is passed as an argument to listeners on this event.
