var constants = require('./constants')

// tallies the pieces as a naiive way of determining who is ahead
function countPoints (fen) {
  var pieces = fen.split(' ')[0]
  var symbols = [
    { // Pawn
      w: /P/g,
      b: /p/g,
      value: constants.values.p
    },
    { // Rook
      w: /R/g,
      b: /r/g,
      value: constants.values.r
    },
    { // Knight
      w: /N/g,
      b: /n/g,
      value: constants.values.n
    },
    { // Bishop
      w: /B/g,
      b: /b/g,
      value: constants.values.b
    },
    { // Queen
      w: /Q/g,
      b: /q/g,
      value: constants.values.q
    }
  ]

  var points = 0
  for (var i = 0; i < symbols.length; i++) {
    points += (pieces.match(symbols[i].w) || []).length * symbols[i].value
    points -= (pieces.match(symbols[i].b) || []).length * symbols[i].value
  }

  return points
}

function filterMoves (moves) {
  var sorted = []
  var secondaryMoves = []
  for (var i = 0; i < moves.length; i++) {
    if (moves[i].san.slice(-1) === '#') {
      // if you can checkmate, there might as well only be one move. ALWAYS DO IT.
      return [moves[i]]
    } else if (moves[i].san.includes('=')) {
      // skip promotions that aren't queen promotions. Otherwise, look at them.
      if (moves[i].san.includes('=Q')) {
        sorted.unshift(moves[i])
      }
    } else if (moves[i].san.slice(-1) === '+') {
      // look at checks next, since they might be a string of checks to a mate
      sorted.unshift(moves[i])
    } else if (moves[i].captured) {
      // then inspect captures
      sorted.push(moves[i])
    } else if (moves[i].piece === 'k') {
      // look at king moves last -> The move selection was biased towards moving the king
      // because it favors center moves, and the king is in the center
      secondaryMoves.push(moves[i])
    } else if (moves[i].to.indexOf('c') + moves[i].to.indexOf('d') + moves[i].to.indexOf('e') + moves[i].to.indexOf('f') > -4){
      // then look at moves that challenge the center
      secondaryMoves.unshift(moves[i])
    } else {
      // then look at other moves
      secondaryMoves.push(moves[i])
    }
  }

  return sorted.concat(secondaryMoves).slice(0, constants.moveEvalNum)
}

// pick a move. Usually random, but not if its a checkmate, or a piece upgrade
function pickMove (moves) {
  moves = filterMoves(moves)
  var bestMove = {
    value: -5,
    move: ''
  }
  for (var i = 0; i < moves.length; i++) {
    if (moves[i].captured) {
      // captured a piece, is it an upgrade?
      var value = constants.values[moves[i].captured] - constants.values[moves[i].piece]
      if (value > bestMove.value) {
        bestMove.value = value
        bestMove.move = moves[i].san
      }
    }
  }

  if (bestMove.value > 0) {
    return bestMove.move
  }

  return moves[Math.floor(Math.random() * moves.length)].san
}

var evaluate = function (chess) {
  var startFen = chess.fen()
  var evaluation = 0
  for (var i = 0; i < constants.simGameNum; i++) {
    chess.load(startFen)
    while (!chess.game_over() && chess.history().length < constants.randomGameDepth) {
      var moves = chess.moves({verbose: true})
      chess.move(pickMove(moves))
    }
    var lastTurn = chess.turn()
    if (chess.game_over()) {
      if (!chess.in_checkmate() && !chess.in_draw()) {
        evaluation += lastTurn === 'w' ? constants.values.win : (constants.values.win * -1)
      } else if (chess.in_draw()) {
        continue
      } else {
        evaluation += lastTurn === 'w' ? (constants.values.win * -1) : constants.values.win
      }
    } else {
      evaluation += countPoints(chess.fen())
    }
  }
  return evaluation
}


var searchTreeForBestMove = function (chess, fen, depth) {
  chess.load(fen)
  if (depth === 0) {
    return evaluate(chess)
  }

  var moves = filterMoves(chess.moves({verbose: true}))
  var value = chess.turn() === 'w' ? -99999999 : 99999999
  var bestMove = ''

  for (var i = 0; i < moves.length; i++) {
    if (depth == constants.mmDepth) {
      console.log(`${i + 1}/${moves.length}: ${moves[i].san}`)
    }
    var newValue
    chess.load(fen)
    if (chess.turn() === 'w') {
      chess.move(moves[i])
      newValue = Math.max(value, searchTreeForBestMove(chess, chess.fen(), depth - 1))
    } else {
      chess.move(moves[i])
      newValue = Math.min(value, searchTreeForBestMove(chess, chess.fen(), depth - 1))
    }

    if (newValue !== value) {
      if (depth == constants.mmDepth) {
        console.log('***new best move:', moves[i].san, newValue)
      }
      bestMove = moves[i].san
    }
    value = newValue
  }
  if (depth === constants.mmDepth) {
    console.log('*************FINAL MOVE: **********', bestMove)
  }
  return value
}

module.exports = {
  filterMoves: filterMoves,
  searchTreeForBestMove: searchTreeForBestMove,
}
