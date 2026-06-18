/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin__guard from "../admin/_guard.js";
import type * as admin_bootstrap from "../admin/bootstrap.js";
import type * as admin_cronLogs from "../admin/cronLogs.js";
import type * as admin_metrics from "../admin/metrics.js";
import type * as admin_subscriptions from "../admin/subscriptions.js";
import type * as admin_users from "../admin/users.js";
import type * as aiGeneration from "../aiGeneration.js";
import type * as bluesky from "../bluesky.js";
import type * as crons from "../crons.js";
import type * as engagement from "../engagement.js";
import type * as http from "../http.js";
import type * as openrouter from "../openrouter.js";
import type * as planLimits from "../planLimits.js";
import type * as posting from "../posting.js";
import type * as subscriptions from "../subscriptions.js";
import type * as telegram from "../telegram.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";
import type * as whatsapp from "../whatsapp.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/_guard": typeof admin__guard;
  "admin/bootstrap": typeof admin_bootstrap;
  "admin/cronLogs": typeof admin_cronLogs;
  "admin/metrics": typeof admin_metrics;
  "admin/subscriptions": typeof admin_subscriptions;
  "admin/users": typeof admin_users;
  aiGeneration: typeof aiGeneration;
  bluesky: typeof bluesky;
  crons: typeof crons;
  engagement: typeof engagement;
  http: typeof http;
  openrouter: typeof openrouter;
  planLimits: typeof planLimits;
  posting: typeof posting;
  subscriptions: typeof subscriptions;
  telegram: typeof telegram;
  usage: typeof usage;
  users: typeof users;
  whatsapp: typeof whatsapp;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
