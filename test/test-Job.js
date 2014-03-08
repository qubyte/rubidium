var Job = require('../Job.js');

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