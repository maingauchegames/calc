import { BuildOptions } from "esbuild";
import * as path from "path";

export const sitePath = path.resolve(path.join(__dirname, "..", "..", "site"));

export const buildConfig: BuildOptions = {
  entryPoints: [
    path.resolve(path.join(__dirname, "..", "client", "index.tsx")),
  ],
  bundle: true,
  sourcemap: true,
  outdir: path.join(sitePath, "js"),
};
