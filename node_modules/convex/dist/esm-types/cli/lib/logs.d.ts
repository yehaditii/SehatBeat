import { Context } from "../../bundler/context.js";
export type LogMode = "always" | "pause-on-deploy" | "disable";
export declare class LogManager {
    private mode;
    private paused;
    constructor(mode: LogMode);
    waitForUnpaused(): Promise<void>;
    beginDeploy(): void;
    endDeploy(): void;
}
type LogDestination = "stdout" | "stderr";
export declare function logsForDeployment(ctx: Context, credentials: {
    url: string;
    adminKey: string;
}, options: {
    success: boolean;
    history: number;
    deploymentNotice: string;
}): Promise<void>;
export declare function watchLogs(ctx: Context, url: string, adminKey: string, dest: LogDestination, options?: {
    success: boolean;
    history?: number | boolean;
    logManager?: LogManager;
}): Promise<void>;
export {};
//# sourceMappingURL=logs.d.ts.map