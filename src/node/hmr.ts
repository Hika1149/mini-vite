import { ServerContext } from "./server";
import { getShortName } from "./utils";
import { blue, green } from "picocolors";

export function bindingHMREvents(serverContext: ServerContext) {
  const { watcher, moduleGraph, ws, root } = serverContext;

  watcher.on("change", async (file) => {
    const shortPath = "/" + getShortName(file, root);
    console.log(`${blue("[hmr]")} ${green(shortPath)} changed`);
    // clear transform cache
    await moduleGraph.invalidateModule(file);

    //

    ws.send({
      type: "update",
      updates: [
        {
          type: "js-update",
          timestamp: Date.now(),
          path: shortPath,
          acceptedPath: "/" + getShortName(file, root),
        },
      ],
    });
  });
}
