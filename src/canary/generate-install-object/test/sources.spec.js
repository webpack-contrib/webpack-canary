/* eslint-disable import/no-extraneous-dependencies */

import chai from 'chai';

import sources from '../sources';

const { expect } = chai;

describe('Sources', () => {
  it('has a unknown source', () => {
    expect(sources.UNKNOWN).to.equal('unknown');
  });

  it('has a registry source', () => {
    expect(sources.REGISTRY).to.equal('registry');
  });

  it('has a repository source', () => {
    expect(sources.REPOSITORY).to.equal('repository');
  });
});
