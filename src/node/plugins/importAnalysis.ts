import path from "path";
import { init, parse } from "es-module-lexer";
import { Plugin } from "../plugin";
import {
  cleanUrl,
  getShortName,
  isInternalRequest,
  isJSRequest,
} from "../utils";
import {
  BARE_IMPORT_RE,
  CLIENT_PUBLIC_PATH,
  PRE_BUNDLE_DIR,
} from "../constants";
import MagicString from "magic-string";
import { ServerContext } from "../server";

export const importAnalysisPlugin = (): Plugin => {
  let serverContext: ServerContext;
  return {
    name: "m-vite:importAnalysis",
    configServer(s) {
      serverContext = s;
    },
    async transform(code, id) {
      if (!isJSRequest(id) || isInternalRequest(id)) {
        return null;
      }

      await init;

      const [imports] = parse(code);
      const ms = new MagicString(code);

      /** resolve to shortPath */
      const resolve = async (id: string, importer?: string) => {
        const resolved = await serverContext.pluginContainer.resolveId(
          id,
          importer
        );

        if (!resolved) {
          return;
        }
        const cleanId = cleanUrl(resolved.id);
        // const mod = moduleGraph.getModuleById(cleanId);
        //
        const resolvedId = `/${getShortName(cleanId, serverContext.root)}`;

        return resolvedId;
      };

      /** update module module */
      const { moduleGraph } = serverContext;
      const curMod = await moduleGraph.getModuleById(id)!;
      const importedModules = new Set<string>();

      //
      for (const importInfo of imports) {
        const { s: modStart, e: modEnd, n: modSource } = importInfo;

        if (!modSource || isInternalRequest(modSource)) {
          continue;
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
          //
          importedModules.add(bundlePath);
        } else if (modSource.startsWith(".") || modSource.startsWith("/")) {
          /** should overwrite relative/absolute import path?
           *  yes
           *  - default extension
           *  - alias plugin...
           * */
          //@ts-ignore
          // const resolvedId = await this.resolve(modSource, id);

          const resolvedId = await resolve(modSource, id);

          if (resolvedId) {
            // ms.overwrite(modStart, modEnd, resolvedId.id);
            ms.overwrite(modStart, modEnd, resolvedId);
            //
            importedModules.add(resolvedId);
          }
        }
      }

      /** inject hmr var */
      if (!id.includes("node_modules")) {
        ms.prepend(
          `import {createHotContext as __vite__createHotContext} from "${CLIENT_PUBLIC_PATH}";` +
            `import.meta.hot = __vite__createHotContext(${JSON.stringify(
              cleanUrl(curMod.url)
            )});`
        );
      }

      await moduleGraph.updateModuleInfo(curMod, importedModules);

      return { code: ms.toString(), map: ms.generateMap() };
    },
  };
};
