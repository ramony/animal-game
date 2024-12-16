// 棋子类型和等级
const POWER_ORDER = {
  '枪': 100,
  '象': 90,
  '狮': 80,
  '虎': 70,
  '豹': 60,
  '狼': 50,
  '人': 40,
  '狗': 30,
  '猫': 20,
  '鼠': 10,
};

// 特殊规则
const SPECIAL_RULES = {
  '鼠': ['象'],  // 鼠可以吃象
  '人': ['枪'], // 枪可以吃除人以外的所有棋子
};

// 判断是否可以吃子
function canCapture(attacker, target) {

  if (!attacker || !target || attacker.color === target.color) {
    return false;
  }
  if (SPECIAL_RULES[attacker.type]?.includes(target.type)) {
    return true;
  }
  if (SPECIAL_RULES[target.type]?.includes(attacker.type)) {
    return false;
  }

  return POWER_ORDER[attacker.type] >= POWER_ORDER[target.type];
}


// 获取有效移动位置
export function getValidMoves(board, index) {
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
      if (!targetPiece || (board[newIndex].revealed && canCapture(piece, targetPiece))) {
        moves.push(newIndex);
      }
    }
  }

  return moves;
}
