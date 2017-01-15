import chai from 'chai';
import sources from '../sources';

var expect = chai.expect;

describe('Sources', function() {
  it('has a unknown source', function() {
    expect(sources.unknown).to.equal('unknown');
  });

  it('has a registry source', function() {
    expect(sources.registry).to.equal('registry');
  });

  it('has a repository source', function() {
    expect(sources.repository).to.equal('repository');
  });
});
