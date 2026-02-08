import { Chess } from 'chess.js';

const puzzles = [
  { id:1, fen:'6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1', sol:{from:'e1',to:'e8'} },
  { id:2, fen:'6k1/5ppp/8/8/8/8/R4PPP/6K1 w - - 0 1', sol:{from:'a2',to:'a8'} },
  { id:3, fen:'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1', sol:{from:'f3',to:'f7'} },
  { id:4, fen:'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 1', sol:{from:'d8',to:'h4'} },
  { id:5, fen:'5rkr/5ppp/8/5N2/8/8/8/4K3 w - - 0 1', sol:{from:'f5',to:'e7'} },
  { id:6, fen:'6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1', sol:{from:'a1',to:'a8'} },
  { id:7, fen:'7k/5Q2/5K2/8/8/8/8/8 w - - 0 1', sol:{from:'f7',to:'g7'} },
  { id:8, fen:'k7/8/1K6/R7/8/8/8/R7 w - - 0 1', sol:{from:'a5',to:'a8'} },
  { id:9, fen:'3R1k2/4P3/5K2/8/8/8/8/8 w - - 0 1', sol:{from:'e7',to:'e8'} },
  { id:10, fen:'r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', sol:{from:'h5',to:'f7'} },
];

for (const p of puzzles) {
  try {
    const c = new Chess(p.fen);
    const result = c.move({ from: p.sol.from, to: p.sol.to, promotion: 'q' });
    if (!result) {
      console.log(`Puzzle ${p.id}: ILLEGAL MOVE`);
      continue;
    }
    if (c.isCheckmate()) {
      console.log(`Puzzle ${p.id}: ✓ checkmate`);
    } else {
      console.log(`Puzzle ${p.id}: ✗ NOT checkmate. Check=${c.isCheck()} FEN=${c.fen()}`);
      // Show all black moves
      console.log(`  Legal moves: ${c.moves().join(', ')}`);
    }
  } catch(e) {
    console.log(`Puzzle ${p.id}: ERROR - ${e.message}`);
  }
}
