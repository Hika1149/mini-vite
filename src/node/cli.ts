import cac from "cac";

const cli = cac();

cli
  .command("[root]", "Run the development server")
  .alias("serve")
  .alias("dev")
  .action(async () => {
    console.log("testing cli~~~");
  });

cli.help();

cli.parse();
