import { board, characterPositions } from "./game";

const getNewPosition = (character: string, command: string) => {
  let destRow = characterPositions[character].row;
  let destCol = characterPositions[character].col;

  const currCharacter = character.split("-")[1];
  const isH1 = currCharacter == "H1" ? 1 : 0;

  if (currCharacter[0] === "P" || isH1) {
    if (command === "L") destCol -= 1 + isH1;
    else if (command === "R") destCol += 1 + isH1;
    else if (command === "F") destRow -= 1 + isH1;
    else destRow += 1 + isH1;
  } else {
    if (command === "FL") [destRow, destCol] = [destRow - 2, destCol - 2];
    else if (command === "FR") [destRow, destCol] = [destRow - 2, destCol + 2];
    else if (command === "BL") [destRow, destCol] = [destRow + 2, destCol - 2];
    else [destRow, destCol] = [destRow + 2, destCol + 2];
  }

  return [destRow, destCol];
};

const isValidCommand = (character: string, command: string) => {
  const mainChar = character.split("-")[1];

  if (mainChar[0] === "P" || mainChar === "H1") {
    return ["F", "B", "L", "R"].includes(command);
  }

  return ["FL", "FR", "BL", "BR"].includes(command);
};

const moveCharacter = (character: string, command: string) => {
  const currPos = characterPositions[character];
  if (!currPos || !isValidCommand(character, command)) {
    const message = currPos ? "Invalid Command!" : "Invalid Character!";
    return { message };
  }

  const data = character.split("-");
  const player = data[0];

  const [destRow, destCol] = getNewPosition(character, command);
  const response = {
    row: destRow,
    col: destCol,
    message: "Invalid Move",
  };

  // Check if the new position is within the board boundaries
  if (destRow < 0 || destRow > 4 || destCol < 0 || destCol > 4) return response;

  const destCharacter = board[destRow][destCol];

  // Handle character's collision
  if (destCharacter) {
    if (destCharacter[0] === player) {
      response.message = "Invalid Move - Character already exist!";
      return response;
    } else response.message = "Killed";
  } else response.message = "Moved";

  // Update the board and character positions
  board[currPos.row][currPos.col] = "";
  board[destRow][destCol] = character;
  characterPositions[character] = {
    row: destRow,
    col: destCol,
  };

  return response;
};

export { moveCharacter };
