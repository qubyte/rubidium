# rubidium

Rubidium is a one-time task emitter, inspired by the unix `at` utility. This module is a minimal implementation. It exports a constructor. Instances of the constructor are event emitters, with methods to add and remove job specifications. A job consists of a due time and a message.

## Usage

```javsacript
var Rubidium = require('rubidium');

var rb = new Rubidium();

// Add a job to be emitted in 5 seconds time.
rb.add({ time: Date.now() + 5000, message: '5 seconds has passes.' });
```

The simplicity of the interface hides the complexity needed in managing the list of jobs and timeouts.