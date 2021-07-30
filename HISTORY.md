# 4.0.0

- This module is now packaged only as an ES module.
- The minimum supported version of node is now 12.22.0.

# 3.0.0

- The minimum officially supported version of Node.js is now 10.

# 2.0.2

Private API refactor with a net reduction in code.

This release includes a fix which means that, after a job is emitted, if one or
more subsequent jobs are due then they will be emitted immediately. Previously
each job emission would set a new timeout, meaning at least a tick of delay.
Lots of jobs close together could appear to be delayed as the queue was
processed.

# 2.0.0

Complete rewrite!

 - Job objects now have a UUID rather than a hash.
 - It's possible to silence events when adding, removing, or clearing jobs.
 - Browser compatible.
 - Comes in UMD and ES2015 module formats. Should work everywhere JS works.
 - The gap between events can now be larger than the maximum timeout. Previously
   this Rubidium was limited to a maximum timeout of about 25 days between jobs.
 - A new example app to demostrate job persistence with Redis.
 - A code of conduct.
