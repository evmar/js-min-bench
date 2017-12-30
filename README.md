# js-min-bench

This project attempts to create a repeatable benchmark comparing various
JavaScript minifiers and options.

[View the current results](https://evmar.github.io/js-min-bench/).

Note: This is not an officially supported Google product.

## Run it yourself

### Dependencies

You need:

- nodejs (to run the benchmarker and uglify)
- Java (to run the Closure compiler)
- yarn (to download more dependencies): `npm i -g yarn`
- [brotli](https://github.com/google/brotli) (a recent version)

### Setup

```sh
# Install dependencies:
$ yarn
# Build code:
$ yarn run build
```

### Run

```sh
# Run benchmark, write index.html:
$ yarn run bench
```
