export interface JSFileMetadata {
    path: string;
    version: string;
    origin: string;
}
export const js: {[name: string]: JSFileMetadata} = {
    "angularjs": {
        path: "third_party/angularjs/angular.js",
        version: "1.6.6",
        origin: "https://ajax.googleapis.com/ajax/libs/angularjs/1.6.6/angular.min.js",
    },
    "react-dom": {
        path: "third_party/react/react-dom.js",
        version: "16.2.0",
        origin: "https://unpkg.com/react-dom@16/umd/react-dom.development.js",
    },
    "vue": {
        path: "third_party/vue/vue.js",
        version: "2.5.3",
        origin: "https://cdn.jsdelivr.net/npm/vue",
    },
    "fake-10mb-angular": {
        path: "third_party/angularjs/fake-10mb-angular.js",
        version: "1.6.6",
        origin: "https://ajax.googleapis.com/ajax/libs/angularjs/1.6.6/angular.min.js",
    },
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
    desc: "uglifyjs 3.2.2 with --compress and --mangle flags",
    command: "node_modules/.bin/uglifyjs %%in%% -o %%out%% --compress --mangle"
},
    {
    name: "closure",
    desc: "Google Closure Compiler 20171203 with no flags",
    command: "java -jar node_modules/google-closure-compiler/compiler.jar --js_output_file=%%out%% %%in%%",
},
    {
    name: "closure-advanced",
    desc: "Google Closure Compiler 20171203, advanced mode + externs",
    command: "java -jar node_modules/google-closure-compiler/compiler.jar -O advanced third_party/externs.js --js_output_file=%%out%% %%in%%",
},
];
