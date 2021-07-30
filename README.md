# rubidium

Rubidium is a one-time task emitter, inspired by the unix `at` utility. This
module is a minimal implementation. It exports a constructor. Instances of the
constructor are event emitters, with methods to add and remove job
specifications. A job consists of a due time and a message.

Rubidium is built upon the use of `setTimeout`, so [the usual warnings apply](http://nodejs.org/api/timers.html#timers_settimeout_callback_delay_arg).
That said, Rubidium creates a fresh timeout after each job is emitted, so it is
self-correcting to within the resolution of a timer.

Rubidium is built on
[vetebrate-event-emitter](https://github.com/qubyte/vertebrate-event-emitter),
which makes it robust against memory leaks. It has been bundled for you with
its dependencies, so Rubidium has no dependencies in production.

## Usage

A brief example is given below. See the examples directory for some more
interesting examples, including wrapping a rubidium instance in an HTTP server,
and persisting a rubidium instance over app restarts.

```javascript
import Rubidium from 'rubidium';

var rb = new Rubidium();

rb.on('job', job => console.log(job.message));

// Add a job to be emitted in 5 seconds time.
rb.add({ time: Date.now() + 5000, message: '5 seconds have passed.' });

// Add a job to be emitted in one day.
rb.add({ time: Date.now() + 1000 * 60 * 60 * 24, 'One day as passed.' });
```

You could of course do this with vanilla timeouts. A rubidium instance allows
you to do it all with a single timeout. It also works around the maximum timeout
length, so you can have a job more than about 25 days into the future.

## API

`Rubidium` extends
[`vertebrate-event-emitter`](https://github.com/qubyte/vertebrate-event-emitter),
so please see the docs for that for the base API around events (methods like
`on`, `off` etc.)

### `var rb = new Rubidium()`

Construct a new Rubidium instance.

### `var hasJobs = rb.hasPendingJobs`

A boolean property. True when there are jobs remaining in the queue.

### `var job = rb.add({ time, message, [uuid] }, silent)`

Add a job. The `time` must be a `Date` instance or a timestamp integer (like
`Date.now()`) representing the time for the job to be emitted. This method
returns a job with a uuid property that may be used to find or remove the job
from the queue.

When `uuid` is in the spec, it will be copied into the job. This is useful for
reviving a persisted queue (see the section on persistence below). In general,
you should not be setting this.

When `silent` is true, this `addJob` event will not be emitted. This is useful
for reviving a persisted queue.

### `var job = rb.remove(uuid, silent)`

Remove a job from a Rubidium instance with the job uuid. This function returns a
job if the job existed and was removed, or `undefined` if the job did not exist.
When `silent` is true, the `removeJob` event will not be emitted.

### `var job = rb.find(uuid)`

Get a job from the Rubidium instance with the job uuid. Returns `undefined` when
no matching job is found.

### `rb.clear(silent)`

Clear all pending jobs. When silent is true, the `clearJobs` event will not be
emitted.

### Event: `'job'`

Listeners on the `'job'` event receive a job object containing `time` and
`message` fields, where `time` is an integer.

### Event: `'addJob'`

This event is emitted when a new job is added. The job object is passed as an
argument to listeners on this event.

### Event: `'removeJob'`

This event is emitted when when a job is removed. The job object is passed as an
argument to listeners on this event. When the `clear` method is used, this event
is emitted for every job.

### Event: `'clearJobs'`

This event is emitted when all jobs for a Rubidium instance are cleared.
