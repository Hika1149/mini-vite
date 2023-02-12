import { Plugin } from "../plugin";
import { resolvePlugin } from "./resolve";
import { esbuildTransformPlugin } from "./esbuild";

export function resolvePlugins(): Plugin[] {
  return [resolvePlugin(), esbuildTransformPlugin()];
}
