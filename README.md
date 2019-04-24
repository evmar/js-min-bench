# js-min-bench

This project attempts to create a repeatable benchmark comparing various
JavaScript minifiers and options.

[View the current results](https://evmar.github.io/js-min-bench/).

Note: This is not an officially supported Google product.

## Methodogy

I collected sample programs and archived them in this repo. The test runner then
runs specific minifier versions against those sample programs and reports their
results. Because the inputs and minifiers are pinned to specific versions, the
reported output sizes should be repeatable. The timing numbers will depend on
the machine the tools are run on, but their relative values are likely more or
less representative of any machine.

### Testing

A trivial "minifier" that took an input program and produced a 0 byte output
file would get the best score on this benchmark. The only way to verify that a
minifier doesn't (accidentally) cheat in this manner is by verifying that the
resulting application still works after minification. For this reason, the input
programs here should be _applications_, not frameworks or libraries, and for
each application we need end-to-end tests. The benchmarker then can run the test
suite for each output.

Unfortunately, I realized the need for testing too late, so this idea is
currently only implemented for the `todomvc` results here.

## Run it yourself

### Dependencies

You need:

* nodejs (to run the benchmarker and uglify)
* yarn (to download more dependencies): `npm i -g yarn`
* [brotli](https://github.com/google/brotli) (a recent version)

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
