// 玩家颜色
export const PLAYER_RED = 'red';
export const PLAYER_BLACK = 'black';

// 玩家名称
export const PLAYER_ONE = '玩家一';
export const PLAYER_TWO = '玩家二';

// 游戏阶段
export const GAME_PHASE = {
  REVEAL: 'reveal',
  PLAY: 'play',
};

// 棋子类型和等级
export const POWER_ORDER = {
  '象': 8,
  '狮': 7,
  '虎': 6,
  '豹': 5,
  '狼': 4,
  '狗': 3,
  '猫': 2,
  '鼠': 1,
  '枪': 7,
  '人': 6,
};

// 特殊规则
export const SPECIAL_RULES = {
  '鼠': ['象'],  // 鼠可以吃象
  '枪': ['象', '狮', '虎', '豹', '狼', '狗', '猫', '鼠'], // 枪可以吃除人以外的所有棋子
};

// 初始棋盘布局
export const INITIAL_BOARD = [
  { type: '象', color: PLAYER_RED },
  { type: '狮', color: PLAYER_RED },
  { type: '虎', color: PLAYER_RED },
  { type: '豹', color: PLAYER_RED },
  { type: '狼', color: PLAYER_RED },
  { type: '狗', color: PLAYER_BLACK },
  { type: '猫', color: PLAYER_BLACK },
  { type: '鼠', color: PLAYER_BLACK },
  { type: '枪', color: PLAYER_BLACK },
  { type: '人', color: PLAYER_BLACK },
  { type: '狗', color: PLAYER_RED },
  { type: '猫', color: PLAYER_RED },
  { type: '鼠', color: PLAYER_RED },
  { type: '枪', color: PLAYER_RED },
  { type: '人', color: PLAYER_RED },
  { type: '象', color: PLAYER_BLACK },
  { type: '狮', color: PLAYER_BLACK },
  { type: '虎', color: PLAYER_BLACK },
  { type: '豹', color: PLAYER_BLACK },
  { type: '狼', color: PLAYER_BLACK },
];

// 判断是否可以吃子
export function canCapture(attacker, target) {
  if (!attacker || !target || attacker.color === target.color) return false;

  if (SPECIAL_RULES[attacker.type]?.includes(target.type)) return true;

  if (attacker.type === '象' && target.type === '鼠') return false;

  if (attacker.type === '枪' && target.type === '人') return false;

  return POWER_ORDER[attacker.type] >= POWER_ORDER[target.type];
}

// 获取有效移动位置
export function getValidMoves(board, index, revealed) {
  if (index === null) return [];

  const piece = board[index];
  if (!piece) return [];

  const x = Math.floor(index / 5);
  const y = index % 5;
  const moves = [];

  const directions = [
    [-1, 0], // 上
    [1, 0],  // 下
    [0, -1], // 左
    [0, 1]   // 右
  ];

  for (const [dx, dy] of directions) {
    const newX = x + dx;
    const newY = y + dy;
    const newIndex = newX * 5 + newY;

    if (newX >= 0 && newX < 4 && newY >= 0 && newY < 5) {
      const targetPiece = board[newIndex];
      if (!targetPiece || (revealed[newIndex] && canCapture(piece, targetPiece))) {
        moves.push(newIndex);
      }
    }
  }

  return moves;
}

// 检查玩家是否有可移动的棋子
export function hasValidMoves(board, playerColor, revealed) {
  let hasMove = false;
  board.forEach((piece, index) => {
    if (piece?.color === playerColor) {
      const moves = getValidMoves(board, index, revealed);
      if (moves.length > 0) {
        hasMove = true;
      }
    }
  });
  return hasMove;
}

// 检查游戏是否结束
export function checkGameOver(board, revealed, currentPlayer, playerColor, opponentColor) {
  // 计算双方剩余棋子数量
  const redPieces = board.filter(p => p?.color === PLAYER_RED).length;
  const blackPieces = board.filter(p => p?.color === PLAYER_BLACK).length;

  // 检查是否所有棋子都已翻开
  const allRevealed = revealed.every(r => r === true);

  if (allRevealed) {
    // 检查是否有一方棋子全部被吃掉
    if (redPieces === 0) return PLAYER_BLACK;
    if (blackPieces === 0) return PLAYER_RED;

    // 检查当前玩家是否无法移动
    const currentPlayerColor = currentPlayer === PLAYER_RED ? playerColor : opponentColor;
    if (!hasValidMoves(board, currentPlayerColor, revealed)) {
      return currentPlayer === PLAYER_RED ? PLAYER_BLACK : PLAYER_RED;
    }
  }

  return null;
}

// 洗牌函数
export function shuffleBoard(board) {
  const shuffled = [...board];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
