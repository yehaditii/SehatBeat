import { Command } from "@commander-js/extra-typings";
export declare const DASHBOARD_HOST: string;
export declare const dashboard: Command<[], {
    open: boolean;
} & {
    envFile?: string | undefined;
    url?: string | undefined;
    adminKey?: string | undefined;
    prod?: boolean | undefined;
    previewName?: string | undefined;
    deploymentName?: string | undefined;
}>;
//# sourceMappingURL=dashboard.d.ts.map