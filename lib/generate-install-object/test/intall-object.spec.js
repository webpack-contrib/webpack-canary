import chai from 'chai';
import InstallObject from '../install-object';

var expect = chai.expect;

describe('InstallObject', function() {
  let env;
  beforeEach(function() {
    env = {};
  });

  describe('Install from registry', function() {
    describe('with version', function() {
      beforeEach(function() {
        env.installObject = new InstallObject('raw-loader@1.2.3')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('raw-loader@1.2.3');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('raw-loader@1.2.3');
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
        env.installObject = new InstallObject('raw-loader')
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
        env.installObject = new InstallObject('webpack/raw-loader#my-branch')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('webpack/raw-loader#my-branch');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('webpack/raw-loader');
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
        env.installObject = new InstallObject('webpack/raw-loader')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('webpack/raw-loader');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('webpack/raw-loader');
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
        env.installObject = new InstallObject('https://bitbucket.org/webpack/raw-loader#my-branch')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('https://bitbucket.org/webpack/raw-loader#my-branch');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('https://bitbucket.org/webpack/raw-loader');
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
        env.installObject = new InstallObject('https://bitbucket.org/webpack/raw-loader')
      });

      it('has the correct string value', function() {
        expect(env.installObject.toString()).to.equal('https://bitbucket.org/webpack/raw-loader');
      });

      it('has the correct local name', function() {
        expect(env.installObject.toLocalName()).to.equal('https://bitbucket.org/webpack/raw-loader');
      });

      it('does not have version', function() {
        expect(env.installObject.hasVersion()).to.equal(false);
      });

      it('does not have branch', function() {
        expect(env.installObject.hasBranch()).to.equal(false);
      });
    });
  });
});
