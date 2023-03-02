import { ServerContext } from "../server";
import { Plugin } from "../plugin";
import path from "path";
import { pathExists } from "fs-extra";
import resolve from "resolve";
import { DEFAULT_EXTENSIONS } from "../constants";
import { cleanUrl, isInternalRequest, removeImportQuery } from "../utils";

export const resolvePlugin = (): Plugin => {
  let serverContext: ServerContext;

  return {
    name: "m-vite:resolve",
    configServer: (s) => {
      serverContext = s;
    },
    /** -> resolve to absolute path so that load-plugin can read the code */
    resolveId: async (id: string, importer?: string) => {
      /** */
      id = removeImportQuery(cleanUrl(id));

      //
      if (isInternalRequest(id)) {
        return null;
      }

      if (path.isAbsolute(id)) {
        /** */
        if (await pathExists(id)) {
          return { id };
        }
        /** /src/main.ts */
        id = path.join(serverContext.root, id);
        if (await pathExists(id)) {
          return { id };
        }
      } else if (id.startsWith(".")) {
        if (!importer) {
          throw new Error(
            "importer should not be undefined when resolve relative path"
          );
        }

        let resolveId;

        /** extension */
        const hasExtension = path.extname(id).length > 1;

        if (hasExtension) {
          resolveId = resolve.sync(id, {
            basedir: path.dirname(importer),
          });
          if (await pathExists(resolveId)) {
            return { id: resolveId };
          }
        } else {
          for (const extension of DEFAULT_EXTENSIONS) {
            try {
              const idWithExtension = `${id}${extension}`;
              resolveId = resolve.sync(idWithExtension, {
                basedir: path.dirname(importer),
              });
              if (await pathExists(resolveId)) {
                return { id: resolveId };
              }
            } catch (e) {
              //
            }
          }
        }
      }
      return null;
    },
  };
};
