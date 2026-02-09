// Baduk puzzle data for beginners
// B=1 (BLACK), W=2 (WHITE)
const B = 1, W = 2;

export const puzzles = [
  // Capture puzzles: "이 돌을 잡아봐!"
  {
    id: 1,
    type: 'capture',
    title: '이 돌을 잡아봐! (1)',
    emoji: '🎯',
    hint: '⚪백돌의 활로가 1개 남았어요! 막아봐요!',
    boardSize: 9,
    board: [
      {r:4,c:4,color:W},
      {r:3,c:4,color:B}, {r:5,c:4,color:B}, {r:4,c:3,color:B},
    ],
    correct: [{r:4,c:5}],
  },
  {
    id: 2,
    type: 'capture',
    title: '이 돌을 잡아봐! (2)',
    emoji: '🎯',
    hint: '⚪백돌 2개가 연결돼 있어요. 활로를 찾아봐요!',
    boardSize: 9,
    board: [
      {r:4,c:4,color:W}, {r:4,c:5,color:W},
      {r:3,c:4,color:B}, {r:3,c:5,color:B},
      {r:5,c:4,color:B}, {r:5,c:5,color:B},
      {r:4,c:3,color:B},
    ],
    correct: [{r:4,c:6}],
  },
  {
    id: 3,
    type: 'capture',
    title: '이 돌을 잡아봐! (3)',
    emoji: '🎯',
    hint: '구석에 있는 ⚪백돌! 활로가 적어요!',
    boardSize: 9,
    board: [
      {r:0,c:0,color:W},
      {r:0,c:1,color:B},
    ],
    correct: [{r:1,c:0}],
  },
  {
    id: 4,
    type: 'capture',
    title: '큰 그룹을 잡아봐!',
    emoji: '💥',
    hint: '⚪백돌 3개의 마지막 활로를 찾아봐요!',
    boardSize: 9,
    board: [
      {r:3,c:3,color:W}, {r:3,c:4,color:W}, {r:3,c:5,color:W},
      {r:2,c:3,color:B}, {r:2,c:4,color:B}, {r:2,c:5,color:B},
      {r:4,c:3,color:B}, {r:4,c:4,color:B}, {r:4,c:5,color:B},
      {r:3,c:2,color:B},
    ],
    correct: [{r:3,c:6}],
  },
  // Escape puzzles: "도망쳐!"
  {
    id: 5,
    type: 'escape',
    title: '도망쳐! (1)',
    emoji: '🏃',
    hint: '⚫흑돌의 활로가 1개! 아래쪽으로 도망가요!',
    boardSize: 9,
    board: [
      {r:3,c:3,color:B},
      {r:2,c:3,color:W}, {r:3,c:2,color:W}, {r:3,c:4,color:W},
    ],
    correct: [{r:4,c:3}],
  },
  {
    id: 6,
    type: 'escape',
    title: '도망쳐! (2)',
    emoji: '🏃',
    hint: '⚫흑돌 2개를 살려야 해요!',
    boardSize: 9,
    board: [
      {r:4,c:4,color:B}, {r:4,c:5,color:B},
      {r:3,c:4,color:W}, {r:3,c:5,color:W},
      {r:5,c:4,color:W}, {r:5,c:5,color:W},
      {r:4,c:3,color:W},
    ],
    correct: [{r:4,c:6}],
  },
  {
    id: 7,
    type: 'escape',
    title: '구석에서 도망쳐!',
    emoji: '🏃',
    hint: '구석은 활로가 적어요! 어디로 도망갈까요?',
    boardSize: 9,
    board: [
      {r:0,c:0,color:B},
      {r:0,c:1,color:W},
    ],
    correct: [{r:1,c:0}],
  },
  // Territory puzzles: "집을 만들어봐!"
  {
    id: 8,
    type: 'territory',
    title: '집을 만들어봐! (1)',
    emoji: '🏠',
    hint: '빈 곳을 둘러싸서 집을 완성해요!',
    boardSize: 9,
    board: [
      {r:0,c:0,color:B},{r:0,c:1,color:B},{r:0,c:2,color:B},
      {r:1,c:0,color:B},
      {r:2,c:0,color:B},{r:2,c:1,color:B},
    ],
    correct: [{r:1,c:2}],
  },
  {
    id: 9,
    type: 'territory',
    title: '집을 만들어봐! (2)',
    emoji: '🏠',
    hint: '변에서 집을 만들어봐요!',
    boardSize: 9,
    board: [
      {r:0,c:3,color:B},{r:0,c:4,color:B},{r:0,c:5,color:B},{r:0,c:6,color:B},
      {r:1,c:3,color:B},{r:1,c:6,color:B},
      {r:2,c:3,color:B},{r:2,c:4,color:B},{r:2,c:6,color:B},
    ],
    correct: [{r:2,c:5}],
  },
  {
    id: 10,
    type: 'territory',
    title: '큰 집을 완성해!',
    emoji: '🏰',
    hint: '한 곳만 막으면 큰 집이 완성돼요!',
    boardSize: 9,
    board: [
      {r:6,c:0,color:B},{r:6,c:1,color:B},{r:6,c:2,color:B},{r:6,c:3,color:B},
      {r:7,c:3,color:B},
      {r:8,c:3,color:B},
    ],
    correct: [{r:8,c:4}],
  },
];
