import express from "express";
import * as esbuild from "esbuild";
import { buildConfig, sitePath } from "build/common";

async function main() {
  const app = express();
  const port = 3000;

  app.use(express.static(sitePath));
  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

  const ctx = await esbuild.context(buildConfig);
  await ctx.watch();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
