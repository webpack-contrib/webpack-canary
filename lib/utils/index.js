import logger from '../logger';

export const fatalError = function(...args) {
  logger.error(...args);
  process.exit(1);
}
