"use strict";
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { logMessage, logOutput, logWarning } from "../../bundler/log.js";
import { nextBackoff } from "./dev.js";
import chalk from "chalk";
import { deploymentFetch } from "./utils/utils.js";
export class LogManager {
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
export async function logsForDeployment(ctx, credentials, options) {
  logMessage(chalk.yellow(`Watching logs${options.deploymentNotice}...`));
  await watchLogs(ctx, credentials.url, credentials.adminKey, "stdout", {
    history: options.history,
    success: options.success
  });
}
export async function watchLogs(ctx, url, adminKey, dest, options) {
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
      const backoff = nextBackoff(numFailures);
      if (numFailures > MAX_UDF_STREAM_FAILURE_COUNT) {
        logWarning(
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
  const fetch = deploymentFetch(ctx, {
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
    chalk.green(
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
          chalk.red(
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
        chalk.cyan(`${prefixLog(timestampMs, udfType, udfPath)} [${level}]`),
        args
      );
    } else {
      logToDestination(
        ctx,
        dest,
        chalk.red(`${prefixLog(timestampMs, udfType, udfPath)} ${message}`)
      );
    }
  } else {
    const level = message.level;
    const formattedMessage = `${message.messages.join(" ")}${message.isTruncated ? " (truncated due to length)" : ""}`;
    logToDestination(
      ctx,
      dest,
      chalk.cyan(
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
      logOutput(...logged);
      break;
    case "stderr":
      logMessage(...logged);
      break;
  }
}
function prefixLog(timestampMs, udfType, udfPath) {
  const prefix = prefixForSource(udfType);
  const localizedTimestamp = new Date(timestampMs).toLocaleString();
  return `${localizedTimestamp} [CONVEX ${prefix}(${udfPath})]`;
}
//# sourceMappingURL=logs.js.map
