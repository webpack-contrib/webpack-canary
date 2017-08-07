import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import sinonPromise from 'sinon-promise';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
sinonPromise(sinon);
const expect = chai.expect;
const proxyquireStrict = proxyquire.noCallThru();

describe('Webpack Canary', function() {
  let env;
  beforeEach(function() {
    env = {};
    env.options = { loglevel: 'silent' };
    env.configsList = [
      {
        name: 'example-1',
        config: { entry: 'my-first-example' }
      },
      {
        name: 'example-2',
        config: { entry: 'my-second-example' }
      },
      {
        name: 'example-3',
        config: { entry: 'my-third-example' }
      }
    ];
    env.installMock = sinon.promise();
    env.dependencyExampleMock = sinon.promise();
    env.runDependencyStub = function() {
      return env.dependencyRunError ? Promise.reject(new Error()) : Promise.resolve();
    };
    sinon.spy(env, 'runDependencyStub');
    env.webpackCanary = proxyquireStrict('../runner', {
      './install-webpack-and-dependency': env.installMock,
      './get-dependency-examples': env.dependencyExampleMock,
      './run-dependency-with-webpack': env.runDependencyStub
    }).default;
  });

  describe('when called', function() {
    describe('and webpack version is not valid', function() {
      describe('version is missing', function() {
        beforeEach(function() {
          env.runnerPromise = env.webpackCanary(undefined, undefined, env.options);
        });

        it('reject with error', function() {
          return env.runnerPromise.then(
            () => expect(true).to.equal(false),
            (err) => expect(err.err).to.deep.equal(['Webpack version is not valid', undefined])
          );
        });
      });

      describe('version is not for webpack', function() {
        beforeEach(function() {
          env.runnerPromise = env.webpackCanary('underscore@1.2.3', undefined, env.options);
        });

        it('reject with error', function() {
          return env.runnerPromise.then(
            () => expect(true).to.equal(false),
            (error) => expect(error.err).to.deep.equal(['Webpack version is not valid', 'underscore@1.2.3'])
          );
        });
      });
    });

    describe('and dependency version is not valid', function() {
      beforeEach(function() {
        env.webpackVersion = '1.2.3';
      });

      describe('version is missing', function() {
        beforeEach(function() {
          env.runnerPromise = env.webpackCanary(env.webpackVersion, undefined, env.options);
        });

        it('reject with error', function() {
          return env.runnerPromise.then(
            () => expect(true).to.equal(false),
            (error) => expect(error.err).to.deep.equal(['Dependency details provided are not valid', undefined])
          );
        });
      });
    });

    describe('and both webpack and dependency versions are valid', function() {
      beforeEach(function() {
        env.runnerPromise = env.webpackCanary('1.2.3', 'raw-loader', env.options);
      });

      it('installs webpack and dependency', function(done) {
        env.runnerPromise.then(
          () => expect(true).to.equal(false),
          () => expect(true).to.equal(false)
        );
        setTimeout(done, 100);
        expect(env.installMock).to.have.been.calledOnce;
      });
    });
  });

  describe('Once install handler has completed', function() {
    beforeEach(function() {
      env.runnerPromise = env.webpackCanary('1.2.3', 'raw-loader', env.options);
    });

    describe('and had an error', function() {
      const error = new Error('test');

      beforeEach(function() {
        return env.installMock.reject(error);
      });

      it('reject with error', function() {
        return env.runnerPromise.then(
          () => expect(true).to.equal(false),
          (err) => expect(err).to.equal(error)
        );
      });
    });

    describe('and was successful', function() {
      beforeEach(function() {
        return env.installMock.resolve();
      });

      it('gets dependency examples', function(done) {
        setImmediate(() => {
          expect(env.dependencyExampleMock).to.have.been.calledOnce;
          done();
        });
      });
    });
  });

  describe('Once examples have been retrieved', function() {
    beforeEach(function() {
      env.runnerPromise = env.webpackCanary('1.2.3', 'raw-loader', env.options);
      return env.installMock.resolve();
    });

    describe('and had an error', function() {
      const error = new Error('test');

      beforeEach(function() {
        return env.dependencyExampleMock.reject(error);
      });

      it('rejects with error', function() {
        return env.runnerPromise.then(
          () => expect(true).to.equal(false),
          (err) => expect(err).to.equal(error)
        );
      });
    });

    describe('and has no examples', function() {
      beforeEach(function() {
        return env.dependencyExampleMock.resolve([]);
      });

      it('rejects with error', function() {
        return env.runnerPromise.then(
          () => expect(true).to.equal(false),
          (error) => expect(error).to.be.an('error')
        );
      });
    });

    describe('and examples are found', function() {
      describe('and not all examples compile', function() {
        beforeEach(function() {
          env.dependencyRunError = true;
          return env.dependencyExampleMock.resolve(env.configsList);
        });

        it('runs each example with webpack', function() {
          return env.runnerPromise.then(
            () => expect(true).to.equal(false),
            () => expect(env.runDependencyStub).to.have.been.calledThrice
          );
        });

        it('reject with error', function() {
          return env.runnerPromise.then(
            () => expect(true).to.equal(false),
            (error) => {
              expect(error).to.be.an('error');
              expect(error.examples).to.deep.equal(env.configsList);
            }
          );
        });
      });

      describe('and all examples compile', function() {
        beforeEach(function() {
          env.dependencyRunError = false;
          return env.dependencyExampleMock.resolve(env.configsList);
        });

        it('runs each example with webpack', function() {
          return env.runnerPromise.then(
            () => expect(env.runDependencyStub).to.have.been.calledThrice,
            () => expect(true).to.equal(false)
          );
        });

        it('resolved', function() {
          return env.runnerPromise.then(
            (data) => expect(data).to.deep.equal(env.configsList),
            () => expect(true).to.equal(false)
          );
        });
      });
    });
  });
});
