/* eslint-disable import/no-extraneous-dependencies */

import chai from 'chai';

import generateInstallObject from '../';

const { expect } = chai;

describe('generateInstallObject', () => {
  let env;
  beforeEach(() => {
    env = {};
  });

  describe('webpack', () => {
    it('has a webpack function', () => {
      expect(generateInstallObject.webpack).to.be.a('function');
    });

    describe('with empty input', () => {
      beforeEach(() => {
        env.installObject = generateInstallObject.webpack('');
      });

      it('does not create an install object', () => {
        expect(env.installObject).to.equal(null);
      });
    });

    describe('with remote repository', () => {
      beforeEach(() => {
        env.installObject = generateInstallObject.webpack(
          'webpack/webpack#master'
        );
      });

      it('creates an install object', () => {
        expect(env.installObject.toString()).to.equal('webpack/webpack#master');
      });
    });

    describe('with semver value', () => {
      beforeEach(() => {
        env.installObject = generateInstallObject.webpack('1.2.3');
      });

      it('creates an install object', () => {
        expect(env.installObject.toString()).to.equal('webpack@1.2.3');
      });
    });
  });

  describe('dependency', () => {
    it('has a dependency function', () => {
      expect(generateInstallObject.dependency).to.be.a('function');
    });

    describe('with empty input', () => {
      beforeEach(() => {
        env.installObject = generateInstallObject.dependency('');
      });

      it('does not create an install object', () => {
        expect(env.installObject).to.equal(null);
      });
    });

    describe('with remote repository', () => {
      beforeEach(() => {
        env.installObject = generateInstallObject.dependency(
          'webpack/raw-loader#master'
        );
      });

      it('creates an install object', () => {
        expect(env.installObject.toString()).to.equal(
          'webpack/raw-loader#master'
        );
      });
    });

    describe('with dependency name and semver value', () => {
      beforeEach(() => {
        env.installObject = generateInstallObject.dependency(
          'raw-loader@1.2.3'
        );
      });

      it('creates an install object', () => {
        expect(env.installObject.toString()).to.equal('raw-loader@1.2.3');
      });
    });
  });
});
