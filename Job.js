var crypto = require('crypto');


/**
 * The job specification constructor.
 *
 * @param {Date|Number} time    A date object or timestamp.
 * @param {*}           message Any data that can be consumed by JSON.stringify.
 */

function Job(time, message) {
	'use strict';

	if (!message) {
		return new Error('Message argument must be populated.');
	}

	this.time = time instanceof Date ? time.getTime() : parseInt(time, 10);

	if (!this.time) {
		return new TypeError('Time must be a Date object or an integer.');
	}

	this.time = time;
	this.message = message;

	this.hash = crypto.createHash('sha1')
		.update(crypto.pseudoRandomBytes(6))
		.update(time.toString())
		.update(JSON.stringify(message)).digest('hex');
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

	return jobs;
};

module.exports = Job;
