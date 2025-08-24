import { Command } from "@commander-js/extra-typings";
export declare const login: Command<[], {
    deviceName?: string | undefined;
    force?: true | undefined;
    open: boolean;
    loginFlow: "paste" | "auto" | "poll";
    linkDeployments?: true | undefined;
    overrideAuthUrl?: string | undefined;
    overrideAuthClient?: string | undefined;
    overrideAuthUsername?: string | undefined;
    overrideAuthPassword?: string | undefined;
    overrideAccessToken?: string | undefined;
    acceptOptIns?: true | undefined;
    dumpAccessToken?: true | undefined;
    checkLogin?: true | undefined;
}>;
//# sourceMappingURL=login.d.ts.map