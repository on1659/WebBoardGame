// Mate-in-1 puzzles for beginners

export const puzzles = [
  {
    id: 1,
    title: '퀸으로 체크메이트!',
    description: '퀸을 움직여서 킹을 잡아봐! 👑',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1',
    solution: { from: 'e1', to: 'e8' },
    hint: '퀸을 맨 위로 올려봐!',
  },
  {
    id: 2,
    title: '룩으로 체크메이트!',
    description: '룩을 움직여서 체크메이트를 만들어봐! 🏰',
    fen: '6k1/5ppp/8/8/8/8/R4PPP/6K1 w - - 0 1',
    solution: { from: 'a2', to: 'a8' },
    hint: '룩을 맨 위로 올려봐!',
  },
  {
    id: 3,
    title: '비숍과 퀸의 협동!',
    description: '퀸으로 체크메이트를 만들어봐! 비숍이 도와줄 거야! ⛪',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    solution: { from: 'f3', to: 'f7' },
    hint: '퀸을 f7로 보내봐! 비숍이 지켜주고 있어!',
  },
  {
    id: 4,
    title: '퀸의 강력한 한 수!',
    description: '퀸 하나로 게임을 끝내봐! 💪',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/6P1/5P2/PPPPP2P/RNBQKBNR b KQkq - 0 1',
    solution: { from: 'd8', to: 'h4' },
    hint: '퀸을 h4로 보내봐! 킹이 도망갈 곳이 없어!',
    playerColor: 'b',
  },
  {
    id: 5,
    title: '나이트의 특별한 점프!',
    description: '나이트로 체크메이트를 만들어봐! 🐴',
    fen: '5rkr/5ppp/8/5N2/8/8/8/4K3 w - - 0 1',
    solution: { from: 'f5', to: 'e7' },
    hint: '나이트를 e7로 점프시켜봐! 킹이 꼼짝 못 해!',
  },
  {
    id: 6,
    title: '비숍으로 체크메이트!',
    description: '비숍으로 마지막 길을 막아봐! ⛪',
    fen: '6k1/5p1p/5QpB/8/8/8/5PPP/6K1 w - - 0 1',
    solution: { from: 'f6', to: 'g7' },
    hint: '퀸을 g7로 보내봐! 킹이 도망갈 곳이 없어!',
  },
  {
    id: 7,
    title: '퀸 + 킹 협동!',
    description: '퀸으로 체크메이트를 완성해봐! 🤝',
    fen: '7k/5Q2/5K2/8/8/8/8/8 w - - 0 1',
    solution: { from: 'f7', to: 'g7' },
    hint: '퀸을 킹 가까이로!',
  },
  {
    id: 8,
    title: '두 개의 룩!',
    description: '룩 두 개로 체크메이트! 🏰🏰',
    fen: 'k7/8/1K6/R7/8/8/8/R7 w - - 0 1',
    solution: { from: 'a5', to: 'a8' },
    hint: '위쪽 룩을 마지막 줄로 보내봐!',
  },
  {
    id: 9,
    title: '폰이 영웅이 되는 순간!',
    description: '폰을 프로모션시켜서 체크메이트! 🦸',
    fen: '3R1k2/4P3/5K2/8/8/8/8/8 w - - 0 1',
    solution: { from: 'e7', to: 'e8' },
    hint: '폰을 맨 위로 보내봐! 퀸이 되면 체크메이트야!',
  },
  {
    id: 10,
    title: '퀸의 마지막 일격!',
    description: '퀸으로 화려하게 체크메이트! ✨',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1',
    solution: { from: 'h5', to: 'f7' },
    hint: 'f7은 약한 칸이야! 퀸으로 공격해봐!',
  },
  // ===== 2수 체크메이트 (⭐⭐) =====
  // multiMove 퍼즐: 첫 수를 두면 → 상대 자동 응수 → 두 번째 수로 체크메이트
  {
    id: 11,
    title: '더블 룩 메이트!',
    description: '룩 2개로 2수 체크메이트! 🏰🏰',
    multiMove: true,
    // 백: Ra7, Rb1, Kg1, f2,g2,h2 / 흑: Kg8, f7,g7,h7
    // Rb8+ → Rf8(유일한 블록) → Rxf8#
    fen: '6k1/R4ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1',
    moves: [{ from: 'b1', to: 'b8' }],
    hint: '룩으로 8번 줄 체크! 상대가 막으면 다른 룩이 잡아!',
  },
  {
    id: 12,
    title: '퀸 희생! 💥',
    description: '퀸을 희생해서 메이트! 대담하게!',
    multiMove: true,
    // Qa8+! Rxa8 → Re8# (백랭크 메이트)
    fen: 'r5k1/5ppp/8/8/8/8/Q4PPP/4R1K1 w - - 0 1',
    moves: [{ from: 'a2', to: 'a8' }],
    hint: '퀸을 a8로! 상대가 잡아도 룩이 기다리고 있어!',
  },
  {
    id: 13,
    title: '킹 몰아넣기!',
    description: '킹을 구석으로 몰아서 메이트! 👑',
    multiMove: true,
    // Qh7+! Kf8 → Qf7# (또는 Qh8#)
    fen: '5k2/5p2/8/8/8/8/5PPQ/6K1 w - - 0 1',
    moves: [{ from: 'h2', to: 'h8' }],
    hint: '퀸으로 h8 체크! 킹이 도망가면 마무리!',
  },
  {
    id: 14,
    title: '백랭크 콤보!',
    description: '백랭크 약점을 이용한 2수 메이트! 🎯',
    multiMove: true,
    // Re8+! Rxe8 → Rxe8# (더블 룩 백랭크)
    fen: 'r3r1k1/5ppp/8/8/8/8/5PPP/2R1R1K1 w - - 0 1',
    moves: [{ from: 'e1', to: 'e8' }],
    hint: 'e줄 룩으로 체크! 잡으면 다른 룩이!',
  },
];
