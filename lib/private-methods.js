import { timeouts } from './private-data';

export function makeTimeout(queue) {
    const dt = Math.max(queue[0].time - Date.now(), 0);

    // setTimeout accepts 32bit integers for the time value. If the next job is
    // later than this, we'll set a timeout without a job emission as a
    // waypoint.
    const isJob = dt < 2147483648;

    const timeout = setTimeout(() => {
        if (isJob) {
            this.emit('job', queue.shift());
        }

        makeNext.call(this, queue);
    }, isJob ? dt : 2147483647);

    replaceTimeout.call(this, timeout);
}

export function replaceTimeout(newTimeout) {
    clearTimeout(timeouts.get(this));
    timeouts.set(this, newTimeout);
}

export function makeNext(queue) {
    if (queue.length) {
        return makeTimeout.call(this, queue);
    }

    replaceTimeout.call(this, null);
}
