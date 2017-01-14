# Webpack Canary

Run loader examples against webpack versions to detect incompatibilities


## Usage

```
node index.js --webpack=<webpack_version> --loader=<loader_name>@<loader_version>
```

## Compatibility

Loaders must include an `examples` directory which contains an example setup with corresponding webpack config. This config is run with the installed webpack version to confirm compatibility.
