var Chess = require('chess.js').Chess
var prompt = require('prompt')
const constants = require('./constants')

var evaluateBoard = require('./evaluate_board')

prompt.start()

var chess = new Chess()
prompt.get('FEN', function (err, result) {
  if (err) {
    console.log(err)
    return
  }

  var fen = result.FEN
  evaluateBoard.searchTreeForBestMove(chess, fen, constants.mmDepth)
})
