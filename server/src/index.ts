import WebSocket from "ws";
import { wsConnectionHandler } from "./controller/events";

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", wsConnectionHandler);

console.log("WebSocket server is listening on ws://localhost:8080");
