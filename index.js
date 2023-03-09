#!/usr/bin/env node

import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { createLocalWebSocketAPI } from "./lib/LocalWebSocketAPI.js";
import { createLocalRestAPI } from "./lib/LocalRestAPI.js";

dotenv.config();

const PORT = process.env.PORT || 8080;

(async () => {
  const { REST_MAPPINGS, WS_MAPPINGS } = await import(process.argv[2]);

  const app = express();
  app.use(cors());
  // app.use(express.json());
  app.use(bodyParser.text());

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
