import path from "path";
import { init, parse } from "es-module-lexer";
import { Plugin } from "../plugin";
import { isJSRequest } from "../utils";
import { BARE_IMPORT_RE, PRE_BUNDLE_DIR } from "../constants";
import MagicString from "magic-string";

export const importAnalysisPlugin = (): Plugin => {
  return {
    name: "m-vite:importAnalysis",

    async transform(code, id) {
      if (!isJSRequest(id)) {
        return null;
      }

      await init;

      const [imports] = parse(code);
      const ms = new MagicString(code);
      for (const importInfo of imports) {
        const { s: modStart, e: modEnd, n: modSource } = importInfo;

        if (!modSource) {
          return null;
        }

        /** mark static import
         * - append ?import
         * */
        if (modSource.endsWith(".svg")) {
          const resolvedUrl = path.join(path.dirname(id), modSource);
          ms.overwrite(modStart, modEnd, `${resolvedUrl}?import`);
          continue;
        }

        /** overwrite importPath of deps */
        if (BARE_IMPORT_RE.test(modSource)) {
          const bundlePath = path.join("/", PRE_BUNDLE_DIR, `${modSource}.js`);
          ms.overwrite(modStart, modEnd, bundlePath);
        } else if (modSource.startsWith(".") || modSource.startsWith("/")) {
          /** should overwrite relative/absolute import path?
           *  yes
           *  - default extension
           *  - alias plugin...
           * */
          //@ts-ignore
          const resolvedId = await this.resolve(modSource, id);
          if (resolvedId) {
            ms.overwrite(modStart, modEnd, resolvedId.id);
          }
        }
      }

      return { code: ms.toString(), map: ms.generateMap() };
    },
  };
};
