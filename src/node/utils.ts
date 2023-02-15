import { HASH_RE, JS_TYPES_RE, QUERY_RE } from "./constants";
import path from "node:path";

export const isJSRequest = (id: string): boolean => {
  id = cleanUrl(id);

  if (JS_TYPES_RE.test(id)) {
    return true;
  }

  //
  // if (!path.extname(id) && !id.endsWith("/")) {
  // }

  return false;
};

export const isCSSRequest = (id: string): boolean => {
  id = cleanUrl(id);
  return id.endsWith(".css");
};

export const isImportRequest = (id: string): boolean => {
  // id = cleanUrl(id);
  return id.endsWith("?import");
};

export const getShortName = (url: string, root: string) => {
  return url.startsWith(root) ? path.relative(root, url) : url;
};

export const cleanUrl = (url: string): string => {
  return url.replace(HASH_RE, "").replace(QUERY_RE, "");
};

export const removeImportQuery = (id: string) => {
  return id.replace(/\?import$/, "");
};
