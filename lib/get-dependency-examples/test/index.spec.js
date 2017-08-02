import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import InstallObject from '../../generate-install-object/install-object';

chai.use(sinonChai);
const expect = chai.expect;
const proxyquireStrict = proxyquire.noCallThru();

describe('getDependencyExamples', function() {
  let env;
  beforeEach(function() {
    env = {};
    env.globMock = sinon.mock().atMost(2);
    env.callbackMock = sinon.mock();
    env.getDependencyExamples = proxyquireStrict('../', {
      'glob': env.globMock
    }).default;
    env.examplesPromise = env.getDependencyExamples(new InstallObject('webpack@2.3.4'), new InstallObject('raw-loader@1.2.3'), env.callbackMock);
    env.examplesGlobCallback = env.globMock.firstCall.args[2];
    env.exampleGlobCallback = env.globMock.secondCall.args[2];
  });

  it('searches for webpack configs', function() {
    expect(env.globMock).to.have.been.calledTwice;
    expect(env.globMock).to.have.been.calledWith('**/webpack.config.js');
  });

  it('searches within the dependency examples', function() {
    expect(env.globMock.firstCall.args[1].cwd).to.equal('node_modules/raw-loader/examples');
    expect(env.globMock.secondCall.args[1].cwd).to.equal('node_modules/raw-loader/example');
  });

  describe('when error finding examples', function() {
    beforeEach(function(done) {
      env.examplesGlobCallback(new Error('test'));

      env.examplesPromise.then(
        () => expect(true).to.equal(false),
        (e) => {
          expect(e.toString()).to.equal('Error: test');
          setTimeout(done, 10);
        }
      );
    });

    it('calls the callback with error', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock.firstCall.args[0].toString()).to.equal('Error: test');

      return env.examplesPromise.then(
        () => expect(true).to.equal(false),
        (e) => expect(e.toString()).to.equal('Error: test')
      );
    });
  });

  describe('when one example found', function() {
    beforeEach(function(done) {
      env.examplesGlobCallback(null, ['webpack.config.js']);
      env.exampleGlobCallback(null, []);
      setTimeout(done, 10)
    });

    it('calls the callback with array of one config', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock.firstCall.args[1]).to.deep.equal([
        {
          name: undefined,
          config: 'node_modules/raw-loader/examples/webpack.config.js'
        }
      ]);

      return env.examplesPromise.then(
        (data) => expect(data).to.deep.equal([{
          name: undefined,
          config: 'node_modules/raw-loader/examples/webpack.config.js'
        }]),
        () => expect(true).to.equal(false)
      );
    });
  });

  describe('when multiple examples found', function() {
    beforeEach(function(done) {
      const examples = [
        'example-1/webpack.config.js',
        'example-2/webpack.config.js'
      ];
      env.examplesGlobCallback(null, examples);
      env.exampleGlobCallback(null, ['webpack.config.js']);
      setTimeout(done, 10)
    });

    it('calls the callback with array of one config', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock.firstCall.args[1]).to.deep.equal([
        {
          name: 'example-1',
          config: 'node_modules/raw-loader/examples/example-1/webpack.config.js'
        },
        {
          name: 'example-2',
          config: 'node_modules/raw-loader/examples/example-2/webpack.config.js'
        },
        {
          name: undefined,
          config: 'node_modules/raw-loader/example/webpack.config.js'
        }
      ]);
    });
  });

  describe('when no examples found', function() {
    beforeEach(function(done) {
      env.examplesGlobCallback(null, []);
      env.exampleGlobCallback(null, []);
      setTimeout(done, 10)
    });

    it('calls the callback with empty array', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith(null, []);
    });
  });
});
