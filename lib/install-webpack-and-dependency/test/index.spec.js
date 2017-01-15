import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import InstallObject from '../../generate-install-object/install-object';

chai.use(sinonChai);
const expect = chai.expect;
const proxyquireStrict = proxyquire.noCallThru();

describe('installWebpackAndDependency', function() {
  let env;
  beforeEach(function() {
    env = {};
    env.childProcessStub = {
      exec: sinon.mock()
    };
    env.callbackMock = sinon.mock();
    env.installWebpackAndDependency = proxyquireStrict('../', {
      'child_process': env.childProcessStub,
    }).default;
    env.installWebpackAndDependency(new InstallObject('webpack@2.3.4'), new InstallObject('raw-loader@1.2.3'), env.callbackMock);
    env.childProcessExecCallback = env.childProcessStub.exec.firstCall.args[1];
  });

  it('calls npm install with correct values', function() {
    expect(env.childProcessStub.exec).to.have.been.calledOnce;
    expect(env.childProcessStub.exec).to.have.been.calledWith('npm install webpack@2.3.4 raw-loader@1.2.3');
  });

  describe('when error installing', function() {
    beforeEach(function() {
      env.childProcessExecCallback(new Error('test'), '', undefined);
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Error calling install command',
        new Error()
      ]);
    });
  });

  describe('when outputted error messages', function() {
    beforeEach(function() {
      env.childProcessExecCallback(null, '', 'child processed error message');
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Error output when installing',
        'child processed error message'
      ]);
    });
  });

  describe('when depedencies installed', function() {
    beforeEach(function() {
      const installedOutput = `
        my-project@1.0.0 /path/to/my-project
        ├── raw-loader@1.2.3
        └── webpack@2.3.4
      `;
      env.childProcessExecCallback(null, installedOutput, undefined);
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWithExactly();
    });
  });

  describe('when depedencies not installed', function() {
    beforeEach(function() {
      env.installedOutput = `
        my-project@1.0.0 /path/to/my-project
        └── webpack@2.3.4
      `;
      env.childProcessExecCallback(null, env.installedOutput, undefined);
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Expected versions not in dependency tree',
        env.installedOutput
      ]);
    });
  });
});
