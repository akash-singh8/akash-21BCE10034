import WebSocket from "ws";
import { moveCharacter } from "./ops";

let playerA: WebSocket | null = null;
let playerB: WebSocket | null = null;
const spectators: WebSocket[] = [];

export const wsConnectionHandler = (ws: WebSocket) => {
  const currPlayer = playerA ? (playerB ? "Spectator" : "B") : "A";

  // todo: reconnect the player to the game on come back

  if (!playerA) playerA = ws;
  else if (!playerB) playerB = ws;
  else spectators.push(ws);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      // todo : add validation check for the data
      //   if (!data.character || !data.command) throw new Error("Invalid input!");

      handleMessage(ws, currPlayer, data);
    } catch (err) {
      const error = {
        status: 400,
        message: "Invalid request message!",
      };

      ws.send(JSON.stringify({ error }));
    }
  });

  ws.on("close", () => {
    handleClose(currPlayer, ws);
  });
};

const handleMessage = (ws: WebSocket, currPlayer: string, data: any) => {
  if (currPlayer === "Spectator") {
    ws.send(JSON.stringify({ message: "Just enjoy the match!" }));
    return;
  }

  const opponent = currPlayer === "A" ? playerB : playerA;
  if (!playerA || !playerB) {
    opponent?.send(
      JSON.stringify({ message: "Waiting for the opponent player!" })
    );
    return;
  }

  const response = moveCharacter(data.character, data.command);

  opponent?.send(JSON.stringify(response));

  spectators.forEach((spec) => {
    spec.send(JSON.stringify(response));
  });
};

// handleClose:  Notify the opponent player and spectators
const handleClose = (currPlayer: string, ws: WebSocket) => {
  // todo: reset the game if both players are disconnected

  const response = {
    message: `${currPlayer} Disconnected`,
  };

  if (currPlayer === "A") playerA = null;
  else if (currPlayer === "B") playerB = null;
  else {
    const index = spectators.indexOf(ws);
    if (index !== -1) spectators.splice(index, 1);
  }

  if (currPlayer !== "Spectator") {
    const opponent = currPlayer === "A" ? playerB : playerA;
    opponent?.send(JSON.stringify(response));
    spectators.forEach((spec) => {
      spec.send(JSON.stringify(response));
    });
  }
};
