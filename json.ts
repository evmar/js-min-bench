export interface JSFileMetadata {
    version: string;
    origin: string;
}
export type JSMetadata = {[filename: string]: JSFileMetadata};

export interface Result {
    input: string;
    tool: string;
    time: number;
    size: number;
    gzSize: number;
}
