import { runCommand } from '../utils';

export default async function runDependencyTests(webpackSetup, dependencySetup, options) {
  // Link webpack
  await runCommand('npm link', webpackSetup.installLocation);
  await runCommand('npm link webpack', dependencySetup.installLocation);

  // Run tests
  return runCommand(options.test, dependencySetup.installLocation);
}
