import React, { useRef, useEffect, useState } from "react";

const BOARD_SIZE = 8; // 8x8 棋盘
const TILE_SIZE = 50; // 每个格子大小 50px

// 初始化棋盘状态
const initializeBoard = () => {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );

  // 示例初始化棋子
  board[0][0] = { type: "rook", player: 1, isFlipped: false };
  board[7][7] = { type: "rook", player: 2, isFlipped: false };

  return board;
};

const GameBoardCanvas = () => {
  const canvasRef = useRef(null);
  const [board, setBoard] = useState(initializeBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);

  // 绘制棋盘
  const drawBoard = (ctx) => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? "#EEE" : "#AAA";
        ctx.fillRect(j * TILE_SIZE, i * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  };

  // 绘制棋子
  const drawPieces = (ctx) => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const piece = board[i][j];
        if (piece) {
          ctx.fillStyle = piece.isFlipped ? (piece.player === 1 ? "blue" : "red") : "gray";
          ctx.beginPath();
          ctx.arc(
            j * TILE_SIZE + TILE_SIZE / 2,
            i * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE / 3,
            0,
            Math.PI * 2
          );
          ctx.fill();

          if (piece.isFlipped) {
            ctx.fillStyle = "white";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.fillText(piece.type, j * TILE_SIZE + TILE_SIZE / 2, i * TILE_SIZE + TILE_SIZE / 2 + 5);
          }
        }
      }
    }
  };

  // 更新画布
  const updateCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBoard(ctx);
    drawPieces(ctx);
  };

  useEffect(() => {
    updateCanvas();
  }, [board]);

  // 处理点击事件
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    const piece = board[y][x];

    if (selectedPiece) {
      // 如果已有选中的棋子，尝试移动
      const newBoard = board.map((row) => row.slice());
      newBoard[y][x] = selectedPiece;
      newBoard[selectedPiece.y][selectedPiece.x] = null;

      setBoard(newBoard);
      setSelectedPiece(null);
    } else if (piece && !piece.isFlipped) {
      // 翻开棋子
      const newBoard = board.map((row) => row.slice());
      newBoard[y][x] = { ...piece, isFlipped: true };
      setBoard(newBoard);
    } else if (piece) {
      // 选中棋子
      setSelectedPiece({ ...piece, x, y });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={BOARD_SIZE * TILE_SIZE}
      height={BOARD_SIZE * TILE_SIZE}
      style={{ border: "1px solid black" }}
      onClick={handleClick}
    />
  );
};

export default GameBoardCanvas;
