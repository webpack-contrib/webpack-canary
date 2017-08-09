import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import sinonPromise from 'sinon-promise';
import createInstallObject from '../../generate-install-object/install-object';
import { MODULES } from '../../consts';

chai.use(sinonChai);
sinonPromise(sinon);
const expect = chai.expect;
const proxyquireStrict = proxyquire.noCallThru();

describe('getDependencyExamples', function() {
  let env;
  beforeEach(function() {
    env = {};
    env.webpack = createInstallObject('webpack@2.3.4');
    env.dependency = createInstallObject('raw-loader@1.2.3');
    env.globMock = sinon.promise();
    env.getDependencyExamples = proxyquireStrict('../', {
      'glob-promise': env.globMock
    }).default;
    env.examplesPromise = env.getDependencyExamples(env.webpack, env.dependency);
    env.examplesGlobPromise = env.globMock.firstCall;
    env.exampleGlobPromise = env.globMock.secondCall;
  });

  it('searches for webpack configs', function() {
    expect(env.globMock).to.have.been.calledTwice;
    expect(env.globMock).to.have.been.calledWith('**/webpack.config.js');
  });

  it('searches within the dependency examples', function() {
    sinon.assert.calledWith(env.globMock, '**/webpack.config.js', {
      cwd: `${MODULES}/raw-loader/examples`
    });
    sinon.assert.calledWith(env.globMock, '**/webpack.config.js', {
      cwd: `${MODULES}/raw-loader/example`
    });
  });

  describe('when provided example pahts', function() {
    beforeEach(function(done) {
      const globMock = sinon.promise();
      const getDependencyExamples = proxyquireStrict('../', {
        'glob-promise': globMock
      }).default;
      env.demoExamplesPromise = getDependencyExamples(env.webpack, env.dependency, ['./demo']);
      globMock.firstCall.resolve(['webpack.config.js']);

      setTimeout(done, 10);
    });

    it('should find exapmles in provided paths', function() {
      return env.demoExamplesPromise.then(
        (data) => expect(data).to.deep.equal([
          {
            name: undefined,
            config: `${MODULES}/raw-loader/demo/webpack.config.js`
          }
        ]),
        () => expect(true).to.equal(false)
      );
    });
  });

  describe('when error finding examples', function() {
    beforeEach(function(done) {
      env.examplesGlobPromise.reject(new Error('test'));

      env.examplesPromise.then(
        () => expect(true).to.equal(false),
        (e) => {
          expect(e.toString()).to.equal('Error: test');
          setTimeout(done, 10);
        }
      );
    });

    it('calls the callback with error', function() {
      return env.examplesPromise.then(
        () => expect(true).to.equal(false),
        (e) => expect(e.toString()).to.equal('Error: test')
      );
    });
  });

  describe('when one example found', function() {
    beforeEach(function(done) {
      env.examplesGlobPromise.resolve(['webpack.config.js']);
      env.exampleGlobPromise.resolve([]);
      setTimeout(done, 10)
    });

    it('calls the callback with array of one config', function() {
      return env.examplesPromise.then(
        (data) => expect(data).to.deep.equal([{
          name: undefined,
          config: `${MODULES}/raw-loader/examples/webpack.config.js`
        }]),
        () => expect(true).to.equal(false)
      );
    });
  });

  describe('when multiple examples found', function() {
    beforeEach(function(done) {
      const examples = [
        'example-1/webpack.config.js',
        'example-2/webpack.config.js'
      ];
      env.examplesGlobPromise.resolve(examples);
      env.exampleGlobPromise.resolve(['webpack.config.js']);
      setTimeout(done, 10)
    });

    it('calls the callback with array of one config', function() {
      return env.examplesPromise.then(
        (data) => expect(data).to.deep.equal([
          {
            name: 'example-1',
            config: `${MODULES}/raw-loader/examples/example-1/webpack.config.js`
          },
          {
            name: 'example-2',
            config: `${MODULES}/raw-loader/examples/example-2/webpack.config.js`
          },
          {
            name: undefined,
            config: `${MODULES}/raw-loader/example/webpack.config.js`
          }
        ]),
        () => expect(true).to.equal(false)
      );
    });
  });

  describe('when no examples found', function() {
    beforeEach(function(done) {
      env.examplesGlobPromise.resolve([]);
      env.exampleGlobPromise.resolve([]);
      setTimeout(done, 10)
    });

    it('calls the callback with empty array', function() {
      return env.examplesPromise.then(
        (data) => expect(data).to.deep.equal([]),
        () => expect(true).to.equal(false)
      );
    });
  });
});
