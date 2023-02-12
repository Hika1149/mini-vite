import type {
  LoadResult,
  PartialResolvedId,
  SourceDescription,
  PluginContext as RollupPluginContext,
  ResolvedId,
} from "rollup";
import { Plugin } from "./plugin";

export interface PluginContainer {
  resolveId(id: string, importer?: string): Promise<PartialResolvedId | null>;
  load(id: string): Promise<LoadResult | null>;
  transform(
    code: string,
    id: string
  ): Promise<SourceDescription | string | null>;
}

export const createPluginContainer = (plugins: Plugin[]): PluginContainer => {
  // @ts-ignore
  // class Context implements RollupPluginContext {
  class Context {
    async resolve(id: string, importer?: string) {
      let out = await pluginContainer.resolveId(id, importer);
      //@ts-ignore
      // if (typeof out === "string") {
      //   out = {
      //     id: out,
      //   };
      // }
      return out as ResolvedId | null;
    }
  }

  const pluginContainer: PluginContainer = {
    async resolveId(id: string, importer?: string) {
      const ctx = new Context() as any;

      for (const plugin of plugins) {
        if (plugin.resolveId) {
          const newId = await plugin.resolveId.call(ctx, id, importer);
          if (newId) {
            // id = typeof newId === "string" ? newId : newId.id;
            id = newId.id;
            return { id };
          }
        }
      }
      return null;
    },

    async load(id: string): Promise<LoadResult | null> {
      const ctx = new Context() as any;

      for (const plugin of plugins) {
        if (plugin.load) {
          const result = await plugin.load.call(ctx, id);
          if (result) {
            return result;
          }
        }
      }
      return null;
    },

    async transform(
      code: string,
      id: string
    ): Promise<SourceDescription | null> {
      const ctx = new Context();

      for (const plugin of plugins) {
        if (plugin.transform) {
          const result = await plugin.transform.call(ctx, code, id);
          if (result) {
            if (typeof result === "string") {
              code = result;
            } else if (result.code) {
              code = result.code;
            }
          }
        }
      }
      return { code };
    },
  };

  return pluginContainer;
};
