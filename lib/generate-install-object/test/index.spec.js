import chai from 'chai';
import generateInstallObject from '../';

const expect = chai.expect;

describe('generateInstallObject', function() {
  let env;
  beforeEach(function() {
    env = {};
  });

  describe('webpack', function() {
    it('has a webpack function', function() {
      expect(generateInstallObject.webpack).to.be.a('function');
    });

    describe('with empty input', function() {
      beforeEach(function() {
        env.installObject = generateInstallObject.webpack('');
      });

      it('does not create an install object', function() {
        expect(env.installObject).to.equal(null);
      });
    });

    describe('with remote repository', function() {
      beforeEach(function() {
        env.installObject = generateInstallObject.webpack('webpack/webpack#master');
      });

      it('creates an install object', function() {
        expect(env.installObject.toString()).to.equal('webpack/webpack#master');
      });
    });

    describe('with semver value', function() {
      beforeEach(function() {
        env.installObject = generateInstallObject.webpack('1.2.3');
      });

      it('creates an install object', function() {
        expect(env.installObject.toString()).to.equal('webpack@1.2.3');
      });
    });
  });

  describe('dependency', function() {
    it('has a dependency function', function() {
      expect(generateInstallObject.dependency).to.be.a('function');
    });

    describe('with empty input', function() {
      beforeEach(function() {
        env.installObject = generateInstallObject.dependency('');
      });

      it('does not create an install object', function() {
        expect(env.installObject).to.equal(null);
      });
    });

    describe('with remote repository', function() {
      beforeEach(function() {
        env.installObject = generateInstallObject.dependency('webpack/raw-loader#master');
      });

      it('creates an install object', function() {
        expect(env.installObject.toString()).to.equal('webpack/raw-loader#master');
      });
    });

    describe('with dependency name and semver value', function() {
      beforeEach(function() {
        env.installObject = generateInstallObject.dependency('raw-loader@1.2.3');
      });

      it('creates an install object', function() {
        expect(env.installObject.toString()).to.equal('raw-loader@1.2.3');
      });
    });
  });
});
