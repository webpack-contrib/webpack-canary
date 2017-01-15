import _ from 'underscore';

const sourceList = ['unknown', 'registry', 'repository'];

const sources = _.reduce(sourceList, function(sourceMapping, source) {
  sourceMapping[source] = source;
  return sourceMapping;
}, {});

export default sources;
