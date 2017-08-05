import chai from 'chai';
import createInstallObject from '../install-object';

var expect = chai.expect;

describe('createInstallObject', function() {
  let env;
  beforeEach(function() {
    env = {};
  });

  describe('Install from registry', function() {
    describe('with version', function() {
      beforeEach(function() {
        env.installObject = createInstallObject('raw-loader@1.2.3')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('raw-loader@1.2.3');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('has version', function() {
        expect(env.installObject.hasVersion()).to.equal(true);
      });

      it('does not have branch', function() {
        expect(env.installObject.hasBranch()).to.equal(false);
      });
    });

    describe('without version', function() {
      beforeEach(function() {
        env.installObject = createInstallObject('raw-loader')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('raw-loader');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('has not have version', function() {
        expect(env.installObject.hasVersion()).to.equal(false);
      });

      it('does not have branch', function() {
        expect(env.installObject.hasBranch()).to.equal(false);
      });
    });
  });

  describe('Install from Github repository', function() {
    describe('with branch', function() {
      beforeEach(function() {
        env.installObject = createInstallObject('webpack/raw-loader#my-branch')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('webpack/raw-loader#my-branch');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', function() {
        expect(env.installObject.hasVersion()).to.equal(false);
      });

      it('has branch', function() {
        expect(env.installObject.hasBranch()).to.equal(true);
      });
    });

    describe('without branch', function() {
      beforeEach(function() {
        env.installObject = createInstallObject('webpack/raw-loader')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('webpack/raw-loader');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', function() {
        expect(env.installObject.hasVersion()).to.equal(false);
      });

      it('does not have branch', function() {
        expect(env.installObject.hasBranch()).to.equal(false);
      });
    });
  });

  describe('Install from remote repository URL', function() {
    describe('with branch', function() {
      beforeEach(function() {
        env.installObject = createInstallObject('https://bitbucket.org/webpack/raw-loader#my-branch')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('https://bitbucket.org/webpack/raw-loader#my-branch');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', function() {
        expect(env.installObject.hasVersion()).to.equal(false);
      });

      it('has branch', function() {
        expect(env.installObject.hasBranch()).to.equal(true);
      });
    });

    describe('without branch', function() {
      beforeEach(function() {
        env.installObject = createInstallObject('https://bitbucket.org/webpack/raw-loader')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('https://bitbucket.org/webpack/raw-loader');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', function() {
        expect(env.installObject.hasVersion()).to.equal(false);
      });

      it('does not have branch', function() {
        expect(env.installObject.hasBranch()).to.equal(false);
      });
    });
  });

  describe('Install from remote tar file URL', function() {
    beforeEach(function() {
      env.installObject = createInstallObject('https://github.com/webpack/webpack-dev-server/archive/v2.2.0.tar.gz')
    });

    it('has the correct string value', function() {
      expect(env.installObject.toString()).to.equal('https://github.com/webpack/webpack-dev-server/archive/v2.2.0.tar.gz');
    });

    it('has the correct local name', function() {
      expect(env.installObject.toLocalName()).to.equal('webpack-dev-server');
    });

    it('has version', function() {
      expect(env.installObject.hasVersion()).to.equal(false);
    });

    it('does not have branch', function() {
      expect(env.installObject.hasBranch()).to.equal(false);
    });
  });
});
