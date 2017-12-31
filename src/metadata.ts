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
}
export const js: { [name: string]: JSFileMetadata } = {
  angularjs: {
    path: "third_party/angularjs/angular.js",
    desc: "angularjs 1.6.6 minified bundle",
    version: "1.6.6"
  },
  "fake-10mb-angular": {
    transform: "angularjs 10x",
    path: "fake-10mb-angular.js",
    desc:
      "angularjs 1.6.6 minified, artificially repeated until input file >10mb",
    version: "1.6.6"
  },
  react: {
    path: "third_party/react/react.production.min.js",
    desc: "react production bundle (without minification)"
  },
  "react-dom": {
    path: "third_party/react/react-dom.production.min.js",
    desc: "react-dom production bundle (without minification)"
  },
  vue: {
    path: "third_party/vue/vue.js",
    desc: "vue.js 2.5.3",
    version: "2.5.3"
  }
};

export interface ToolMetadata {
  name: string;
  desc: string;
  command: string;
}
export const tools: ToolMetadata[] = [
  // Note: code expects 'raw' to be first.
  {
    name: "raw",
    desc: "baseline input file",
    command: "cp %%in%% %%out%%"
  },
  {
    name: "uglify",
    desc: "uglifyjs 3.2.2 with no options",
    command: "node_modules/.bin/uglifyjs %%in%% -o %%out%%"
  },
  {
    name: "uglify-compress-mangle",
    desc: "uglifyjs 3.2.2 with <tt>--compress</tt> and <tt>--mangle</tt> flags",
    command: "node_modules/.bin/uglifyjs %%in%% -o %%out%% --compress --mangle"
  },
  {
    name: "closure",
    desc: "Google Closure Compiler 20171203 with no flags",
    command:
      "java -jar node_modules/google-closure-compiler/compiler.jar --js_output_file=%%out%% %%in%%"
  },
  {
    name: "closure-advanced",
    desc: "Google Closure Compiler 20171203, advanced mode + externs",
    command:
      "java -jar node_modules/google-closure-compiler/compiler.jar -O advanced third_party/externs.js --js_output_file=%%out%% %%in%%"
  },
  {
    name: "j8t",
    desc: "<a href='https://github.com/evmar/j8t'>j8t</a> (work in progress)",
    command: "../j8t/target/release/js %%in%% > %%out%%"
  }
];
