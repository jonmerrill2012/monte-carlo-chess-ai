var Chess = require('chess.js').Chess;
var prompt = require('prompt')

var evaluateBoard = require('./evaluate_board').evaluate

prompt.start()

var chess = new Chess()
prompt.get('FEN', function(err, result) {
  chess.load(result.FEN)
  console.log(evaluateBoard(chess))
})
