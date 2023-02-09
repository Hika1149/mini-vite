import { ServerContext } from "../index";
import { NextHandleFunction } from "connect";
import path from "path";
import { pathExists, readFile } from "fs-extra";

export function indexHtmlMiddleware(
  serverContext: ServerContext
): NextHandleFunction {
  return async function (req, res, next) {
    if (req.url === "/") {
      const { root } = serverContext;

      /** */
      const htmlPath = path.join(root, "index.html");

      const isHtmlPathExist = await pathExists(htmlPath);

      if (isHtmlPathExist) {
        const rawHtml = await readFile(htmlPath, "utf8");

        /** transformIndexHtml hook */
        let html = rawHtml;

        for (const plugin of serverContext.plugins) {
          if (plugin.transformIndexHtml) {
            html = await plugin.transformIndexHtml(html);
          }
        }

        /** */
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        return res.end(html);
      }
    }
    return next();
  };
}
