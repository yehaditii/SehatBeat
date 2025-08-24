import { Command } from "@commander-js/extra-typings";
export declare const convexImport: Command<[string], {
    table?: string | undefined;
    format?: "csv" | "jsonLines" | "jsonArray" | "zip" | undefined;
    replace?: boolean | undefined;
    append?: boolean | undefined;
    replaceAll?: boolean | undefined;
    yes?: boolean | undefined;
    component?: string | undefined;
} & {
    envFile?: string | undefined;
    url?: string | undefined;
    adminKey?: string | undefined;
    prod?: boolean | undefined;
    previewName?: string | undefined;
    deploymentName?: string | undefined;
}>;
//# sourceMappingURL=convexImport.d.ts.map