export interface JSFileMetadata {
    version: string;
    origin: string;
}
export const js: {[filename: string]: JSFileMetadata} = {
    "angular.js": {
        version: "1.6.6",
        origin: "https://ajax.googleapis.com/ajax/libs/angularjs/1.6.6/angular.min.js",
    },
    "react-dom.js": {
        version: "16.2.0",
        origin: "https://unpkg.com/react-dom@16/umd/react-dom.development.js",
    },
    "vue.js": {
        version: "2.5.3",
        origin: "https://cdn.jsdelivr.net/npm/vue",
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
];
