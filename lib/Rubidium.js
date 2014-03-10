var EventEmitter = require('events').EventEmitter;
var util = require('util');

var Job = require('./Job');


/**
 * Sets up the next job.
 *
 * @param {Rubidium} rubidium A job queue.
 */

function makeTimeout(rubidium) {
	'use strict';

	// > 0 is in the future.
	var dt = Math.max(rubidium.jobs[0].time - Date.now(), 0);

	clearTimeout(rubidium.timeout);

	// Jobs in the future are given to a timeout.
	rubidium.timeout = setTimeout(function () {
		rubidium.emit('job', rubidium.jobs.shift());
	}, dt);
}


/**
 * Set the next timeout.
 *
 * @param {Rubidium} rubidium A job queue.
 */

function makeNext(rubidium) {
	'use strict';

	if (rubidium.jobs.length) {
		return makeTimeout(rubidium);
	}

	if (rubidium.timeout) {
		clearTimeout(rubidium.timeout);
	}

	rubidium.timeout =  null;
}


/**
 * Sorting function for jobs.
 */
function sortJobs(a, b) {
	'use strict';

	return a.time - b.time;
}


/**
 * The job queue constructor.
 *
 * @param {Job[]|Object[]} [jobs] Array of job instances.
 */

function Rubidium(jobs) {
	'use strict';

	var rubidium = this;

	if (!(rubidium instanceof Rubidium)) {
		return new Rubidium(jobs);
	}

	EventEmitter.call(rubidium);

	// jobs is a queue of job specifications.
	rubidium.jobs = Job.fromList(jobs || []);

	// timeout is set to trigger on the next job.
	rubidium.timeout = null;

	// Set up the first timeout.
	rubidium.on('job', function next() {
		makeNext(rubidium);
	});

	makeNext(rubidium);
}

util.inherits(Rubidium, EventEmitter);


/**
 * Add a job to the queue.
 *
 * @param {Number|Date} time    A date or timestamp of when the job should be emitted.
 * @param {*}           message Anything that can be given to JSON.stringify without throwing.
 */

Rubidium.prototype.add = function (time, message) {
	'use strict';

	var job = new Job(time, message);

	this.emit('addJob', job);

	// If no job is scheduled, then set this as the next.
	if (this.jobs.length === 0) {
		this.jobs.push(job);

		makeTimeout(this);
		return job.hash;
	}

	// If a job is scheduled, but this should happen before, replace it and queue up the old job.
	if (this.jobs[0].time > job.time) {

		// Put the old job back on the stack and sort to be sure.
		this.jobs.unshift(job);

		makeTimeout(this);
		return job.hash;
	}

	// If a job is scheduled, and this new job should happen after, then just add it to the queue.
	this.jobs.push(job);
	this.jobs.sort(sortJobs);

	return job.hash;
};


/**
 * Get the index of the job with a particular hash. Returns -1 if the job is not found.
 *
 * @param  {Rubidium} rubidium Rubidium instance.
 * @param  {String}   hash     Job hash.
 * @return {Number}            Job index.
 */

function getIndex(rubidium, hash) {
	'use strict';

	var jobs = rubidium.jobs;

	for (var i = 0, len = jobs.length; i < len; i++) {
		if (jobs[i].hash === hash) {
			return i;
		}
	}

	return -1;
}


/**
 * Given a hash, attempt to return the associated job.
 *
 * @param  {String} hash A job hash.
 * @return {Job}         A job instance.
 */

Rubidium.prototype.find = function (hash) {
	'use strict';

	var index = getIndex(this, hash);

	if (index !== -1) {
		return this.jobs[index];
	}
};


/**
 * Remove a job.
 *
 * @param  {String}  hash Hash of the job to be removed.
 * @return {Boolean}      The returned value is true if a job was removed.
 */

Rubidium.prototype.remove = function (hash) {
	'use strict';

	var index =  getIndex(this, hash);
	var job = this.jobs[index];

	this.emit('removeJob', job);

	if (!job) {
		return false;
	}

	if (job === this.jobs[0]) {
		this.jobs.shift();
		makeNext(this);

		return true;
	}

	this.jobs.splice(index, 1);

	return true;
};

module.exports = Rubidium;
