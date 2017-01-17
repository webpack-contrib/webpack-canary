# Webpack Canary

Run dependency examples against webpack versions to detect incompatibilities.

## Usage

### Squawk

Most usage of the canary is to check multiple versions of webpack against a set of dependencies and squawk if there are any failures. The `squawk` task is a runner to do; webpack versions are stored in `webpack-versions.json` and dependency versions are stored in `dependency-versions.json`.

Use `npm run squawk` to run all dependencies in the JSON file against all versions of webpack in the JSON file, and generate a report.

### CLI Interface

To run a one off specific dependency version against specific version of webpack, use the canary CLI interface

```
node index.js --webpack=<webpack_reference> --dependency=<dependency_reference>
```

 - `--webpack` can be a version or path to remote repository
 - `--dependency` can be a dependency name (with or without version) or path to remote repository

#### Example

```
# Published versions in registry
node index.js --webpack=2.2 --dependency=raw-loader

# Development versions in remote repositories
node index.js --webpack=webpack/webpack#master --dependency=https://github.com/alistairjcbrown/raw-loader/
```

## Compatibility

A dependency must include an `examples` directory which contains an example setup with corresponding webpack config. This config is run with the installed webpack version to confirm compatibility.

## To do

 - [x] ES6
 - [x] Tests
 - [x] Flag to control log level verbosity
 - [x] Programatic interface (split CLI flags from app)
 - [x] Script to run for multiple dependencies
 - [x] Linting
 - [x] Show summary successes / failure after running squawk
 - [x] Change logLevel to loglevel
 - [x] Investigate why failing on webpack 1 causes failure in webpack 2 (cache?)
 - [x] Update summary to use progress bar and collapse table if all success
 - [x] Update readme
 - [ ] Output recreation command when squawk failure
 - [ ] Split webpack 1 configs and 2 configs in examples
 - [ ] Add ability to run more than just loaders / plugins
