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
    env.globMock = sinon.mock();
    env.retrieveStub = sinon.stub();
    env.retrieveStub.onFirstCall().returns({ entry: 'my-first-example' });
    env.retrieveStub.onSecondCall().returns({ entry: 'my-second-example' });
    env.retrieveStub.onThirdCall().returns({ entry: 'my-third-example' });
    env.callbackMock = sinon.mock();
    env.getDependencyExamples = proxyquireStrict('../', {
      'glob': env.globMock,
      './retrieve-example-config': env.retrieveStub
    }).default;
    env.getDependencyExamples(new InstallObject('webpack@2.3.4'), new InstallObject('raw-loader@1.2.3'), env.callbackMock);
    env.globCallback = env.globMock.firstCall.args[2];
  });

  it('searches for webpack configs', function() {
    expect(env.globMock).to.have.been.calledOnce;
    expect(env.globMock).to.have.been.calledWith('**/webpack.config.js');
  });

  it('searches within the dependency examples', function() {
    expect(env.globMock).to.have.been.calledOnce;
    expect(env.globMock.firstCall.args[1].cwd).to.equal('node_modules/raw-loader/examples');
  });

  describe('when error finding examples', function() {
    beforeEach(function() {
      env.globCallback(new Error('test'));
    });

    it('does not retrieve example config', function() {
      expect(env.retrieveStub).not.to.have.been.called;
    });

    it('calls the callback with error', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith(new Error());
    });
  });

  describe('when one example found', function() {
    beforeEach(function() {
      env.globCallback(null, ['webpack.config.js']);
    });

    it('retrieves the example config', function() {
      expect(env.retrieveStub).to.have.been.calledOnce;
      expect(env.retrieveStub).to.have.been.calledWith('raw-loader/examples/webpack.config.js');
    });

    it('calls the callback with array of one config', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock.firstCall.args[1]).to.deep.equal([
        {
          name: undefined,
          config: { entry: 'my-first-example' }
        }
      ]);
    });
  });

  describe('when multiple examples found', function() {
    beforeEach(function() {
      const examples = [
        'example-1/webpack.config.js',
        'example-2/webpack.config.js',
        'example-3/webpack.config.js'
      ];
      env.globCallback(null, examples);
    });

    it('retrieves the example config', function() {
      expect(env.retrieveStub).to.have.been.calledThrice;
      expect(env.retrieveStub).to.have.been.calledWith('raw-loader/examples/example-1/webpack.config.js');
      expect(env.retrieveStub).to.have.been.calledWith('raw-loader/examples/example-2/webpack.config.js');
      expect(env.retrieveStub).to.have.been.calledWith('raw-loader/examples/example-3/webpack.config.js');
    });

    it('calls the callback with array of one config', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock.firstCall.args[1]).to.deep.equal([
        {
          name: 'example-1',
          config: { entry: 'my-first-example' }
        },
        {
          name: 'example-2',
          config: { entry: 'my-second-example' }
        },
        {
          name: 'example-3',
          config: { entry: 'my-third-example' }
        }
      ]);
    });
  });

  describe('when no examples found', function() {
    beforeEach(function() {
      env.globCallback(null, []);
    });

    it('does not retrieve example config', function() {
      expect(env.retrieveStub).not.to.have.been.called;
    });

    it('calls the callback with empty array', function() {
      expect(env.callbackMock).to.have.been.calledOnce;
      expect(env.callbackMock).to.have.been.calledWith(null, []);
    });
  });
});
