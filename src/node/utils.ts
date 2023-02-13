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

const cleanUrl = (url: string): string => {
  return url.replace(HASH_RE, "").replace(QUERY_RE, "");
};
