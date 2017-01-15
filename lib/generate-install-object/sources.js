import _ from 'underscore';

const sourceList = ['registry', 'respository'];

const sources = _.reduce(sourceList, function(sourceMapping, source) {
  sourceMapping[source] = source;
  return sourceMapping;
}, {});

export default sources;
