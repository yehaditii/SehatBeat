import { OneoffCtx } from "../../bundler/context.js";
import { LogMode } from "./logs.js";
import { PushOptions } from "./push.js";
export declare function devAgainstDeployment(ctx: OneoffCtx, credentials: {
    url: string;
    adminKey: string;
    deploymentName: string | null;
}, devOptions: {
    verbose: boolean;
    typecheck: "enable" | "try" | "disable";
    typecheckComponents: boolean;
    codegen: boolean;
    once: boolean;
    untilSuccess: boolean;
    run?: {
        kind: "function";
        name: string;
        component?: string;
    } | {
        kind: "shell";
        command: string;
    };
    tailLogs: LogMode;
    traceEvents: boolean;
    debugBundlePath?: string;
    debugNodeApis: boolean;
    liveComponentSources: boolean;
}): Promise<void>;
export declare function watchAndPush(outerCtx: OneoffCtx, options: PushOptions, cmdOptions: {
    run?: {
        kind: "function";
        name: string;
        component?: string;
    } | {
        kind: "shell";
        command: string;
    };
    once: boolean;
    untilSuccess: boolean;
    traceEvents: boolean;
}): Promise<void>;
export declare function nextBackoff(prevFailures: number): number;
//# sourceMappingURL=dev.d.ts.map