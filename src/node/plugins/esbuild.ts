import { Plugin } from "../plugin";
import fs from "fs-extra";
import { isJSRequest } from "../utils";
import esbuild from "esbuild";
import path from "path";

export const esbuildTransformPlugin = (): Plugin => {
  return {
    name: "m-vite:transform",
    async load(id: string) {
      if (isJSRequest(id)) {
        try {
          const code = await fs.readFile(id, "utf-8");
          return code;
        } catch (e) {
          console.error(e);
        }
      }
    },
    async transform(code, id) {
      if (isJSRequest(id)) {
        const extname = path.extname(id).slice(1);

        const { code: transformCode, map } = await esbuild.transform(code, {
          target: "esnext",
          format: "esm",
          sourcemap: true,
          loader: extname as "js" | "jsx" | "ts" | "tsx",
        });

        return {
          code: transformCode,
          map,
        };
      }
      return null;
    },
  };
};
