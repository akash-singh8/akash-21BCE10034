const isValidMove = (
  character: string,
  command: string,
  row: number,
  col: number,
  board: string[][]
) => {
  const isH1 = character == "H1" ? 1 : 0;

  if (character[0] === "P" || isH1) {
    if (command === "L") col -= 1 + isH1;
    else if (command === "R") col += 1 + isH1;
    else if (command === "F") row -= 1 + isH1;
    else row += 1 + isH1;
  } else {
    if (command === "FL") [row, col] = [row - 2, col - 2];
    else if (command === "FR") [row, col] = [row - 2, col + 2];
    else if (command === "BL") [row, col] = [row + 2, col - 2];
    else [row, col] = [row + 2, col + 2];
  }

  return {
    isValid: !(row < 0 || row > 4 || col < 0 || col > 4 || board[row][col]),
    row,
    col,
  };
};

export default isValidMove;
