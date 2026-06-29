import type { DesignSystem, LintReport } from "./types";
export interface ParsedDoc {
    tokens: DesignSystem;
    raw: string;
    yamlStr: string;
    yamlLineOffset: number;
}
export declare function parseDesignMd(raw: string): ParsedDoc | null;
export declare function lintDesignMd(doc: ParsedDoc): LintReport;
