import Rubidium from 'rubidium';
import sinon from 'sinon';
import { strict as assert } from 'assert';

describe('Rubidium', () => {
  let callback;
  let clock;
  let rb;

  beforeEach(() => {
    callback = sinon.stub();
    rb = new Rubidium();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    rb.clear();
    clock.restore();
  });

  describe('add', () => {
    describe('not silenced', () => {
      it('returns the job when add is called', () => {
        const job = rb.add({ time: 100, message: 'hi' });

        assert.equal(job.time, 100);
        assert.equal(job.message, 'hi');
      });

      it('emits "addJob" with the added job when a job is added', () => {
        rb.on('addJob', callback);

        const job = rb.add({ time: 100, message: 'hi' });

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('adds a uuid to an added job when it does not have one', () => {
        const job = rb.add({ time: 100, message: 'hi' });

        assert.equal(typeof job.uuid, 'string');
        assert.ok(job.uuid.length);
      });

      it('does not change the uuid when the the added job has one', () => {
        const job = rb.add({ time: 100, message: 'hi', uuid: 'abcd' });

        assert.equal(job.uuid, 'abcd');
      });

      it('emits the added job when the timeout has elapsed', () => {
        rb.on('job', callback);

        const job = rb.add({ time: 100, message: 'hi' });

        assert.equal(callback.callCount, 0);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('emits jobs submitted in wrong order in the correct order', () => {
        rb.on('job', callback);

        const job2 = rb.add({ time: 200, message: 'bye' });
        const job1 = rb.add({ time: 100, message: 'hi' });

        assert.equal(callback.callCount, 0);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job1);

        clock.tick(200);

        assert.equal(callback.callCount, 2);
        assert.equal(callback.args[1][0], job2);
      });

      it('emits jobs submitted in order in the correct order', () => {
        rb.on('job', callback);

        const job1 = rb.add({ time: 100, message: 'hi' });
        const job2 = rb.add({ time: 200, message: 'bye' });

        assert.equal(callback.callCount, 0);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job1);

        clock.tick(200);

        assert.equal(callback.callCount, 2);
        assert.equal(callback.args[1][0], job2);
      });

      it('emits a job in the next tick when it is scheduled for the past', () => {
        rb.on('job', callback);

        const job = rb.add({ time: -100, message: 'test' });

        assert.equal(callback.callCount, 0);

        clock.tick(1);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('emits a job beyond the resolution of setTimeout', () => {
        rb.on('job', callback);

        const job = rb.add({ time: 3e9, message: 'test' });

        clock.tick(10);

        assert.equal(callback.callCount, 0);

        clock.tick(3e9);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('emits clustered jobs simultaneously', () => {
        rb.on('job', callback);

        const jobs = [
          rb.add({ time: 100, message: 'test0' }),
          rb.add({ time: 100, message: 'test1' }),
          rb.add({ time: 100, message: 'test2' })
        ];

        clock.tick(10);

        assert.equal(callback.callCount, 0);

        clock.tick(90);

        assert.equal(callback.callCount, 3);
        assert.ok(callback.calledWithExactly(jobs[0]));
        assert.ok(callback.calledWithExactly(jobs[1]));
        assert.ok(callback.calledWithExactly(jobs[2]));
      });
    });

    describe('silenced', () => {
      it('returns the job when add is called', () => {
        const job = rb.add({ time: 100, message: 'hi' }, true);

        assert.equal(job.time, 100);
        assert.equal(job.message, 'hi');
      });

      it('does not emit "addJob"', () => {
        rb.on('addJob', callback);
        rb.add({ time: 100, message: 'hi' }, true);

        assert.equal(callback.callCount, 0);
      });

      it('adds a uuid to an added job when it does not have one', () => {
        const job = rb.add({ time: 100, message: 'hi' }, true);

        assert.equal(typeof job.uuid, 'string');
        assert.ok(job.uuid.length);
      });

      it('does not change the uuid when the the added job has one', () => {
        const job = rb.add({ time: 100, message: 'hi', uuid: 'abcd' }, true);

        assert.equal(job.uuid, 'abcd');
      });

      it('emits the added job when the timeout has elapsed', () => {
        rb.on('job', callback);

        const job = rb.add({ time: 100, message: 'hi' }, true);

        assert.equal(callback.callCount, 0);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('emits jobs submitted in wrong order in the correct order', () => {
        rb.on('job', callback);

        const job2 = rb.add({ time: 200, message: 'bye' }, true);
        const job1 = rb.add({ time: 100, message: 'hi' }, true);

        assert.equal(callback.callCount, 0);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job1);

        clock.tick(200);

        assert.equal(callback.callCount, 2);
        assert.equal(callback.args[1][0], job2);
      });

      it('emits jobs submitted in order in the correct order', () => {
        rb.on('job', callback);

        const job1 = rb.add({ time: 100, message: 'hi' }, true);
        const job2 = rb.add({ time: 200, message: 'bye' }, true);

        assert.equal(callback.callCount, 0);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job1);

        clock.tick(200);

        assert.equal(callback.callCount, 2);
        assert.equal(callback.args[1][0], job2);
      });

      it('emits a job in the next tick when it is scheduled for the past', () => {
        rb.on('job', callback);

        const job = rb.add({ time: -100, message: 'test' }, true);

        assert.equal(callback.callCount, 0);

        clock.tick(1);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('emits a job beyond the resolution of setTimeout', () => {
        rb.on('job', callback);

        const job = rb.add({ time: 3e9, message: 'test' }, true);

        clock.tick(10);

        assert.equal(callback.callCount, 0);

        clock.tick(3e9);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('emits clustered jobs simultaneously', () => {
        rb.on('job', callback);

        const jobs = [
          rb.add({ time: 100, message: 'test0' }),
          rb.add({ time: 100, message: 'test1' }),
          rb.add({ time: 100, message: 'test2' })
        ];

        clock.tick(10);

        assert.equal(callback.callCount, 0);

        clock.tick(90);

        assert.equal(callback.callCount, 3);
        assert.ok(callback.calledWithExactly(jobs[0]));
        assert.ok(callback.calledWithExactly(jobs[1]));
        assert.ok(callback.calledWithExactly(jobs[2]));
      });
    });
  });

  describe('remove', () => {
    describe('not silenced', () => {
      it('returns the job when removeJob is called', () => {
        const job = rb.add({ time: 100, message: 'hi' });
        const removed = rb.remove(job.uuid);

        assert.equal(removed, job);
      });

      it('emits "removeJob"', () => {
        rb.on('removeJob', callback);

        const job = rb.add({ time: 100, message: 'hi' });

        assert.equal(callback.callCount, 0);

        rb.remove(job.uuid);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job);
      });

      it('does not emit removed jobs with "job"', () => {
        rb.on('job', callback);

        const job = rb.add({ time: Date.now() + 100, message: 'test' });

        rb.remove(job.uuid);

        clock.tick(105);

        assert.equal(callback.callCount, 0);
      });

      it('returns undefined when removing a non-existent job', () => {
        const removed = rb.remove('abcd');

        assert.strictEqual(removed, undefined);
      });

      it('does not affect the following job when the next is removed', () => {
        rb.on('job', callback);

        const job1 = rb.add({ time: 100, message: 'test1' });
        const job2 = rb.add({ time: 200, message: 'test2' });

        rb.remove(job1.uuid);

        clock.tick(105);

        assert.equal(callback.callCount, 0);

        clock.tick(100);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job2);
      });

      it('does not affect the job following when a job (not next) is removed', () => {
        rb.on('job', callback);

        const job2 = rb.add({ time: 200, message: 'test2' });
        const job1 = rb.add({ time: 100, message: 'test1' });
        const job3 = rb.add({ time: 300, message: 'test3' });

        rb.remove(job2.uuid);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job1);

        clock.tick(100);

        assert.equal(callback.callCount, 1);

        clock.tick(100);

        assert.equal(callback.callCount, 2);
        assert.equal(callback.args[1][0], job3);
      });
    });

    describe('silenced', () => {
      it('returns the job when removeJob is called', () => {
        const job = rb.add({ time: 100, message: 'hi' });
        const removed = rb.remove(job.uuid, true);

        assert.equal(removed, job);
      });

      it('does not emit "removeJob"', () => {
        rb.on('removeJob', callback);

        const job = rb.add({ time: 100, message: 'hi' });

        assert.equal(callback.callCount, 0);

        rb.remove(job.uuid, true);

        assert.equal(callback.callCount, 0);
      });

      it('does not emit removed jobs with "job"', () => {
        rb.on('job', callback);

        const job = rb.add({ time: Date.now() + 100, message: 'test' });

        rb.remove(job.uuid, true);

        clock.tick(105);

        assert.equal(callback.callCount, 0);
      });

      it('returns undefined when removing a non-existent job', () => {
        const removed = rb.remove('abcd', true);

        assert.strictEqual(removed, undefined);
      });

      it('does not affect the following job when the next is removed', () => {
        rb.on('job', callback);

        const job1 = rb.add({ time: 100, message: 'test1' });
        const job2 = rb.add({ time: 200, message: 'test2' });

        rb.remove(job1.uuid, true);

        clock.tick(105);

        assert.equal(callback.callCount, 0);

        clock.tick(100);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job2);
      });

      it('does not affect the job following when a job (not next) is removed', () => {
        rb.on('job', callback);

        const job2 = rb.add({ time: 200, message: 'test2' });
        const job1 = rb.add({ time: 100, message: 'test1' });
        const job3 = rb.add({ time: 300, message: 'test3' });

        rb.remove(job2.uuid, true);

        clock.tick(105);

        assert.equal(callback.callCount, 1);
        assert.equal(callback.args[0][0], job1);

        clock.tick(100);

        assert.equal(callback.callCount, 1);

        clock.tick(100);

        assert.equal(callback.callCount, 2);
        assert.equal(callback.args[1][0], job3);
      });
    });
  });

  describe('find', () => {
    it('finds the correct job with the find method and a uuid', () => {
      rb.add({ time: 100, message: 'test' });

      const job = rb.add({ time: 200, message: 'test' });

      rb.add({ time: 300, message: 'test' });
      rb.add({ time: 400, message: 'test' });
      rb.add({ time: 500, message: 'test' });

      assert.equal(rb.find(job.uuid), job);
    });

    it('does not find a non-existent job', () => {
      rb.add({ time: 100, message: 'test' });

      const job = rb.add({ time: 200, message: 'test' });

      rb.add({ time: 300, message: 'test' });
      rb.add({ time: 400, message: 'test' });
      rb.add({ time: 500, message: 'test' });

      rb.remove(job.uuid);

      assert.strictEqual(rb.find(job.uuid), undefined);
    });
  });

  describe('clear', () => {
    let clearCallback;
    let removeCallback;
    let jobs;

    beforeEach(() => {
      clearCallback = sinon.stub();
      removeCallback = sinon.stub();

      rb.on('job', callback);
      rb.on('clearJobs', clearCallback);
      rb.on('removeJob', removeCallback);

      jobs = [
        rb.add({ time: 200, message: 'test2' }),
        rb.add({ time: 100, message: 'test1' }),
        rb.add({ time: 300, message: 'test3' })
      ];
    });

    describe('not silenced', () => {
      beforeEach(() => {
        rb.clear();
      });

      it('emits "clearJobs"', () => {
        assert.equal(clearCallback.callCount, 1);
      });

      it('emits "removeJob" for each job', () => {
        assert.equal(removeCallback.callCount, 3);

        for (const job of jobs) {
          assert.ok(removeCallback.calledWithExactly(job));
        }
      });

      it('prevents previously scheduled jobs from being emitted', () => {
        clock.tick(310);

        assert.equal(callback.callCount, 0);
      });
    });

    describe('silenced', () => {
      beforeEach(() => {
        rb.clear(true);
      });

      it('does not emit "clearJobs"', () => {
        assert.equal(clearCallback.callCount, 0);
      });

      it('does not emit "removeJob"', () => {
        assert.equal(removeCallback.callCount, 0);
      });

      it('prevents previously scheduled jobs from being emitted', () => {
        clock.tick(310);

        assert.equal(callback.callCount, 0);
      });
    });
  });

  describe('hasPendingJobs', () => {
    it('is false before jobs are added', () => {
      assert.strictEqual(rb.hasPendingJobs, false);
    });

    it('is true when a job is added', () => {
      rb.add({ time: 100, message: 'test1' });

      assert.strictEqual(rb.hasPendingJobs, true);
    });

    it('is false once all jobs have been emitted', () => {
      rb.add({ time: 100, message: 'test1' });

      clock.tick(110);

      assert.strictEqual(rb.hasPendingJobs, false);
    });

    it('is false once all jobs have been removed', () => {
      const job = rb.add({ time: 100, message: 'test1' });

      rb.remove(job.uuid);

      assert.strictEqual(rb.hasPendingJobs, false);
    });

    it('is false once all jobs have been cleared', () => {
      rb.add({ time: 100, message: 'test1' });

      rb.clear();

      assert.strictEqual(rb.hasPendingJobs, false);
    });
  });
});
