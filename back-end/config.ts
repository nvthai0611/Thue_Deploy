 

import path from "path";
import dotenv from "dotenv";
import moduleAlias from "module-alias";
import fs from "fs-extra";

// Check the env
const NODE_ENV = process.env.NODE_ENV ?? "development";
const envPath = path.join(__dirname, `./config/.env.${NODE_ENV}`);

// Configure "dotenv"
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

// Configure moduleAlias
if (__filename.endsWith("js")) {
  moduleAlias.addAlias("@src", __dirname + "/dist");
  moduleAlias.addAlias("config", path.join(__dirname, "dist", "config"));
}
