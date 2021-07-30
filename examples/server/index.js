import fetch from 'node-fetch';
import Rubidium from 'rubidium';
import http from 'http';
import Toisu from 'toisu';
import Router from 'toisu-router';
import body from 'toisu-body';

// Set up a rubidium instance.
const rb = new Rubidium();

// Give it a listener for job events. This will make a JSON POST request to the
// callback in the message with the message itself as the body. Requests have
// a custom header so that registered jobs can't create another job.
rb.on('job', job => {
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'FROM-ATD-SERVER': 'true' },
    body: JSON.stringify(job.message)
  };

  return fetch(job.message.callbackUrl, options)
    .catch(err => console.error(err.stack || err.message));
});

// Create a router for the Toisu! server.
const router = new Router();

// This middleware will use the :timestamp parameter and the request body to
// create a job, and then add it to the rubidium instance.
function addJobMiddleware(req, res) {
  const params = this.get('params');
  const time = parseInt(params.timestamp, 10);
  const message = this.get('body');

  // Stop callbacks registering new jobs.
  if (req.headers['FROM-ATD-SERVER'] !== 'true') {
    rb.add({ time, message });
  }

  res.statusCode = 202;
  res.end();
}

// Use this to accept requests from itself as a test.
function testMiddleware(req, res) {
  const message = this.get('body');

  console.log('Received callback request:', message);

  res.statusCode = 204;
  res.end();
}

// Give the router the JSON body parsing middleware and the add job middleware.
router.route('/add/:timestamp', {
  post: [body.json(), addJobMiddleware]
});

router.route('/test', {
  post: [body.json(), testMiddleware]
});

// Create a Toisu! instance.
const app = new Toisu();

// Have the Toisu instance use the router.
app.use(router.middleware);

// Make the server listen for requests on localhost:3000.
http.createServer(app.requestHandler).listen(3000, () => console.log('Listening on port 3000'));
