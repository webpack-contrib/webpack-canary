import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
const expect = chai.expect;
const proxyquireStrict = proxyquire.noCallThru();

describe('Webpack Canary', function() {
  let env;
  beforeEach(function() {
    env = {};
    env.options = { logLevel: 'silent' };
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
    env.callbackMock = sinon.mock();
    env.installMock = sinon.mock();
    env.dependencyExampleMock = sinon.mock();
    env.runDependencyStub = function(config, callback) {
      env.dependencyRunError ? callback(new Error()) : callback();
    };
    sinon.spy(env, 'runDependencyStub');
    env.webpackCanary = proxyquireStrict('../', {
      './install-webpack-and-dependency': env.installMock,
      './get-dependency-examples': env.dependencyExampleMock,
      './run-dependency-with-webpack': env.runDependencyStub
    }).default;
  });

  describe('when called', function() {
    describe('and webpack version is not valid', function() {
      describe('version is missing', function() {
        beforeEach(function() {
          env.webpackCanary(undefined, undefined, env.options, env.callbackMock);
        });

        it('passes error in callback', function() {
          expect(env.callbackMock).to.have.been.calledOnce;
          expect(env.callbackMock).to.have.been.calledWith(['Webpack version is not valid', undefined]);
        });
      });

      describe('version is not for webpack', function() {
        beforeEach(function() {
          env.webpackCanary('underscore@1.2.3', undefined, env.options, env.callbackMock);
        });

        it('passes error in callback', function() {
          expect(env.callbackMock).to.have.been.calledOnce;
          expect(env.callbackMock).to.have.been.calledWith(['Webpack version is not valid', 'underscore@1.2.3']);
        });
      });
    });

    describe('and dependency version is not valid', function() {
      beforeEach(function() {
        env.webpackVersion = '1.2.3';
      });

      describe('version is missing', function() {
        beforeEach(function() {
          env.webpackCanary(env.webpackVersion, undefined, env.options, env.callbackMock);
        });

        it('passes error in callback', function() {
          expect(env.callbackMock).to.have.been.calledOnce;
          expect(env.callbackMock).to.have.been.calledWith(['Dependency details provided are not valid', undefined]);
        });
      });
    });

    describe('and both webpack and dependency versions are valid', function() {
      beforeEach(function() {
        env.webpackCanary('1.2.3', 'raw-loader', env.options, env.callbackMock);
      });

      it('installs webpack and dependency', function() {
        expect(env.callbackMock).not.to.have.been.called;
        expect(env.installMock).to.have.been.calledOnce;
      });
    });
  });

  describe('Once install handler has completed', function() {
    beforeEach(function() {
      env.webpackCanary('1.2.3', 'raw-loader', env.options, env.callbackMock);
      env.installCallback = env.installMock.firstCall.args[2];
    });

    describe('and had an error', function() {
      beforeEach(function() {
        env.installCallback(new Error('test'));
      });

      it('passes error in callback', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWith(new Error());
      });
    });

    describe('and was successful', function() {
      beforeEach(function() {
        env.installCallback();
      });

      it('gets dependency examples', function() {
        expect(env.callbackMock).not.to.have.been.called;
        expect(env.dependencyExampleMock).to.have.been.calledOnce;
      });
    });
  });

  describe('Once examples have been retrieved', function() {
    beforeEach(function() {
      env.webpackCanary('1.2.3', 'raw-loader', env.options, env.callbackMock);
      env.installCallback = env.installMock.firstCall.args[2];
      env.installCallback();
      env.dependencyExampleCallback = env.dependencyExampleMock.firstCall.args[2];
    });

    describe('and had an error', function() {
      beforeEach(function() {
        env.dependencyExampleCallback(new Error('test'));
      });

      it('passes error in callback', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWith(new Error());
      });
    });

    describe('and has no examples', function() {
      beforeEach(function() {
        env.dependencyExampleCallback(null, []);
      });

      it('passes error in callback', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWith('Unable to get any dependency examples');
      });
    });

    describe('and examples are found', function() {
      describe('and not all examples compile', function() {
        beforeEach(function(done) {
          env.dependencyRunError = true;
          env.dependencyExampleCallback(null, env.configsList);
          setTimeout(done, 10)
        });

        it('runs only the first failing example with webpack', function() {
          expect(env.runDependencyStub).to.have.been.calledOnce;
        });

        it('passes error in callback', function() {
          expect(env.callbackMock).to.have.been.calledOnce;
          expect(env.callbackMock.firstCall.args[0]).to.be.an('object');
        });
      });

      describe('and all examples compile', function() {
        beforeEach(function(done) {
          env.dependencyRunError = false;
          env.dependencyExampleCallback(null, env.configsList);
          setTimeout(done, 10)
        });

        it('runs each example with webpack', function() {
          expect(env.runDependencyStub).to.have.been.calledThrice;
        });

        it('calls callback', function() {
          expect(env.callbackMock).to.have.been.called;
          expect(env.callbackMock).to.have.been.calledWithExactly();
        });
      });
    });
  });
});
