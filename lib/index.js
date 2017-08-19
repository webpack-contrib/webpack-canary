import { argv } from 'yargs';
import chalk from 'chalk';
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

const command = `node ./index.js --webpack=${argv.webpack} --dependency=${argv.dependency}${argv.packageManager ? ` --package-manager=${argv.packageManager}` : null}`;
logger.debug(`To re-run: ${chalk.bold(command)}`);

runner(argv.webpack, argv.dependency, options)
  .then(
    () => logger.success('All examples passed'),
    (error) => {
      logger.error('Errors have occurred running examples');
      logger.error(error instanceof Error ? (error.err || error.message) : error);
      process.exit(1);
    },
  );
