// Tutorial lesson data for chess learning

export const lessons = [
  {
    id: 1,
    title: '말의 이름과 모양',
    emoji: '👑',
    description: '체스에는 6가지 말이 있어요! 각각의 이름과 모양을 알아볼까요?',
    steps: [
      {
        text: '이것은 **킹(왕)** ♔이에요! 체스에서 가장 중요한 말이에요. 킹이 잡히면 게임이 끝나요!',
        highlight: ['e1'],
        fen: '8/8/8/8/8/8/8/4K3 w - - 0 1',
      },
      {
        text: '이것은 **퀸(여왕)** ♕이에요! 가장 강한 말이에요. 어디든 갈 수 있어요!',
        highlight: ['d1'],
        fen: '8/8/8/8/8/8/8/3Q4 w - - 0 1',
      },
      {
        text: '이것은 **룩(성)** ♖이에요! 직선으로 쭉~ 갈 수 있어요.',
        highlight: ['a1', 'h1'],
        fen: '8/8/8/8/8/8/8/R6R w - - 0 1',
      },
      {
        text: '이것은 **비숍(주교)** ♗이에요! 대각선으로 쭉~ 갈 수 있어요.',
        highlight: ['c1', 'f1'],
        fen: '8/8/8/8/8/8/8/2B2B2 w - - 0 1',
      },
      {
        text: '이것은 **나이트(기사)** ♘에요! ㄱ자로 움직이는 특별한 말이에요. 다른 말을 뛰어넘을 수도 있어요!',
        highlight: ['b1', 'g1'],
        fen: '8/8/8/8/8/8/8/1N4N1 w - - 0 1',
      },
      {
        text: '이것은 **폰(병사)** ♙이에요! 가장 많은 말이에요. 앞으로만 갈 수 있어요.',
        highlight: ['a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2'],
        fen: '8/8/8/8/8/8/PPPPPPPP/8 w - - 0 1',
      },
      {
        text: '모든 말이 제자리에! 이렇게 시작해요. 잘 기억해두세요! 🌟',
        highlight: [],
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
    ],
  },
  {
    id: 2,
    title: '폰 움직이기',
    emoji: '♟️',
    description: '폰은 작지만 중요한 병사에요! 어떻게 움직이는지 배워볼까요?',
    steps: [
      {
        text: '폰은 **앞으로 한 칸** 갈 수 있어요. 처음에는 **두 칸**도 갈 수 있어요!',
        highlight: ['e2', 'e3', 'e4'],
        fen: '8/8/8/8/8/8/4P3/8 w - - 0 1',
      },
      {
        text: '폰은 **대각선 앞으로** 상대 말을 잡을 수 있어요! 앞에 있는 말은 못 잡아요.',
        highlight: ['d4', 'e5', 'f5'],
        fen: '8/8/8/3p1p2/4P3/8/8/8 w - - 0 1',
      },
      {
        text: '폰이 상대편 끝까지 가면 **퀸으로 변신**해요! 🎉 이걸 "프로모션"이라고 해요.',
        highlight: ['a7', 'a8'],
        fen: '8/P7/8/8/8/8/8/8 w - - 0 1',
      },
      {
        text: '아주 특별한 규칙! **앙파상** - 상대 폰이 두 칸 전진하면 옆에서 잡을 수 있어요. 어려우니까 나중에 더 배워요! 😊',
        highlight: ['d5', 'e5', 'e6'],
        fen: '8/8/8/3Pp3/8/8/8/8 w - e6 0 1',
      },
    ],
    // Interactive practice: move a pawn forward
    practice: {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      task: '폰을 앞으로 움직여 보세요!',
      validMoves: [
        { from: 'a2', to: 'a3' }, { from: 'a2', to: 'a4' },
        { from: 'b2', to: 'b3' }, { from: 'b2', to: 'b4' },
        { from: 'c2', to: 'c3' }, { from: 'c2', to: 'c4' },
        { from: 'd2', to: 'd3' }, { from: 'd2', to: 'd4' },
        { from: 'e2', to: 'e3' }, { from: 'e2', to: 'e4' },
        { from: 'f2', to: 'f3' }, { from: 'f2', to: 'f4' },
        { from: 'g2', to: 'g3' }, { from: 'g2', to: 'g4' },
        { from: 'h2', to: 'h3' }, { from: 'h2', to: 'h4' },
      ],
    },
  },
  {
    id: 3,
    title: '룩, 비숍, 나이트',
    emoji: '🏰',
    description: '강력한 말들의 움직임을 배워봐요!',
    steps: [
      {
        text: '**룩** ♖은 가로와 세로로 원하는 만큼 갈 수 있어요! 쭉~ 직진!',
        highlight: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4'],
        fen: '8/8/8/8/3R4/8/8/8 w - - 0 1',
      },
      {
        text: '**비숍** ♗은 대각선으로 원하는 만큼 갈 수 있어요! X자로 움직여요.',
        highlight: ['a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'g1', 'f2', 'e3', 'c5', 'b6', 'a7'],
        fen: '8/8/8/8/3B4/8/8/8 w - - 0 1',
      },
      {
        text: '**나이트** ♘는 ㄱ자(L자)로 움직여요! 다른 말을 뛰어넘을 수 있는 유일한 말이에요! 🐴',
        highlight: ['c6', 'e6', 'f5', 'f3', 'e2', 'c2', 'b3', 'b5'],
        fen: '8/8/8/8/3N4/8/8/8 w - - 0 1',
      },
      {
        text: '룩은 직선, 비숍은 대각선, 나이트는 ㄱ자! 기억해요! 🌟',
        highlight: [],
        fen: '8/8/8/8/1N1R1B2/8/8/8 w - - 0 1',
      },
    ],
    practice: {
      fen: '8/8/8/8/3N4/8/8/8 w - - 0 1',
      task: '나이트를 ㄱ자로 움직여 보세요!',
      validMoves: [
        { from: 'd4', to: 'c6' }, { from: 'd4', to: 'e6' },
        { from: 'd4', to: 'f5' }, { from: 'd4', to: 'f3' },
        { from: 'd4', to: 'e2' }, { from: 'd4', to: 'c2' },
        { from: 'd4', to: 'b3' }, { from: 'd4', to: 'b5' },
      ],
    },
  },
  {
    id: 4,
    title: '퀸과 킹',
    emoji: '👸',
    description: '가장 강한 퀸과 가장 중요한 킹!',
    steps: [
      {
        text: '**퀸** ♕은 룩+비숍이에요! 가로, 세로, 대각선 어디든 갈 수 있어요. 가장 강해요! 💪',
        highlight: ['d1', 'd2', 'd3', 'd5', 'd6', 'd7', 'd8', 'a4', 'b4', 'c4', 'e4', 'f4', 'g4', 'h4', 'a1', 'b2', 'c3', 'e5', 'f6', 'g7', 'h8', 'a7', 'b6', 'c5', 'e3', 'f2', 'g1'],
        fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
      },
      {
        text: '**킹** ♔은 모든 방향으로 **한 칸만** 갈 수 있어요. 느리지만 가장 소중해요! 👑',
        highlight: ['c5', 'd5', 'e5', 'c4', 'e4', 'c3', 'd3', 'e3'],
        fen: '8/8/8/8/3K4/8/8/8 w - - 0 1',
      },
      {
        text: '킹이 잡히면 안 돼요! 그래서 킹이 위험하면 "체크"라고 해요. 꼭 피해야 해요!',
        highlight: ['e1', 'e8'],
        fen: '4k3/8/8/8/8/8/8/4K3 w - - 0 1',
      },
    ],
    practice: {
      fen: '8/8/8/8/3Q4/8/8/8 w - - 0 1',
      task: '퀸을 원하는 곳으로 움직여 보세요!',
      validMoves: 'any', // any legal move is fine
    },
  },
  {
    id: 5,
    title: '캐슬링',
    emoji: '🏰',
    description: '킹과 룩이 한번에 움직이는 특별한 규칙!',
    steps: [
      {
        text: '**캐슬링**은 킹과 룩이 동시에 움직이는 특별한 수에요! 킹을 안전하게 숨길 수 있어요.',
        highlight: ['e1', 'h1'],
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
      },
      {
        text: '**킹사이드 캐슬링**: 킹이 오른쪽으로 두 칸, 룩이 킹 왼쪽으로! O-O',
        highlight: ['e1', 'g1', 'h1', 'f1'],
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
      },
      {
        text: '**퀸사이드 캐슬링**: 킹이 왼쪽으로 두 칸, 룩이 킹 오른쪽으로! O-O-O',
        highlight: ['e1', 'c1', 'a1', 'd1'],
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
      },
      {
        text: '캐슬링 조건: 킹과 룩이 한 번도 안 움직였고, 사이에 말이 없어야 해요! 체크 중에도 안 돼요.',
        highlight: [],
        fen: 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
      },
    ],
  },
  {
    id: 6,
    title: '체크와 체크메이트',
    emoji: '🏆',
    description: '게임에서 이기는 방법을 배워요!',
    steps: [
      {
        text: '**체크**: 킹이 공격받고 있어요! 반드시 피해야 해요. 세 가지 방법이 있어요.',
        highlight: ['e8', 'e1'],
        fen: '4k3/8/8/8/8/8/8/4R3 w - - 0 1',
      },
      {
        text: '체크 피하기 1: **킹을 도망**시켜요! 안전한 칸으로 움직여요.',
        highlight: ['e8', 'd8', 'f8', 'd7', 'f7'],
        fen: '4k3/8/8/8/8/8/8/4R3 w - - 0 1',
      },
      {
        text: '체크 피하기 2: **공격하는 말을 잡아요!**',
        highlight: ['e1', 'e8'],
        fen: '4k3/8/8/8/8/8/8/r3K3 w - - 0 1',
      },
      {
        text: '체크 피하기 3: **다른 말로 막아요!** 킹과 공격하는 말 사이에 놓아요.',
        highlight: ['d1'],
        fen: '4k3/8/8/8/8/8/8/3RK3 w - - 0 1',
      },
      {
        text: '**체크메이트**: 킹이 체크인데 피할 수 없어요! 이러면 게임 끝! 🏆 이긴 거예요!',
        highlight: ['h8'],
        fen: '5Rk1/6pp/8/8/8/8/8/6K1 w - - 0 1',
      },
      {
        text: '축하해요! 체스의 기본 규칙을 다 배웠어요! 이제 게임을 해봐요! 🌟🎉',
        highlight: [],
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
    ],
  },
];
