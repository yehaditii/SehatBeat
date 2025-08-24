import { Context } from "../../../bundler/context.js";
export declare const promptString: (ctx: Context, options: {
    message: string;
    default?: string;
}) => Promise<string>;
export declare const promptOptions: <V>(ctx: Context, options: {
    message: string;
    choices: {
        name: string;
        value: V;
    }[];
    default?: V | undefined;
}) => Promise<V>;
export declare const promptSearch: <V>(ctx: Context, options: {
    message: string;
    choices: {
        name: string;
        value: V;
    }[];
    default?: V | undefined;
}) => Promise<V>;
export declare const promptYesNo: (ctx: Context, options: {
    message: string;
    default?: boolean;
}) => Promise<boolean>;
//# sourceMappingURL=prompts.d.ts.map