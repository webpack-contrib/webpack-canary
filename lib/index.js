import { argv } from 'yargs';
import getLogger from './logger';
import runner from './runner';
import { argvToOptions } from './utils';

const options = argvToOptions(argv);
const logger = getLogger(options.loglevel);

runner(argv.webpack, argv.dependency, options)
  .then(
    () => logger.success('All test cases passed'),
    (error) => {
      logger.error('Errors have occurred while running canary');
      logger.error(error instanceof Error ? (error.err || error.message) : error);
      process.exit(1);
    },
  );
