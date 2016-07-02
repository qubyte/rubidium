# At server.

This example wraps Rubidium in an HTTP server, and uses it to schedule requests
to another server in the future. If you have a cluster of microservices, this is
useful to have since it means that other services do not have to keep track of
state (job schedules) or know about time.

To try it out, you must do

```bash
npm install
npm run build
```

in the Rubidium directory, and then do

```bash
npm install
```

in this directory. Run with `node .` or `npm start`.

Try making a request to this server with a URL that looks like:

const URL = `http://localhost:3000/add/${Date.now() + 5000}`

With a body that looks like:

```javascript
{ "callbackUrl": "http://localhost:3000/test" }
```

You should see a log statement in the server console after 5 seconds.

The source of the server is annotated to help explain what's going on.
