var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Job = require('./Job');


/**
 * Sets up the next job.
 *
 * @param {At} at A job queue.
 */

function makeTimeout(at) {
	'use strict';

	if (!at.jobs[0]) {
		return;
	}

	// > 0 is in the future.
	var dt = at.jobs[0].time - Date.now();

	// Jobs set for now or some time in the past should emit immediately.
	if (dt <= 0) {
		at.emit('job', at.jobs.shift());
		return;
	}

	clearTimeout(at.timeout);

	// Jobs in the future are given to a timeout.
	at.timeout =  setTimeout(function () {
		at.emit('job', at.jobs.shift());
	}, dt);
}


/**
 * Set the next timeout.
 *
 * @param {At} at A job queue.
 */

function makeNext(at) {
	'use strict';

	if (at.jobs.length) {
		return makeTimeout(at);
	}

	if (at.timeout) {
		clearTimeout(at.timeout);
	}

	at.timeout =  null;
}

function sortJobs(a, b) {
	'use strict';

	return a.time - b.time;
}


/**
 * The job queue constructor.
 *
 * @param {Job[]|Object[]} [jobs] Array of job instances.
 */

function At(jobs) {
	'use strict';

	if (!(this instanceof At)) {
		return new At(jobs);
	}

	EventEmitter.call(this);

	// jobs is a queue of job specifications.
	this.jobs = Job.fromList(jobs || []);

	// timeout is set to trigger on the next job.
	this.timeout = null;

	var that = this;

	// Set up the first timeout.
	this.on('job', function next() {
		makeNext(that);
	});

	makeNext(this);
}

util.inherits(At, EventEmitter);


/**
 * Add a job to the queue.
 *
 * @param {Number|Date} time    A date or timestamp of when the job should be emitted.
 * @param {*}           message Anything that can be given to JSON.stringify without throwing.
 */

At.prototype.add = function (time, message) {
	'use strict';

	var job = new Job(time, message);

	// If no job is scheduled, then set this as the next.
	if (this.jobs.length === 0) {
		this.jobs.push(job);

		return makeTimeout(this);
	}

	// If a job is scheduled, but this should happen before, replace it and queue up the old job.
	if (this.jobs[0].time > job.time) {

		// Put the old job back on the stack and sort to be sure.
		this.jobs.unshift(job);

		return makeTimeout(this);
	}

	// If a job is scheduled, and this new job should happen after, then just add it to the queue.
	this.jobs.push(job);
	this.jobs.sort(sortJobs);
};


/**
 * Given a has, attempt to return the associated job.
 *
 * @param  {String} hash A job hash.
 * @return {Job}         A job instance.
 */

At.prototype.find = function (hash) {
	'use strict';

	for (var i = 0, len = this.jobs.length; i < len; i++) {
		var job = this.jobs[i];

		if (job.hash === hash) {
			return job;
		}
	}
};


/**
 * Remove a job.
 *
 * @param  {String}  hash Hash of the job to be removed.
 * @return {Boolean}      The returned value is true if a job was removed.
 */

At.prototype.remove = function (hash) {
	'use strict';

	var job = this.find(hash);

	if (!job) {
		return false;
	}

	if (job === this.jobs[0]) {
		this.jobs.shift();
		makeNext(this);

		return true;
	}

	this.jobs.splice(this.jobs.indexOf(job), 1);

	return true;
};

module.exports = At;
