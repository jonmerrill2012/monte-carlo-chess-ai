module.exports = {
  values: { // piece values for random simulation evaluation
    win: 40, // all pieces together are worth 39 points. Make a win worth 1 more than that
    p: 1, // pawn
    n: 3, // knight
    b: 3, // bishop
    r: 5, // rook
    q: 9, // queen
  },
  mmDepth: 2, // depth for minimax search
  moveEvalNum: 25, // number of moves to look at
  simGameNum: 10, // number of games to simulate in each evaluation,
  randomGameDepth: 5, // number of moves to simulate for each game during evaluation
}
