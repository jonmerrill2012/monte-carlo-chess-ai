var VALUES = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9
}

// tallies the pieces as a naiive way of determining who is ahead
function countPoints (fen) {
  var pieces = fen.split(' ')[0]
  var symbols = [
    { // Pawn
      w: /P/g,
      b: /p/g,
      value: VALUES.p
    },
    { // Rook
      w: /R/g,
      b: /r/g,
      value: VALUES.r
    },
    { // Knight
      w: /N/g,
      b: /n/g,
      value: VALUES.n
    },
    { // Bishop
      w: /B/g,
      b: /b/g,
      value: VALUES.b
    },
    { // Queen
      w: /Q/g,
      b: /q/g,
      value: VALUES.q
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

  return sorted.concat(secondaryMoves).slice(0, 15)
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
      var value = VALUES[moves[i].captured] - VALUES[moves[i].piece]
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
  var evaluation = {
    b: 0,
    w: 0
  }
  for (var i = 0; i < 30; i++) {
    chess.load(startFen)
    while (!chess.game_over() && chess.history().length < 10) {
      var moves = chess.moves({verbose: true})
      chess.move(pickMove(moves))
    }
    var lastTurn = chess.turn()
    if (chess.game_over()) {
      if (!chess.in_checkmate() && !chess.in_draw()) {
        evaluation[lastTurn] += 1
      } else if (chess.in_draw()) {
        continue
      } else {
        evaluation[lastTurn] -= 1
      }
    } else {
      if (countPoints(chess.fen()) > 0) {
        evaluation.w += 1
      } else {
        evaluation.b += 1
      }
    }
  }
  return evaluation.w - evaluation.b
}

module.exports = {
  evaluate: evaluate,
  filterMoves: filterMoves
}
