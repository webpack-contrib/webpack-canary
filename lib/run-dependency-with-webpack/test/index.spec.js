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
    env.childProcessStub = {
      exec: sinon.mock()
    };
    env.callbackMock = sinon.mock();
    env.runDependencyWithWebpack = proxyquireStrict('../', {
      'child_process': env.childProcessStub,
    }).default;
    env.config = 'node_modules/raw-loader/examples/webpack.config.js';
    env.runDependencyWithWebpack(env.config, env.callbackMock);
    env.childProcessCallback = env.childProcessStub.exec.firstCall.args[1];
  });

  it('executes webpack', function() {
    expect(env.childProcessStub.exec).to.have.been.calledOnce;
    expect(env.childProcessStub.exec).to.have.been.calledWith('./node_modules/webpack/bin/webpack.js --config node_modules/raw-loader/examples/webpack.config.js');
  });

  describe('when error executing webpack', function() {
    beforeEach(function() {
      env.childProcessCallback(new Error('test'), '', '');
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Error running webpack',
        new Error()
      ]);
    });
  });

  describe('when webpack build causes error', function() {
    beforeEach(function() {
      env.childProcessCallback(null, '', 'error output');
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Errors output during compilation',
        'error output'
      ]);
    });
  });

  describe('when webpack outputs error message', function() {
    beforeEach(function() {
      env.childProcessCallback(null, 'An error has occurred', '');
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Errors detected in compilation',
        'An error has occurred'
      ]);
    });
  });

  describe('when webpack build is successful', function() {
    beforeEach(function() {
      env.childProcessCallback(null, '', '');
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWithExactly();
    });
  });
});
