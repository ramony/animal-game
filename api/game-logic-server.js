// 玩家颜色
const COLOR_RED = 'red';
const COLOR_BLACK = 'black';

const OPPISITE_COLOR = {
  'red': 'black',
  'black': 'red',
};

const COLOR_TEXT_MAP = {
  'red': '红',
  'black': '黑',
};

const PIECE_LIST = [
  '枪',
  '象',
  '狮',
  '虎',
  '豹',
  '狼',
  '人',
  '狗',
  '猫',
  '鼠',
];

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

function initializeGame(players) {
  // 初始棋盘布局
  const startPlayer = players[0];
  const initBoard = PIECE_LIST.flatMap((type) => {
    return [
      { type, color: COLOR_RED, revealed: false },
      { type, color: COLOR_BLACK, revealed: false },
    ];
  });
  return {
    gameover: false,
    board: shuffleBoard(initBoard),
    currentPlayer: startPlayer,
    playerColorMap: {},
    gameStatus: '游戏开始，先翻开棋子',
    lastRevealed: null,
    colorConfirmed: false,
    gameover: false
  };
}

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
function getValidMoves(board, index) {
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
      if (!targetPiece || (targetPiece.revealed && canCapture(piece, targetPiece))) {
        moves.push(newIndex);
      }
    }
  }

  return moves;
}

// 检查玩家是否有可移动的棋子
function hasValidMoves(board, playerColor) {
  let hasMove = false;
  board.forEach((piece, index) => {
    if (piece?.color === playerColor) {
      const moves = getValidMoves(board, index);
      if (moves.length > 0) {
        hasMove = true;
      }
    }
  });
  return hasMove;
}

// 检查游戏是否结束
function checkGameOver(board, playerColor) {
  const checkColor = OPPISITE_COLOR[playerColor];
  // 计算双方剩余棋子数量
  const leftPieces = board.filter(p => p?.color === checkColor).length;
  // 检查是否所有棋子都已翻开
  const allRevealed = board.every(r => !r || r.revealed === true);

  if (allRevealed) {
    // 检查是否有一方棋子全部被吃掉
    if (leftPieces === 0) {
      return { gameover: true, colorText: COLOR_TEXT_MAP[playerColor] };
    }

    // 检查当前玩家是否无法移动
    if (!hasValidMoves(board, checkColor)) {
      return { gameover: true, colorText: COLOR_TEXT_MAP[playerColor] };
    }
  }
  return { gameover: false };
}

function shuffleBoard(board) {
  const shuffled = [...board];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getPieceText(piece) {
  if (!piece) return null;
  return COLOR_TEXT_MAP[piece.color] + piece.type;
}

const ANIMAL_EVENT_HANDLER = {}

ANIMAL_EVENT_HANDLER.backkdoor = ({ roomId, boardMockData }, rooms) => {
  const room = rooms[roomId - 1];
  if (room && room.gameState) {
    // 验证和执行移动
    const gameState = room.gameState;
    boardMockData.forEach((piece, index) => {
      if (piece) {
        gameState.board[index] = { ...gameState.board[index], ...piece };
      } else {
        gameState.board[index] = null;
      }
    });
    gameState.colorConfirmed = true;
    gameState.playerColorMap = { 'user2': 'red', 'user1': 'black' };
    return { to: `room-${roomId}`, type: 'gameUpdate', data: room.gameState }
  }
}

// 加入房间
ANIMAL_EVENT_HANDLER.joinRoom = (roomId, rooms, socket, io) => {
  const room = rooms[roomId - 1];
  if (room && room.players.length < 2) {
    socket.join(`room-${roomId}`);
    room.players.push(socket.username);
    io.to(`room-${roomId}`).emit('roomUpdate', room);

    if (room.players.length === 2) {
      // 开始游戏
      room.gameState = initializeGame(room.players);
      io.to(`room-${roomId}`).emit('gameStart', room.gameState);
    }
  }
}

ANIMAL_EVENT_HANDLER.disconnect = (_, rooms, socket, io) => {
  console.log('User disconnected:', socket.username);
  // 清理房间状态
  rooms.forEach(room => {
    const index = room.players.indexOf(socket.username);
    if (index !== -1) {
      room.players.splice(index, 1);
      room.gameState = null;
      io.to(`room-${room.id}`).emit('playerLeft', { username: socket.username });
    }
  });
}

ANIMAL_EVENT_HANDLER.reveal = ({ roomId, index }, rooms, socket) => {
  const room = rooms[roomId - 1];
  if (room && room.gameState) {
    // 验证和执行移动
    const gameState = room.gameState;
    if (gameState.board[index]) {
      gameState.board[index].revealed = true;
    }
    const username = socket.username;
    if (!gameState.colorConfirmed) {
      const piece = gameState.board[index];
      const lastRevealed = gameState.lastRevealed;
      if (!lastRevealed) {
        gameState.lastRevealed = { color: piece.color, username };
        gameState.gameStatus = "继续翻开棋子";
      } else if (piece.color !== lastRevealed.color) {
        gameState.playerColorMap[username] = piece.color;
        gameState.playerColorMap[lastRevealed.username] = lastRevealed.color;
        gameState.gameStatus = "双方颜色已确定";
        gameState.colorConfirmed = true;
      } else {
        gameState.lastRevealed = { color: piece.color, username };
        gameState.gameStatus = "继续翻开棋子";
      }
    }
    gameState.currentPlayer = room.players[0] === gameState.currentPlayer ? room.players[1] : room.players[0]; // 更新当前玩家gameState.currentPlayer;
    return { to: `room-${roomId}`, type: 'gameUpdate', data: room.gameState }
  }
}

ANIMAL_EVENT_HANDLER.move = ({ roomId, selectedPiece, index }, rooms, socket) => {
  const room = rooms[roomId - 1];
  const actions = []
  if (room && room.gameState) {
    // 验证和执行移动
    const gameState = room.gameState;
    const board = gameState.board;
    const currentPlayer = gameState.currentPlayer;
    const validMoves = getValidMoves(board, selectedPiece);
    if (validMoves.includes(index)) {
      const newPiece = board[index];
      const oldPiece = board[selectedPiece];
      board[index] = board[selectedPiece];
      board[selectedPiece] = null;

      gameState.currentPlayer = room.players[0] === gameState.currentPlayer ? room.players[1] : room.players[0]; // 更新当前玩家gameState.currentPlayer;

      const oldPieceText = getPieceText(oldPiece);
      if (newPiece) {
        const newPieceText = getPieceText(newPiece);
        gameState.gameStatus = `${oldPieceText}吃掉了${newPieceText}`;
        actions.push({ type: 'capture', oldPiece, newPiece });
      } else {
        gameState.gameStatus = `${oldPieceText}移动到新位置`;
        actions.push({ type: 'move', oldPiece, newPiece });
      }

      const playerColor = gameState.playerColorMap[currentPlayer];
      const result = checkGameOver(board, playerColor);
      if (result.gameover) {
        gameState.gameStatus = `${result.colorText}方获胜`;
        gameState.gameover = true;
      }
    } else {
      gameState.gameStatus = `不能移动到该位置，请重新选择`;
      return { to: 'me', type: 'gameUpdate', data: room.gameState };
    }
    return { to: `room-${roomId}`, type: 'gameUpdate', data: { ...room.gameState, actions } }
  }
}

export { ANIMAL_EVENT_HANDLER } 