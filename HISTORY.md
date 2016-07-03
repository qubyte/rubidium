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
