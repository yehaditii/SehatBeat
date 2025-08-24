import { Filesystem } from "./fs.js";
export type ErrorType = "invalid filesystem data" | {
    "invalid filesystem or db data": {
        tableName: string;
        componentPath?: string;
    } | null;
} | "invalid filesystem or env vars" | "transient" | "fatal";
export type BigBrainAuth = {
    header: string;
} & ({
    kind: "projectKey";
    projectKey: string;
} | {
    kind: "previewDeployKey";
    previewDeployKey: string;
} | {
    kind: "accessToken";
    accessToken: string;
});
export interface Context {
    fs: Filesystem;
    deprecationMessagePrinted: boolean;
    crash(args: {
        exitCode: number;
        errorType: ErrorType;
        errForSentry?: any;
        printedMessage: string | null;
    }): Promise<never>;
    registerCleanup(fn: (exitCode: number, err?: any) => Promise<void>): string;
    removeCleanup(handle: string): (exitCode: number, err?: any) => Promise<void> | null;
    bigBrainAuth(): BigBrainAuth | null;
    /**
     * Prefer using `updateBigBrainAuthAfterLogin` in `deploymentSelection.ts` instead
     */
    _updateBigBrainAuth(auth: BigBrainAuth | null): void;
}
export type OneoffCtx = Context & {
    flushAndExit: (exitCode: number, err?: any) => Promise<never>;
};
export declare const oneoffContext: (args: {
    url?: string;
    adminKey?: string;
    envFile?: string;
}) => Promise<OneoffCtx>;
//# sourceMappingURL=context.d.ts.map