import { Context } from "../../bundler/context.js";
export declare function checkAuthorization(ctx: Context, acceptOptIns: boolean): Promise<boolean>;
export declare function performLogin(ctx: Context, { overrideAuthUrl, overrideAuthClient, overrideAuthUsername, overrideAuthPassword, overrideAccessToken, loginFlow, open, acceptOptIns, dumpAccessToken, deviceName: deviceNameOverride, anonymousId, }?: {
    overrideAuthUrl?: string;
    overrideAuthClient?: string;
    overrideAuthUsername?: string;
    overrideAuthPassword?: string;
    overrideAccessToken?: string;
    loginFlow?: "auto" | "paste" | "poll";
    open?: boolean;
    acceptOptIns?: boolean;
    dumpAccessToken?: boolean;
    deviceName?: string;
    anonymousId?: string;
}): Promise<undefined>;
export declare function ensureLoggedIn(ctx: Context, options?: {
    message?: string;
    overrideAuthUrl?: string;
    overrideAuthClient?: string;
    overrideAuthUsername?: string;
    overrideAuthPassword?: string;
}): Promise<void>;
//# sourceMappingURL=login.d.ts.map