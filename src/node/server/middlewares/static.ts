import { NextHandleFunction } from "connect";
import sirv from "sirv";
import { isImportRequest } from "../../utils";

export const staticMiddleware = (root: string): NextHandleFunction => {
  const servFromRoot = sirv(root, { dev: true });

  return async (req, res, next) => {
    if (!req.url) {
      return;
    }
    //
    if (isImportRequest(req.url)) {
      return;
    }

    servFromRoot(req, res, next);
  };
};
