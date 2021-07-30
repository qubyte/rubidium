import EventEmitter from 'vertebrate-event-emitter';
import Job from './job.js';

const jobs = new WeakMap();
const timeouts = new WeakMap();

function getJobFromQueue(queue, uuid) {
  for (let i = 0, len = queue.length; i < len; i++) {
    if (queue[i].uuid === uuid) {
      return queue[i];
    }
  }
}

function makeTimeout(rb, queue) {
  clearTimeout(timeouts.get(rb));

  if (!queue.length) {
    return timeouts.set(rb, null);
  }

  // setTimeout accepts 32bit integers for the time value. If the next job is
  // later than this, we'll set a shorter timeout as a waypoint.
  const dt = Math.min(Math.max(queue[0].time - Date.now(), 0), 2147483647);

  timeouts.set(rb, setTimeout(() => {
    while (queue.length && queue[0].time <= Date.now()) {
      rb.emit('job', queue.shift());
    }

    makeTimeout(rb, queue);
  }, dt));
}

export default class Rubidium extends EventEmitter {
  constructor() {
    super();

    jobs.set(this, []);

    timeouts.set(this, null);
  }

  add(spec, silent) {
    const queue = jobs.get(this);
    const job = new Job(spec);

    queue.push(job);
    queue.sort((a, b) => a.time - b.time);

    if (!silent) {
      this.emit('addJob', job);
    }

    if (job === queue[0]) {
      makeTimeout(this, queue);
    }

    return job;
  }

  find(uuid) {
    return getJobFromQueue(jobs.get(this), uuid);
  }

  remove(uuid, silent) {
    const queue = jobs.get(this);
    const job = getJobFromQueue(queue, uuid);

    if (!job) {
      return;
    }

    const index = queue.indexOf(job);

    queue.splice(index, 1);

    if (!silent) {
      this.emit('removeJob', job);
    }

    if (index === 0) {
      makeTimeout(this, queue);
    }

    return job;
  }

  clear(silent) {
    const newJobs = [];

    makeTimeout(this, newJobs);

    const oldJobs = jobs.get(this);

    jobs.set(this, newJobs);

    if (silent) {
      return;
    }

    for (let i = 0, len = oldJobs.length; i < len; i++) {
      this.emit('removeJob', oldJobs[i]);
    }

    this.emit('clearJobs');
  }

  get hasPendingJobs() {
    return jobs.get(this).length !== 0;
  }
}
