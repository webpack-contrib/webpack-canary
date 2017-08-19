import Gauge from 'gauge';

export function parseExampleDirArgv(exampleDir) {
  return typeof exampleDir === 'string' ? [exampleDir] : exampleDir;
}

let gauge;
let logger;
let options;

export function progressStart(description, _options, _logger) {
  options = _options;
  logger = _logger;
  if (options.progress && !options.verbose) {
    gauge = new Gauge();
    progressUpdate(description, 0, 1);
  }
}

export function progressUpdate(description, current, total) {
  if (options.progress && !options.verbose) {
    gauge.show(`${description}`, current / total);
  } else {
    logger.info(description);
  }
}

export function progressStop() {
  if (options.progress && !options.verbose) {
    gauge.hide();
  }
}
