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
$ git subtree -P examples/vanillajs -b todomvc-vanillajs
$ git checkout master
$ git subtree add -P third_party/todomvc/vanillajs todomvc-vanillajs --squash
```

They were then modified by hand to use a single bundle for their JS.
