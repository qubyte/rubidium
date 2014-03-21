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

exports['Jobs submitted in wrong order should emit in the correct order.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var messages = ['hi', 'bye'];
	var now = Date.now();

	rb.on('job', function (job) {
		var expected = messages.shift();

		test.strictEqual(job.message, expected);

		if (!messages.length) {
			test.done();
		}
	});

	rb.add(now + 200, messages[1]);
	rb.add(now + 100, messages[0]);
};

exports['Jobs should submitted in order should emit in the correct order.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var messages = ['hi', 'bye'];
	var now = Date.now();

	rb.on('job', function (job) {
		var expected = messages.shift();

		test.strictEqual(job.message, expected);

		if (!messages.length) {
			test.done();
		}
	});

	rb.add(now + 100, messages[0]);
	rb.add(now + 200, messages[1]);
};

exports['Removed jobs should not be emitted.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var job = rb.add(Date.now() + 100, 'test');

	rb.remove(job.hash);

	var emitted = false;

	rb.on('job', function () {
		emitted = true;
	});

	setTimeout(function () {
		test.ok(!emitted);
		test.done();
	}, 200);
};

exports['Removing a non-existent job should return false.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var removed = rb.remove('abcd');

	test.strictEqual(removed, false);
	test.done();
};

exports['Removing the next job should not disrupt the following.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var job = rb.add(Date.now() + 100, 'test1');
	rb.add(Date.now() + 200, 'test2');
	rb.remove(job.hash);

	rb.on('job', function (job) {
		test.strictEqual(job.message, 'test2');
		test.done();
	});
};

exports['Removing a job (not next) should not disrupt the next.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	rb.add(Date.now() + 100, 'test1');
	var job = rb.add(Date.now() + 200, 'test2');
	rb.remove(job.hash);

	rb.on('job', function (job) {
		test.strictEqual(job.message, 'test1');
		test.done();
	});
};

exports['A job scheduled in the past should still be emitted.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	rb.add(Date.now() - 100, 'test1');
	rb.add(Date.now() + 100, 'test2');

	rb.once('job', function (job) {
		test.strictEqual(job.message, 'test1');
		test.done();
	});
};

exports['Find should get the correct job.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var hash;

	for (var i = 0; i < 10; i++) {
		var job = rb.add(Date.now() + i, i);

		if (i === 5) {
			hash = job.hash;
		}
	}

	test.strictEqual(rb.find(hash).message, 5);
	test.done();
};

exports['Find should not find a non-existent job.'] = function (test) {
	'use strict';

	var rb = new Rubidium();
	var hash;

	for (var i = 0; i < 10; i++) {
		var hashi = rb.add(Date.now() + i, i);

		if (i === 0) {
			hash = hashi;
		}
	}

	rb.once('job', function () {
		test.strictEqual(rb.find(hash), undefined);
		test.done();
	});
};
