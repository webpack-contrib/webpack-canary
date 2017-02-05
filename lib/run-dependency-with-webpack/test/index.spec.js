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
    env.clock = sinon.useFakeTimers();
    env.childProcessStub = {
      exec: sinon.mock()
    };
    env.fsStub = {
      readFileSync: sinon.mock()
    };
    env.callbackMock = sinon.mock();
    env.runDependencyWithWebpack = proxyquireStrict('../', {
      'child_process': env.childProcessStub,
      'fs': env.fsStub
    }).default;
    env.config = 'node_modules/raw-loader/examples/webpack.config.js';
  });

  afterEach(function() {
    env.clock.restore();
  });

  describe('when readme file does not contain command', function() {
    beforeEach(function() {
      env.fsStub.readFileSync.returns('foo'); // eslint-disable-line no-sync
      env.runDependencyWithWebpack(env.config, env.callbackMock);
    });

    it('executes default webpack compile', function() {
      expect(env.childProcessStub.exec).to.have.been.calledOnce;
      expect(env.childProcessStub.exec).to.have.been.calledWith('./node_modules/webpack/bin/webpack.js --config ./webpack.config.js');
      expect(env.childProcessStub.exec.firstCall.args[1]).to.deep.equal({ cwd: 'node_modules/raw-loader/examples', timeout: 5000 });
    });
  });

  describe('when readme file does contain command', function() {
    beforeEach(function() {
      env.fsStub.readFileSync.returns('```shell\ncat ./package.json;\n```'); // eslint-disable-line no-sync
      env.runDependencyWithWebpack(env.config, env.callbackMock);
    });

    it('executes default webpack compile', function() {
      expect(env.childProcessStub.exec).to.have.been.calledOnce;
      expect(env.childProcessStub.exec).to.have.been.calledWith('cat ./package.json;');
      expect(env.childProcessStub.exec.firstCall.args[1]).to.deep.equal({ cwd: 'node_modules/raw-loader/examples', timeout: 5000 });
    });
  });

  describe('when executing', function() {
    beforeEach(function() {
      env.runDependencyWithWebpack(env.config, env.callbackMock);
      env.childProcessCallback = env.childProcessStub.exec.firstCall.args[2];
    });

    describe('and error executing webpack', function() {
      beforeEach(function() {
        env.childProcessCallback(new Error('test'), '', '');
        env.clock.tick(510);
      });

      it('calls the callback with error message', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWith([
          'Error running webpack',
          new Error(),
          ''
        ]);
      });
    });

    describe('and execution times out with valid webpack build', function() {
      beforeEach(function() {
        env.childProcessCallback(new Error('timed out'), 'webpack: Compiled successfully', '');
        env.clock.tick(510);
      });

      it('calls the callback', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWithExactly();
      });
    });

    describe('and webpack build causes error', function() {
      beforeEach(function() {
        env.childProcessCallback(null, '', 'error output');
        env.clock.tick(510);
      });

      it('calls the callback with error message', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWith([
          'Errors output during compilation',
          'error output'
        ]);
      });
    });

    describe('and webpack outputs error message', function() {
      beforeEach(function() {
        env.childProcessCallback(null, 'An error has occurred', '');
        env.clock.tick(510);
      });

      it('calls the callback with error message', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWith([
          'Errors detected in compilation',
          'An error has occurred'
        ]);
      });
    });

    describe('and webpack build is successful', function() {
      beforeEach(function() {
        env.childProcessCallback(null, '', '');
        env.clock.tick(510);
      });

      it('calls the callback', function() {
        expect(env.callbackMock).to.have.been.calledOnce;
        expect(env.callbackMock).to.have.been.calledWithExactly();
      });
    });
  });
});
