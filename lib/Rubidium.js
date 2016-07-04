import EventEmitter from 'vertebrate-event-emitter';
import Job from './Job';
import { jobs, timeouts } from './private-data';
import { makeTimeout, replaceTimeout, makeNext } from './private-methods';

function getJobFromQueue(queue, uuid) {
    for (let i = 0, len = queue.length; i < len; i++) {
        if (queue[i].uuid === uuid) {
            return queue[i];
        }
    }
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
        const isNext = queue.length === 0 || job.time < queue[0].time;

        queue.push(job);
        queue.sort((a, b) => a.time - b.time);

        if (!silent) {
            this.emit('addJob', job);
        }

        if (isNext) {
            makeTimeout.call(this, queue);
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
            makeNext.call(this, queue);
        }

        return job;
    }

    clear(silent) {
        replaceTimeout.call(this, null);

        const oldJobs = jobs.get(this);

        jobs.set(this, []);

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
