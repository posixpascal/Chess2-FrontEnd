package boardmanager

import (
	"syscall/js"
	"fmt"
)

type pieceType string

const (
	Bear pieceType = "Bear"
	Elephant pieceType = "Elephant"
	Fish pieceType = "Fish"
	FishQueen pieceType = "FishQueen"
	King pieceType = "King"
	Monkey pieceType = "Monkey"
	Queen pieceType = "Queen"
	Rook pieceType = "Rook"
)

type tile struct {
	isWhite bool;
	pieceType pieceType;
}

// This is the ASCII code for the "a" character
const ASCII_OFFSET = 97;

// The 8x8 board, plus 2 jail positions for each player, plus bear starting position = 69
type gameBoard [69]tile

func (t tile) info() string {

	var color string
	if (t.pieceType == Bear){
		color = "G"
	} else if (t.isWhite){
		color = "W"
	} else {
		color = "B"
	}

	var secondaryChar string
	if (len(t.pieceType) > 4){
		secondaryChar = string(t.pieceType[4])
	} else {
		secondaryChar = " "
	}
	
	var primaryChar string
	if (len(t.pieceType) > 0){
		primaryChar = string(t.pieceType[0])
	} else {
		primaryChar = " "
	}

	return fmt.Sprintf("[%s %s%s]", color, primaryChar, secondaryChar)
}

func (gb gameBoard) print(){
	for i := 0; i < 8; i++ {
		for j := 0; j < 8; j++ {
			fmt.Print(gb[i*8+j].info())
		}
		fmt.Print("\n")
	}
}

func BoardRawToArrayBoard(boardRaw js.Value) gameBoard {
	
	var boardArray gameBoard;

	for i := 7; i > -1; i-- { // i corresponds to the number
		for j := 0; j < 8; j++ { // while j corresponds to the letter
			tileString := fmt.Sprintf("%s%d", string(rune(ASCII_OFFSET+j)), i+1)
			piece := boardRaw.Get(tileString)
			if (!piece.IsUndefined()){
				boardArray[j+(7-i)*8] = tile{
					isWhite: piece.Get("isWhite").Bool(),
					pieceType: (pieceType)(piece.Get("constructor").Get("name").String()),
				}
				fmt.Println( tileString, piece.Get("constructor").Get("name") )
			} else {
				fmt.Println( tileString, "undefined" )
			}
		}
	}
	// fmt.Println( boardArray )
	boardArray.print()
	return gameBoard{}
}