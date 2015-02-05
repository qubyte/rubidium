'use strict';

var Rubidium = require('../');
var Job = require('../lib/Job');

var EventEmitter = require('events').EventEmitter;
var sinon = require('sinon');
var assert = require('assert');

describe('Rubidium', function () {
	before(function () {
		this.sandbox = sinon.sandbox.create();
	});

	beforeEach(function () {
		this.clock = this.sandbox.useFakeTimers();
		this.emitSpy = this.sandbox.spy(Rubidium.prototype, 'emit');
	});

	afterEach(function () {
		this.sandbox.restore();
	});

	it('creates event emitters', function () {
		assert.ok(new Rubidium() instanceof EventEmitter);
	});

	it('handles forgotten `new`', function () {
		/* jshint newcap: false */
		assert.ok(Rubidium() instanceof Rubidium);
	});

	describe('an instance', function () {
		describe('add', function () {
			it('returns the job when add is called', function () {
				var rb = new Rubidium();
				var job = rb.add(100, 'hi');

				assert.ok(job instanceof Job);
				assert.equal(job.message, 'hi');
			});

			it('emits "addJob" with the added job when a job is added', function () {
				var rb = new Rubidium();
				var addJobStub = this.emitSpy.withArgs('addJob');

				var job = rb.add(100, 'hi');

				assert.equal(addJobStub.callCount, 1);
				assert.equal(addJobStub.args[0][1], job);
			});

			it('emits the added job when the timeout has elapsed', function () {
				var rb = new Rubidium();
				var jobEmitStub = this.emitSpy.withArgs('job');

				var job = rb.add(100, 'hi');

				assert.equal(jobEmitStub.callCount, 0);

				this.clock.tick(105);

				assert.equal(jobEmitStub.callCount, 1);
				assert.equal(jobEmitStub.args[0][1], job);
			});

			it('emits jobs submitted in wrong order should emit in the correct order', function () {
				var rb = new Rubidium();
				var jobEmitStub = this.emitSpy.withArgs('job');

				var job2 = rb.add(200, 'bye');
				var job1 = rb.add(100, 'hi');

				assert.equal(jobEmitStub.callCount, 0);

				this.clock.tick(105);

				assert.equal(jobEmitStub.callCount, 1);
				assert.equal(jobEmitStub.args[0][1], job1);

				this.clock.tick(200);

				assert.equal(jobEmitStub.callCount, 2);
				assert.equal(jobEmitStub.args[1][1], job2);
			});

			it('emits jobs submitted in order in the correct order', function () {
				var rb = new Rubidium();
				var jobEmitStub = this.emitSpy.withArgs('job');

				var job1 = rb.add(100, 'hi');
				var job2 = rb.add(200, 'bye');

				assert.equal(jobEmitStub.callCount, 0);

				this.clock.tick(105);

				assert.equal(jobEmitStub.callCount, 1);
				assert.equal(jobEmitStub.args[0][1], job1);

				this.clock.tick(200);

				assert.equal(jobEmitStub.callCount, 2);
				assert.equal(jobEmitStub.args[1][1], job2);
			});

			it('emits a job in the next tick when it is scheduled for the past', function () {
				var rb = new Rubidium();
				var jobEmitStub = this.emitSpy.withArgs('job');

				var job = rb.add(-100, 'test');

				this.clock.tick(1);

				assert.equal(jobEmitStub.callCount, 1);
				assert.equal(jobEmitStub.args[0][1], job);
			});
		});

		describe('remove', function () {
			it('returns the job when removeJob is called', function () {
				var rb = new Rubidium();
				var job = rb.add(100, 'hi');
				var removed = rb.remove(job.hash);

				assert.equal(removed, job);
			});

			it('emits "removeJob" with the removed job when a job is removed', function () {
				var rb = new Rubidium();
				var removeJobStub = this.emitSpy.withArgs('removeJob');
				var job = rb.add(100, 'hi');

				assert.equal(removeJobStub.callCount, 0);

				var removed = rb.remove(job.hash);

				assert.equal(removeJobStub.callCount, 1);
				assert.equal(removeJobStub.args[0][1], removed);
			});

			it('does not emit removed jobs with "job"', function () {
				var rb = new Rubidium();
				var jobEmitStub = this.emitSpy.withArgs('job');

				var job = rb.add(Date.now() + 100, 'test');

				rb.remove(job.hash);

				this.clock.tick(105);

				assert.equal(jobEmitStub.callCount, 0);
			});

			it('returns undefined when removing a non-existent job', function () {
				var rb = new Rubidium();
				var removed = rb.remove('abcd');

				assert.strictEqual(removed, undefined);
			});

			it('does not affect the following job when the next is removed', function () {
				var rb = new Rubidium();
				var jobEmitStub = this.emitSpy.withArgs('job');

				var job1 = rb.add(100, 'test1');
				var job2 = rb.add(200, 'test2');

				rb.remove(job1.hash);

				this.clock.tick(105);

				assert.equal(jobEmitStub.callCount, 0);

				this.clock.tick(100);

				assert.equal(jobEmitStub.callCount, 1);
				assert.equal(jobEmitStub.args[0][1], job2);
			});

			it('does not affect the job following when a job (not next) is removed', function () {
				var rb = new Rubidium();
				var jobEmitStub = this.emitSpy.withArgs('job');

				var job1 = rb.add(100, 'test1');
				var job2 = rb.add(200, 'test2');
				var job3 = rb.add(300, 'test3');

				rb.remove(job2.hash);

				this.clock.tick(105);

				assert.equal(jobEmitStub.callCount, 1);
				assert.equal(jobEmitStub.args[0][1], job1);

				this.clock.tick(100);

				assert.equal(jobEmitStub.callCount, 1);

				this.clock.tick(100);

				assert.equal(jobEmitStub.callCount, 2);
				assert.equal(jobEmitStub.args[1][1], job3);
			});
		});

		describe('find', function () {
			it('finds the correct job with the find method and a hash', function () {
				var rb = new Rubidium();

				rb.add(100, 'test');

				var job = rb.add(200, 'test');

				rb.add(300, 'test');
				rb.add(400, 'test');
				rb.add(500, 'test');

				assert.equal(rb.find(job.hash), job);
			});

			it('does not find a non-existent job', function () {
				var rb = new Rubidium();

				rb.add(100, 'test');

				var job = rb.add(200, 'test');

				rb.add(300, 'test');
				rb.add(400, 'test');
				rb.add(500, 'test');

				rb.remove(job.hash);

				assert.strictEqual(rb.find(job.hash), undefined);
			});
		});
	});
});
