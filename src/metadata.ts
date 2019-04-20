/**
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface JSFileMetadata {
  path: string;
  desc: string;
  version?: string;
  transform?: string;
  test?: {
    webroot: string;
    test: string;
  };
}
export const js: {[name: string]: JSFileMetadata} = {
  angularjs: {
    path: 'third_party/angularjs/angular.js',
    desc: 'angularjs 1.6.6 minified bundle',
    version: '1.6.6'
  },
  'fake-10mb-angular': {
    transform: 'angularjs 10x',
    path: 'fake-10mb-angular.js',
    desc:
      'angularjs 1.6.6 minified, artificially repeated until input file >10mb',
    version: '1.6.6'
  },
  'angular-hello': {
    path: 'third_party/angular/main.js',
    desc:
      'angular5 + cli hello world ' +
      '(note: <a href="https://github.com/angular/closure-demo">closure-optimized build</a> is much smaller)'
  },
  react: {
    path: 'third_party/react/react.production.min.js',
    desc: 'react production bundle'
  },
  'react-dom': {
    path: 'third_party/react/react-dom.production.min.js',
    desc: 'react-dom production bundle'
  },
  vue: {
    path: 'third_party/vue/vue.js',
    desc: 'vue.js 2.5.3',
    version: '2.5.3'
  },
  'todomvc-vanillajs': {
    path: 'third_party/todomvc/vanillajs/bundle.js',
    desc: 'todomvc vanillajs',
    test: {
      webroot: 'third_party/todomvc/vanillajs',
      test: 'build/third_party/todomvc/test.js'
    }
  }
};

export interface ToolMetadata {
  id: string;
  name: string;
  variants: Array<{id?: string; desc?: string; command: string}>;
}
export const tools: ToolMetadata[] = [
  // Note: code expects 'raw' to be first.
  {
    id: 'raw',
    name: 'baseline input file',
    variants: [
      {
        command: 'cp %%in%% %%out%%'
      }
    ]
  },
  {
    id: 'uglify',
    name: 'uglifyjs 3.2.2',
    variants: [
      {command: 'node_modules/.bin/uglifyjs %%in%% -o %%out%%'},
      {
        id: 'compress-mangle',
        desc: '<tt>--compress</tt> and <tt>--mangle</tt> flags',
        command:
          'node_modules/.bin/uglifyjs %%in%% -o %%out%% --compress --mangle'
      }
    ]
  },
  {
    id: 'closure',
    name:
      "<a href='https://developers.google.com/closure/compiler/'>Google Closure Compiler</a> 20171203",
    variants: [
      {
        command:
          'java -jar node_modules/google-closure-compiler/compiler.jar --jscomp_off=checkVars --warning_level=QUIET --js_output_file=%%out%% %%in%%'
      },
      {
        id: 'advanced',
        desc: 'advanced mode + externs',
        command:
          'java -jar node_modules/google-closure-compiler/compiler.jar --jscomp_off=checkVars --warning_level=QUIET -O advanced third_party/externs.js --js_output_file=%%out%% %%in%%'
      }
    ]
  },
  {
    id: 'j8t',
    name: "<a href='https://github.com/evmar/j8t'>j8t</a> (work in progress)",
    variants: [
      {
        command: '../j8t/target/release/j8t %%in%% > %%out%%'
      }
    ]
  }
];
