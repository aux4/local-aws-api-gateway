import { nanoid } from "nanoid";
import { toMultiValueArray } from "./Utils.js";

const wsClients = {};

export async function wsConnect(ws, req) {
  const connectionId = nanoid(10);
  console.log("open ws connection", connectionId);
  ws.id = connectionId;

  const requestContext = {
    connectionId: connectionId,
    routeKey: "$connect",
    eventType: "CONNECT",
    path: req.path.replace("/.websocket", ""),
    connectedAt: Date.now(),
    requestTimeEpoch: Date.now(),
    identity: {
      sourceIp: req.socket.remoteAddress,
      userAgent: req.headers["user-agent"],
      apiKey: req.headers["x-api-key"]
    }
  };

  wsClients[connectionId] = {
    requestContext,
    ws
  };

  return { requestContext };
}

export async function wsReceive(ws, message) {
  let wsMessage;

  try {
    wsMessage = JSON.parse(message);
  } catch (e) {
    wsMessage = { data: message };
  }

  const client = wsClients[ws.id];
  return {
    requestContext: {
      ...client.requestContext,
      routeKey: wsMessage.action || "$default",
      eventType: "MESSAGE",
      messageDirection: "IN",
      requestTimeEpoch: Date.now()
    },
    body: wsMessage.data,
    isBase64Encoded: false
  };
}

export async function wsSend(message) {
  const client = wsClients[message.ConnectionId];
  client.ws.send(message.Data);
}

export async function wsDisconnectClient(connectionId) {
  const client = wsClients[connectionId];
  if (!client) return;

  client.ws.close();
}

export async function wsDisconnect(ws) {
  const client = wsClients[ws.id];
  console.log("close ws connection", ws.id);
  delete wsClients[ws.id];

  return {
    requestContext: {
      ...client.requestContext,
      routeKey: "$disconnect",
      eventType: "DISCONNECT",
      requestTimeEpoch: Date.now()
    }
  };
}
