var EventEmitter = require('events').EventEmitter;
var util = require('util');
var crypto = require('crypto');

function makeTimeout(at, job) {
	'use strict';

	at.next = job;

	// > 0 is in the future.
	var dt = job.time - Date.now();

	// Jobs set for now or some time in the past should emit immediately.
	if (dt <= 0) {
		at.emit('job', job.message);
		return null;
	}

	clearTimeout(at.timeout);

	// Jobs in the future are given to a timeout.
	at.timeout =  setTimeout(function () {
		at.emit('job', job);
	}, dt);
}

// Set the timeout to trigger for the next job.
function makeNext(at) {
	'use strict';

	return function () {
		if (at.jobs.length) {
			return makeTimeout(at, at.jobs.shift());
		}

		at.next = null;
		at.timeout =  null;
	};
}

function sortJobs(a, b) {
	'use strict';

	return a.time - b.time;
}

function At(jobs) {
	'use strict';

	if (!(this instanceof At)) {
		return new At(jobs);
	}

	EventEmitter.call(this);

	// jobs is a queue of job specifications.
	this.jobs = jobs || [];

	// timeout is set to trigger on the next job.
	this.timeout = null;
	this.next = null;

	var next = makeNext(this);

	// Set up the first timeout.
	this.on('job', next);

	next(this);
}

util.inherits(At, EventEmitter);

At.prototype.add = function (time, message) {
	'use strict';

	if (!message) {
		return new Error('Message argument must be populated.');
	}

	time = time instanceof Date ? time.getTime() : parseInt(time, 10);

	if (!time) {
		return new TypeError('Time must be a Date object or an integer.');
	}

	var hash = crypto.createHash('sha1')
		.update(time.toString())
		.update(JSON.stringify(message)).digest('hex');

	var job = { time: time, message: message, hash: hash };

	// If no job is scheduled, then set this as the next.
	if (!this.next) {
		return makeTimeout(this, job);
	}

	// If a job is scheduled, but this should happen before, replace it and queue up the old job.
	if (this.next.time > job.time) {

		// Put the old job back on the stack and sort to be sure.
		this.jobs.unshift(this.next);
		this.jobs.sort(sortJobs);

		return makeTimeout(this, job);
	}

	// If a job is scheduled, and this new job should happen after, then just add it to the queue.
	this.jobs.push(job);
	this.jobs.sort(sortJobs);
};

module.exports = At;
