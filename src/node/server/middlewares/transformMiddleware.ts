import { NextHandleFunction } from "connect";
import { ServerContext } from "../index";
import { isCSSRequest, isImportRequest, isJSRequest } from "../../utils";
import createDebug from "debug";

const debug = createDebug("dev");

const transformRequest = async (url: string, serverContext: ServerContext) => {
  const { pluginContainer, moduleGraph } = serverContext;

  const resolvedResult = await pluginContainer.resolveId(url);

  const resolvedId = resolvedResult?.id;

  let mod = await moduleGraph.getModuleByUrl(url);
  // transform from cache
  if (mod && mod.transformResult) {
    return mod.transformResult;
  }

  let transformResult;
  if (resolvedId) {
    let code = await pluginContainer.load(resolvedId);

    /** */
    if (typeof code === "object" && code !== null) {
      code = code.code;
    }

    /** register to moduleGroup */
    mod = await moduleGraph.ensureEntryFromUrl(url);

    if (code) {
      transformResult = await pluginContainer.transform(code, resolvedId);
    }
  }

  //
  if (mod) {
    mod.transformResult = transformResult;
  }
  return transformResult;
};

/**
 *  handle js/css/svg req
 *  - invoke pluginContainer (resolve,load, transform..)
 * */
export const transformMiddleware = (
  serverContext: ServerContext
): NextHandleFunction => {
  return async (req, res, next) => {
    if (req.method !== "GET" || !req.url) {
      return next();
    }
    const url = req.url;
    debug("transformMiddleware: %s", url);
    if (isJSRequest(url) || isCSSRequest(url) || isImportRequest(url)) {
      let result = await transformRequest(req.url, serverContext);
      if (!result) {
        return next();
      }
      if (typeof result === "object") {
        result = result.code;
      }

      res.statusCode = 200;
      /** */
      res.setHeader("Content-Type", "application/javascript");

      //
      return res.end(result);
    }

    next();
  };
};
