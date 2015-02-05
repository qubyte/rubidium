'use strict';

var Job = require('../lib/Job.js');

var assert = require('assert');

describe('Job', function () {
	it('constructs a job object', function () {
		assert.ok(new Job(Date.now(), 'test') instanceof Job);
	});

	it('handles forgotten `new`', function () {
		/* jshint newcap: false */
		assert.ok(Job(Date.now(), 'test') instanceof Job);
	});

	it('should throw when not constructing with a message', function () {
		assert.throws(function () {
			return new Job(new Date());
		});
	});

	it('constructs a job instance when given a date object', function () {
		var now = new Date();
		var job = new Job(now, 'test');

		assert.strictEqual(job.time, now.getTime());
	});

	it('constructs a job instance when given a time integer', function () {
		var now = Date.now();
		var job = new Job(now, 'test');

		assert.strictEqual(job.time, now);
	});

	it('throws when given an undefined time', function () {
		assert.throws(function () {
			return new Job(undefined, 'test');
		});
	});

	it('returns a stable stringification of a job when job.stringify is called', function () {
		var now = Date.now();

		var job1 = new Job(now, { a: 1, b: 2 });
		var job2 = new Job(now, { b: 2, a: 1 });

		assert.equal(job1.stringify(), job2.stringify());
	});

	it('produces consistent hashes', function () {
		var now = Date.now();

		var job1 = new Job(now, { a: 1, b: 2 });
		var job2 = new Job(now, { b: 2, a: 1 });

		assert.equal(job1.hash, job2.hash);
	});

	it('builds jobs from a list of plain object', function () {
		var job1 = { time: new Date(), message: 'one' };
		var job2 = new Job(Date.now(), 'two');

		var list = Job.fromList([job1, job2]);

		assert.ok(list[0] instanceof Job);
		assert.ok(list[1] instanceof Job);
	});
});
