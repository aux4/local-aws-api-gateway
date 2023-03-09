import ExpressWs from "express-ws";
import bodyParser from "body-parser";
import { wsConnect, wsDisconnect, wsDisconnectClient, wsReceive, wsSend } from "./WsManagement.js";
import { replacePathParams } from "./Utils.js";

export function createLocalWebSocketAPI(app, mappings) {
  const expressWs = ExpressWs(app);
  expressWs.getWss().on("connection", (ws, req) => {
    wsConnect(ws, req).then(context => {
      const mapping = mappings.find(
        mapping => replacePathParams(mapping.path) === req.route.path.replace(".websocket", "")
      );
      mapping.handlers.$connect(context).catch(e => console.error("[ERROR]", e.message, e));
    });
  });

  app.post("/@connections/:connectionId", bodyParser.text({ type: "*/*" }), (req, res) => {
    const payload = req.body;
    const connectionId = req.params.connectionId;
    wsSend({ ConnectionId: connectionId, Data: payload }).then(() => {
      res.status(200).send();
    });
  });

  app.delete("/@connections/:connectionId", (req, res) => {
    const connectionId = req.params.connectionId;
    wsDisconnectClient(connectionId).then(() => {
      res.status(200).send();
    });
  });

  mappings.forEach(mapping => {
    app.ws(replacePathParams(mapping.path), ws => {
      ws.on("message", message => {
        wsReceive(ws, message).then(wsMessage => {
          const routeKey = wsMessage.requestContext.routeKey;
          const handler = mapping.handlers[routeKey];
          if (handler) {
            handler(wsMessage);
          }
        });
      });
      ws.on("close", () => {
        wsDisconnect(ws).then(wsMessage => {
          const routeKey = wsMessage.requestContext.routeKey;
          const handler = mapping.handlers[routeKey];
          if (handler) {
            handler(wsMessage).catch(e => console.error("[ERROR]", e));
          }
        });
      });
    });
  });
}
