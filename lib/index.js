import { argv } from 'yargs';
import { TEST_PATH } from './consts';
import getLogger from './logger';
import runner from './runner';
import parseExampleDirArgv from './utils';

const loglevel = argv.loglevel || 'info';
const logger = getLogger(loglevel);
const options = {
  loglevel,
  packageManager: argv.packageManager,
  exampleDirs: parseExampleDirArgv(argv.exampleDir),
  test: argv.test,
  testPath: argv.testPath || TEST_PATH,
};

runner(argv.webpack, argv.dependency, options)
  .then(
    () => logger.success('All test cases passed'),
    (error) => {
      logger.error('Errors have occurred while running canary');
      logger.error(error instanceof Error ? (error.err || error.message) : error);
      process.exit(1);
    },
  );
