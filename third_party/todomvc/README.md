# todomvc

[todomvc](https://github.com/tastejs/todomvc) is the same todo app implemented
in a bunch of different frameworks. js-min-bench runs these apps to verify
whehter a given minified JS bundle breaks the app or not.

## Relation to upstream

This directory contains git-subtree imports of the todomvc apps.

They were imported via e.g.

```sh
$ git remote add todomvc https://github.com/tastejs/todomvc.git
$ git checkout -b todomvc todomvc/master
$ git subtree split -P examples/vanillajs -b todomvc-vanillajs
$ git checkout master
$ git subtree add -P third_party/todomvc/vanillajs todomvc-vanillajs --squash
```

They were then modified by hand to use a single bundle for their JS, as
described in the following sections.

### vanillajs

The scripts were concatenated with 'cat' and the HTML file changed to use it.

A command like this extracts all of the source scripts in order:

```sh
$ cat $(sed -ne 's/.*script src="\(.*\)".*/\1/p' index.html) > bundle.js
```

### react

The jsx was manually transpiled to js via

```sh
$ path/to/tsc --jsx react -t es2017 --allowjs *.jsx
```

then the scripts were concatenated as in vanillajs.
