#!/usr/bin/env node

import { argv } from 'yargs';
import chalk from 'chalk';

import getLogger from './logger';
import runner from './runner';
import { argvToOptions, progressStop } from './utils';

const options = argvToOptions(argv);
const logger = getLogger(options.loglevel);

const command = `node ./index.js --webpack=${argv.webpack} --dependency=${
  argv.dependency
}${argv.packageManager ? ` --package-manager=${argv.packageManager}` : null}`;
logger.debug(`To re-run: ${chalk.bold(command)}`);

runner(argv.webpack, argv.dependency, options).then(
  () => logger.success('All test cases passed'),
  (error) => {
    progressStop();
    logger.error('Errors have occurred running examples');
    logger.error(error instanceof Error ? error.err || error.message : error);
    process.exit(1);
  }
);
