"use strict";
import { Command } from "@commander-js/extra-typings";
import { readProjectConfig } from "./lib/config.js";
import chalk from "chalk";
import { bigBrainAPI } from "./lib/utils/utils.js";
import { oneoffContext } from "../bundler/context.js";
import { logError, logMessage, logOutput } from "../bundler/log.js";
export const deployments = new Command("deployments").description("List deployments associated with a project").allowExcessArguments(false).action(async () => {
  const ctx = await oneoffContext({
    url: void 0,
    adminKey: void 0,
    envFile: void 0
  });
  const { projectConfig: config } = await readProjectConfig(ctx);
  const url = `teams/${config.team}/projects/${config.project}/deployments`;
  logMessage(`Deployments for project ${config.team}/${config.project}`);
  const deployments2 = await bigBrainAPI({
    ctx,
    method: "GET",
    url
  });
  logOutput(deployments2);
  if (deployments2.length === 0) {
    logError(chalk.yellow(`No deployments exist for project`));
  }
});
//# sourceMappingURL=deployments.js.map
