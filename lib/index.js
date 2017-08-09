import { argv } from 'yargs';

import getLogger from './logger';
import runner from './runner';
import { parseExampleDirArgv } from './utils';

const loglevel = argv.loglevel || 'info';
const logger = getLogger(loglevel);
const options = {
  loglevel: loglevel,
  packageManager: argv.packageManager,
  exampleDirs: parseExampleDirArgv(argv.exampleDir),
};

runner(argv.webpack, argv.dependency, options)
  .then(
    () => logger.success('All examples passed'),
    (error) => {
      logger.error('Errors have occurred running examples');
      logger.error(error instanceof Error ? error.err : error);
      process.exit(1);
    }
  );
