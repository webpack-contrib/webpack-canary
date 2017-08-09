export const parseExampleDirArgv = function (exampleDir) {
  return typeof exampleDir === 'string' ? [exampleDir] : exampleDir;
};
