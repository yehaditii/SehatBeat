import { z } from "zod";
import { ConvexTool } from "./index.js";
declare const inputSchema: z.ZodObject<{
    deploymentSelector: z.ZodString;
    cursor: z.ZodOptional<z.ZodNumber>;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    deploymentSelector: string;
    cursor?: number | undefined;
    limit?: number | undefined;
}, {
    deploymentSelector: string;
    cursor?: number | undefined;
    limit?: number | undefined;
}>;
declare const outputSchema: z.ZodObject<{
    entries: z.ZodArray<z.ZodAny, "many">;
    newCursor: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    entries: any[];
    newCursor: number;
}, {
    entries: any[];
    newCursor: number;
}>;
export declare const LogsTool: ConvexTool<typeof inputSchema, typeof outputSchema>;
export {};
//# sourceMappingURL=logs.d.ts.map