import { Plugin } from "esbuild";
import { BARE_IMPORT_RE } from "../constants";
import fs from "fs-extra";
import resolve from "resolve";
import { extname } from "path";
import { init, parse } from "es-module-lexer";

/**
 *
 *  preBundlePlugin:
 *  - deal cjs deps name exports
 *
 *
 *
 *  e.g.
 *  when not use preBundlePlugin
 *  - react -> export default react_default
 *
 *  when use preBundlePlugin
 *  - export {
 *    react as default
 *    export_useState as useState,
 *    ...
 *  }
 *
 * */

export const preBundlePlugin = (deps: Set<string>): Plugin => {
  return {
    name: "preBundle-deps",
    setup(build) {
      build.onResolve({ filter: BARE_IMPORT_RE }, (args) => {
        const isEntryImport = !args.importer;
        const { path: id } = args;

        // console.log(`[preBundle-deps onResolve ]: `, {
        //   args,
        // });
        if (deps.has(id)) {
          if (isEntryImport) {
            // console.log(`[preBundle-deps onResolve]: `, { args });
            return {
              path: args.path,
              namespace: "deps",
            };
          } else {
            return {
              path: resolve.sync(args.path, { basedir: process.cwd() }),
            };
          }
        }
      });

      build.onLoad({ filter: /.*/, namespace: "deps" }, async (args) => {
        await init;

        const { path: id } = args;

        const root = process.cwd();
        const codePath = resolve.sync(id, { basedir: root });
        const codeFileExt = extname(codePath);

        const code = fs.readFileSync(codePath, "utf8");

        const [imports, exports] = parse(code);

        const isCommonJs = !imports.length && !exports.length;

        const modules = [];

        if (isCommonJs) {
          const res = require(codePath);
          const specifiers = Object.keys(res);

          modules.push(`export default require("${codePath}")`);
          modules.push(`export {${specifiers.join(",")}} from "${codePath}"`);
        } else {
          //esm
          modules.push(`export default from "${codePath}"`);
          modules.push(`export * from "${codePath}"`);
        }
        return {
          contents: modules.join("\n"),
          /** es-build will bundle contents according to the loader below*/
          loader: codeFileExt.slice(1) as any,
          // loader: "text",
          /**
           * this directory will be passed to any onResolve cb that run on unresolved import paths in this module
           *  */
          resolveDir: root,
        };
      });
    },
  };
};
