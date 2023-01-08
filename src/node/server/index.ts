import connect from "connect";

import { blue, green } from "picocolors";
import { optimize } from "../optimizer";

export async function startDevServer() {
  const app = connect();
  const root = process.cwd();
  const startTime = Date.now();

  app.listen(3000, async () => {
    await optimize(root);

    console.log(
      green("No-Bundle service started!"),
      `time used: ${Date.now() - startTime}ms`
    );

    console.log(`> local: ${blue("http://localhost:3000")}`);
  });
}
