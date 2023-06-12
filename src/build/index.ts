import * as esbuild from "esbuild";
import { buildConfig } from "./common";

esbuild.buildSync(buildConfig);
