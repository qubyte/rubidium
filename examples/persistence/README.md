# Persistent queues.

This example sets up a Rubidium instance, and persists jobs to a redis server.
This is useful, because if the node app goes down then jobs aren't lost. When
the app is restarted it retrieves persisted jobs and loads them into the
Rubidium instance. The instance will emit any jobs which should have been
emitted when the app was down, then any in the future will behave as normal.

To try it out, you must have a redis server running locally. Then run

```bash
npm install
npm run build
```

in the Rubidium directory, followed by

```bash
npm install
```

in this directory. Run with `node .` or `npm start`.

See the source for annotations.
