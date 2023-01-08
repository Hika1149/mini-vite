import path from "path";
import esbuild from "esbuild";
import { scanDepsPlugin } from "./scanPlugin";
import { green } from "picocolors";

export async function optimize(root: string) {
  /**
   * 1. confirm entry
   * 2. scan deps
   *  - use esBuild build api - during onResolve
   * 3. pre-bundle deps
   *
   * */

  //1.
  const entry = path.resolve(root, "src/main.tsx");

  //2.
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
}
