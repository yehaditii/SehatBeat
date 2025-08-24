import { Context } from "../../bundler/context.js";
export declare function dataInDeployment(ctx: Context, options: {
    deploymentUrl: string;
    adminKey: string;
    deploymentNotice: string;
    tableName?: string;
    limit: number;
    order: "asc" | "desc";
    component?: string;
}): Promise<void>;
//# sourceMappingURL=data.d.ts.map