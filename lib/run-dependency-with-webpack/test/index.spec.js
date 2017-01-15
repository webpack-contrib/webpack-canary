import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';

chai.use(sinonChai);
const expect = chai.expect;
const proxyquireStrict = proxyquire.noCallThru();

describe('runDependencyWithWebpack', function() {
  let env;
  beforeEach(function() {
    env = {};
    env.compilerRunMock = sinon.mock();
    env.webpackStub = sinon.stub().returns({
      run: env.compilerRunMock
    });
    env.callbackMock = sinon.mock();
    env.runDependencyWithWebpack = proxyquireStrict('../', {
      'webpack': env.webpackStub,
    }).default;
    env.config = { entry: 'my-app' };
    env.runDependencyWithWebpack(env.config, env.callbackMock);
    env.compilerRunCallback = env.compilerRunMock.firstCall.args[0];
  });

  it('creates a webpack compiler', function() {
    expect(env.webpackStub).to.have.been.calledOnce;
    expect(env.webpackStub).to.have.been.calledWith(env.config);
  });

  describe('when error running compiler', function() {
    beforeEach(function() {
      env.compilerRunCallback(new Error('test'));
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Error running webpack',
        new Error()
      ]);
    });
  });

  describe('when errors output from compiler', function() {
    beforeEach(function() {
      const statsWithErrors = {
        toJson: () => ({ errors: ['error output'], warnings: [] })
      };
      env.compilerRunCallback(null, statsWithErrors);
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Errors output during compilation',
        ['error output']
      ]);
    });
  });

  describe('when warnings output from compiler', function() {
    beforeEach(function() {
      const statsWithWarnings = {
        toJson: () => ({ errors: [], warnings: ['warning output'] })
      };
      env.compilerRunCallback(null, statsWithWarnings);
    });

    it('calls the callback with warning message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Warnings output during compilation',
        ['warning output']
      ]);
    });
  });

  describe('when compilation is successful', function() {
    beforeEach(function() {
      const cleanStats = {
        toJson: () => ({ errors: [], warnings: [] })
      };
      env.compilerRunCallback(null, cleanStats);
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWithExactly();
    });
  });
});
