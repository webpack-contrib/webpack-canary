export const parseExampleDirArgv = function (exampleDir) {
  if (typeof exampleDir === 'string') {
    return [exampleDir];
  }

  return exampleDir;
};
