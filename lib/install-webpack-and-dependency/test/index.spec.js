import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import createInstallObject from '../../generate-install-object/install-object';
import { ROOT_PATH } from '../../consts';

chai.use(sinonChai);
const { expect } = chai;
const proxyquireStrict = proxyquire.noCallThru();

describe('installWebpackAndDependency', () => {
  let env;
  const installedOutput = `
    my-project@1.0.0 /path/to/my-project
    ├── raw-loader@1.2.3
    └── webpack@2.3.4
  `;

  beforeEach(() => {
    env = {};
    env.webpack = createInstallObject('webpack@2.3.4');
    env.dependency = createInstallObject('raw-loader@1.2.3');
    env.childProcessStub = {
      exec: sinon.mock().atMost(2),
    };
    env.installWebpackAndDependency = proxyquireStrict('../', {
      child_process: env.childProcessStub,
    }).default;
    env.installPromise = env.installWebpackAndDependency(env.webpack, env.dependency);
    [, , env.webpackInstallCallback] = env.childProcessStub.exec.firstCall.args;
  });

  it('calls npm install with correct values', () => {
    expect(env.childProcessStub.exec).to.have.been.calledOnce;
    expect(env.childProcessStub.exec).to.have.been.calledWith('npm install webpack@2.3.4 raw-loader@1.2.3', { cwd: ROOT_PATH });
  });

  it('calls yarn add with correct values', () => {
    // Note: First call is with npm
    env.installPromise = env.installWebpackAndDependency(env.webpack, env.dependency, 'yarn');
    [, , env.webpackInstallCallback] = env.childProcessStub.exec.secondCall.args;
    expect(env.childProcessStub.exec).to.have.been.calledTwice;

    expect(env.childProcessStub.exec.secondCall).to.have.been.calledWith('yarn add webpack@2.3.4 raw-loader@1.2.3', { cwd: ROOT_PATH });
  });

  describe('when error installing', () => {
    const error = new Error('test');

    beforeEach(() => {
      env.webpackInstallCallback(error, '', null);
    });

    it('calls the callback with error message', () => env.installPromise.then(
      () => expect(true).to.equal(false),
      ({ err }) => expect(err).to.deep.equal([
        'Error calling install command',
        error,
      ]),
    ));
  });

  describe('when outputted messages on error', () => {
    describe('which contain errors', () => {
      beforeEach(() => {
        env.webpackInstallCallback(null, installedOutput, 'child process error message');
      });

      it('calls the callback with error message', () => env.installPromise.then(
        () => expect(true).to.equal(false),
        err => expect(err).to.deep.equal([
          'Error output when installing',
          'child process error message',
        ]),
      ));
    });

    describe('which contain warnings', () => {
      beforeEach(() => {
        env.webpackInstallCallback(null, installedOutput, 'warning missing peer dependency');
        env.childProcessStub.exec.secondCall.args[2]();
      });

      it('calls the callback with error message', () => env.installPromise.then(
        () => expect(true).to.equal(true),
        () => expect(true).to.equal(false),
      ));
    });
  });

  describe('when depedencies installed', () => {
    beforeEach(() => {
      env.webpackInstallCallback(null, installedOutput, null);
      [, , env.examplesInstallCallback] = env.childProcessStub.exec.secondCall.args;
    });

    describe('and examples install errors out', () => {
      const error = new Error('test');
      beforeEach(() => {
        env.examplesInstallCallback(error);
      });

      it('calls the callback with error message', () => env.installPromise.then(
        () => expect(true).to.equal(false),
        ({ err }) => expect(err).to.deep.equal([
          'Error calling install command for dependency build',
          error,
        ]),
      ));
    });

    describe('and examples install finishes', () => {
      beforeEach(() => {
        env.examplesInstallCallback();
      });

      it('calls the callback', () => env.installPromise.then(
        () => expect(true).to.equal(true),
        () => expect(true).to.equal(false),
      ));
    });
  });

  describe('when depedencies not installed', () => {
    beforeEach(() => {
      env.installedOutput = `
        my-project@1.0.0 /path/to/my-project
        └── webpack@2.3.4
      `;
      env.webpackInstallCallback(null, env.installedOutput, null);
    });

    it('calls the callback with error message', () => env.installPromise.then(
      () => expect(true).to.equal(false),
      ({ err }) => expect(err).to.deep.equal([
        'Expected versions not in dependency tree',
        env.installedOutput,
      ]),
    ));
  });
});
