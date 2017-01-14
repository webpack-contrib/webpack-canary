module.exports = function(name, version) {
  this.name = name;
  this.version = version;
  this.toString = function() {
    return name + '@' + version;
  }
};
