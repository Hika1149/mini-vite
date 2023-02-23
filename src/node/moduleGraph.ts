import { PartialResolvedId, TransformResult } from "rollup";
import { cleanUrl } from "./utils";

export class ModuleNode {
  // mod req url
  url: string;

  // resolved id
  id: string | null = null;

  importers = new Set<ModuleNode>();
  importedModules = new Set<ModuleNode>();

  //
  transformResult: TransformResult | null;

  //
  lastHRMTimestamp = 0;

  constructor(url: string) {
    this.url = url;
  }
}

export class ModuleGraph {
  urlToModuleMap = new Map<string, ModuleNode>();

  idToModuleMap = new Map<string, ModuleNode>();

  constructor(
    private resolvedId: (url: string) => Promise<PartialResolvedId | null>
  ) {}

  /** */
  getModuleById(id: string) {
    return this.idToModuleMap.get(id);
  }

  async getModuleByUrl(rawUrl: string) {
    // const { url } = await this._resolve(rawUrl);
    // return this.urlToModuleMap.get(url);
    return this.urlToModuleMap.get(rawUrl);
  }

  /** - return module
   * - if not exist, create module from url, and store mod mapping */
  async ensureEntryFromUrl(rawUrl: string) {
    const { url, resolvedId } = await this._resolve(rawUrl);
    if (this.urlToModuleMap.get(url)) {
      return this.urlToModuleMap.get(url) as ModuleNode;
    }
    const mod = new ModuleNode(url);
    mod.id = resolvedId;
    this.urlToModuleMap.set(url, mod);
    this.idToModuleMap.set(resolvedId, mod);
    return mod;
  }

  /** update mod import relation */
  async updateModuleInfo(
    mod: ModuleNode,
    importedModules: Set<string | ModuleNode>
  ) {
    const prevImports = mod.importedModules;

    for (const curImports of importedModules) {
      /** curImports string -> req short path to root */
      const dep =
        typeof curImports === "string"
          ? await this.ensureEntryFromUrl(cleanUrl(curImports))
          : curImports;

      /** */
      if (dep) {
        mod.importedModules.add(dep);
        dep.importers?.add(mod);
      }
    }

    //
    for (const prevImport of prevImports) {
      if (!importedModules.has(prevImport.url)) {
        prevImport.importers?.delete(mod);
        //
        mod.importedModules?.delete(prevImport);
      }
    }
  }

  invalidateModule(id: string) {
    const mod = this.idToModuleMap.get(id);

    if (mod) {
      mod.lastHRMTimestamp = Date.now();
      mod.transformResult = null;
      mod.importers.forEach((importer) => {
        this.invalidateModule(importer.id!);
      });
    }
  }

  private async _resolve(url: string) {
    const resolved = await this.resolvedId(url);
    const resolvedId = resolved?.id || url;

    return {
      resolvedId,
      url,
    };
  }
}
