import connect from "connect";
import { blue, green } from "picocolors";
import { optimize } from "../optimizer";
import { resolvePlugins } from "../plugins";
import { createPluginContainer } from "../pluginContainer";

export interface ServerContext {}

export async function startDevServer() {
  const app = connect();
  const root = process.cwd();
  const startTime = Date.now();

  /** resolve plugins & create pluginContainer */
  const plugins = resolvePlugins();
  const pluginContainer = createPluginContainer(plugins);
  const serverContext = {
    root,
    app,
    plugins,
    pluginContainer,
  };

  for (const plugin of plugins) {
    if (plugin.configServer) {
      await plugin.configServer(serverContext);
    }
  }

  app.listen(3000, async () => {
    await optimize(root);

    console.log(
      green("No-Bundle service started!"),
      `time used: ${Date.now() - startTime}ms`
    );

    console.log(`> local: ${blue("http://localhost:3000")}`);
  });
}
