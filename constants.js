module.exports = {
  values: { // piece values for random simulation evaluation
    win: 40, // all pieces together are worth 39 points. Make a win worth 1 more than that
    p: 1, // pawn
    n: 3, // knight
    b: 3, // bishop
    r: 5, // rook
    q: 9, // queen
  },
  mmDepth: 3, // depth for minimax search
  moveEvalNum: 10, // number of moves to look at
  simGameNum: 5, // number of games to simulate in each evaluation,
  randomGameDepth: 7, // number of moves to simulate for each game during evaluation
}
