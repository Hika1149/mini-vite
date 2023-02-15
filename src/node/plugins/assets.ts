import { Plugin } from "../plugin";
import { cleanUrl, getShortName, removeImportQuery } from "../utils";
import { ServerContext } from "../server";

export const assetsPlugin = (): Plugin => {
  let serverContext: ServerContext;
  return {
    name: "m-vite:assets",
    configServer(s) {
      serverContext = s;
    },
    load(id) {
      const cleanedId = removeImportQuery(cleanUrl(id));

      /** should be inside sirv served dir */
      const resolvedId = `/${getShortName(id, serverContext.root)}`;
      //
      if (cleanedId.endsWith(".svg")) {
        return {
          code: `export default "${resolvedId}"`,
        };
      }
    },
  };
};
