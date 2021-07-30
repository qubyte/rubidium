import { v4 as uuid } from 'uuid';

export default class Job {
  constructor(spec) {
    if (!spec) {
      throw new Error('Spec must be an object');
    }

    if (spec.message === undefined) {
      throw new Error('Message argument must be populated.');
    }

    this.time = spec.time instanceof Date ? spec.time.getTime() : parseInt(spec.time, 10);

    if (!this.time) {
      throw new TypeError('Time must be a Date object or an integer.');
    }

    this.message = spec.message;

    this.uuid = spec.uuid || uuid();
  }
}
