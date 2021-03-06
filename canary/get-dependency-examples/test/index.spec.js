/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import sinonPromise from 'sinon-promise';
import createInstallObject from '../../generate-install-object/install-object';
import { MODULES } from '../../consts';

chai.use(sinonChai);
sinonPromise(sinon);
const { expect } = chai;
const proxyquireStrict = proxyquire.noCallThru();

describe('getDependencyExamples', () => {
  let env;
  beforeEach(() => {
    env = {};
    env.webpack = createInstallObject('webpack@2.3.4');
    env.dependency = createInstallObject('raw-loader@1.2.3');
    env.globMock = sinon.promise();
    env.getDependencyExamples = proxyquireStrict('../', {
      'glob-promise': env.globMock,
    }).default;
    env.examplesPromise = env.getDependencyExamples(env.webpack, env.dependency, 'examples');
    env.examplesGlobPromise = env.globMock.firstCall;
  });

  it('searches for webpack configs', () => {
    expect(env.globMock).to.have.been.calledOnce;
    expect(env.globMock).to.have.been.calledWith('**/webpack.config.js');
  });

  it('searches within the dependency examples', () => {
    sinon.assert.calledWith(env.globMock, '**/webpack.config.js', {
      cwd: `${MODULES}/raw-loader/examples`,
    });
  });

  describe('when provided example paths', () => {
    beforeEach((done) => {
      const globMock = sinon.promise();
      const getDependencyExamples = proxyquireStrict('../', {
        'glob-promise': globMock,
      }).default;
      env.demoExamplesPromise = getDependencyExamples(env.webpack, env.dependency, './demo');
      globMock.firstCall.resolve(['webpack.config.js']);

      setTimeout(done, 10);
    });

    it('should find examples in provided paths', () => env.demoExamplesPromise.then(
      data => expect(data).to.deep.equal([
        {
          name: null,
          config: `${MODULES}/raw-loader/demo/webpack.config.js`,
        },
      ]),
      () => expect(true).to.equal(false),
    ));
  });

  describe('when error finding examples', () => {
    beforeEach((done) => {
      env.examplesGlobPromise.reject(new Error('test'));

      env.examplesPromise.then(
        () => expect(true).to.equal(false),
        (e) => {
          expect(e.toString()).to.equal('Error: test');
          setTimeout(done, 10);
        },
      );
    });

    it('calls the callback with error', () => env.examplesPromise.then(
      () => expect(true).to.equal(false),
      e => expect(e.toString()).to.equal('Error: test'),
    ));
  });

  describe('when one example found', () => {
    beforeEach((done) => {
      env.examplesGlobPromise.resolve(['webpack.config.js']);
      setTimeout(done, 10);
    });

    it('calls the callback with array of one config', () => env.examplesPromise.then(
      data => expect(data).to.deep.equal([{
        name: null,
        config: `${MODULES}/raw-loader/examples/webpack.config.js`,
      }]),
      e => expect(e).to.equal(false),
    ));
  });

  describe('when multiple examples found', () => {
    beforeEach((done) => {
      const examples = [
        'example-1/webpack.config.js',
        'example-2/webpack.config.js',
      ];
      env.examplesGlobPromise.resolve(examples);
      setTimeout(done, 10);
    });

    it('calls the callback with array of one config', () => env.examplesPromise.then(
      data => expect(data).to.deep.equal([
        {
          name: 'example-1',
          config: `${MODULES}/raw-loader/examples/example-1/webpack.config.js`,
        },
        {
          name: 'example-2',
          config: `${MODULES}/raw-loader/examples/example-2/webpack.config.js`,
        },
      ]),
      e => expect(e).to.equal(false),
    ));
  });

  describe('when no examples found', () => {
    beforeEach((done) => {
      env.examplesGlobPromise.resolve([]);
      setTimeout(done, 10);
    });

    it('calls the callback with empty array', () => env.examplesPromise.then(
      data => expect(data).to.deep.equal([]),
      () => expect(true).to.equal(false),
    ));
  });
});
