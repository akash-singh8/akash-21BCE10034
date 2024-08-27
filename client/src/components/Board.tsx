"use client";

import { useState, useEffect, useRef } from "react";
import isValidMove from "@/utils/validate-move";
import styles from "@/styles/board.module.scss";
import Popup from "./Popup";

const Board = () => {
  const initialBoard = [
    ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
  ];

  const socket = useRef<WebSocket | null>(null);
  const [player, setPlayer] = useState<string>(""); // can be "B" or "Spectator"
  const [turn, setTurn] = useState("");
  const [opponentPresent, setOpponentPresent] = useState(false);
  const [isH2, setIsH2] = useState(false);

  const [board, setBoard] = useState(initialBoard);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [position, setPosition] = useState([-1, -1]);
  const [possibleMoves, setPossibleMoves] = useState([
    false,
    false,
    false,
    false,
  ]);

  const [showPopup, setShowPopup] = useState(false);
  const [winner, setWinner] = useState("");

  useEffect(() => {
    socket.current = new WebSocket("ws://localhost:8080");

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.player) {
        setBoard(data.board);
        setTurn("A");
        if (data.player === "B") setOpponentPresent(true);
        return setPlayer((currPlayer) => currPlayer || data.player);
      }

      const message: string = data.message;

      if (message.startsWith("Waiting")) return setOpponentPresent(false);
      if (message.startsWith("Invalid")) return alert(message);

      const { board } = data;
      if (board === undefined) return;

      setTurn((t) => (t === "A" ? "B" : "A"));
      setBoard(board);

      setTimeout(() => {
        if (data.winner) {
          setWinner(data.winner);
          setShowPopup(true);
        }
      }, 500);
    };

    socket.current.addEventListener("message", handleMessage);

    return () => {
      socket.current?.removeEventListener("message", handleMessage);
      socket.current?.close();
    };
  }, []);

  const handleClick = (row: number, col: number) => {
    const selectedItem = board[row][col];

    if (selectedItem && opponentPresent && player === turn) {
      const selectedPlayer = selectedItem[0];
      if (player != selectedPlayer) return;

      setSelectedCharacter(selectedItem);
      setPosition([row, col]);

      const character = selectedItem.split("-")[1];
      const cPossibleMoves = [false, false, false, false];
      // 0th value represent Forward, 1->Backward, 2->Left, 3->right

      const validMove = (command: string) => {
        const { isValid } = isValidMove(
          player,
          character,
          command,
          row,
          col,
          board
        );

        return isValid;
      };

      if (character.startsWith("P") || character === "H1") {
        setIsH2(false);
        if (validMove("F")) cPossibleMoves[0] = true;
        if (validMove("B")) cPossibleMoves[1] = true;
        if (validMove("L")) cPossibleMoves[2] = true;
        if (validMove("R")) cPossibleMoves[3] = true;
      } else if (character === "H2") {
        setIsH2(true);
        if (validMove("FL")) cPossibleMoves[0] = true;
        if (validMove("FR")) cPossibleMoves[1] = true;
        if (validMove("BL")) cPossibleMoves[2] = true;
        if (validMove("BR")) cPossibleMoves[3] = true;
      }

      setPossibleMoves(cPossibleMoves);
    }
  };

  const handleMove = (e: React.MouseEvent) => {
    if (!opponentPresent || player !== turn) return;
    const buttonClicked = e.target as HTMLButtonElement;
    const command = buttonClicked.innerText;

    const character = selectedCharacter.split("-")[1];
    const { isValid, row, col } = isValidMove(
      player,
      character,
      command,
      position[0],
      position[1],
      board
    );

    if (!isValid) return;

    socket.current?.send(
      JSON.stringify({
        character: selectedCharacter,
        command: command,
      })
    );

    setTurn((t) => (t === "A" ? "B" : "A"));
    setBoard((prevBoard) => {
      const newBoard = prevBoard.map((row) => [...row]);
      newBoard[position[0]][position[1]] = "";
      newBoard[row][col] = selectedCharacter;
      return newBoard;
    });
    setSelectedCharacter("");
  };

  return (
    <>
      {showPopup && (
        <Popup
          won={player === winner}
          spectator={player === "Spectator" ? `Player ${winner} won!` : ""}
          onClose={() => setShowPopup(false)}
        />
      )}
      <div className={styles.main}>
        <p className={styles.currentPlayer}>
          {player === "A" && "Joined as Player A"}
          {player === "B" && "Joined as Player B"}
          {player === "Spectator" && "Joined as Spectator"}
        </p>

        <p className={styles.playerTurn}>
          {player === "Spectator"
            ? `${turn}'s Turn`
            : !opponentPresent
            ? "Waiting for opponent player"
            : `${player === turn ? "Your's Turn" : "Opponent's Turn"}`}
        </p>

        <div className={styles.board}>
          {board.map((row, i) => (
            <div key={i} className={styles.row}>
              {row.map((item, j) => (
                <div
                  key={`${i}-${j}`}
                  onClick={() => handleClick(i, j)}
                  className={`${styles.item} ${
                    item &&
                    (player === "A" && item.startsWith("A")
                      ? styles.fillA
                      : styles.fillB)
                  } ${
                    item &&
                    (player === "B" && item.startsWith("B")
                      ? styles.fillA
                      : styles.fillB)
                  } ${item && item == selectedCharacter && styles.current}`}
                >
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>

        {player === turn && opponentPresent && (
          <div className={styles.selectedPlayer}>
            {selectedCharacter
              ? `Selected: ${selectedCharacter}`
              : "Please select a character to move"}
          </div>
        )}

        {selectedCharacter && (
          <div className={styles.options}>
            <button onClick={handleMove} disabled={!possibleMoves[0]}>
              {isH2 ? "FL" : "F"}
            </button>
            <button onClick={handleMove} disabled={!possibleMoves[1]}>
              {isH2 ? "FR" : "B"}
            </button>
            <button onClick={handleMove} disabled={!possibleMoves[2]}>
              {isH2 ? "BL" : "L"}
            </button>
            <button onClick={handleMove} disabled={!possibleMoves[3]}>
              {isH2 ? "BR" : "R"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Board;
