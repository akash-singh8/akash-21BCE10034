"use client";

import { useState } from "react";
import isValidMove from "@/utils/validate-move";
import styles from "@/styles/board.module.scss";

const Board = () => {
  const initialBoard = [
    ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
  ];

  const currPlayer: string = "A"; // can be "B" or "Spectator"
  const [isH2, setIsH2] = useState(false);

  const [board, setBoard] = useState(initialBoard);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [position, setPosition] = useState([-1, -1]);
  const [possibleMoves, setPossibleMoves] = useState([
    false,
    false,
    false,
    false,
  ]);

  const handleClick = (row: number, col: number) => {
    const selectedItem = board[row][col];

    if (selectedItem) {
      const selectedPlayer = selectedItem[0];
      if (currPlayer != selectedPlayer) return;

      setSelectedPlayer(selectedItem);
      setPosition([row, col]);

      const character = selectedItem.split("-")[1];
      const cPossibleMoves = [false, false, false, false];
      // 0th value represent Forward, 1->Backward, 2->Left, 3->right

      const validMove = (command: string) => {
        const { isValid } = isValidMove(character, command, row, col, board);

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
    const buttonClicked = e.target as HTMLButtonElement;
    const command = buttonClicked.innerText;

    const character = selectedPlayer.split("-")[1];
    const { isValid, row, col } = isValidMove(
      character,
      command,
      position[0],
      position[1],
      board
    );

    if (!isValid) return;

    const newBoard = board.map((row) => [...row]);
    newBoard[position[0]][position[1]] = "";
    newBoard[row][col] = selectedPlayer;

    setBoard(newBoard);
    setSelectedPlayer("");
  };

  return (
    <div className={styles.main}>
      <p className={styles.currentPlayer}>
        {/* add title for spectator */}
        {currPlayer === "A" ? "Your's turn" : "Opponent's turn"}
      </p>

      <div className={styles.board}>
        {board.map((row, i) => (
          <div key={i} className={styles.row}>
            {row.map((item, j) => (
              <div
                key={`${i}-${j}`}
                className={`${styles.item} ${
                  item &&
                  (currPlayer === "A" && item.startsWith("A")
                    ? styles.fillA
                    : styles.fillB)
                } ${
                  item &&
                  (currPlayer === "B" && item.startsWith("B")
                    ? styles.fillA
                    : styles.fillB)
                } ${item && item == selectedPlayer && styles.current}`}
                onClick={() => handleClick(i, j)}
              >
                {item}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className={styles.selectedPlayer}>
        {selectedPlayer
          ? `Selected: ${selectedPlayer}`
          : "Please select a character to move"}
      </div>

      {selectedPlayer && (
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
  );
};

export default Board;
