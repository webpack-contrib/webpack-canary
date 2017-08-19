/* eslint-disable import/no-extraneous-dependencies, no-unused-expressions */

import path from 'path';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import createInstallObject from '../../generate-install-object/install-object';

chai.use(sinonChai);
const { expect } = chai;
const proxyquireStrict = proxyquire.noCallThru();

describe('runDependencyTests', () => {
  let env;

  beforeEach(() => {
    env = {};
    env.webpack = createInstallObject('webpack@2.3.4');
    env.dependency = createInstallObject('raw-loader@1.2.3');
    env.options = {
      testPath: __dirname,
    };
    env.childProcessStub = {
      exec: sinon.mock().atMost(2),
    };
    env.utils = proxyquireStrict('../../utils', {
      child_process: env.childProcessStub,
    });
    env.fsStub = {
      renameSync: sinon.mock(),
      symlinkSync: sinon.mock(),
    };
    env.rmfrMock = sinon.promise();
    env.runDependencyTests = proxyquireStrict('../', {
      fs: env.fsStub,
      rmfr: env.rmfrMock,
      '../utils': env.utils,
    }).default;
    env.runPromise = env.runDependencyTests(env.webpack, env.dependency, env.options);
  });

  it('clears the old test path', () => {
    expect(env.rmfrMock).to.have.been.calledOnce;
    expect(env.rmfrMock).to.have.been.calledWith(env.options.testPath);
  });

  it('moves the dependency to testPath', async () => {
    await env.rmfrMock.firstCall.resolve();
    await Promise.resolve();
    expect(env.fsStub.renameSync).to.have.been.calledOnce;
    expect(env.fsStub.renameSync).to.have.been.calledWith(env.dependency.installLocation, env.options.testPath);
  });

  it('clears the dependency webpack module', async () => {
    await env.rmfrMock.firstCall.resolve();
    await Promise.resolve();
    expect(env.rmfrMock).to.have.been.calledTwice;
    expect(env.rmfrMock.secondCall).to.have.been.calledWith(path.join(env.options.testPath, 'node_modules', 'webpack'));
  });

  it('symlinks webpack to dependency', async () => {
    await env.rmfrMock.firstCall.resolve();
    await Promise.resolve();
    await env.rmfrMock.secondCall.resolve();
    await Promise.resolve();
    expect(env.fsStub.symlinkSync).to.have.been.calledOnce;
    expect(env.fsStub.symlinkSync).to.have.been.calledWith(env.webpack.installLocation, path.join(env.options.testPath, 'node_modules', 'webpack'), 'junction');
  });

  describe('running tests', () => {
    beforeEach(async () => {
      await env.rmfrMock.firstCall.resolve();
      await Promise.resolve();
      await env.rmfrMock.secondCall.resolve();
      await Promise.resolve();
    });

    it('should fail if status code > 0', () => {
      const error = new Error('test');
      env.childProcessStub.exec.firstCall.args[2](error);
      return env.runPromise.then(
        () => expect(true).to.equal(false),
        err => expect(err.err).to.deep.equal([
          'Error calling command',
          error,
        ]),
      );
    });

    it('should succeed if stderr, but code == 0', () => {
      env.childProcessStub.exec.firstCall.args[2](null, 'Success', 'Warning when executing');
      return env.runPromise.then(
        stdout => expect(stdout).to.equal('Success'),
        () => expect(true).to.equal(false),
      );
    });

    it('should succeed if code == 0', () => {
      env.childProcessStub.exec.firstCall.args[2](null, 'Success');
      return env.runPromise.then(
        stdout => expect(stdout).to.equal('Success'),
        () => expect(true).to.equal(false),
      );
    });
  });
});
