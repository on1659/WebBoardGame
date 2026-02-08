// Baduk tutorial lesson data
// Board positions use a simple format: array of {r, c, color} for stones
// color: 1 = BLACK, 2 = WHITE
// highlight: array of {r, c} positions to highlight
// practice: { board, correct: [{r,c}], task }

const B = 1, W = 2;

export const lessons = [
  {
    id: 1,
    title: '바둑이란?',
    emoji: '🌟',
    description: '바둑판과 돌에 대해 알아봐요!',
    steps: [
      {
        text: '바둑은 아주 오래된 보드게임이에요! ⚫흑돌과 ⚪백돌을 놓으면서 땅을 많이 차지하면 이겨요! 🎉',
        board: [],
        highlight: [],
        boardSize: 9,
      },
      {
        text: '이것이 바둑판이에요! 줄이 가로세로로 있고, 줄이 만나는 곳(교차점)에 돌을 놓아요. ✨',
        board: [],
        highlight: [{r:2,c:2}, {r:2,c:6}, {r:6,c:2}, {r:6,c:6}, {r:4,c:4}],
        boardSize: 9,
      },
      {
        text: '⚫ 이것은 흑돌이에요! 흑돌이 먼저 시작해요.',
        board: [{r:4,c:4,color:B}],
        highlight: [{r:4,c:4}],
        boardSize: 9,
      },
      {
        text: '⚪ 이것은 백돌이에요! 흑돌 다음에 백돌이 놓아요. 번갈아가며 놓아요!',
        board: [{r:4,c:4,color:B}, {r:4,c:5,color:W}],
        highlight: [{r:4,c:5}],
        boardSize: 9,
      },
      {
        text: '목표는 돌로 빈 땅을 둘러싸서 내 땅을 만드는 거예요! 땅이 더 많은 사람이 이겨요! 🏆',
        board: [
          {r:1,c:1,color:B},{r:1,c:2,color:B},{r:1,c:3,color:B},
          {r:2,c:1,color:B},{r:2,c:3,color:B},
          {r:3,c:1,color:B},{r:3,c:2,color:B},{r:3,c:3,color:B},
        ],
        highlight: [{r:2,c:2}],
        boardSize: 9,
      },
    ],
  },
  {
    id: 2,
    title: '돌 놓기',
    emoji: '👆',
    description: '돌을 어떻게 놓는지 배워요!',
    steps: [
      {
        text: '돌은 줄이 만나는 곳(교차점)에 놓아요. 줄 위에도, 빈 칸에도 놓는 게 아니에요! 반짝이는 곳이 교차점이에요.',
        board: [],
        highlight: [{r:2,c:2}, {r:4,c:4}, {r:6,c:6}],
        boardSize: 9,
      },
      {
        text: '⚫흑이 먼저 놓고, ⚪백이 놓고, 번갈아 놓아요. 한 번에 한 개씩!',
        board: [{r:4,c:4,color:B}, {r:3,c:5,color:W}, {r:6,c:2,color:B}],
        highlight: [],
        boardSize: 9,
      },
      {
        text: '한번 놓은 돌은 움직일 수 없어요! 체스랑 다르죠? 잘 생각하고 놓아야 해요! 🤔',
        board: [{r:4,c:4,color:B}, {r:3,c:5,color:W}],
        highlight: [{r:4,c:4}],
        boardSize: 9,
      },
    ],
    practice: {
      boardSize: 9,
      board: [],
      task: '빈 바둑판에 돌을 3개 놓아봐요! 아무 곳이나 눌러보세요! 👆',
      type: 'place_any',
      requiredMoves: 3,
    },
  },
  {
    id: 3,
    title: '따먹기 (캡처)',
    emoji: '🎯',
    description: '상대 돌을 잡는 방법을 배워요!',
    steps: [
      {
        text: '돌 옆에 빈 교차점을 "활로"라고 해요. 활로는 돌이 숨 쉬는 곳이에요! 😤 이 돌은 활로가 4개예요.',
        board: [{r:4,c:4,color:B}],
        highlight: [{r:3,c:4}, {r:5,c:4}, {r:4,c:3}, {r:4,c:5}],
        boardSize: 9,
      },
      {
        text: '구석에 있는 돌은 활로가 2개, 변에 있으면 3개예요.',
        board: [{r:0,c:0,color:B}, {r:0,c:4,color:B}],
        highlight: [{r:0,c:1}, {r:1,c:0}, {r:0,c:3}, {r:0,c:5}, {r:1,c:4}],
        boardSize: 9,
      },
      {
        text: '상대가 내 돌의 활로를 다 막으면, 내 돌이 잡혀요! 😱 이 흑돌은 활로가 1개만 남았어요!',
        board: [
          {r:4,c:4,color:B},
          {r:3,c:4,color:W}, {r:5,c:4,color:W}, {r:4,c:3,color:W},
        ],
        highlight: [{r:4,c:5}],
        boardSize: 9,
      },
      {
        text: '백이 마지막 활로를 막으면... 흑돌이 잡혀서 판에서 없어져요! 💥',
        board: [
          {r:3,c:4,color:W}, {r:5,c:4,color:W}, {r:4,c:3,color:W}, {r:4,c:5,color:W},
        ],
        highlight: [{r:4,c:4}],
        boardSize: 9,
      },
    ],
    practice: {
      boardSize: 9,
      board: [
        {r:4,c:4,color:W},
        {r:3,c:4,color:B}, {r:5,c:4,color:B}, {r:4,c:3,color:B},
      ],
      task: '⚪백돌을 잡아봐요! 마지막 활로를 막아보세요! 🎯',
      type: 'capture',
      correct: [{r:4,c:5}],
    },
  },
  {
    id: 4,
    title: '단수 (아타리)',
    emoji: '⚡',
    description: '활로가 1개! 위험해요!',
    steps: [
      {
        text: '"단수"는 돌의 활로가 1개만 남은 상태예요! 아주 위험해요! ⚡ 다음에 잡힐 수 있어요!',
        board: [
          {r:4,c:4,color:B},
          {r:3,c:4,color:W}, {r:5,c:4,color:W}, {r:4,c:3,color:W},
        ],
        highlight: [{r:4,c:5}],
        boardSize: 9,
      },
      {
        text: '단수에 놓인 돌은 도망가야 해요! 빈 곳으로 연결하면 활로가 늘어나요! 🏃',
        board: [
          {r:4,c:4,color:B}, {r:4,c:5,color:B},
          {r:3,c:4,color:W}, {r:5,c:4,color:W}, {r:4,c:3,color:W},
        ],
        highlight: [{r:3,c:5}, {r:5,c:5}, {r:4,c:6}],
        boardSize: 9,
      },
      {
        text: '상대 돌을 단수로 만들면 다음에 잡을 수 있어요! 공격할 때도 단수를 만들어봐요! 💪',
        board: [
          {r:4,c:4,color:W},
          {r:3,c:4,color:B}, {r:5,c:4,color:B}, {r:4,c:3,color:B},
        ],
        highlight: [{r:4,c:5}],
        boardSize: 9,
      },
    ],
    practice: {
      boardSize: 9,
      board: [
        {r:3,c:4,color:B},
        {r:2,c:4,color:W}, {r:3,c:3,color:W}, {r:4,c:4,color:W},
      ],
      task: '⚫흑돌이 단수예요! 도망쳐서 활로를 만들어요! 🏃',
      type: 'escape',
      correct: [{r:3,c:5}],
    },
  },
  {
    id: 5,
    title: '연결과 끊기',
    emoji: '🔗',
    description: '돌을 연결하면 더 강해져요!',
    steps: [
      {
        text: '같은 색 돌이 옆에 붙어있으면 "연결"된 거예요! 연결된 돌은 활로를 함께 써서 더 강해요! 💪',
        board: [{r:4,c:3,color:B}, {r:4,c:4,color:B}, {r:4,c:5,color:B}],
        highlight: [{r:4,c:3}, {r:4,c:4}, {r:4,c:5}],
        boardSize: 9,
      },
      {
        text: '대각선은 연결이 아니에요! 가로나 세로로 붙어있어야 연결이에요.',
        board: [{r:3,c:3,color:B}, {r:4,c:4,color:B}],
        highlight: [],
        boardSize: 9,
      },
      {
        text: '상대 돌 사이를 끊으면 약한 돌을 잡을 수 있어요! ✂️ 흑이 백돌 사이를 끊었어요!',
        board: [
          {r:4,c:3,color:W}, {r:4,c:5,color:W},
          {r:4,c:4,color:B},
        ],
        highlight: [{r:4,c:4}],
        boardSize: 9,
      },
      {
        text: '내 돌이 끊어지지 않게 잘 연결하는 것이 중요해요! 🧩',
        board: [
          {r:3,c:3,color:B}, {r:3,c:4,color:B}, {r:3,c:5,color:B},
          {r:4,c:3,color:B}, {r:4,c:5,color:B},
          {r:5,c:3,color:B}, {r:5,c:4,color:B}, {r:5,c:5,color:B},
        ],
        highlight: [],
        boardSize: 9,
      },
    ],
    practice: {
      boardSize: 9,
      board: [
        {r:4,c:3,color:B}, {r:4,c:5,color:B},
        {r:3,c:4,color:W}, {r:5,c:4,color:W},
      ],
      task: '⚫흑돌 두 개를 연결해봐요! 사이에 돌을 놓아요! 🔗',
      type: 'connect',
      correct: [{r:4,c:4}],
    },
  },
  {
    id: 6,
    title: '집 만들기 (영토)',
    emoji: '🏠',
    description: '빈 땅을 둘러싸면 내 집이에요!',
    steps: [
      {
        text: '돌로 빈 곳을 둘러싸면 "집"이 돼요! 집이 많으면 이겨요! 🏆',
        board: [
          {r:1,c:1,color:B},{r:1,c:2,color:B},{r:1,c:3,color:B},
          {r:2,c:1,color:B},{r:2,c:3,color:B},
          {r:3,c:1,color:B},{r:3,c:2,color:B},{r:3,c:3,color:B},
        ],
        highlight: [{r:2,c:2}],
        boardSize: 9,
      },
      {
        text: '이 모양을 봐요! 흑이 구석에 집을 만들었어요. 반짝이는 곳이 흑의 집이에요! ✨',
        board: [
          {r:0,c:0,color:B},{r:0,c:1,color:B},{r:0,c:2,color:B},
          {r:1,c:2,color:B},
          {r:2,c:0,color:B},{r:2,c:1,color:B},{r:2,c:2,color:B},
        ],
        highlight: [{r:1,c:0}, {r:1,c:1}],
        boardSize: 9,
      },
      {
        text: '집의 크기 = 둘러싼 빈 교차점의 수! 빈 곳이 많을수록 점수가 높아요! 📊',
        board: [
          {r:0,c:5,color:W},{r:0,c:6,color:W},{r:0,c:7,color:W},{r:0,c:8,color:W},
          {r:1,c:5,color:W},
          {r:2,c:5,color:W},{r:2,c:6,color:W},{r:2,c:7,color:W},{r:2,c:8,color:W},
        ],
        highlight: [{r:1,c:6},{r:1,c:7},{r:1,c:8}],
        boardSize: 9,
      },
    ],
    practice: {
      boardSize: 9,
      board: [
        {r:0,c:0,color:B},{r:0,c:1,color:B},{r:0,c:2,color:B},
        {r:1,c:0,color:B},
        {r:2,c:0,color:B},{r:2,c:1,color:B},
      ],
      task: '집을 완성해봐요! 빈 곳을 둘러싸세요! 🏠',
      type: 'territory',
      correct: [{r:1,c:2}],
    },
  },
  {
    id: 7,
    title: '패 (Ko)',
    emoji: '🔄',
    description: '같은 모양을 반복하면 안 돼요!',
    steps: [
      {
        text: '바둑에는 "패"라는 특별한 규칙이 있어요! 같은 모양이 계속 반복되면 안 돼요! 🔄',
        board: [
          {r:3,c:3,color:B}, {r:3,c:5,color:W},
          {r:4,c:2,color:B}, {r:4,c:4,color:W}, {r:4,c:5,color:B},
          {r:5,c:3,color:B}, {r:5,c:5,color:W},
          {r:4,c:3,color:W},
        ],
        highlight: [{r:4,c:3}, {r:4,c:4}],
        boardSize: 9,
      },
      {
        text: '흑이 백돌 1개를 잡았어요! 그런데 백이 바로 같은 자리에 놓으면 또 같은 모양이 돼요...',
        board: [
          {r:3,c:3,color:B}, {r:3,c:5,color:W},
          {r:4,c:2,color:B}, {r:4,c:3,color:B}, {r:4,c:5,color:B},
          {r:5,c:3,color:B}, {r:5,c:5,color:W},
        ],
        highlight: [{r:4,c:4}],
        boardSize: 9,
      },
      {
        text: '그래서 백은 바로 다시 잡을 수 없어요! 다른 곳에 한 번 놓고 나서야 잡을 수 있어요. 이것이 "패" 규칙이에요! 🚫',
        board: [
          {r:3,c:3,color:B}, {r:3,c:5,color:W},
          {r:4,c:2,color:B}, {r:4,c:3,color:B}, {r:4,c:5,color:B},
          {r:5,c:3,color:B}, {r:5,c:5,color:W},
        ],
        highlight: [{r:4,c:4}],
        boardSize: 9,
        annotation: '❌ 여기에 바로 못 놓아요!',
      },
    ],
  },
];
