// Start, then quit, then start this app again. The console logs will show that
// the job registered the first time the app ran will be emitted after 10
// seconds, even though the app was restarted.

import Redis from 'ioredis';
import Rubidium from 'rubidium';

const redis = new Redis();
const rb = new Rubidium();

// Load the persisted queue when redis is ready.
redis.hgetall('rubidium-queue').then(stringifiedJobs => {
  for (const uuid of Object.keys(stringifiedJobs)) {
    // Add the persisted jobs to the queue, taking care to silence them so
    // they are not duplicated in redis.
    rb.add(JSON.parse(stringifiedJobs[uuid]), true);
  }
});

rb.on('addJob', job => {
  redis.hset('rubidium-queue', job.uuid, JSON.stringify(job)).then(() => {
    console.log(`Job ${job.uuid} persisted.`);
  });
});

rb.on('job', job => {
  redis.hdel('rubidium-queue', job.uuid);
  console.log(`Job ${job.uuid} emitted, message: ${job.message}`);
});

rb.on('removeJob', job => {
  redis.hdel('rubidium-queue', job.uuid);
});

rb.add({ time: Date.now() + 10000, message: '10 seconds have passed.' });
