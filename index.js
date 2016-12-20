var Chess = require('chess.js').Chess
var prompt = require('prompt')

var evaluateBoard = require('./evaluate_board')

prompt.start()

var chess = new Chess()
prompt.get('FEN', function (err, result) {
  if (err) {
    console.log(err)
    return
  }

  var fen = result.FEN
  chess.load(fen)
  var moves = evaluateBoard.filterMoves(chess.moves({verbose: true}))
  var bestMove = {
    value: chess.turn() === 'w' ? -999 : 999,
    move: ''
  }
  for (var i = 0; i < moves.length; i++) {
    chess.move(moves[i])
    var evaluation = evaluateBoard.evaluate(chess)
    chess.load(fen)
    console.log((i + 1) + '/' + moves.length, moves[i].san, evaluation)
    if ((chess.turn() === 'w' && evaluation > bestMove.value) || (chess.turn() === 'b' && evaluation < bestMove.value)) {
      console.log('*** new best move')
      bestMove.value = evaluation
      bestMove.move = moves[i]
    }
  }
  console.log(bestMove.move.san)
})
