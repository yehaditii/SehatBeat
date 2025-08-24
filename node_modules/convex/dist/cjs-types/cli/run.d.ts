import { Command } from "@commander-js/extra-typings";
export declare const run: Command<[string, string | undefined], {
    watch?: boolean | undefined;
    push?: boolean | undefined;
    identity?: string | undefined;
    typecheck: "try" | "enable" | "disable";
    typecheckComponents: boolean;
    codegen: "enable" | "disable";
    component?: string | undefined;
    liveComponentSources?: boolean | undefined;
} & {
    envFile?: string | undefined;
    url?: string | undefined;
    adminKey?: string | undefined;
    prod?: boolean | undefined;
    previewName?: string | undefined;
    deploymentName?: string | undefined;
}>;
//# sourceMappingURL=run.d.ts.map