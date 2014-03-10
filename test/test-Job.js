var Job = require('../lib/Job.js');

exports['An undefined message should throw'] = function (test) {
	'use strict';

	var job;

	test.throws(function () {
		job = new Job(new Date());
	});

	test.done();
};

exports['New instance with timestamp.'] = function (test) {
	'use strict';

	var now = new Date();
	var job = new Job(now, 'test');

	test.strictEqual(job.time, now.getTime());
	test.done();
};

exports['New instances with time object.'] = function (test) {
	'use strict';

	var now = Date.now();
	var job = new Job(now, 'test');

	test.strictEqual(job.time, now);
	test.done();
};

exports['New instances with a bad time should throw.'] = function (test) {
	'use strict';

	var job;

	test.throws(function () {
		job = new Job(undefined, 'test');
	});

	test.done();
};

exports['Forgetting new should be ok.'] = function (test) {
	'use strict';

	/* jshint newcap: false */

	test.ok(Job(Date.now(), 'test') instanceof Job);
	test.done();
};

exports['Hashes should be consistent'] = function (test) {
	'use strict';

	var now = Date.now();
	var jobA = new Job(now, { a: 1, b: 2 });
	var jobB = new Job(now, { b: 2, a: 1 });

	test.strictEqual(jobA.hash, jobB.hash);
	test.done();
};

exports['Building jobs from a list of objects'] = function (test) {
	'use strict';

	var job1 = { time: new Date(), message: 'one' };
	var job2 = new Job(Date.now(), 'two');

	var list = Job.fromList([job1, job2]);

	test.ok(list[0] instanceof Job);
	test.ok(list[1] instanceof Job);
	test.done();
};
