import { ChessBoard } from "./chess2.js";
import { socketID , LOSE_TEXT, WIN_TEXT, disconnectText, DISCONNECT_TIMER_START } from "./helper-js/utils.js";
import { getQuerystring } from "./helper-js/utils.js"
import { Cookie } from "./helper-js/cookieManager.js"
import { Bear } from "./pieces-js/Bear.js";
import { Elephant } from "./pieces-js/Elephant.js";
import { FishQueen } from "./pieces-js/FishQueen.js";
import { Monkey } from "./pieces-js/Monkey.js";
import { Fish } from "./pieces-js/Fish.js";
import { King } from "./pieces-js/King.js";
import { Queen } from "./pieces-js/Queen.js";
import { Rook } from "./pieces-js/Rook.js";
import { Position } from "./helper-js/board.js"
import { GameLauncher } from "./game/GameLauncher.js";
import { DOMPlugin } from "./game/DOMPlugin.js";
import { MultiplayerPlugin } from "./game/MultiplayerPlugin.js";
import { TimerPlugin } from "./game/TimerPlugin.js";
import { DOMBoardPlugin } from "./game/DOMBoardPlugin.js";

export const onLoad = async (styleSheet, styleName) => {

    let {roomID, friendRoom, timeLimit} = getQuerystring()

    if (!globalThis.cookie) globalThis.cookie = new Cookie();

    let playerID = parseInt(globalThis.cookie.pid)

    if (roomID == undefined){
        roomID = null
    }

    // covered
    let turn_Dom = document.getElementById("turn")
    turn_Dom.innerText = "...Waiting for player to join"
    turn_Dom.style.backgroundColor = 'white'

    let socket = io(socketID())

    const launcher = new GameLauncher({ debug: true });
    launcher.init();
    launcher.install(new DOMPlugin());
    launcher.install(new DOMBoardPlugin({ styleSheet, styleName }));
    launcher.install(new TimerPlugin());
    launcher.install(new MultiplayerPlugin({ socket }));

    const game = launcher.game;

    // === TEMPORARY: update variables used by unmigrated code ===
    game.on('state.roomID', (_, v) => roomID = v);
    game.on('state.playerID', (_, v) => playerID = v);
    // === END TEMPORARY ===

    let chessBoard = game.plugins['DOMBoardPlugin'].board;

    let reversedPointer = { 
        get reversed(){
            return game.get('reversed');
        },
        set reversed(v){
            console.log("set reversed", v)
            game.set('reversed', v);
            // if (flipBoard && chessBoard) flipBoard(chessBoard.isWhite);
        }
    }

    socket.on("registeredMove", args=>{
        console.log('REGISTER', args)
        // TODO: MoveInfo class to encapsulate serialize/deserialize logic
        if ( args.moveInfo.toPos )
            args.moveInfo.toPos = new Position(args.moveInfo.toPos);
        if ( args.moveInfo.fromPos )
            args.moveInfo.fromPos = new Position(args.moveInfo.fromPos);

        if (roomID == args.room && playerID != args.player){
            if (chessBoard.validateMove(args.moveInfo.fromPos, args.moveInfo.toPos, args.moveInfo.newTurn)){
                chessBoard.makePreValidatedMove(args.moveInfo.fromPos, args.moveInfo.toPos);
                chessBoard.currentTurn = args.moveInfo.newTurn
            } else {
                console.error("move is not allowed")
            }
        }
    })
    
    document.addEventListener("mouseup", event => chessBoard.dragEnd(event))
    document.addEventListener("mousemove", event=>chessBoard.cursorMove(event))

    launcher.launch();
    return { chessBoard, reversedPointer };
}
