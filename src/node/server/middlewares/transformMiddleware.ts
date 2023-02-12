import { NextHandleFunction } from "connect";
import { ServerContext } from "../index";
import { isJSRequest } from "../../utils";
import createDebug from "debug";

const debug = createDebug("dev");

const transformRequest = async (url: string, serverContext: ServerContext) => {
  const { pluginContainer } = serverContext;

  const resolvedResult = await pluginContainer.resolveId(url);

  const resolvedId = resolvedResult?.id;

  let transformResult;
  if (resolvedId) {
    let code = await pluginContainer.load(resolvedId);

    /** */
    if (typeof code === "object" && code !== null) {
      code = code.code;
    }

    if (code) {
      transformResult = await pluginContainer.transform(code, resolvedId);
    }
  }
  return transformResult;
};

/**
 *  handle js req
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
    if (isJSRequest(req.url)) {
      let result = await transformRequest(req.url, serverContext);
      if (!result) {
        return next();
      }
      if (typeof result === "object") {
        result = result.code;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "application/javascript");

      //
      return res.end(result);
    }

    next();
  };
};
