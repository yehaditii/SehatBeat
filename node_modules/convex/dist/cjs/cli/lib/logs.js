"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var logs_exports = {};
__export(logs_exports, {
  LogManager: () => LogManager,
  logsForDeployment: () => logsForDeployment,
  watchLogs: () => watchLogs
});
module.exports = __toCommonJS(logs_exports);
var import_log = require("../../bundler/log.js");
var import_dev = require("./dev.js");
var import_chalk = __toESM(require("chalk"), 1);
var import_utils = require("./utils/utils.js");
class LogManager {
  constructor(mode) {
    this.mode = mode;
    __publicField(this, "paused", false);
  }
  async waitForUnpaused() {
    while (this.paused) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  beginDeploy() {
    if (this.mode === "pause-on-deploy") {
      this.paused = true;
    }
  }
  endDeploy() {
    if (this.mode === "pause-on-deploy") {
      this.paused = false;
    }
  }
}
const MAX_UDF_STREAM_FAILURE_COUNT = 5;
async function logsForDeployment(ctx, credentials, options) {
  (0, import_log.logMessage)(import_chalk.default.yellow(`Watching logs${options.deploymentNotice}...`));
  await watchLogs(ctx, credentials.url, credentials.adminKey, "stdout", {
    history: options.history,
    success: options.success
  });
}
async function watchLogs(ctx, url, adminKey, dest, options) {
  let numFailures = 0;
  let isFirst = true;
  let cursorMs = 0;
  for (; ; ) {
    try {
      const { entries, newCursor } = await pollUdfLog(
        ctx,
        cursorMs,
        url,
        adminKey
      );
      cursorMs = newCursor;
      numFailures = 0;
      await options?.logManager?.waitForUnpaused();
      if (isFirst) {
        isFirst = false;
        if (options?.history === true || typeof options?.history === "number" && options?.history > 0) {
          const entriesSlice = options?.history === true ? entries : entries.slice(entries.length - options?.history);
          processLogs(ctx, entriesSlice, dest, options?.success);
        }
      } else {
        processLogs(ctx, entries, dest, options?.success === true);
      }
    } catch {
      numFailures += 1;
    }
    if (numFailures > 0) {
      const backoff = (0, import_dev.nextBackoff)(numFailures);
      if (numFailures > MAX_UDF_STREAM_FAILURE_COUNT) {
        (0, import_log.logWarning)(
          `Convex [WARN] Failed to fetch logs. Waiting ${backoff}ms before next retry.`
        );
      }
      await new Promise((resolve) => {
        setTimeout(() => resolve(null), backoff);
      });
    }
  }
}
async function pollUdfLog(ctx, cursor, url, adminKey) {
  const fetch = (0, import_utils.deploymentFetch)(ctx, {
    deploymentUrl: url,
    adminKey
  });
  const response = await fetch(`/api/stream_function_logs?cursor=${cursor}`, {
    method: "GET"
  });
  return await response.json();
}
const prefixForSource = (udfType) => {
  return udfType.charAt(0);
};
function processLogs(ctx, rawLogs, dest, shouldShowSuccessLogs) {
  for (let i = 0; i < rawLogs.length; i++) {
    const log = rawLogs[i];
    if (log.logLines) {
      const id = log.identifier;
      const udfType = log.udfType;
      const timestampMs = log.timestamp * 1e3;
      const executionTimeMs = log.executionTime * 1e3;
      for (let j = 0; j < log.logLines.length; j++) {
        logToTerminal(
          ctx,
          "info",
          timestampMs,
          udfType,
          id,
          log.logLines[j],
          dest
        );
      }
      if (log.error) {
        logToTerminal(ctx, "error", timestampMs, udfType, id, log.error, dest);
      } else if (log.kind === "Completion" && shouldShowSuccessLogs) {
        logFunctionExecution(
          ctx,
          timestampMs,
          log.udfType,
          id,
          executionTimeMs,
          dest
        );
      }
    }
  }
}
function logFunctionExecution(ctx, timestampMs, udfType, udfPath, executionTimeMs, dest) {
  logToDestination(
    ctx,
    dest,
    import_chalk.default.green(
      `${prefixLog(
        timestampMs,
        udfType,
        udfPath
      )} Function executed in ${Math.ceil(executionTimeMs)} ms`
    )
  );
}
function logToTerminal(ctx, type, timestampMs, udfType, udfPath, message, dest) {
  const prefix = prefixForSource(udfType);
  if (typeof message === "string") {
    if (type === "info") {
      const match = message.match(/^\[.*?\] /);
      if (match === null) {
        logToDestination(
          ctx,
          dest,
          import_chalk.default.red(
            `[CONVEX ${prefix}(${udfPath})] Could not parse console.log`
          )
        );
        return;
      }
      const level = message.slice(1, match[0].length - 2);
      const args = message.slice(match[0].length);
      logToDestination(
        ctx,
        dest,
        import_chalk.default.cyan(`${prefixLog(timestampMs, udfType, udfPath)} [${level}]`),
        args
      );
    } else {
      logToDestination(
        ctx,
        dest,
        import_chalk.default.red(`${prefixLog(timestampMs, udfType, udfPath)} ${message}`)
      );
    }
  } else {
    const level = message.level;
    const formattedMessage = `${message.messages.join(" ")}${message.isTruncated ? " (truncated due to length)" : ""}`;
    logToDestination(
      ctx,
      dest,
      import_chalk.default.cyan(
        // timestamp is in ms since epoch
        `${prefixLog(message.timestamp, udfType, udfPath)} [${level}]`
      ),
      formattedMessage
    );
  }
}
function logToDestination(ctx, dest, ...logged) {
  switch (dest) {
    case "stdout":
      (0, import_log.logOutput)(...logged);
      break;
    case "stderr":
      (0, import_log.logMessage)(...logged);
      break;
  }
}
function prefixLog(timestampMs, udfType, udfPath) {
  const prefix = prefixForSource(udfType);
  const localizedTimestamp = new Date(timestampMs).toLocaleString();
  return `${localizedTimestamp} [CONVEX ${prefix}(${udfPath})]`;
}
//# sourceMappingURL=logs.js.map
