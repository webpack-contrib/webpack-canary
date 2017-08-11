/* eslint-disable import/no-extraneous-dependencies */

import chai from 'chai';
import createInstallObject from '../install-object';

const { expect } = chai;

describe('createInstallObject', () => {
  let env;
  beforeEach(() => {
    env = {};
  });

  describe('Install from registry', () => {
    describe('with version', () => {
      beforeEach(() => {
        env.installObject = createInstallObject('raw-loader@1.2.3');
      });

      it('has the correct string value', () => {
        expect(env.installObject.toString()).to.equal('raw-loader@1.2.3');
      });

      it('has the correct local name', () => {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('has version', () => {
        expect(env.installObject.hasVersion).to.equal(true);
      });

      it('does not have branch', () => {
        expect(env.installObject.hasBranch).to.equal(false);
      });
    });

    describe('without version', () => {
      beforeEach(() => {
        env.installObject = createInstallObject('raw-loader');
      });

      it('has the correct string value', () => {
        expect(env.installObject.toString()).to.equal('raw-loader');
      });

      it('has the correct local name', () => {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('has not have version', () => {
        expect(env.installObject.hasVersion).to.equal(false);
      });

      it('does not have branch', () => {
        expect(env.installObject.hasBranch).to.equal(false);
      });
    });
  });

  describe('Install from Github repository', () => {
    describe('with branch', () => {
      beforeEach(() => {
        env.installObject = createInstallObject('webpack/raw-loader#my-branch');
      });

      it('has the correct string value', () => {
        expect(env.installObject.toString()).to.equal('webpack/raw-loader#my-branch');
      });

      it('has the correct local name', () => {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', () => {
        expect(env.installObject.hasVersion).to.equal(false);
      });

      it('has branch', () => {
        expect(env.installObject.hasBranch).to.equal(true);
      });
    });

    describe('without branch', () => {
      beforeEach(() => {
        env.installObject = createInstallObject('webpack/raw-loader');
      });

      it('has the correct string value', () => {
        expect(env.installObject.toString()).to.equal('webpack/raw-loader');
      });

      it('has the correct local name', () => {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', () => {
        expect(env.installObject.hasVersion).to.equal(false);
      });

      it('does not have branch', () => {
        expect(env.installObject.hasBranch).to.equal(false);
      });
    });
  });

  describe('Install from remote repository URL', () => {
    describe('with branch', () => {
      beforeEach(() => {
        env.installObject = createInstallObject('https://bitbucket.org/webpack/raw-loader#my-branch');
      });

      it('has the correct string value', () => {
        expect(env.installObject.toString()).to.equal('https://bitbucket.org/webpack/raw-loader#my-branch');
      });

      it('has the correct local name', () => {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', () => {
        expect(env.installObject.hasVersion).to.equal(false);
      });

      it('has branch', () => {
        expect(env.installObject.hasBranch).to.equal(true);
      });
    });

    describe('without branch', () => {
      beforeEach(() => {
        env.installObject = createInstallObject('https://bitbucket.org/webpack/raw-loader');
      });

      it('has the correct string value', () => {
        expect(env.installObject.toString()).to.equal('https://bitbucket.org/webpack/raw-loader');
      });

      it('has the correct local name', () => {
        expect(env.installObject.toLocalName()).to.equal('raw-loader');
      });

      it('does not have version', () => {
        expect(env.installObject.hasVersion).to.equal(false);
      });

      it('does not have branch', () => {
        expect(env.installObject.hasBranch).to.equal(false);
      });
    });
  });

  describe('Install from remote tar file URL', () => {
    beforeEach(() => {
      env.installObject = createInstallObject('https://github.com/webpack/webpack-dev-server/archive/v2.2.0.tar.gz');
    });

    it('has the correct string value', () => {
      expect(env.installObject.toString()).to.equal('https://github.com/webpack/webpack-dev-server/archive/v2.2.0.tar.gz');
    });

    it('has the correct local name', () => {
      expect(env.installObject.toLocalName()).to.equal('webpack-dev-server');
    });

    it('has version', () => {
      expect(env.installObject.hasVersion).to.equal(false);
    });

    it('does not have branch', () => {
      expect(env.installObject.hasBranch).to.equal(false);
    });
  });
});
