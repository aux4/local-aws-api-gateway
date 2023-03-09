#!/usr/bin/env node

import path from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createLocalWebSocketAPI } from "./lib/LocalWebSocketAPI.js";
import { createLocalRestAPI } from "./lib/LocalRestAPI.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

(async () => {
  let mappingPath = process.argv[2];
  if (!mappingPath) {
    throw new Error("Please provide the mapping file");
  }

  if (!mappingPath.startsWith("/")) {
    mappingPath = path.join(process.resolve("."), mappingPath);
  }

  const { REST_MAPPINGS, WS_MAPPINGS } = await import(mappingPath);

  const app = express();
  app.use(cors());
  app.use(express.json());

  if (WS_MAPPINGS) {
    createLocalWebSocketAPI(app, WS_MAPPINGS);
  }

  if (REST_MAPPINGS) {
    createLocalRestAPI(app, REST_MAPPINGS);
  }

  app.listen(PORT, () => {
    console.log(`Local AWS API Gateway started on port ${PORT}`);
  });
})();
