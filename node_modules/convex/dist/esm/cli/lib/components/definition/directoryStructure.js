"use strict";
import path from "path";
import {
  DEFINITION_FILENAME_JS,
  DEFINITION_FILENAME_TS
} from "../constants.js";
import { getFunctionsDirectoryPath } from "../../config.js";
export function qualifiedDefinitionPath(directory, workingDir = ".") {
  const definitionPath = path.relative(workingDir, directory.definitionPath);
  return `./${definitionPath}`;
}
export function isComponentDirectory(ctx, directory, isRoot) {
  if (!ctx.fs.exists(directory)) {
    return { kind: "err", why: `Directory doesn't exist` };
  }
  const dirStat = ctx.fs.stat(directory);
  if (!dirStat.isDirectory()) {
    return { kind: "err", why: `Not a directory` };
  }
  let filename = DEFINITION_FILENAME_TS;
  let definitionPath = path.resolve(path.join(directory, filename));
  if (!ctx.fs.exists(definitionPath)) {
    filename = DEFINITION_FILENAME_JS;
    definitionPath = path.resolve(path.join(directory, filename));
  }
  if (!ctx.fs.exists(definitionPath)) {
    return {
      kind: "err",
      why: `Directory doesn't contain a ${filename} file`
    };
  }
  const definitionStat = ctx.fs.stat(definitionPath);
  if (!definitionStat.isFile()) {
    return {
      kind: "err",
      why: `Component definition ${filename} isn't a file`
    };
  }
  return {
    kind: "ok",
    component: {
      isRoot,
      path: path.resolve(directory),
      definitionPath
    }
  };
}
export async function buildComponentDirectory(ctx, definitionPath) {
  const convexDir = path.resolve(await getFunctionsDirectoryPath(ctx));
  const isRoot = path.dirname(path.resolve(definitionPath)) === convexDir;
  const isComponent = isComponentDirectory(
    ctx,
    path.dirname(definitionPath),
    isRoot
  );
  if (isComponent.kind === "err") {
    return await ctx.crash({
      exitCode: 1,
      errorType: "invalid filesystem data",
      printedMessage: `Invalid component directory (${isComponent.why}): ${path.dirname(definitionPath)}`
    });
  }
  return isComponent.component;
}
export function toComponentDefinitionPath(rootComponent, component) {
  const relativePath = path.relative(
    rootComponent.path,
    component.path
  );
  const definitionPath = relativePath.split(path.sep).join(path.posix.sep);
  return definitionPath;
}
export function toAbsolutePath(rootComponent, componentDefinitionPath) {
  const relativePath = componentDefinitionPath.split(path.posix.sep).join(path.sep);
  return path.normalize(path.join(rootComponent.path, relativePath));
}
//# sourceMappingURL=directoryStructure.js.map
