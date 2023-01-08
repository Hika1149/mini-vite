import { Plugin } from "esbuild";
import { BARE_IMPORT_RE, EXTERNAL_TYPES } from "../constants";

export const scanDepsPlugin = (deps: Set<string>): Plugin => {
  return {
    name: "scan-deps",
    setup(build) {
      //ignore external file
      build.onResolve(
        { filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})$`) },
        (args) => ({
          path: args.path,
          external: true,
        })
      );

      build.onResolve({ filter: BARE_IMPORT_RE }, (args) => {
        const { path } = args;
        /** gather dep */
        deps.add(path);

        return {
          path,
          external: true, //
        };
      });
    },
  };
};
