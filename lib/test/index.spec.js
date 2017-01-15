import _ from 'underscore';
import Promise from 'bluebird';
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
    env.fatalErrorMock = sinon.mock();
    env.installMock = sinon.mock();
    env.dependencyExampleMock = sinon.mock();
    env.runDependencyStub = function(config, callback) {
      env.dependencyRunError ? callback(new Error()) : callback();
    };
    sinon.spy(env, 'runDependencyStub');
    env.loggerSuccessMock = sinon.mock();
    env.webpackCanary = proxyquireStrict('../', {
      './utils': {
        fatalError: env.fatalErrorMock
      },
      './logger': {
        info: _.noop,
        success: env.loggerSuccessMock
      },
      './install-webpack-and-dependency': env.installMock,
      './get-dependency-examples': env.dependencyExampleMock,
      './run-dependency-with-webpack': env.runDependencyStub
    }).default;
  });

  describe('when called', function() {
    describe('and webpack version is not valid', function() {
      describe('version is missing', function() {
        beforeEach(function() {
          env.webpackCanary();
        });

        it('triggers a fatal error', function() {
          expect(env.fatalErrorMock).to.have.been.calledOnce;
          expect(env.fatalErrorMock).to.have.been.calledWith('Webpack version is not valid', undefined);
        });
      });

      describe('version is not for webpack', function() {
        beforeEach(function() {
          env.webpackCanary('underscore@1.2.3');
        });

        it('triggers a fatal error', function() {
          expect(env.fatalErrorMock).to.have.been.calledOnce;
          expect(env.fatalErrorMock).to.have.been.calledWith('Webpack version is not valid', 'underscore@1.2.3');
        });
      });
    });

    describe('and dependency version is not valid', function() {
      beforeEach(function() {
        env.webpackVersion = '1.2.3';
      });

      describe('version is missing', function() {
        beforeEach(function() {
          env.webpackCanary(env.webpackVersion);
        });

        it('triggers a fatal error', function() {
          expect(env.fatalErrorMock).to.have.been.calledOnce;
          expect(env.fatalErrorMock).to.have.been.calledWith('Dependency details provided are not valid', undefined);
        });
      });
    });

    describe('and both webpack and dependency versions are valid', function() {
      beforeEach(function() {
        env.webpackCanary('1.2.3', 'raw-loader');
      });

      it('installs webpack and dependency', function() {
        expect(env.fatalErrorMock).not.to.have.been.called;
        expect(env.installMock).to.have.been.calledOnce;
      });
    });
  });

  describe('Once install handler has completed', function() {
    beforeEach(function() {
      env.webpackCanary('1.2.3', 'raw-loader');
      env.installCallback = env.installMock.firstCall.args[2];
    });

    describe('and had an error', function() {
      beforeEach(function() {
        env.installCallback(new Error('test'));
      });

      it('triggers a fatal error', function() {
        expect(env.fatalErrorMock).to.have.been.calledOnce;
        expect(env.fatalErrorMock).to.have.been.calledWith(new Error());
      });
    });

    describe('and was successful', function() {
      beforeEach(function() {
        env.installCallback();
      });

      it('gets dependency examples', function() {
        expect(env.fatalErrorMock).not.to.have.been.called;
        expect(env.dependencyExampleMock).to.have.been.calledOnce;
      });
    });
  });

  describe('Once examples have been retrieved', function() {
    beforeEach(function() {
      env.webpackCanary('1.2.3', 'raw-loader');
      env.installCallback = env.installMock.firstCall.args[2];
      env.installCallback();
      env.dependencyExampleCallback = env.dependencyExampleMock.firstCall.args[2];
    });

    describe('and had an error', function() {
      beforeEach(function() {
        env.dependencyExampleCallback(new Error('test'));
      });

      it('triggers a fatal error', function() {
        expect(env.fatalErrorMock).to.have.been.calledOnce;
        expect(env.fatalErrorMock).to.have.been.calledWith(new Error());
      });
    });

    describe('and has no examples', function() {
      beforeEach(function() {
        env.dependencyExampleCallback(null, []);
      });

      it('triggers a fatal error', function() {
        expect(env.fatalErrorMock).to.have.been.calledOnce;
        expect(env.fatalErrorMock).to.have.been.calledWith('Unable to get any dependency examples');
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

        it('displays failure message', function() {
          expect(env.fatalErrorMock).to.have.been.calledOnce;
          expect(env.fatalErrorMock.firstCall.args[0]).to.be.an('object');
          expect(env.loggerSuccessMock).not.to.have.been.called;
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

        it('displays success message', function() {
          expect(env.fatalErrorMock).not.to.have.been.called;
          expect(env.loggerSuccessMock).to.have.been.calledOnce;
        });
      });
    });
  });
});
