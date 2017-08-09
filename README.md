[![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![test][test]][test-url]
[![coverage][cover]][cover-url]
[![chat][chat]][chat-url]

<div align="center">
  <!-- replace with accurate logo e.g from https://worldvectorlogo.com/ -->
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200" vspace="" hspace="25"
      src="https://cdn.rawgit.com/webpack/media/e7485eb2/logo/icon.svg">
  </a>
  <h1>Webpack Canary</h1>
  <p>Run dependency examples against webpack versions to detect incompatibilities.<p>
</div>

<h2 align="center">Usage</h2>

### Squawk

Expected usage of the canary is to check multiple versions of webpack against a set of dependencies and squawk if there are any failures. The `squawk` task is a runner to just that. Webpack and dependency versions are stored in `webpack-to-dependency-versions.json`.

Use `npm run squawk` to run all dependencies against all versions of webpack, and generate a report with successes and failures. This command does not take any flags.

### CLI Interface

To run a specific dependency version against a specific version of webpack, use the canary CLI interface

```
node index.js --webpack=<webpack_reference> --dependency=<dependency_reference>
```

 - `--webpack` can be a version or path to remote repository
 - `--dependency` can be a dependency name (with or without version) or path to remote repository

#### Example

```
# Published versions in registry
node index.js --webpack=2.2 --dependency=raw-loader

# Development versions in remote repositories
node index.js --webpack=webpack/webpack#master --dependency=https://github.com/alistairjcbrown/raw-loader/
```

<h2 align="center">Compatibility</h2>

A dependency must include an `example` or `examples` directory which contains an example setup with corresponding webpack config (ie. must have a `webpack.config.js` file). This config is run with the installed webpack version to confirm compatibility. If a custom command needs to be run, there should be an accompanying `README.md` file which contains the command in a codeblock.

### Readme file

The readme can also contain any other content tha twould usualy be in the file. If there are multiple code blocks, only the first one will be used.

    # A title

    Some content

    ```npm run example```

    Some other content

    ```command that will be ignored```

The command can also contain some placeholders. Right now, only `<insert local ip>` is supported (will be replaced with `127.0.0.1`).

<h2 align="center">Maintainers</h2>

<table>
  <tbody>
    <tr>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/635903?v=3&s=150">
        </br>
        <a href="https://github.com/alistairjcbrown">Alistair Brown</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/166921?v=3&s=150">
        </br>
        <a href="https://github.com/bebraw">Juho Vepsäläinen</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars2.githubusercontent.com/u/8420490?v=3&s=150">
        </br>
        <a href="https://github.com/d3viant0ne">Joshua Wiens</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/533616?v=3&s=150">
        </br>
        <a href="https://github.com/SpaceK33z">Kees Kluskens</a>
      </td>
      <td align="center">
        <img width="150" height="150"
        src="https://avatars3.githubusercontent.com/u/3408176?v=3&s=150">
        </br>
        <a href="https://github.com/TheLarkInn">Sean Larkin</a>
      </td>
    </tr>
  <tbody>
</table>


[npm]: https://img.shields.io/npm/v/webpack-canary.svg
[npm-url]: https://npmjs.com/package/webpack-canary

[deps]: https://david-dm.org/webpack-contrib/webpack-canary.svg
[deps-url]: https://david-dm.org/webpack-contrib/webpack-canary

[chat]: https://img.shields.io/badge/gitter-webpack%2Fwebpack-brightgreen.svg
[chat-url]: https://gitter.im/webpack/webpack

[test]: http://img.shields.io/travis/webpack-contrib/webpack-canary.svg
[test-url]: https://travis-ci.org/webpack-contrib/webpack-canary

[cover]: https://codecov.io/gh/webpack-contrib/webpack-canary/branch/master/graph/badge.svg
[cover-url]: https://codecov.io/gh/webpack-contrib/webpack-canary
