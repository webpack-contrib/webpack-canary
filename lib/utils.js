import Gauge from 'gauge';

export function parseExampleDirArgv(exampleDir) {
  return typeof exampleDir === 'string' ? [exampleDir] : exampleDir;
}

let gauge;
let options;

export function progressStart(description, _options) {
  options = _options;
  if (options.progress && !options.verbose) {
    gauge = new Gauge();
    gauge.show(description, 0);
  }
}

export function progressUpdate(description, current, total) {
  if (options.progress && !options.verbose) {
    gauge.show(`${description}`, current / total);
  }
}

export function progressStop() {
  if (options.progress && !options.verbose) {
    gauge.hide();
  }
}
