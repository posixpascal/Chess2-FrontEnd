import { ChessBoard } from "../chess2";
import { LOSE_TEXT } from "../helper-js/utils";

// Pieces
import { Bear } from "../pieces-js/Bear.js";
import { Elephant } from "../pieces-js/Elephant.js";
import { FishQueen } from "../pieces-js/FishQueen.js";
import { Monkey } from "../pieces-js/Monkey.js";
import { Fish } from "../pieces-js/Fish.js";
import { King } from "../pieces-js/King.js";
import { Queen } from "../pieces-js/Queen.js";
import { Rook } from "../pieces-js/Rook.js";

export class DOMBoardPlugin {
    constructor ({ styleSheet, styleName }) {
        this.styleSheet = styleSheet;
        this.styleName = styleName;
    }
    install (game) {
        this.board = new ChessBoard(
            game,
            (moveInfo)=>{

                // TODO: MoveInfo class to encapsulate serialize/deserialize logic
                if ( moveInfo.toPos ) moveInfo.toPos = moveInfo.toPos?.id || moveInfo.toPos;
                if ( moveInfo.fromPos ) moveInfo.fromPos = moveInfo.fromPos?.id || moveInfo.fromPos;

                console.log('EMIT', moveInfo)
                if (moveInfo.newTurn === undefined) debugger

                // launcher.events.emit('move.end', moveInfo);

                game.emit("request.commitMove", {
                    player: game.get('playerID'),
                    room: game.get('roomID'),
                    moveInfo
                })
            },
            game.emit.bind(game, 'request.admitDefeat', { message: LOSE_TEXT }),
            this.styleSheet, this.styleName
        )

        game.on('launch', this.launch.bind(this));

        game.on('request.reconnectData', () => {
            game.emit('request.sendReconnectData', {
                layout: Object.keys(this.board.boardLayout).map((val, index)=>{
                    return {
                        position: this.board.boardLayout[val].position.id, 
                        isWhite: this.board.boardLayout[val].isWhite, 
                        type: this.board.boardLayout[val].constructor.name, 
                        hasBanana: this.board.boardLayout[val].hasBanana,
                        key: val
                    }
                }), 
                rookActiveWhite: this.board.rookActiveWhite,
                rookActiveBlack: this.board.rookActiveBlack,
                currentTurn: this.board.currentTurn
            });
        });

        game.on('request.setBoardLayout', (_, args) => {
            const chessBoard = this.board;

            chessBoard.boardLayout = {};
            for (let i = 0; i < args.layout.length; i++){
                switch (args.layout[i].type) {
                    case Bear.name:
                        chessBoard.boardLayout[args.layout[i].key] = new Bear(args.layout[i].position)
                        break;
                    case Elephant.name:
                        chessBoard.boardLayout[args.layout[i].key] = 
                            new Elephant(args.layout[i].position, args.layout[i].isWhite)
                        break;
                    case Fish.name:
                        chessBoard.boardLayout[args.layout[i].key] = 
                            new Fish(args.layout[i].position, args.layout[i].isWhite)
                        break;
                    case FishQueen.name:
                        chessBoard.boardLayout[args.layout[i].key] = 
                            new FishQueen(args.layout[i].position, args.layout[i].isWhite)
                        break;
                    case King.name:
                        chessBoard.boardLayout[args.layout[i].key] = 
                            new King(args.layout[i].position, args.layout[i].isWhite)
                        chessBoard.boardLayout[args.layout[i].key].hasBanana = args.layout[i].hasBanana
                        break;
                    case Monkey.name:
                        chessBoard.boardLayout[args.layout[i].key] = 
                            new Monkey(args.layout[i].position, args.layout[i].isWhite)
                        break;
                    case Queen.name:
                        chessBoard.boardLayout[args.layout[i].key] = 
                            new Queen(args.layout[i].position, args.layout[i].isWhite)
                        break;
                    case Rook.name:
                        chessBoard.boardLayout[args.layout[i].key] = 
                            new Rook(args.layout[i].position, args.layout[i].isWhite)
                        break;
                    default:
                        break;
                }
            }

            chessBoard.rookActiveWhite = args.rookActiveWhite;
            chessBoard.rookActiveBlack = args.rookActiveBlack;
            chessBoard.currentTurn = args.currentTurn;

            chessBoard.updatePieces();

            // if the player was holding royalty piece when they disconnected
            if(
                chessBoard.boardLayout["TEMP"] &&
                (chessBoard.boardLayout["TEMP"].constructor.name == Queen.name || chessBoard.boardLayout["TEMP"].constructor.name == King.name) &&
                (
                    (chessBoard.currentTurn == "White Jail" && chessBoard.isWhite) ||
                    (chessBoard.currentTurn == "Black Jail" && !chessBoard.isWhite)
                )
            ){
                chessBoard.manageTakeKingOrQueen(chessBoard.boardLayout["TEMP"])
            } else if (
                chessBoard.boardLayout["TEMP"] &&
                chessBoard.boardLayout["TEMP"].constructor.name == Monkey.name
                
            ){

                if (
                    (chessBoard.currentTurn == "White Rescue" && chessBoard.isWhite) ||
                    (chessBoard.currentTurn == "Black Rescue" && !chessBoard.isWhite)
                ){
                    let location = null;
                    if (chessBoard.isWhite){
                        if (chessBoard.boardLayout["a4"] && chessBoard.boardLayout["a4"].constructor.name == King.name){
                            location = "a4"
                        } else if (chessBoard.boardLayout["a5"] && chessBoard.boardLayout["a5"].constructor.name == King.name){
                            location = "a5"
                        }
                    } else {
                        if (chessBoard.boardLayout["h4"] && chessBoard.boardLayout["h4"].constructor.name == King.name){
                            location = "h4"
                        } else if (chessBoard.boardLayout["h5"] && chessBoard.boardLayout["h5"].constructor.name == King.name){
                            location = "h5"
                        }
                    }
                    chessBoard.manageMonkeyJumping(chessBoard.boardLayout[location])
                } else if (
                    (chessBoard.currentTurn == "White Jumping" && chessBoard.isWhite) ||
                    (chessBoard.currentTurn == "Black Jumping" && !chessBoard.isWhite)
                ) {
                    chessBoard.manageMonkeyJumpingNonRescue()
                }
            }
        });
    }
    launch () {
        this.board.updatePieces();
    }
}