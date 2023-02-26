import path from "path";
import { Plugin } from "../plugin";
import { ServerContext } from "../server";
import { CLIENT_PUBLIC_PATH, HMR_PORT } from "../constants";
import fs from "fs-extra";

export function clientInjectPlugin(): Plugin {
  let serverContext: ServerContext;

  return {
    name: "m-vite:client-inject",

    configServer: (s) => {
      serverContext = s;
    },
    resolveId: (id) => {
      if (id === CLIENT_PUBLIC_PATH) {
        return {
          id,
        };
      }
      return null;
    },

    async load(id) {
      if (id === CLIENT_PUBLIC_PATH) {
        const realPath = path.join(
          serverContext.root,
          "node_modules",
          "mini-vite",
          "dist",
          "client.mjs"
        );

        const code = await fs.readFile(realPath, "utf-8");

        return {
          code: code.replace("__HMR_PORT__", JSON.stringify(HMR_PORT)),
        };
      }
    },

    /** inject client script req  */
    transformIndexHtml(raw) {
      return raw.replace(
        /(<head[^>]*>)/i,
        `$1<script type="module" src="${CLIENT_PUBLIC_PATH}"></script>`
      );
    },
  };
}
