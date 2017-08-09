import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import createInstallObject from '../../generate-install-object/install-object';
import { ROOT_PATH } from '../../consts';

chai.use(sinonChai);
const expect = chai.expect;
const proxyquireStrict = proxyquire.noCallThru();

describe('installWebpackAndDependency', function() {
  let env;
  beforeEach(function() {
    env = {};
    env.webpack = createInstallObject('webpack@2.3.4');
    env.dependency = createInstallObject('raw-loader@1.2.3');
    env.childProcessStub = {
      exec: sinon.mock().atMost(2)
    };
    env.installWebpackAndDependency = proxyquireStrict('../', {
      'child_process': env.childProcessStub
    }).default;
    env.installPromise = env.installWebpackAndDependency(env.webpack, env.dependency);
    env.webpackInstallCallback = env.childProcessStub.exec.firstCall.args[2];
  });

  it('calls npm install with correct values', function() {
    expect(env.childProcessStub.exec).to.have.been.calledOnce;
    expect(env.childProcessStub.exec).to.have.been.calledWith('npm install webpack@2.3.4 raw-loader@1.2.3', { cwd: ROOT_PATH });
  });

  it('calls yarn add with correct values', function() {
    // Note: First call is with npm
    env.installPromise = env.installWebpackAndDependency(env.webpack, env.dependency, 'yarn');
    env.webpackInstallCallback = env.childProcessStub.exec.secondCall.args[2];
    expect(env.childProcessStub.exec).to.have.been.calledTwice;

    expect(env.childProcessStub.exec.secondCall).to.have.been.calledWith('yarn add webpack@2.3.4 raw-loader@1.2.3', { cwd: ROOT_PATH });
  });

  describe('when error installing', function() {
    const error = new Error('test');

    beforeEach(function() {
      env.webpackInstallCallback(error, '', undefined);
    });

    it('calls the callback with error message', function() {
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
