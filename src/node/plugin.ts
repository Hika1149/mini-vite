import { ServerContext } from "./server";
import { LoadResult, PartialResolvedId, SourceDescription } from "rollup";

export type ServerHook = (
  server: ServerContext
) => (() => void) | void | Promise<(() => void) | void>;

export interface Plugin {
  name: string;
  configServer?: ServerHook;
  resolveId?: (
    id: string,
    importer?: string
  ) => Promise<PartialResolvedId | null> | PartialResolvedId | null;
  load?: (id: string) => Promise<LoadResult | null> | LoadResult | null;
  transform?: (
    code: string,
    id: string
  ) => Promise<SourceDescription | null> | SourceDescription | null;
  transformIndexHtml?: (raw: string) => Promise<string> | string;
}
