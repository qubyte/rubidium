var crypto = require('crypto');
var stringify = require('json-stable-stringify');


/**
 * The job specification constructor.
 *
 * @param {Date|Number} time    A date object or timestamp.
 * @param {*}           message Any data that can be consumed by JSON.stringify.
 */

function Job(time, message) {
	'use strict';

	if (!(this instanceof Job)) {
		return new Job(time, message);
	}

	if (message === undefined) {
		throw new Error('Message argument must be populated.');
	}

	this.time = time instanceof Date ? time.getTime() : parseInt(time, 10);

	if (!this.time) {
		throw new TypeError('Time must be a Date object or an integer.');
	}

	this.message = message;

	this.hash = crypto.createHash('sha1')
		.update(time.toString())
		.update(stringify(message))
		.digest('hex');
}


/**
 * A helper method that generates a list of Job instances from a list of objects.
 *
 * @param  {Object[]|Job[]} specs A list of job specifications, including time and message fields.
 * @return {Job[]}                A list of Job instances.
 */

Job.fromList = function (specs) {
	'use strict';

	var jobs = [];

	for (var i = 0, len = specs.length; i < len; i++) {
		var spec = specs[i];

		jobs.push(spec instanceof Job ? spec : new Job(spec.time, spec.message));
	}

	jobs.sort(function (a, b) {
		return a.time - b.time;
	});

	return jobs;
};

module.exports = Job;
