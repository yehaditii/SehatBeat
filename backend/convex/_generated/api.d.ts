/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as documents from "../documents.js";
import type * as http from "../http.js";
import type * as myFunctions from "../myFunctions.js";
import type * as seedClinicalDocs from "../seedClinicalDocs.js";
import type * as seedData from "../seedData.js";
import type * as seedDocuments from "../seedDocuments.js";
import type * as simpleSeed from "../simpleSeed.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  http: typeof http;
  myFunctions: typeof myFunctions;
  seedClinicalDocs: typeof seedClinicalDocs;
  seedData: typeof seedData;
  seedDocuments: typeof seedDocuments;
  simpleSeed: typeof simpleSeed;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
