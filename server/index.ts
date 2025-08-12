import express from "express";
import { WebSocketServer } from "ws";
import cors from "cors";
const app = express();

app.use(
  cors({
    origin: ["*"],
  })
);
const server = app.listen(8080, () => {
  console.log("HTTP Server is running at 8080");
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  console.log("Client Connected");
  ws.on("message", (data, isBinary) => {
    console.log("message:", data);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });

  ws.on("close", () => {
    console.log(
      `Client ${"unknown client"} disconnected from the WebSocket server.`
    );
  });
});
