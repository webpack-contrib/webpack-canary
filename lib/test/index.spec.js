/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonPromise from 'sinon-promise';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
sinonPromise(sinon);
const { expect } = chai;
const proxyquireStrict = proxyquire.noCallThru();

describe('Webpack Canary', () => {
  let env;
  beforeEach(() => {
    env = {};
    env.options = { loglevel: 'silent' };
    env.configsList = [
      {
        name: 'example-1',
        config: { entry: 'my-first-example' },
      },
      {
        name: 'example-2',
        config: { entry: 'my-second-example' },
      },
      {
        name: 'example-3',
        config: { entry: 'my-third-example' },
      },
    ];
    env.installMock = sinon.promise();
    env.dependencyExampleMock = sinon.promise();
    env.runDependencyStub = () => { // eslint-disable-line arrow-body-style
      return env.dependencyRunError ? Promise.reject(new Error()) : Promise.resolve();
    };
    sinon.spy(env, 'runDependencyStub');
    env.webpackCanary = proxyquireStrict('../runner', {
      './install-webpack-and-dependency': env.installMock,
      './get-dependency-examples': env.dependencyExampleMock,
      './run-dependency-with-webpack': env.runDependencyStub,
    }).default;
  });

  describe('when called', () => {
    describe('and webpack version is not valid', () => {
      describe('version is missing', () => {
        beforeEach(() => {
          env.runnerPromise = env.webpackCanary(null, null, env.options);
        });

        it('reject with error', () => env.runnerPromise.then(
          () => expect(true).to.equal(false),
          err => expect(err.err).to.deep.equal(['Webpack version is not valid', null]),
        ));
      });

      describe('version is not for webpack', () => {
        beforeEach(() => {
          env.runnerPromise = env.webpackCanary('underscore@1.2.3', null, env.options);
        });

        it('reject with error', () => env.runnerPromise.then(
          () => expect(true).to.equal(false),
          error => expect(error.err).to.deep.equal(['Webpack version is not valid', 'underscore@1.2.3']),
        ));
      });
    });

    describe('and dependency version is not valid', () => {
      beforeEach(() => {
        env.webpackVersion = '1.2.3';
      });

      describe('version is missing', () => {
        beforeEach(() => {
          env.runnerPromise = env.webpackCanary(env.webpackVersion, null, env.options);
        });

        it('reject with error', () => env.runnerPromise.then(
          () => expect(true).to.equal(false),
          error => expect(error.err).to.deep.equal(['Dependency details provided are not valid', null]),
        ));
      });
    });

    describe('and both webpack and dependency versions are valid', () => {
      beforeEach(() => {
        env.runnerPromise = env.webpackCanary('1.2.3', 'raw-loader', env.options);
      });

      it('installs webpack and dependency', (done) => {
        env.runnerPromise.then(
          () => expect(true).to.equal(false),
          () => expect(true).to.equal(false),
        );
        setTimeout(done, 100);
        expect(env.installMock).to.have.been.calledOnce;
      });
    });
  });

  describe('Once install handler has completed', () => {
    beforeEach(() => {
      env.runnerPromise = env.webpackCanary('1.2.3', 'raw-loader', env.options);
    });

    describe('and had an error', () => {
      const error = new Error('test');

      beforeEach(() => env.installMock.reject(error));

      it('reject with error', () => env.runnerPromise.then(
        () => expect(true).to.equal(false),
        err => expect(err).to.equal(error),
      ));
    });

    describe('and was successful', () => {
      beforeEach(() => env.installMock.resolve());

      it('gets dependency examples', (done) => {
        setImmediate(() => {
          expect(env.dependencyExampleMock).to.have.been.calledOnce;
          done();
        });
      });
    });
  });

  describe('Once examples have been retrieved', () => {
    beforeEach(() => {
      env.runnerPromise = env.webpackCanary('1.2.3', 'raw-loader', env.options);
      return env.installMock.resolve();
    });

    describe('and had an error', () => {
      const error = new Error('test');

      beforeEach(() => env.dependencyExampleMock.reject(error));

      it('rejects with error', () => env.runnerPromise.then(
        () => expect(true).to.equal(false),
        err => expect(err).to.equal(error),
      ));
    });

    describe('and has no examples', () => {
      beforeEach(() => env.dependencyExampleMock.resolve([]));

      it('rejects with error', () => env.runnerPromise.then(
        () => expect(true).to.equal(false),
        error => expect(error).to.be.an('error'),
      ));
    });

    describe('and examples are found', () => {
      describe('and not all examples compile', () => {
        beforeEach(() => {
          env.dependencyRunError = true;
          return env.dependencyExampleMock.resolve(env.configsList);
        });

        it('runs each example with webpack', () => env.runnerPromise.then(
          () => expect(true).to.equal(false),
          () => expect(env.runDependencyStub).to.have.been.calledThrice,
        ));

        it('reject with error', () => env.runnerPromise.then(
          () => expect(true).to.equal(false),
          (error) => {
            expect(error).to.be.an('error');
            expect(error.examples).to.deep.equal(env.configsList);
          },
        ));
      });

      describe('and all examples compile', () => {
        beforeEach(() => {
          env.dependencyRunError = false;
          return env.dependencyExampleMock.resolve(env.configsList);
        });

        it('runs each example with webpack', () => env.runnerPromise.then(
          () => expect(env.runDependencyStub).to.have.been.calledThrice,
          () => expect(true).to.equal(false),
        ));

        it('resolved', () => env.runnerPromise.then(
          data => expect(data).to.deep.equal(env.configsList),
          () => expect(true).to.equal(false),
        ));
      });
    });
  });
});
