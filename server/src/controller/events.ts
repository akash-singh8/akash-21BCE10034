import WebSocket from "ws";
import { moveCharacter } from "./ops";
import { board, resetGame } from "./game";

let playerA: WebSocket | null = null;
let playerB: WebSocket | null = null;
const spectators: WebSocket[] = [];

export const wsConnectionHandler = (ws: WebSocket) => {
  const currPlayer = playerA ? (playerB ? "Spectator" : "B") : "A";

  const initResponse = JSON.stringify({ player: currPlayer, board });
  ws.send(initResponse);
  if (currPlayer === "B") playerA?.send(initResponse);

  // todo: reconnect the player to the game on come back

  if (!playerA) playerA = ws;
  else if (!playerB) playerB = ws;
  else spectators.push(ws);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (!data.character || !data.command) throw new Error("Invalid input!");

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
    (currPlayer === "A" ? playerA : playerB)?.send(
      JSON.stringify({ message: "Waiting for the opponent player!" })
    );
    return;
  }

  const response = moveCharacter(data.character, data.command);

  // @ts-ignore
  const isWinner = response.winner;
  if (isWinner)
    (currPlayer === "A" ? playerA : playerB)?.send(JSON.stringify(response));

  opponent?.send(JSON.stringify(response));

  spectators.forEach((spec) => {
    spec.send(JSON.stringify(response));
  });

  if (isWinner) resetGame();
};

// handleClose:  Notify the opponent player and spectators
const handleClose = (currPlayer: string, ws: WebSocket) => {
  const response = {
    message: `${currPlayer} Disconnected`,
  };

  if (currPlayer === "A") playerA = null;
  else if (currPlayer === "B") playerB = null;
  else {
    const index = spectators.indexOf(ws);
    if (index !== -1) spectators.splice(index, 1);
  }

  // Reset the game if both player left
  if (!playerA && !playerB) resetGame();

  if (currPlayer !== "Spectator") {
    const opponent = currPlayer === "A" ? playerB : playerA;
    opponent?.send(JSON.stringify(response));
    spectators.forEach((spec) => {
      spec.send(JSON.stringify(response));
    });
  }
};
