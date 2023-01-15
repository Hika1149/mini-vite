import path from "path";
import esbuild from "esbuild";
import { scanDepsPlugin } from "./scanPlugin";
import { green } from "picocolors";
import { PRE_BUNDLE_DIR } from "../constants";
import { preBundlePlugin } from "./preBundlePlugin";

export async function optimize(root: string) {
  /**
   * 1. confirm entry
   * 2. scan deps
   *  - use esBuild build api - during onResolve
   * 3. pre-bundle deps
   *
   * */

  //1.
  const entry = path.resolve(root, "src/main");

  // //2.
  const deps = new Set<string>();
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanDepsPlugin(deps)],
  });
  console.log(
    `${green(`pre-bundle deps: `)}\n${[...deps]
      .map(green)
      .map((item) => `   ${item}`)
      .join("\n")}`
  );

  //3.
  const result = await esbuild.build({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    outdir: path.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBundlePlugin(deps)],
    // plugins: [preBundlePlugin(deps)],
  });
  console.log(`${green(`build result: ${result}`)}`);
}
