import { Context } from "../../bundler/context.js";
type SchemaState = {
    state: "pending";
} | {
    state: "validated";
} | {
    state: "active";
} | {
    state: "overwritten";
} | {
    state: "failed";
    error: string;
    tableName?: string;
};
export declare function pushSchema(ctx: Context, origin: string, adminKey: string, schemaDir: string, dryRun: boolean, deploymentName: string | null): Promise<{
    schemaId?: string;
    schemaState?: SchemaState;
}>;
export {};
//# sourceMappingURL=indexes.d.ts.map