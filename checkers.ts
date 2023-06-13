// Ben Wetzel Checkers 2023
// Imports //
import * as readline from 'readline/promises';

//// Data Structures ////
// create object for player pieces
class GamePiece {
    kinged: boolean;
    readonly playerID: number; // 0 = Player1, 1 = Player2
    playerPieceID: number; // index of this piece in the player's list of pieces
    posX: number;
    posY: number;
    aMoves: number[][] // list of available moves the piece can make. 
    // aMove[n] = [x,y,      // first two values are x and y coordinates of new landing location
    //             0/1,   // third value lists if the move is a jump or not.
    //            jX, jY // fourth and fifth value lists the space a jump was made over.
    //            ] 
    constructor(kinged: boolean = false, playerID: number = 0, playerPieceID: number = 0,
        posX: number = 0, posY: number = 0, aMoves: number[][] = []) {
        this.kinged = kinged;
        this.playerID = playerID;
        this.playerPieceID = playerPieceID;
        this.posX = posX;
        this.posY = posY;
        this.aMoves = aMoves;
    }
    clone(): GamePiece {
        var nMoves: number[][] = [];
        this.aMoves.forEach(move => {
            var n: number[] = [];
            move.forEach(value => {
                n.push(value.valueOf());
            });
            nMoves.push(n);
        });
        var result: GamePiece = new GamePiece(
            this.kinged.valueOf(),
            this.playerID.valueOf(),
            this.playerPieceID.valueOf(),
            this.posX.valueOf(),
            this.posY.valueOf(),
            nMoves
        )
        return result;
    }
    toString(): string {
        var result: string = "\n  Piece at (" + this.posX + ", " + this.posY + ")";
        result += "\n      Team: " + (this.playerID + 1);
        result += "\n      Kinged: " + this.kinged;
        result += "\n      Index on Player List: " + this.playerPieceID;
        result += "\n   " + this.movesToString();
        return result;
    }
    movesToString(): string {
        var result: string = "";
        var moves: string = "";
        // if the available moves list has moves in it
        if (this.aMoves.length > 0) {
            // add the possible moves to the string of moves the piece can make.
            this.aMoves.forEach((aMove, index) => {
                if (aMove[2] == 0) { // log a basic move
                    moves += " Move" + (index + 1) + " = (" + aMove[0].toString() + ", " + aMove[1].toString() + ")";
                } else if (aMove[2] == 1) { // log a jump
                    moves += " Move" + (index + 1) + " = (" + aMove[0] + ", " + aMove[1] + ") jumpping over (" + aMove[3] + ", " + aMove[4] + ")";
                }
                moves += ", ";
            });
            result = "   Moves for Piece at (" + this.posX.toString() + "," + this.posY.toString() + ") : " + moves;
        }
        return result;
    }
    jumpsToString(): string {
        var result: string = "";
        var jumps: string = "";
        // if the available moves list has moves in it
        if (this.aMoves.length > 0) {
            // add the possible moves to the string of moves the piece can make.
            this.aMoves.forEach((aMove, index) => {
                if (aMove[2] == 1) { // log a jump
                    jumps += " Move" + (index + 1) + " = (" + aMove[0] + ", " + aMove[1] + ") jumpping over (" + aMove[3] + ", " + aMove[4] + "), ";
                }
            });

            // don't return a full string if there are no jumps
            if (jumps !== "") {
                result += "   Jumps for Piece at (" +
                    this.posX.toString() + "," + this.posY.toString() + ") : " + jumps;
            }
        }
        return result;
    }
}
// create object type for players
class Player {
    readonly playerID: number;
    pieces: GamePiece[]; // list of remaining pieces belonging to the player on the board

    constructor(id: number = 0, p: GamePiece[] = []) {
        this.playerID = id;
        this.pieces = p;
    }

    clone(): Player {
        var p: GamePiece[] = [];
        this.pieces.forEach(piece => {
            p.push(piece.clone());
        });
        var result: Player = new Player(
            this.playerID.valueOf(),
            p
        );
        return result;
    }

    movesToString(): string {
        var result: string = " PLAYER " + (this.playerID + 1) + " Moves: \n";
        // for each piece on the board the player controls which can move
        this.pieces.forEach(piece => {
            if (piece.aMoves.length >= 1) {
                result += piece.movesToString() + "\n";
            }
        });
        return result;
    }

    toString(): string {
        var result: string = " PLAYER " + (this.playerID + 1) + " Pieces Printout: ";
        this.pieces.forEach(piece => {
            result += piece.toString();
        });
        return result;
    }
}
// create object for game space
class GameSpace {
    color: string;
    piece?: GamePiece;

    constructor(c: string, p?: GamePiece) {
        this.color = c;
        if (p !== undefined) {
            this.piece = p;
        }
    }

    clone(): GameSpace {
        var p: GamePiece | undefined = this.piece;
        if (this.piece !== undefined) {
            p = this.piece?.clone()
        }
        var result: GameSpace = new GameSpace(
            this.color.valueOf(),
            p
        );
        return result;
    }
}
// create object type to hold the game board
class GameState {
    players: Player[];
    board: GameSpace[][];
    end: boolean;
    currentPlayerID?: number;

    constructor(players: Player[] = [], board: GameSpace[][] = [], end: boolean = false, currentPlayerID?: number) {
        this.players = players;
        this.board = board;
        this.end = end;
        if (currentPlayerID !== undefined) {
            this.currentPlayerID = currentPlayerID;
        }
    }

    clone(): GameState {
        var nPlayers: Player[] = [];
        this.players.forEach(player => {
            nPlayers.push(player.clone());
        });
        var nBoard: GameSpace[][] = []
        this.board.forEach(row => {
            var nRow: GameSpace[] = [];
            row.forEach((space) => {
                nRow.push(space.clone());
            });
            nBoard.push(nRow);
        });
        var result: GameState = new GameState(
            nPlayers,
            nBoard,
            this.end.valueOf(),
            this.currentPlayerID?.valueOf()
        )
        return result;
    }

    toString(): string {
        var result: string = "State Printout: \n";
        result += "   Players: ";
        for (var i = 0; i < this.players.length; i++) {
            result += this.players[i].playerID + ", ";
        }
        result += "\n   Current Player: " + this.currentPlayerID;
        result += "\n   End State: " + this.end;
        printBoardToConsole(this.board);
        return result;
    }

    piecesToString(): string {
        var result: string = "Board Pieces Printout: ";
        this.board.forEach(col => {
            col.forEach(space => {
                if (space.piece !== undefined) {
                    result += space.piece.toString();
                }
            });
        });
        return result;
    }
}

//// Global Variables ////
// open the user interface
const myInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//// Main ////
// printTestBoard();
index();

//// FUNCTIONS ////
function index() {
    console.log("   Digital Checkers");
    console.log("Presented by Ben Wetzel");
    console.log("         2023");
    readMenuResponse();
}
async function readMenuResponse() {
    var debug: string = "DEBUG.readMenuResponse: "
    var board: GameSpace[][] = buildBasicBoard();
    console.log("\nYou can PLAY the game, learn the RULES, or EXIT");
    var answer: string = await myInterface.question("What would you like to do? >");
    // check answer against programmed responses
    switch (answer.toLowerCase().trim()) {
        case "play": {
            var checkers: GameState = buildCheckersBoard(board, false);
            // console.log(debug + "board built and filled");
            printBoardToConsole(checkers.board);
            // prompt players to choose whom shall go first.
            choosePlayer().then((id) => {
                checkers.currentPlayerID = id;
                // console.log(debug + "current player = " + checkers.currentPlayerID);
            }).then(() => {
                // console.log(debug + "startGame() finished. Moving to playGame().");
                // console.log(debug + "current player = " + checkers.currentPlayerID);
            }).then(
                () => playGame(checkers)).then(
                    () => readMenuResponse());
            break;
        }
        case "rules": {
            printRules();
            readMenuResponse();
            break;
        }
        case "exit": {
            console.log("Thanks for playing.");
            myInterface.close();
            process.exit();
            break;
        }
        default: {
            console.log("That was not a valid command. Please input PLAY, RULES, or EXIT.");
            readMenuResponse();
            break;
        }
    }
}

async function playGame(state: GameState): Promise<GameState> {
    var nState: GameState = state.clone();
    var preface: string = "\nPLAYER " + (nState.currentPlayerID! + 1) + ": ";
    console.log(preface);
    printBoardToConsole(nState.board);
    var debug: string = "DEBUG.playGame: "
    if (nState.end == false) {
        console.log(debug + "Enter Player Prompt")
        promptPlayer(nState, preface).then((s) => {
            // console.log(debug + "Current Player = " + nState.currentPlayerID);
            // console.log(nState.toString());
            // console.log(debug + "Current Player = " + s.currentPlayerID);
            // console.log(s.toString())
            var game: GameState = s;
            // switch the active player
            game.currentPlayerID!++;
            if (game.currentPlayerID! >= game.players.length) {
                game.currentPlayerID = 0;
            }
            // console.log(debug + "Current Player = " + game.currentPlayerID);
            console.log("Current Player is now Player " + (game.currentPlayerID! + 1));
            return game;
        }).then((s) => playGame(s)
        ).then((s) => {
            nState = s
            return nState;
        });

    } else {
        console.log("Great Game! Congratulations Player " + (nState.currentPlayerID! + 1))
        readMenuResponse();
    }
    return nState;
}

async function choosePlayer(): Promise<number> {
    var debug: string = "DEBUG.choosePlayer: "
    var answer: string = await myInterface.question("Which player would like to go first? > ");
    // update the current player to the selected player
    switch (answer.toLowerCase().trim()) {
        case "one":
        case "1": {
            console.log(debug + "answer one");
            return 0;
        }
        case "two":
        case "2": {
            console.log(debug + "answer two");
            return 1;
        }
        default: {
            console.log("That is not a valid player. You must pick either 1 or 2.");
            return choosePlayer();
        }
    }
}

async function promptPlayer(state: GameState, preface: string): Promise<GameState> {
    var nState: GameState = state.clone();
    var debug: string = "DEBUG.promptPlayer: ";
    console.log(nState.players[nState.currentPlayerID!].movesToString());
    // console.log(debug + "test");
    var uPiece: GamePiece | undefined = await promptPiece(nState, preface);
    if (typeof uPiece !== 'undefined') {
        // console.log(debug + "Piece Selected");
        nState = await promptMove(nState, preface, uPiece!);
    } else {
        console.log("\nYou have not selected a piece to move. Please enter a valid piece.")
        nState = await promptPlayer(state, preface);
    }
    return nState;
}

// ask the player which piece they would like to move
// -- state: the current game state
// -- preface: a string with the current player to be attatched at the front of the question
async function promptPiece(state: GameState, preface: string): Promise<GamePiece | undefined> {
    var debug: string = "DEBUG.promptPiece: ";
    console.log("Format response like this -> pieceX, pieceY");
    var answer: string = await myInterface.question(preface + "Which piece would you like to move? > ");
    try {
        // clean off the response 
        answer = answer.toLowerCase().trim();
        var strings: string[] = answer.split(',');
        var coordinates: number[] = [];
        // convert the string elements into numbers
        strings.forEach(position => {
            coordinates.push(parseInt(position));
        });
        // assign useful variables
        var board: GameSpace[][] = state.board;
        var x: number = coordinates[0];
        var y: number = coordinates[1];
        // check if board space exists
        if (isTargetOnBoard(board, x, y)) {
            // check if there is a piece in that space
            if (typeof board[y][x].piece !== 'undefined') {
                // if the current player controls that piece
                if (board[y][x].piece?.playerID == state.currentPlayerID &&
                    board[y][x].piece?.aMoves.length! >= 1) {
                    return board[y][x].piece!;
                }
            }
        }
        return undefined;
    } catch (error) {
        var answer: string = await myInterface.question("That was not a valid response. Would you like to TRY again, or go BACK? >");
        // clean off the response 
        switch (answer.toLowerCase().trim()) {
            case "back": {
                return undefined;
            }
            case "try":
            default: {
                return promptPiece(state, preface);
            }
        }
    }
}

// prompt the player to select a move from the selected piece's move list
// -- state: current state of the game
// -- preface: leading string containing the player being adressed
// -- piece: the piece selected to move
async function promptMove(state: GameState, preface: string, piece: GamePiece): Promise<GameState> {
    var debug: string = "DEBUG.promptMove: ";
    var nState: GameState = state.clone();
    var x: number = piece.posX;
    var y: number = piece.posY;
    var nPiece: GamePiece = nState.board[y][x].piece!.clone();
    console.log(nPiece.movesToString());
    console.log("Format response like this -> targetX, targetY");
    var answer: string = await myInterface.question(preface + "Where would you like to move the piece currently at (" + x + ", " + y + ")? > ");
    try {
        // clean off the response 
        answer = answer.toLowerCase().trim();
        var strings: string[] = answer.split(',');
        var coordinates: number[] = [];
        // convert the string elements into numbers
        strings.forEach(position => {
            coordinates.push(parseInt(position));
        });
        // assign readable variables from user input
        var tX: number = coordinates[0];
        var tY: number = coordinates[1];

        // if two inputs are read from the player response
        if (tX !== undefined && tY !== undefined) {
            // for each move that the piece could make, check if there is a match
            for (var i: number = 0; i < nPiece.aMoves.length; i++) {
                if (nPiece.aMoves[i][0] == tX && nPiece.aMoves[i][1] == tY) {
                    // move the piece
                    nState = movePiece(nState, nState.currentPlayerID!, nPiece, nPiece.aMoves[i]);

                    // console.log(debug + "(" + nPiece.aMoves[i][0] + ", " + nPiece.aMoves[i][1] +
                    //     ") to (" + nPiece.aMoves[i][3] + ", " + nPiece.aMoves[i][4] + "). Jump?" + nPiece.aMoves[i][2])
                    // if this move was a jump
                    if (nPiece.aMoves[i][2] == 1) {
                        // grab updated moves list
                        nPiece = nState.board[tY][tX].piece!;
                        // check if another jump can be made based on the updated moves
                        for (var j: number = 0; j < nPiece.aMoves.length; j++) {
                            if (nPiece.aMoves[j][2] == 1) {
                                // console.log(debug + "Checking for double jump input");
                                nState = await promptJump(nState, preface, nPiece);
                                return nState;
                            }
                        }
                    }
                    return nState;
                }
            }
        }
        // if no valid moves have been found
        console.log("\nYou cannot make that move with the piece at (" + x + ", " + y + "). Please input a vaid move to continue.");
        nState = await promptMove(state, preface, piece);
        return nState;
    } catch (error) {
        console.log(error);
        var answer = await myInterface.question("That was not a valid response. Would you like to TRY again, or go BACK? >");
        // clean off the response 
        answer = answer.toLowerCase().trim();
        switch (answer) {
            case "back": {
                console.log(debug + ".catch.back")
                nState = await promptPlayer(state, preface);
                break;
            }
            case "try":
            default: {
                console.log(debug + ".catch.try")
                nState = await promptMove(state, preface, piece);
                break;
            }
        }
        return nState;
    }
}

async function promptJump(state: GameState, preface: string, piece: GamePiece): Promise<GameState> {
    var nState: GameState = state.clone();
    var x: number = piece.posX;
    var y: number = piece.posY;
    var nPiece: GamePiece = nState.board[y][x].piece!.clone();

    printBoardToConsole(nState.board);
    console.log(nPiece.jumpsToString());
    console.log("Format response like this -> targetX, targetY");
    var answer = await myInterface.question(preface + "Where would you like to move the piece currently at (" + x + ", " + y + ")? > ");
    try {
        // clean off the response 
        answer = answer.toLowerCase().trim();
        var strings: string[] = answer.split(',');
        var coordinates: number[] = [];
        // convert the string elements into numbers
        strings.forEach(position => {
            coordinates.push(parseInt(position));
        });
        // assign readable variables from user input
        var tX: number = coordinates[0];
        var tY: number = coordinates[1];

        // if two inputs are read from the player response
        if (tX !== undefined && tY !== undefined) {
            // for each jump that the piece could make, check if there is a match
            for (var i: number = 0; i < nPiece.aMoves.length; i++) {
                if (nPiece.aMoves[i][0] == tX && // x pos matches
                    nPiece.aMoves[i][1] == tY &&  // y pos matches
                    nPiece.aMoves[i][2] == 1) { // the move is a jump
                    // move the piece
                    nState = movePiece(nState, nState.currentPlayerID!, nPiece, nPiece.aMoves[i]);

                    // check if another jump can be made
                    nPiece = nState.board[tY][tX].piece!;
                    for (var j: number = 0; j < nPiece.aMoves.length; j++) {
                        if (nPiece.aMoves[j][2] == 1) {
                            nState = await promptJump(nState, preface, nPiece);
                            return nState;
                        }
                    }
                    return nState;
                }
            }
        }
        // if no valid moves have been found
        console.log("\nYou cannot make that jump with the piece at (" + x + ", " + y + "). Please input a vaid move to continue.");
        nState = await promptJump(state, preface, piece);
        return nState;
    }
    catch (error) {
        var answer: string = await myInterface.question("That was not a valid response. Would you like to TRY again, or go BACK? >");
        // clean off the response 
        answer = answer.toLowerCase().trim();
        switch (answer) {
            case "back": {
                nState = await promptPlayer(state, preface);
                break;
            }
            case "try":
            default: {
                nState = await promptJump(state, preface, piece);
                break;
            }
        }
        return nState;
    }
}

// given a piece and a coordinate, move that piece to the given 
//coordinate if it is on the piece's list of valid moves.
// -- boardState: gives the current board state before the piece moves
// -- tPlayerID: player initiating the move.
// -- tPiece: gives the information for the target piece to be moved
// -- tMove: gives the target gameSpace for the target piece to move to
function movePiece(state: GameState, tPlayerID: number, tPiece: GamePiece, tMove: number[]): GameState {
    var debug: string = "DEBUG.movePiece: ";
    // retermine if the piece exists
    if (typeof tPiece == "undefined") {
        console.log("That Piece doesn not exist. Please try again.\n");
        return state;
    }
    // create the gameState to be returned or edited
    var nState: GameState = state.clone();

    // execute the code to move the piece on the board
    // if (run) {
    var oldX: number = tPiece.posX;
    var oldY: number = tPiece.posY;

    var newX: number = tMove[0];
    var newY: number = tMove[1];

    var nPiece: GamePiece = tPiece.clone();
    var nColor: string = nState.board[oldY][oldX].color;
    // console.log("");
    // console.log(debug + "Moving Piece from (" + oldX + ", " + oldY + ") to (" + newX + ", " + newY + ") ");

    nState = removePieceFromBoardState(nState, tPiece);

    // modify the removed piece's xPos and yPos properties
    nPiece.posX = newX;
    nPiece.posY = newY;
    // set the piece's stored index to be the end of it's player's array
    nPiece.playerPieceID = nState.players[tPlayerID].pieces.length;

    // if the piece is at the opposite end of the board from which it started, king it
    switch (nState.currentPlayerID) {
        case 0: {
            if (newY == 7) {
                nPiece.kinged = true;
            }
            break;
        }
        case 1:
        default: {
            if (newY == 0) {
                nPiece.kinged = true;
            }
            break;
        }
    }

    // add the new piece back into the board list
    nState.board[newY][newX].piece = nPiece;
    nState.board[newY][newX].color = nColor;
    // console.log(debug + "Piece added back to Board's List " + nState.piecesToString());
    // add piece back to the player's array of pieces
    nState.players[tPlayerID].pieces.push(nPiece);
    // console.log(debug + "Piece Added Back to Player's List " + nState.players[tPlayerID].toString());

    // update the moves of all affected pieces
    if (tMove[2] < 1) { // no jumps involved
        nState = updateMoves(nState, nPiece, true, oldX, oldY);
    } else { // a jump was made
        // remove the jumped piece from the board
        nState = removePieceFromBoardState(nState, nState.board[tMove[4]][tMove[3]].piece!);

        // check if the game can end
        nState.players.forEach(player => {
            if (player.pieces.length < 1) {
                console.log("Game is over. Player" + (player.playerID + 1) + " lost");
                nState.end = true;
            }
        });
        nState = updateMoves(nState, nPiece, true, oldX, oldY, true, tMove[3], tMove[4]);
    }

    return nState;
}

// Update the available moves for this piece 
//and if moved, update any pieces the move or jump affected
//  -- boardState: board data and player data
//  -- piece: the piece to update the valid moves for
//  -- moved: mark if the piece was just moved, and thus if other pieces need to be updated
//  -- oldX: xPosition from before the piece moved
//  -- oldY: yPosition from before the piece moved
//  -- jumped: mark if the piece's last move was a jump, and thus updates for pieces adjacent to the jumped space
//  -- movedX: xPosition of space jumped over
//  -- movedY: yPosition of space jumped over
function updateMoves(boardState: GameState, piece: GamePiece,
    moved?: Boolean, oldX?: number, oldY?: number,
    jumped?: Boolean, jumpedX?: number, jumpedY?: number): GameState {
    var debug: string = "DEBUG.updateMoves: ";

    var nState: GameState = boardState.clone();

    if (typeof piece !== 'undefined') { // if there is a piece in the space we are looking at, update that piece's moves
        var nPiece: GamePiece = piece.clone();
        var team: number = piece.playerID;
        var x: number = nPiece.posX;
        var y: number = nPiece.posY;
        var nMoves: number[][] = []; // empty list for the new version of moves available to the piece
        // console.log("----------------------------");
        // console.log(debug + "copying data from piece at (" + x + ", " + y + ")");
        // console.log(debug + "Piece's index in player list: " + nPiece.playerPieceID)
        // console.log(debug + nPiece.toString());

        // update this piece's available moves
        switch (nPiece.kinged) {
            // if kinged, check all adjacent spots for movement
            case true: {
                //console.log("DEBUG.updateMoves.updatingKingedMoves for Piece at ("+x+", "+y+").");
                // check northWest available moves
                var northWest = checkValidMove(nState.board, x, y, team, 0);
                if (typeof northWest !== 'undefined') {
                    nMoves.push(northWest);
                }

                // check northEast available moves
                var northEast = checkValidMove(nState.board, x, y, team, 1);
                if (typeof northEast !== 'undefined') {
                    nMoves.push(northEast);
                }

                // check southEast available moves
                var southEast = checkValidMove(nState.board, x, y, team, 2);
                if (typeof southEast !== 'undefined') {
                    nMoves.push(southEast);
                }

                // check southWest available moves
                var southWest = checkValidMove(nState.board, x, y, team, 3);
                if (typeof southWest !== 'undefined') {
                    nMoves.push(southWest);
                }
                break;
            }
            // else, check adjacent spots in the direciton of the player's movement
            default: {
                // console.log(debug + ".updatingBaseMoves for Piece at (" + x + ", " + y + ").");
                switch (team) {
                    // adjacent spots for Player 1
                    case 0: {
                        // check southEast available moves
                        var southEast = checkValidMove(nState.board, x, y, team, 2);
                        if (typeof southEast !== 'undefined') {
                            nMoves.push(southEast);
                        }

                        // check southWest available moves
                        var southWest = checkValidMove(nState.board, x, y, team, 3);
                        if (typeof southWest !== 'undefined') {
                            nMoves.push(southWest);
                        }
                        break;
                    }
                    // adjacent spots for Player 2
                    default: {
                        // check northEast available moves
                        var northEast = checkValidMove(nState.board, x, y, team, 1);
                        if (typeof northEast !== 'undefined') {
                            nMoves.push(northEast);
                        }

                        // check northWest available moves
                        var northWest = checkValidMove(nState.board, x, y, team, 0);
                        if (typeof northWest !== 'undefined') {
                            nMoves.push(northWest);
                        }
                        break;
                    }
                }
                break;
            }
        }

        // collect the new moves for the piece into the piece's array of moves
        nPiece.aMoves = nMoves;
        // add those moves to the piece in the GameState list 
        nState.board[y][x].piece! = nPiece;
        // add those moves to the piece in the Player's list of pieces 
        nState.players[team].pieces[nPiece.playerPieceID] = nPiece;

        // if this piece has changed any values, output the changes made.
        // if (nMoves.length > 0) {
        //     console.log(debug + "Listing modified moves for Player " + (team + 1));
        //     console.log(debug + nState.players[team].movesToString());
        // }
    }

    // if calling method after a piece just moved, update available moves for affected pieces
    if (typeof moved !== 'undefined' && typeof oldX !== 'undefined' && typeof oldY !== 'undefined') { // if moved is defined, then oldK and oldY will be defined too
        // console.log("_______________________________")
        // update moves of pieces next to the moved piece's new space
        if (typeof piece !== 'undefined') {
            var x: number = piece.posX;
            var y: number = piece.posY;
            // console.log(debug + ".updatingAffectedPieces adjacent to (" + x + ", " + y + ").");
            // check northWest space for adjacent piece to update
            if (isAdjacentOccupied(nState.board, x, y, 0)) {
                nState = updateMoves(nState, nState.board[y - 1][x - 1].piece!);
                // check for jumps being blocked by this piece moving
                if(isAdjacentOccupied(nState.board, x - 1, y - 1, 0)){
                    nState = updateMoves(nState, nState.board[y - 2][x - 2].piece!);
                }
            }
            // check northEast space for adjacent piece to update
            if (isAdjacentOccupied(nState.board, x, y, 1)) {
                nState = updateMoves(nState, nState.board[y - 1][x + 1].piece!);
                // check for jumps being blocked by this piece moving
                if(isAdjacentOccupied(nState.board, x + 1, y - 1, 1)){
                    nState = updateMoves(nState, nState.board[y - 2][x + 2].piece!);
                }
            }
            // check southEast space for adjacent piece to update
            if (isAdjacentOccupied(nState.board, x, y, 2)) {
                nState = updateMoves(nState, nState.board[y + 1][x + 1].piece!);
                // check for jumps being blocked by this piece moving
                if(isAdjacentOccupied(nState.board, x + 1, y + 1, 2)){
                    nState = updateMoves(nState, nState.board[y + 2][x + 2].piece!);
                }
            }
            // check southWest space for adjacent piece to update
            if (isAdjacentOccupied(nState.board, x, y, 3)) {
                nState = updateMoves(nState, nState.board[y + 1][x - 1].piece!);
                // check for jumps being blocked by this piece moving
                if(isAdjacentOccupied(nState.board, x - 1, y + 1, 4)){
                    nState = updateMoves(nState, nState.board[y + 2][x - 2].piece!);
                }
            }
        }

        // console.log(debug + ".updatingAffectedPieces adjacent to (" + oldX + ", " + oldY + ").");
        // check northWest space for adjacent piece to update
        if (isAdjacentOccupied(nState.board, oldX!, oldY!, 0)) {
            nState = updateMoves(nState, nState.board[oldY! - 1][oldX! - 1].piece!);
            // check for jumps unblocked by this piece moving
            if(isAdjacentOccupied(nState.board, oldX - 1, oldY - 1, 0)){
                nState = updateMoves(nState, nState.board[oldY - 2][oldX - 2].piece!);
            }
        }
        // check northEast space for adjacent piece to update
        if (isAdjacentOccupied(nState.board, oldX!, oldY!, 1)) {
            nState = updateMoves(nState, nState.board[oldY! - 1][oldX! + 1].piece!);
            // check for jumps unblocked by this piece moving
            if(isAdjacentOccupied(nState.board, oldX + 1, oldY - 1, 1)){
                nState = updateMoves(nState, nState.board[oldY - 2][oldX + 2].piece!);
            }
        }
        // check southEast space for adjacent piece to update
        if (isAdjacentOccupied(nState.board, oldX!, oldY!, 2)) {
            nState = updateMoves(nState, nState.board[oldY! + 1][oldX! + 1].piece!);
            // check for jumps unblocked by this piece moving
            if(isAdjacentOccupied(nState.board, oldX + 1, oldY + 1, 2)){
                nState = updateMoves(nState, nState.board[oldY + 2][oldX + 2].piece!);
            }
        }
        // check southWest space for adjacent piece to update
        if (isAdjacentOccupied(nState.board, oldX!, oldY!, 3)) {
            nState = updateMoves(nState, nState.board[oldY! + 1][oldX! - 1].piece!);
            // check for jumps unblocked by this piece moving
            if(isAdjacentOccupied(nState.board, oldX - 1, oldY + 1, 3)){
                nState = updateMoves(nState, nState.board[oldY + 2][oldX - 2].piece!);
            }
        }

        // if the move was a jump, update pieces adjacent to jumped space
        if (typeof jumped !== 'undefined' && typeof jumpedX !== 'undefined' && typeof jumpedY !== 'undefined') { // if jumped is defined, then jumpedX and jumpedY will be defined as well
            // console.log(debug + ".updatingJumpedPieces adjacent to (" + jumpedX + ", " + jumpedY + ").");
            // check top northWest for adjacent piece to update
            if (isAdjacentOccupied(nState.board, jumpedX!, jumpedY!, 0)) {
                nState = updateMoves(nState, nState.board[jumpedY! - 1][jumpedX! - 1].piece!);
                // check for jumps unblocked by this piece moving
                if(isAdjacentOccupied(nState.board, jumpedX! - 1, jumpedY! - 1, 0)){
                    nState = updateMoves(nState, nState.board[jumpedY! - 2][jumpedX! - 2].piece!);
                }
            }
            // check top northEast for adjacent piece to update
            if (isAdjacentOccupied(nState.board, jumpedX!, jumpedY!, 1)) {
                nState = updateMoves(nState, nState.board[jumpedY! - 1][jumpedX! + 1].piece!);
                // check for jumps unblocked by this piece moving
                if(isAdjacentOccupied(nState.board, jumpedX! + 1, jumpedY! - 1, 1)){
                    nState = updateMoves(nState, nState.board[jumpedY! - 2][jumpedX! + 2].piece!);
                }
            }
            // check southEast space for adjacent piece to update
            if (isAdjacentOccupied(nState.board, jumpedX!, jumpedY!, 2)) {
                nState = updateMoves(nState, nState.board[jumpedY! + 1][jumpedX! + 1].piece!);
                // check for jumps unblocked by this piece moving
                if(isAdjacentOccupied(nState.board, jumpedX! + 1, jumpedY! + 1, 2)){
                    nState = updateMoves(nState, nState.board[jumpedY! + 2][jumpedX! + 2].piece!);
                }
            }
            // check southWest space for adjacent piece to update
            if (isAdjacentOccupied(nState.board, jumpedX!, jumpedY!, 3)) {
                nState = updateMoves(nState, nState.board[jumpedY! + 1][jumpedX! - 1].piece!);
                // check for jumps unblocked by this piece moving
                if(isAdjacentOccupied(nState.board, jumpedX! - 1, jumpedY! + 1, 3)){
                    nState = updateMoves(nState, nState.board[jumpedY! + 2][jumpedX! - 2].piece!);
                }
            }
        }
    }
    return nState;
}

// remove a reference to a game piece from the board and from the player's list of pieces
// -- state: game state to remove the piece from. Will contain board data and player data
// -- piece: piece to be removed
function removePieceFromBoardState(state: GameState, piece: GamePiece): GameState {
    var nState: GameState = state.clone();
    var x: number = piece.posX;
    var y: number = piece.posY;
    var pL: GamePiece[] = [];
    var pLIndex: number = 0;
    var debug: string = "DEBUG.removePieceFromBoardState: ";

    // remove reference from board
    nState.board[y][x].piece = undefined;
    // reset the space's color
    nState.board[y][x].color = paintSquare(x, y);
    // reset stored index value of remaining pieces the player controls on the board
    nState.board.forEach(col => {
        col.forEach(space => {
            if (space.piece !== undefined) {
                if (space.piece.playerID == piece.playerID) { // the piece is controlled by the same player
                    // add the piece to new list of pieces controlled by the player
                    space.piece.playerPieceID = pLIndex;
                    pLIndex++;
                    pL.push(space.piece);
                    // console.log(debug + space.piece.toString());
                }
            }
        });
    });

    // reset Player's array with newly-generated array of remaining pieces on board
    nState.players[piece.playerID].pieces = pL;
    // console.log(debug + "Piece Removed from Game State at (" + x + ", " + y + ") " + nState.piecesToString());
    // console.log(debug + "Listing new player piece lists: ");
    // console.log(nState.players[piece.playerID].movesToString());

    return nState;
}


// return a coordinate if the requested move is valid
//  -- board: grid of current game spaces and layout of pieces
//  -- x: x position of the space to move from
//  -- y: y position of the space to move from
//  -- p: player ID of the player looking to move.
//  -- direction: number indicating the direction the piece is trying to move
//      // 0= northWest, 1=northEast, 2=southEast, 3=southWest
function checkValidMove(board: GameSpace[][], x: number, y: number, p: number, direction: number): number[] | undefined {
    var debug: string = "DEBUG.checkValidMove: ";
    // console.log(debug + "Checking Move Pattern for (" + x + ", " + y + "), in the " + direction + " direction.");
    var validMove: number[] | undefined = undefined;
    switch (direction) {
        case 0: { // northWest
            // check northWest adjacent space
            if (isAdjacentOccupied(board, x, y, direction)) {
                if (canJump(board, x, y, p, direction)) {
                    // add the position to the valid moves
                    validMove = [x - 2, y - 2, 1, x - 1, y - 1];
                    // console.log(debug + ".loggingJump: Piece at (" + x + ", " + y + ") can jump over piece at " +
                    //     "(" + validMove[3] + ", " + validMove[4] + ") to land at (" + validMove[0] + ", " + validMove[1] + ")");
                }
            } else {
                // target Space
                var tX: number = x - 1;
                var tY: number = y - 1;
                // if the adjacent space is inside the borders of the board
                if (isTargetOnBoard(board, tX, tY)) {
                    // add the posiiton to the valid move
                    validMove = [tX, tY, 0, 0, 0];
                    // console.log(debug + ".loggingMove: Piece at (" + x + ", " + y + ") can move to (" + validMove[0] + ", " + validMove[1] + ")");
                }
            }
            return validMove;
        }
        case 1: { // northEast
            // check northEast adjacent space
            if (isAdjacentOccupied(board, x, y, direction)) {
                if (canJump(board, x, y, p, direction)) {
                    // add the position to the valid moves
                    validMove = [x + 2, y - 2, 1, x + 1, y - 1];
                    // console.log(debug + ".loggingJump: Piece at (" + x + ", " + y + ") can jump over piece at " +
                    // "(" + validMove[3] + ", " + validMove[4] + ") to land at (" + validMove[0] + ", " + validMove[1] + ")");
                }
            } else {
                // target Space
                var tX: number = x + 1;
                var tY: number = y - 1;
                // if the adjacent space is inside the borders of the board
                if (isTargetOnBoard(board, tX, tY)) {
                    // add the posiiton to the valid move
                    validMove = [tX, tY, 0, 0, 0];
                    // console.log(debug + ".loggingMove: Piece at (" + x + ", " + y + ") can move to (" + validMove[0] + ", " + validMove[1] + ")");
                }
            }
            return validMove;
        }
        case 2: { // southEast
            // check southEast adjacent space
            if (isAdjacentOccupied(board, x, y, direction)) {
                if (canJump(board, x, y, p, direction)) {
                    // add the position to the valid moves
                    validMove = [x + 2, y + 2, 1, x + 1, y + 1];
                    // console.log(debug + ".loggingJump: Piece at (" + x + ", " + y + ") can jump over piece at " +
                    //     "(" + validMove[3] + ", " + validMove[4] + ") to land at (" + validMove[0] + ", " + validMove[1] + ")");
                }
            } else {
                // target Space
                var tX: number = x + 1;
                var tY: number = y + 1;
                // if the adjacent space is inside the borders of the board
                if (isTargetOnBoard(board, tX, tY)) {
                    // add the posiiton to the valid move
                    validMove = [tX, tY, 0, 0, 0];
                    // console.log(debug + ".loggingMove: Piece at (" + x + ", " + y + ") can move to (" + validMove[0] + ", " + validMove[1] + ")");
                }
            }
            return validMove;
        }
        case 3: { // southWest
            // check southWest adjacent space
            if (isAdjacentOccupied(board, x, y, direction)) {
                if (canJump(board, x, y, p, direction)) {
                    // add the position to the valid moves
                    validMove = [x - 2, y + 2, 1, x - 1, y + 1];
                    // console.log(debug + ".loggingJump: Piece at (" + x + ", " + y + ") can jump over piece at " +
                    //     "(" + validMove[0][3] + ", " + validMove[4] + ") to land at (" + validMove[0] + ", " + validMove[1] + ")");
                }
            } else {
                // target Space
                var tX: number = x - 1;
                var tY: number = y + 1;
                // if the adjacent space is inside the borders of the board
                if (isTargetOnBoard(board, tX, tY)) {
                    // add the posiiton to the valid move
                    validMove = [tX, tY, 0, 0, 0];
                    // console.log(debug + ".loggingMove: Piece at (" + x + ", " + y + ") can move to (" + validMove[0] + ", " + validMove[1] + ")");
                }
            }
            return validMove;
        }
        default: {
            return validMove;
        }
    }
}

// checks if the space adjacent to the piece is occupied
//  -- board: grid of current game spaces and layout of pieces
//  -- x: x position of the piece trying to move
//  -- y: y position of the piece trying to move
//  -- direction: number indicating the direction the piece is trying to move
//      // 0= northWest, 1=northEast, 2=southEast, 3=southWest
function isAdjacentOccupied(board: GameSpace[][], x: number, y: number, direction: number): boolean {
    var debug: string = "DEBUG.isAdjacentOccupied: ";
    // console.log(debug + "Checking adjacent space for a piece next to (" + x + ", " + y +
    //     "), in the " + direction + " direction.");
    var result: boolean = false;
    switch (direction) {
        case 0: { // northWest
            // target Space
            var tX: number = x - 1;
            var tY: number = y - 1;
            // console.log(debug + "Checking target space (" + tX + ", " + tY + ")");
            // if the adjacent space is inside the borders of the board
            if (isTargetOnBoard(board, tX, tY)) {
                result = typeof board[tY][tX].piece !== 'undefined';
                // console.log(debug + "(" + tX + ", " + tY + ") is occupied - " + result);
                return result;
            }
            // console.log(debug + "isAdjacent.output = " + result);
            return result;
        }
        case 1: { // northEast
            // target Space
            var tX: number = x + 1;
            var tY: number = y - 1;
            // console.log(debug + "Checking target space (" + tX + ", " + tY + ")");
            // if the adjacent space is inside the borders of the board
            if (isTargetOnBoard(board, tX, tY)) {
                result = typeof board[tY][tX].piece !== 'undefined';
                // console.log(debug + "(" + tX + ", " + tY + ") is occupied - " + result);
                return result;
            }
            // console.log(debug + "isAdjacent.output = " + result);
            return result;
        }
        case 2: { // southEast
            // target Space
            var tX: number = x + 1;
            var tY: number = y + 1;
            // console.log(debug + "Checking target space (" + tX + ", " + tY + ")");
            // if the adjacent space is inside the borders of the board
            if (isTargetOnBoard(board, tX, tY)) {
                result = typeof board[tY][tX].piece !== 'undefined';
                // console.log(debug + "(" + tX + ", " + tY + ") is occupied - " + result);
                return result;
            }
            // console.log(debug + "isAdjacent.output = " + result);
            return result;
        }
        case 3: { // southWest
            // target Space
            var tX: number = x - 1;
            var tY: number = y + 1;
            // console.log(debug + "Checking target space (" + tX + ", " + tY + ")");
            // if the adjacent space is inside the borders of the board
            if (isTargetOnBoard(board, tX, tY)) {
                result = typeof board[tY][tX].piece !== 'undefined';
                // console.log(debug + "(" + tX + ", " + tY + ") is occupied - " + result);
                return result;
            }
            // console.log(debug + "isAdjacent.output = " + result);
            return result;
        }
        default: {
            // console.log(debug + "isAdjacent.output = " + result);
            return result;
        }
    }
}

function isTargetOnBoard(board: GameSpace[][], x: number, y: number): boolean {
    var isOnBoard: boolean = false;
    isOnBoard = x < board.length && x >= 0 && y < board.length && y >= 0;
    // console.log("DEBUG.isTargetOnBoard: Looking at potential space (" + x + ", " + y + "). Its existance is " + isOnBoard)
    return isOnBoard;
}

// checks if the space opposite an adjacent piece is open
//and if the piece to be jumped is friendly or an enemy
//  -- board: grid of current game spaces and layout of pieces
//  -- x: x position of the piece trying to jump
//  -- y: y position of the piece trying to jump
//  -- p: player ID for the piece. 
//  -- direction: number indicating the direction the piece is trying to jump
//      // 0= northWest, 1=northEast, 2=southEast, 3=southWest
function canJump(board: GameSpace[][], x: number, y: number, p: number, direction: number): boolean {
    var debug: string = "DEBUG.canJump: ";
    /*console.log(debug + "Checking Jump Pattern for (" + x + ", " + y + "), in the " + direction +
        " direction.");*/
    var result: boolean = false;
    // check if the square to be jumped exists, and if the square to land in exists
    switch (direction) {
        case 0: { // northWest
            // target Space
            var tX: number = x - 2;
            var tY: number = y - 2;
            // jumped Space
            var jX: number = x - 1;
            var jY: number = y - 1;
            // if the jumped space and the target space are inside the borders of the board
            if (isTargetOnBoard(board, jX, jY) && isTargetOnBoard(board, tX, tY)) {
                // if the space over the jumpee has a piece
                if (typeof board[tY][tX].piece == 'undefined' && typeof board[jY][jX].piece !== 'undefined') {
                    result = board[jY][jX].piece!.playerID !== p;
                    // console.log(debug + "jumpable piece is on enemy team - " + result);
                    // return if the piece to be jumped is an enemy piece.
                    return result;
                }
            }
            // console.log(debug + "canJump.result = " + result);
            return result;
        }
        case 1: { // northEast
            // target Space
            var tX: number = x + 2;
            var tY: number = y - 2;
            // jumped Space
            var jX: number = x + 1;
            var jY: number = y - 1;
            // if the jumped space and the target space are inside the borders of the board
            if (isTargetOnBoard(board, jX, jY) && isTargetOnBoard(board, tX, tY)) {
                // if the space over the jumpee has a piece
                if (typeof board[tY][tX].piece == 'undefined' && typeof board[jY][jX].piece !== 'undefined') {
                    result = board[jY][jX].piece!.playerID !== p;
                    // console.log(debug + "jumpable piece is on enemy team - " + result);
                    // return if the piece to be jumped is an enemy piece.
                    return result;
                }
            }
            // console.log(debug + "canJump.result = " + result);
            return result;
        }
        case 2: { // southEast
            // target Space
            var tX: number = x + 2;
            var tY: number = y + 2;
            // jumped Space
            var jX: number = x + 1;
            var jY: number = y + 1;
            // if the jumped space and the target space are inside the borders of the board
            if (isTargetOnBoard(board, jX, jY) && isTargetOnBoard(board, tX, tY)) {
                // if the space over the jumpee has a piece
                if (typeof board[tY][tX].piece == 'undefined' && typeof board[jY][jX].piece !== 'undefined') {
                    result = board[jY][jX].piece!.playerID !== p;
                    // console.log(debug + "jumpable piece is on enemy team - " + result);
                    // return if the piece to be jumped is an enemy piece.
                    return result;
                }
            }
            // console.log(debug + "canJump.result = " + result);
            return result;
        }
        case 3: { // southWest
            // target Space
            var tX: number = x - 2;
            var tY: number = y + 2;
            // jumped Space
            var jX: number = x - 1;
            var jY: number = y + 1;
            // if the jumped space and the target space are inside the borders of the board
            if (isTargetOnBoard(board, jX, jY) && isTargetOnBoard(board, tX, tY)) {
                // if the space over the jumpee has a piece
                if (typeof board[tY][tX].piece == 'undefined' && typeof board[jY][jX].piece !== 'undefined') {
                    result = board[jY][jX].piece!.playerID !== p;
                    // console.log(debug + "jumpable piece is on enemy team - " + result);
                    // return if the piece to be jumped is an enemy piece.
                    return result;
                }
            }
            // console.log(debug + "canJump.result = " + result);
            return result;
        }
        default: {
            // console.log(debug + "canJump.result = " + result);
            return result;
        }
    }
}

function paintSquare(x: number, y: number): string {
    var color: string = "";

    if (Math.abs((x % 2) + (-1 * (y % 2))) == 0) {
        color = "\x1b[41m   \x1b[0m"; // Red Square
    } else {
        color = "\x1b[40m   \x1b[0m"; // Black Square
    }
    /*// check for the color the space should be
    switch (yMod) {
        case 1: {// if y is even
            switch (xMod) {
                case 1: { // and if x is even
                    color = "\x1b[41m   \x1b[0m"; // Red Square
                }
                default: {// and if x is odd
                    color = "\x1b[40m   \x1b[0m"; // Black Square
                }
            }
        }
        default: {// if y is odd
            switch (xMod) {
                case 1: { // and if x is even
                    color = "\x1b[40m   \x1b[0m"; // Black Square
                }
                default: {// and if x is odd
                    color = "\x1b[41m   \x1b[0m"; // Red Square
                }
            }
        }
    }*/
    return color;
}

function addPieceToSquareColor(piece: GamePiece, red: boolean): string {
    var result: string = "";
    if (red) {
        result = "\x1b[41m " + generatePieceIcon(piece) + " \x1b[0m"; // Red Square
    } else {
        result = "\x1b[40m " + generatePieceIcon(piece) + " \x1b[0m"; // Black Square
    }

    return result;
}

// return an ascii icon for each player's pieces
//  -- piece: game piece to be translated into a ascii character
function generatePieceIcon(piece: GamePiece) {
    var string: String = "";
    switch (piece.playerID) {
        case 0: {
            string = "1"; // player 1 ascii piece
            break;
        }
        default: {
            string = "2"; // player 2 ascii piece
            break;
        }
    }
    return string;
}

// Builds a Checkers game board given a pre-generated board
//  -- board: pass in an existing board state
//  -- redStart: True="start pieces on Red", False="start pieces on Black"
function buildCheckersBoard(tempBoard: GameSpace[][], redStart: boolean): GameState {
    var debug: string = "DEBUG.buildCheckersBoard: ";
    var color: boolean = true; // used for making checker pattern
    // define new lists for each player
    var p1: GamePiece[] = [];
    var p2: GamePiece[] = [];

    // add pieces to the playing color in the first 3 and last 3 rows of the board
    for (var y: number = 0; y < 8; y++) {
        debug += "\n    ";
        for (var x: number = 0; x < 8; x++) {
            debug += "(" + x + ", " + y + ", isRed: " + color;
            // fill squares in top 3 rows with player 1 pieces
            if (y < 3 && color == redStart) {
                var tempPiece: GamePiece = new GamePiece(false, 0, 0, x, y, []);
                p1.push(tempPiece);
                tempBoard[y][x] = new GameSpace(
                    addPieceToSquareColor(tempPiece, color),
                    tempPiece
                );
                debug += ", Team " + tempPiece.playerID + "), ";
            }
            // fill squares in bottom 3 rows with player 2 pieces
            else if (y > 4 && color == redStart) {
                var tempPiece: GamePiece = new GamePiece(false, 1, 0, x, y, []);
                p2.push(tempPiece);
                tempBoard[y][x] = new GameSpace(
                    addPieceToSquareColor(tempPiece, color),
                    tempPiece
                );
                debug += ", Team " + tempPiece.playerID + "), ";
            } else {
                debug += "),         ";
            }
            color = !color; // reverse color to create checkered pattern
            // printBoardToConsole(tempBoard);
        }
        color = !color;// reverse color to create checkered pattern
    }
    // console.log(debug);
    // create game state with the generated data
    var nState = new GameState(
        [new Player(0, p1), new Player(1, p2)],
        tempBoard,
        false
    );
    // update the pieces of player 1 to have their starting available moves
    for (var i: number = 0; i < p1.length; i++) {
        p1[i].playerPieceID = i;
        nState = updateMoves(nState, p1[i]);
    }
    // update the pieces of player 2 to have their starting available moves
    for (var i: number = 0; i < p1.length; i++) {
        p2[i].playerPieceID = i;
        nState = updateMoves(nState, p2[i]);
    }
    return nState;
}

// funciton which builds blank red-black checkered board
function buildBasicBoard(): GameSpace[][] {
    var board: GameSpace[][] = []; // make an empty 2D Array
    var debug: string = "DEBUG.buildBasicBoard: "
    for (var y: number = 0; y < 8; y++) {
        var col: GameSpace[] = []; // define empty 1D Array for new Board Column
        // Fill board column with colored spaces
        for (var x: number = 0; x < 8; x++) {
            var space: GameSpace = new GameSpace(paintSquare(x, y));
            col.push(space);
            debug += "(" + x + ", " + y + "), ";
        }
        // add filled column to 2D Array
        board.push(col);
    }
    // console.log(debug);
    return board;
}

// print the given board
function printBoardToConsole(pBoard: GameSpace[][]) {
    console.log("---------------------------");
    console.log("    0  1  2  3  4  5  6  7 ");
    for (var y: number = 0; y < 8; y++) {
        var column: string = " " + y.toString() + " ";
        for (var x: number = 0; x < 8; x++) {
            column += pBoard[y][x].color;
        }
        console.log(column);
    }
    console.log("---------------------------");
}

function printTestBoard() {
    var checkers: GameState = buildCheckersBoard(buildBasicBoard(), true);
    printBoardToConsole(checkers.board);
    console.log(checkers.players[0].movesToString());
    console.log(checkers.players[1].movesToString());
    // move a piece for player 1
    checkers.currentPlayerID = 0;
    checkers = movePiece(checkers, 0, checkers.board[2][4].piece!, checkers.board[2][4].piece!.aMoves[0]);
    // move a piece for player 2 to allow player 1 to jump the moved piece
    checkers.currentPlayerID = 1;
    checkers = movePiece(checkers, 1, checkers.board[5][7].piece!, checkers.board[5][7].piece!.aMoves[0]);
    // Player 1 jumps over player 2's piece
    checkers.currentPlayerID = 0;
    checkers = movePiece(checkers, 0, checkers.board[3][5].piece!, checkers.board[3][5].piece!.aMoves[0]);

    printBoardToConsole(checkers.board);
    console.log(checkers.players[0].movesToString());
    console.log(checkers.players[1].movesToString());
}

function printRules() {
    console.log("Welcome to a fun game of Checkers!")
    console.log("-- The Rules are simple. Your goal is to capture all of \n" +
        "-- the other player's pieces by jumping over them with \n" +
        "-- your pieces.");
    console.log("-- Pieces can MOVE 1 space at a time, and can only move \n" +
        "-- diagonaly in certain directions at the begining of play. \n" +
        "-- Player 1's Pieces can move towards the bottom of the board, \n" +
        "-- and Player 2's pieces can move towards the top of the \n" +
        "-- board. Any piece which makes it to the opposite end of \n" +
        "-- the board can move in any diagonal direction.");
    console.log("-- JUMPS can be made when an enemy piece is in a space your \n" +
        "-- piece would normally be able to move to. If the spot \n" +
        "-- directly accross the enemy piece from your piece is open, \n" +
        "-- you may move your piece to that open spot. The enemy piece \n" +
        "-- you jumped over is then removed from the board.");
}
// // remove a game piece from the given array and return the new array
// // -- pieces: the array of pieces to be edited
// // -- piece: the piece to be removed from the array
// function removePieceFromArray(pieces: GamePiece[], piece: GamePiece): GamePiece[] {
//     var nPieces: GamePiece[] = pieces;
//     var index: number = piece.playerPieceID;
//     var debug: string = "DEBUG.removePieceFromArray: ";
//     // console.log(debug + "Removing piece formerly at (" + piece.posX + ", " + piece.posY + ") from Player " + (piece.playerID + 1) + "'s array of controled pieces.")
//     console.log(debug + "Removing piece from index " + index + " of player " + (piece.playerID + 1) + "'s list");
//     nPieces.splice(index, 1);
//     // reduce the stored index of pieces past the removed piece by one.
//     for (var i: number = index; i < nPieces.length; i++) {
//         nPieces[i].playerPieceID -= 1;
//         console.log(debug + nPieces[i].toString());
//     }
//     return nPieces;
// }