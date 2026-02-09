import {Chess} from 'chess.js';

const puzzles = [
  // Pattern: piece checks rank 8, gets captured, second piece mates on rank 8
  // All need: king g8 + f7,g7,h7 pawns (traps king)
  
  { id: 11, fen: 'r5k1/5ppp/8/1Q6/8/8/5PPP/4R1K1 w - - 0 1',
    moves: [{from:'e1',to:'e8'},{from:'a8',to:'e8'},{from:'b5',to:'e8'}],
    title: '룩 희생 + 퀸 체크메이트! (1)' },

  { id: 12, fen: '2r3k1/5ppp/8/8/8/3Q4/5PPP/3R2K1 w - - 0 1',
    moves: [{from:'d3',to:'d8'},{from:'c8',to:'d8'},{from:'d1',to:'d8'}],
    title: '퀸 희생 + 룩 체크메이트!' },

  { id: 13, fen: 'r5k1/1Q3ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1',
    moves: [{from:'c1',to:'c8'},{from:'a8',to:'c8'},{from:'b7',to:'c8'}],
    title: '룩 희생 + 퀸 체크메이트! (2)' },

  { id: 14, fen: '1r4k1/5ppp/8/8/8/4Q3/5PPP/3R2K1 w - - 0 1',
    moves: [{from:'d1',to:'d8'},{from:'b8',to:'d8'},{from:'e3',to:'e8'}],
    title: '룩 희생 + 퀸 체크메이트! (3)' },

  { id: 15, fen: 'r5k1/5ppp/8/8/8/1Q6/5PPP/1R4K1 w - - 0 1',
    moves: [{from:'b1',to:'b8'},{from:'a8',to:'b8'},{from:'b3',to:'b8'}],
    title: '룩 희생 + 퀸 체크메이트! (4)' },

  // Variation: Queen goes to different square on rank 8
  { id: 16, fen: 'r3r1k1/5ppp/8/1Q6/8/8/5PPP/4R1K1 w - - 0 1',
    moves: [{from:'e1',to:'e8'},{from:'a8',to:'e8'},{from:'b5',to:'e8'}],
    title: '룩 교환 + 퀸 체크메이트!' },

  // Queen sacrifice first, then rook mates
  { id: 17, fen: '1r4k1/5ppp/8/8/3Q4/8/5PPP/3R2K1 w - - 0 1',
    moves: [{from:'d4',to:'d8'},{from:'b8',to:'d8'},{from:'d1',to:'d8'}],
    title: '퀸 희생 + 룩 체크메이트! (2)' },

  { id: 18, fen: 'r5k1/5ppp/8/8/8/Q7/5PPP/4R1K1 w - - 0 1',
    moves: [{from:'e1',to:'e8'},{from:'a8',to:'e8'},{from:'a3',to:'e7'}],
    title: '룩 희생 + 퀸 체크메이트! (5)' },

  // Try Qa3->e7 mate after Re8+ Rxe8: Qe7 checks? No e7 doesn't check g8.
  // Qa3->a8: can it reach? a3->a8 a-file, clear? yes. Qa8+? a8-b8-...-g8, but e8 has black rook! blocks.
  // So Qe7 doesn't work. Let me try Qa3->f8: a3 to f8 diagonal? a3(3,1) f8(8,6) diff (5,5) yes diagonal!
  // Qf8# checks g8 king (f8 adjacent). g7 pawn, h7 pawn, f7 pawn. h8 controlled by Q(f8 rank). Mate!
  { id: '18b', fen: 'r5k1/5ppp/8/8/8/Q7/5PPP/4R1K1 w - - 0 1',
    moves: [{from:'e1',to:'e8'},{from:'a8',to:'e8'},{from:'a3',to:'f8'}],
    title: '룩 희생 + 퀸 체크메이트! (5)' },

  // Another queen sac
  { id: 19, fen: '2r3k1/5ppp/8/8/8/8/3Q1PPP/2R3K1 w - - 0 1',
    moves: [{from:'d2',to:'d8'},{from:'c8',to:'d8'},{from:'c1',to:'c8'}],
    title: '퀸 희생 + 룩 체크메이트! (3)' },

  // Rook sac + queen mate from far
  { id: 20, fen: 'r5k1/5ppp/8/8/8/8/5PPP/Q3R1K1 w - - 0 1',
    moves: [{from:'e1',to:'e8'},{from:'a8',to:'e8'},{from:'a1',to:'a8'}],
    title: '룩 희생 + 퀸 체크메이트! (6)' },
  
  // Qa1->a8: a-file clear? yes. Qa8# checks g8 king via rank 8. e8 has black rook blocking!
  // So Qa8 is NOT mate because e8 rook blocks. Try Qa1->e5: doesn't check.
  // Qa1 can go to f6? a1(1,1) f6(6,6) diagonal. Qf6 doesn't check g8.
  // Hmm. What if Q goes to a8? a8->b8->c8->d8->e8(blocked). Not check.
  // So this doesn't work with rook on e8. Need Q to reach rank 8 on OTHER side of e8.
  // Qa1->f6->... no. Let me put Q on f1: Qf8#! f1->f8. But f7 pawn blocks!
  // Put Q on h5: Qh8# or Qh5->h8. h8 checks g8? h8 is adjacent. Mate? g7 pawn, f8 free? 
  // After Re8+ Rxe8, Qh8+ is check on g8 king from h8. But Kf7 is NOT possible (f7 pawn).
  // Actually king is on g8. Qh8+: h8 checks g8 (adjacent). Is it mate? f8? Not controlled by Qh8.
  // f8 is free for king to escape! Unless e8 rook controls f8... black rook on e8 is black's piece,
  // doesn't block king. King CAN go to f8. Not mate.
  
  // Let me try: Q on g5. After Re8+ Rxe8, Qg5->g8 blocked by g7 pawn.
  // Q on h4: Qh4->h8. Qh8+ adjacent to g8. f8 is free. Not mate.
  // Q on f4: Qf8#! f4->f8 along f-file. f7 pawn blocks! Can't.
  
  // OK, for this to work, Q needs to reach rank 8 at a square FROM WHICH the entire rank to g8 is clear,
  // or be adjacent to g8. And ALL king escape squares must be covered.
  // Easiest: Q reaches a square on rank 8 where rank 8 is clear to g8.
  // After Re8+ Rxe8: e8 has black rook. So Q must reach rank 8 on the f-h side of g8.
  // Qf8#: need clear f-file (f7 pawn blocks! unless captured)
  // Qh8+: f8 not controlled, king escapes.
  // So I need Q to reach f8 (but f7 blocks) or need extra piece control.
  
  // Simplest: just put Q where it can reach a square on rank 8 with clear path to g8
  // WITHOUT the e8 rook blocking. Like: put Q where it goes to f8 with the pawn gone.
  // Or have action happen on a DIFFERENT file.

  // Let me just move the action to a-file:
  { id: '20b', fen: 'r5k1/5ppp/8/8/8/8/Q4PPP/R5K1 w - - 0 1',
    moves: [{from:'a1',to:'a8'},{from:'g8',to:'h8'},{from:'a2',to:'a8'}] },
    // Ra8+! Rxa8... wait r on a8 is black's. Rxa8+ Rxa8? Can't capture own piece with own rook.
    // Actually Ra1 captures Ra8: Rxa8+. That's check? a8 to g8 rank 8 clear? b-f8 all empty. Check!
    // After Rxa8+, who recaptures? Nobody! It's just a capture and check.
    // King moves: h8 (g7 pawn, f8 free). Can Kf8? Ra8 controls f8? a8->f8 rank 8, yes! 
    // So Kf8 is blocked. Kh8. Then Qa8? But Ra8 is our rook there. Qa2->a8 can't, rook blocks on a8.
    // Hmm.
];

// Only test the ones with proper moves arrays
const validPuzzles = puzzles.filter(p => p.moves);

for (const p of validPuzzles) {
  const c = new Chess(p.fen);
  process.stdout.write(`\nPuzzle ${p.id}: `);
  let ok = true;
  for (let i = 0; i < p.moves.length; i++) {
    const m = p.moves[i];
    try {
      const result = c.move({from: m.from, to: m.to, promotion: 'q'});
      if (!result) { console.log(`ILLEGAL ${m.from}-${m.to}`); ok = false; break; }
      const status = c.isCheckmate() ? '✅MATE' : c.isCheck() ? 'check' : 'ok';
      process.stdout.write(`${result.san}(${status}) `);
      if (c.isCheckmate()) { if (i < 2) process.stdout.write('⚠️EARLY'); break; }
    } catch(e) {
      console.log(`ERROR ${m.from}-${m.to}`);
      ok = false; break;
    }
  }
  if (ok && !c.isCheckmate()) process.stdout.write('❌NO MATE');
  console.log();
}
