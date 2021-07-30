import sinon from 'sinon';
import assert from 'assert';
import uuidv4 from '../src/uuidv4.js';

describe('uuidv4', () => {
  it('is a function', () => {
    assert.equal(typeof uuidv4, 'function');
  });

  describe('sample', () => {
    const expected = 'c2d06e01-217b-4f6d6d5-80ccc42-642e8573401b';

    beforeEach(() => {
      sinon.stub(Math, 'random');

      Math.random.onCall(0).returns(0.7598701265952619);
      Math.random.onCall(1).returns(0.8134768956731693);
      Math.random.onCall(2).returns(0.4324240063309106);
      Math.random.onCall(3).returns(0.004501034384116309);
      Math.random.onCall(4).returns(0.13056163393263187);
      Math.random.onCall(5).returns(0.483824321959035);
      Math.random.onCall(6).returns(0.962755439322031);
      Math.random.onCall(7).returns(0.8385543919513738);
      Math.random.onCall(8).returns(0.832324777600663);
      Math.random.onCall(9).returns(0.051273026356071005);
      Math.random.onCall(10).returns(0.04931980291567517);
      Math.random.onCall(11).returns(0.7970684833761694);
      Math.random.onCall(12).returns(0.25914385183758615);
      Math.random.onCall(13).returns(0.390900363131224);
      Math.random.onCall(14).returns(0.1808070966332891);
      Math.random.onCall(15).returns(0.5228907810351897);
      Math.random.onCall(16).returns(0.45064177320914434);
      Math.random.onCall(17).returns(0.2501263934740454);
      Math.random.onCall(18).returns(0.1073328779456526);
    });

    afterEach(() => {
      Math.random.restore();
    });

    it('is the expected string', () => {
      const sample = uuidv4();

      assert.equal(sample, expected);
    });
  });

  it('produces UUID strings of the correct length', () => {
    for (let i = 0; i < 10000; i++) {
      assert.equal(uuidv4().length, 42);
    }
  });

  it('does not easily produce duplicates', () => {
    const uuids = new Set();

    for (let i = 0; i < 10000; i++) {
      const uuid = uuidv4();

      if (uuids.has(uuid)) {
        throw new Error(`Duplicate UUID produced: ${uuid}`);
      }

      uuids.add(uuid);
    }
  });
});
