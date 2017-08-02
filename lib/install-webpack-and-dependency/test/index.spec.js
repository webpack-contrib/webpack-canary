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
      exec: sinon.mock().atMost(2)
    };
    env.callbackMock = sinon.mock();
    env.installWebpackAndDependency = proxyquireStrict('../', {
      'child_process': env.childProcessStub,
    }).default;
    env.installPromise = env.installWebpackAndDependency(new InstallObject('webpack@2.3.4'), new InstallObject('raw-loader@1.2.3'), env.callbackMock);
    env.webpackInstallCallback = env.childProcessStub.exec.firstCall.args[1];
  });

  it('calls npm install with correct values', function() {
    expect(env.childProcessStub.exec).to.have.been.calledOnce;
    expect(env.childProcessStub.exec).to.have.been.calledWith('npm install webpack@2.3.4 raw-loader@1.2.3 --loglevel error');
  });

  describe('when error installing', function() {
    const error = new Error('test');

    beforeEach(function() {
      env.webpackInstallCallback(error, '', undefined);
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Error calling install command',
        error
      ]);

      return env.installPromise.then(
        () => expect(true).to.equal(false),
        (err) => expect(err).to.deep.equal([
          'Error calling install command',
          error
        ])
      );
    });
  });

  describe('when outputted error messages', function() {
    beforeEach(function() {
      env.webpackInstallCallback(null, '', 'child processed error message');
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Error output when installing',
        'child processed error message'
      ]);

      return env.installPromise.then(
        () => expect(true).to.equal(false),
        (err) => expect(err).to.deep.equal([
        'Error output when installing',
        'child processed error message'
        ])
      );
    });
  });

  describe('when depedencies installed', function() {
    beforeEach(function() {
      const installedOutput = `
        my-project@1.0.0 /path/to/my-project
        ├── raw-loader@1.2.3
        └── webpack@2.3.4
      `;
      env.webpackInstallCallback(null, installedOutput, undefined);
      env.examplesInstallCallback = env.childProcessStub.exec.secondCall.args[2];
    });

    describe('and examples install errors out', function() {
      const error = new Error('test');
      beforeEach(function() {
        env.examplesInstallCallback(error);
      });

      it('calls the callback with error message', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWith([
          'Error calling install command for dependency build',
          error
        ]);

        return env.installPromise.then(
          () => expect(true).to.equal(false),
          (err) => expect(err).to.deep.equal([
            'Error calling install command for dependency build',
            error
          ])
        );
      });
    });

    describe('and examples install finishes', function() {
      beforeEach(function() {
        env.examplesInstallCallback();
      });

      it('calls the callback', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWithExactly();

        return env.installPromise.then(
          () => expect(true).to.equal(true),
          () => expect(true).to.equal(false)
        );
      });
    });
  });

  describe('when depedencies not installed', function() {
    beforeEach(function() {
      env.installedOutput = `
        my-project@1.0.0 /path/to/my-project
        └── webpack@2.3.4
      `;
      env.webpackInstallCallback(null, env.installedOutput, undefined);
    });

    it('calls the callback with error message', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith([
        'Expected versions not in dependency tree',
        env.installedOutput
      ]);

      return env.installPromise.then(
        () => expect(true).to.equal(false),
        (err) => expect(err).to.deep.equal([
          'Expected versions not in dependency tree',
          env.installedOutput
        ])
      );
    });
  });
});
