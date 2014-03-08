var Rubidium = require('../');
var EventEmitter = require('events').EventEmitter;

exports['Instances should be event emitters.'] = function (test) {
	'use strict';

	var rb = new Rubidium();

	test.ok(rb instanceof EventEmitter);
	test.done();
};

exports['Forgetting new should be ok.'] = function (test) {
	'use strict';

	/* jshint newcap: false */

	var rb = Rubidium();

	test.ok(rb instanceof Rubidium);
	test.done();
};

exports['A job should be emitted.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var message = 'hi';

	rb.once('job', function (job) {
		test.strictEqual(job.message, message);
		test.done();
	});

	rb.add(Date.now() + 100, message);
};

exports['A job should be emitted once.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var message = 'hi';
	var counter = 0;

	rb.on('job', function () {
		counter += 1;
	});

	rb.add(Date.now() + 100, message);

	setTimeout(function () {
		test.strictEqual(counter, 1);
		test.done();
	}, 300);
};