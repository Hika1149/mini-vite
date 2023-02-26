import { Plugin } from "../plugin";
import { resolvePlugin } from "./resolve";
import { esbuildTransformPlugin } from "./esbuild";
import { importAnalysisPlugin } from "./importAnalysis";
import { cssPlugin } from "./css";
import { assetsPlugin } from "./assets";
import { clientInjectPlugin } from "./clientInject";

export function resolvePlugins(): Plugin[] {
  return [
    clientInjectPlugin(),
    //
    resolvePlugin(),
    esbuildTransformPlugin(),
    cssPlugin(),
    //
    // assetsPlugin(),
    importAnalysisPlugin(),

    assetsPlugin(),
  ];
}
