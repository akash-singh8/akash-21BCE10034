// The 5x5 grid(board) represents the game.
// The first row represents player A's characters.
// The last row represents player B's characters, and the rest are empty.
export const board: string[][] = [
  ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["", "", "", "", ""],
  ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
];

type positionType = {
  [key: string]: {
    row: number;
    col: number;
  };
};

// Initialize the positions of characters on the board.
export const characterPositions: positionType = {
  "A-P1": { row: 0, col: 0 },
  "A-P2": { row: 0, col: 1 },
  "A-H1": { row: 0, col: 2 },
  "A-H2": { row: 0, col: 3 },
  "A-P3": { row: 0, col: 4 },
  "B-P1": { row: 4, col: 0 },
  "B-P2": { row: 4, col: 1 },
  "B-H1": { row: 4, col: 2 },
  "B-H2": { row: 4, col: 3 },
  "B-P3": { row: 4, col: 4 },
};
