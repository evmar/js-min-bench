export interface JSFileMetadata {
    version: string;
    origin: string;
}
export type JSMetadata = {[filename: string]: JSFileMetadata};

export interface ToolMetadata {
    name: string;
    desc: string;
    command: string;
}
export type ToolsMetadata = ToolMetadata[];

export interface Result {
    input: string;
    tool: string;
    time: number;
    size: number;
    gzSize: number;
}
