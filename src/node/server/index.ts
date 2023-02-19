import connect from "connect";
import { blue, green } from "picocolors";
import { optimize } from "../optimizer";
import { resolvePlugins } from "../plugins";
import { createPluginContainer, PluginContainer } from "../pluginContainer";
import { indexHtmlMiddleware } from "./middlewares/indexHtml";
import { Plugin } from "../plugin";
import { transformMiddleware } from "./middlewares/transformMiddleware";
import { staticMiddleware } from "./middlewares/static";
import { ModuleGraph } from "../moduleGraph";

export interface ServerContext {
  root: string;
  plugins: Plugin[];
  pluginContainer: PluginContainer;
  moduleGraph: ModuleGraph;
}

export async function startDevServer() {
  /** resolve plugins & create pluginContainer */
  const plugins = resolvePlugins();
  const pluginContainer = createPluginContainer(plugins);
  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url));

  const app = connect();
  const root = process.cwd();
  const startTime = Date.now();

  const serverContext = {
    root,
    app,
    plugins,
    pluginContainer,
    moduleGraph,
  };
  /** hook: configServer */
  for (const plugin of plugins) {
    if (plugin.configServer) {
      await plugin.configServer(serverContext);
    }
  }
  /** middleware: handle '/' req */
  app.use(indexHtmlMiddleware(serverContext));
  /** middleware: handle (js) req */
  app.use(transformMiddleware(serverContext));

  /** middleware: handle static req*/
  app.use(staticMiddleware(root));

  app.listen(3000, async () => {
    await optimize(root);

    console.log(
      green("No-Bundle service started!"),
      `time used: ${Date.now() - startTime}ms`
    );

    console.log(`> local: ${blue("http://localhost:3000")}`);
  });
}
