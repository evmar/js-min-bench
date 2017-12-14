export interface Result {
    input: string;
    tool: string;
    time: number;
    size: number;
    gzSize: number;
    failed?: boolean;
}
