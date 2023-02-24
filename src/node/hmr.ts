import { ServerContext } from "./server";
import { getShortName } from "./utils";
import { blue, green } from "picocolors";

export function bindingHMREvents(serverContext: ServerContext) {
  const { watcher, moduleGraph, ws, root } = serverContext;

  watcher.on("change", async (file) => {
    console.log(`${blue("[hmr]")} ${green(file)} changed`);
    // clear transform cache
    await moduleGraph.invalidateModule(file);

    //

    ws.send({
      type: "update",
      updates: [
        {
          type: "js-update",
          timestamp: Date.now(),
          path: "/" + getShortName(file, root),
          acceptedPath: "/" + getShortName(file, root),
        },
      ],
    });
  });
}
