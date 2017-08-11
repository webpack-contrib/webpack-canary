import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import { MODULES, WEBPACK_BIN } from '../../consts';

chai.use(sinonChai);
const { expect } = chai;
const proxyquireStrict = proxyquire.noCallThru();

describe('runDependencyWithWebpack', () => {
  let env;

  beforeEach(() => {
    env = {};
    env.setTimeout = setTimeout;
    env.clock = sinon.useFakeTimers();
    env.mockProcess = {
      on: sinon.mock().atMost(2),
      kill: sinon.mock(),
      stdout: { on: sinon.mock() },
      stderr: { on: sinon.mock() },
    };
    env.childProcessStub = {
      spawn: sinon.mock().returns(env.mockProcess),
      exec: sinon.mock(),
    };
    env.fsStub = {
      readFileSync: sinon.mock(),
    };
    env.callbackMock = sinon.mock();
    env.runDependencyWithWebpack = proxyquireStrict('../', {
      child_process: env.childProcessStub,
      fs: env.fsStub,
    }).default;
    env.config = `${MODULES}/raw-loader/examples/webpack.config.js`;
  });

  afterEach(() => {
    env.clock.restore();
  });

  describe('when readme file does not contain command', () => {
    beforeEach(() => {
      env.fsStub.readFileSync.returns('foo'); // eslint-disable-line no-sync
      env.runPromise = env.runDependencyWithWebpack(env.config);
    });

    it('executes default webpack compile', () => {
      expect(env.childProcessStub.spawn).to.have.been.calledOnce;
      expect(env.childProcessStub.spawn).to.have.been.calledWith(WEBPACK_BIN);
      expect(env.childProcessStub.spawn.firstCall.args[1]).to.deep.equal(['--config', './webpack.config.js']);
      expect(env.childProcessStub.spawn.firstCall.args[2]).to.deep.equal({ cwd: `${MODULES}/raw-loader/examples` });
    });
  });

  describe('when readme file does contain command', () => {
    beforeEach(() => {
      env.fsStub.readFileSync.returns('```shell\ncat ./package.json\n```'); // eslint-disable-line no-sync
      env.runPromise = env.runDependencyWithWebpack(env.config);
    });

    it('executes default webpack compile', () => {
      expect(env.childProcessStub.spawn).to.have.been.calledOnce;
      expect(env.childProcessStub.spawn).to.have.been.calledWith('cat');
      expect(env.childProcessStub.spawn.firstCall.args[1]).to.deep.equal(['./package.json']);
      expect(env.childProcessStub.spawn.firstCall.args[2]).to.deep.equal({ cwd: `${MODULES}/raw-loader/examples` });
    });
  });

  describe('when executing', () => {
    beforeEach(() => {
      env.runPromise = env.runDependencyWithWebpack(env.config);
      [, env.processCloseHandler] = env.mockProcess.on.firstCall.args;
      [, env.processErrorHandler] = env.mockProcess.on.secondCall.args;
      [, env.errorHandler] = env.mockProcess.stderr.on.firstCall.args;
      [, env.successHandler] = env.mockProcess.stdout.on.firstCall.args;
    });

    describe('and error executing example', () => {
      beforeEach(() => {
        env.processErrorHandler('Bad command');
        env.clock.tick(110);
      });

      it('calls the callback with error message', () => env.runPromise.then(
        () => expect(true).to.equal(false),
        ({ err }) => expect(err).to.deep.equal([
          'Failed to run example',
          'Bad command',
        ]),
      ));
    });

    describe('and process is closed', () => {
      beforeEach(() => {
        env.processCloseHandler();
        env.clock.tick(110);
      });

      it('calls the callback with error message', () => env.runPromise.then(
        () => expect(true).to.equal(false),
        ({ err }) => expect(err).to.deep.equal([
          'Unable to detect successful compilation',
        ]),
      ));
    });

    describe('and example run causes an error', () => {
      beforeEach(() => {
        env.errorHandler('Process level error occurred');
        env.clock.tick(110);
      });

      it('calls the callback with error message', () => env.runPromise.then(
        () => expect(true).to.equal(false),
        ({ err }) => expect(err).to.deep.equal([
          'Errors output during compilation',
          'Process level error occurred',
        ]),
      ));

      it('exits the example run', () => {
        expect(env.mockProcess.kill).to.have.been.calledOnce;
      });
    });

    describe('and webpack outputs error message', () => {
      beforeEach(() => {
        env.successHandler('A webpack error has occurred');
        env.clock.tick(110);
      });

      it('calls the callback with error message', () => env.runPromise.then(
        () => expect(true).to.equal(false),
        ({ err }) => expect(err).to.deep.equal([
          'Errors detected in compilation',
          'A webpack error has occurred',
        ]),
      ));

      it('exits the example run', () => {
        expect(env.mockProcess.kill).to.have.been.calledOnce;
      });
    });

    describe('and webpack outputs meta data', () => {
      beforeEach(() => {
        env.successHandler('Useful information on build time and size');
        env.clock.tick(110);
      });

      it('does not resolve/reject the promise', () => {
        expect(env.callbackMock).not.to.have.been.called;
      });

      it('does not exit the example run', () => {
        expect(env.mockProcess.kill).not.to.have.been.called;
      });
    });

    describe('and webpack outputs a URL', () => {
      describe('which is external', () => {
        beforeEach(() => {
          env.successHandler('http://www.example.com');
          env.clock.tick(110);
        });

        it('does not open the URL', () => {
          expect(env.childProcessStub.exec).not.to.have.been.called;
        });

        it('does not resolve/reject the promise', (done) => {
          env.runPromise.then(
            () => expect(true).to.equal(false),
            () => expect(true).to.equal(false),
          );
          env.setTimeout(() => {
            expect(true).to.equal(true);
            done();
          }, 10);
        });

        it('does not exit the example run', () => {
          expect(env.mockProcess.kill).not.to.have.been.called;
        });
      });

      describe('which is internal', () => {
        beforeEach(() => {
          env.successHandler('http://localhost:8080');
          env.clock.tick(110);
        });

        it('does open the URL', () => {
          expect(env.childProcessStub.exec).to.have.been.calledOnce;
          expect(env.childProcessStub.exec).to.have.been.calledWith('phantomjs ./scripts/open-url.js \'http://localhost:8080\'');
        });

        it('does not resolve/reject the promise', (done) => {
          env.runPromise.then(
            () => expect(true).to.equal(false),
            () => expect(true).to.equal(false),
          );
          env.setTimeout(() => {
            expect(true).to.equal(true);
            done();
          }, 10);
        });

        it('does not exit the example run', () => {
          expect(env.mockProcess.kill).not.to.have.been.called;
        });
      });
    });

    describe('and webpack build is successful', () => {
      beforeEach(() => {
        env.successHandler('webpack: Compiled successfully');
        env.clock.tick(110);
      });

      it('calls the callback', () => env.runPromise.then(
        () => expect(true).to.equal(true),
        () => expect(true).to.equal(false),
      ));

      it('exits the example run', () => {
        expect(env.mockProcess.kill).to.have.been.calledOnce;
      });
    });

    describe('and build does not complete within 10 seconds', () => {
      beforeEach(() => {
        env.clock.tick(10001);
      });

      it('exits the example run', () => {
        expect(env.mockProcess.kill).to.have.been.calledOnce;
      });
    });
  });
});
