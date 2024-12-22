'use client';
import * as PIXI from 'pixi.js'
import '@pixi/events';

import React, { useState, useEffect, useCallback } from 'react';
import { Stage, Container, Graphics, Text, useTick } from '@pixi/react'

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getValidMoves,
} from '@/lib/game-logic';


export default function GameBoardCanvas({ player, room, gameState, onReveal, onMove, onBackdoor }) {
  const [board, setBoard] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [gameStatus, setGameStatus] = useState(`游戏开始`);
  const [gameover, setGameover] = useState(false);
  const [positions, setPositions] = useState([]);
  const [movingPiece, setMovingPiece] = useState(null);

  useEffect(() => {
    if (gameState) {
      const { actions } = gameState;
      if (actions != null && actions.length > 0) {
        setMovingPiece(pre => {
          const newMovingPiece = [...pre];
          const movingIndex = actions[0].oldPiece
          const toIndex = actions[0].newPiece
          const nowIndex = newMovingPiece.length;
          const movingPosition = { x: positions[movingIndex].x, y: positions[movingIndex].y }
          const toPosition = { x: positions[toIndex].x, y: positions[toIndex].y }
          newMovingPiece.push({ ...movingPosition, type: board[movingIndex].type, color: board[movingIndex].color });

          gsap.to(movingPosition, {
            ...toPosition,
            duration: 0.5,
            ease: "power1.inOut",
            repeat: 1,
            yoyo: true,
            onUpdate: function () {
              //console.log('progress', this.progress)
              //setPlayer(prev => ({ ...prev, y: this.targets()[0].y })); // 更新半径
            },
          });
          return newMovingPiece;
        });
        setBoard(pre => {
          const newBoard = [...pre];
          newBoard[actions[0].oldPiece] = null;
          newBoard[actions[0].newPiece] = null;
          return newBoard;
        });
        return;
      }

      setBoard(gameState.board);
      setCurrentPlayer(gameState.currentPlayer);
      setGameStatus(gameState.gameStatus);
      setPlayerColor(gameState.playerColorMap?.[player]);
      setGameover(gameState.gameover);
    }
  }, [gameState]);

  useEffect(() => {
    const x = width / 2 - (cols - 1) / 2 * size
    const y = height / 2 - (rows - 1) / 2 * size
    const positions = Array(20).fill(null).map((_, index) => {
      return { x: x + index % cols * size, y: y + Math.floor(index / cols) * size };
    })
    setPositions(positions);
  }, []);

  const handlePieceClick = (index) => {
    console.log('handlePieceClick', index);
    if (gameover) {
      return
    }
    if (currentPlayer !== player) {
      return;
    }
    const piece = board[index];
    if (piece && !piece.revealed) {
      onReveal(index);
      return;
    }
    if (selectedPiece === null) {
      if (board[index]?.color === playerColor) {
        setSelectedPiece(index);
        setGameStatus(`已选择${board[index].type}，请选择移动位置`);
      } else {
        setGameStatus(`对方棋子，无法选择`);
      }
    } else {
      if (index === selectedPiece) {
        setSelectedPiece(null);
        setGameStatus(`已取消选择，请重新选择棋子`);
        return;
      }

      onMove(selectedPiece, index);
      setSelectedPiece(null);
    }
  };

  const restartGame = () => {

  };

  const backdoorData = [...Array(17).fill(null), ...Array(3).fill({ revealed: true })];

  const width = 800
  const height = 600

  const boardWidth = 700
  const boardHeight = 550

  const rows = 4
  const cols = 5

  const size = 150

  const radius = 20

  const createPiece = (index, position, piece) => {
    return (
      <Container x={position.x} y={position.y} anchor={[0.5, 0.5]} rotation={0} interactive={true}
        pointerdown={() => handlePieceClick(index)}>
        <Graphics draw={g => {
          g.clear()
          if (!piece) {
            g.alpha = 0;
          }
          if (selectedPiece === index) {
            g.lineStyle(5, 0xFF0000);
          } else {
            g.lineStyle(1, 0xCCCCCC);
          }
          g.beginFill(0xffffff);
          g.drawCircle(0, 0, radius);
          g.endFill();
        }} />
        {
          piece && !piece.revealed && (
            <Text text={"?"} anchor={[0.5, 0.5]} style={{ fontSize: 24, fill: piece.color }} pointerdown={() => handlePieceClick(index)} />
          )
        }
        {
          piece && piece.revealed && (
            <Text text={piece.type} anchor={[0.5, 0.5]} style={{ fontSize: 24, fill: piece.color }} pointerdown={() => handlePieceClick(index)} />
          )
        }
      </Container>
    )
  }

  const PieceList = ({ pieces }) => {
    if (!pieces) {
      return null;
    }
    return pieces.map((piece, index) => {
      return createPiece(index, positions[index], piece);
    })
  }

  const MovingPieceList = ({ pieces }) => {
    if (!pieces) {
      return null;
    }
    return pieces.map((piece, index) => {
      return createPiece(index, { x: piece.x, y: piece.y }, piece);
    })
  }

  const drawBoard = useCallback((g) => {
    g.clear()
    g.beginFill(0xFFFFFF); // 设置填充色
    //g.lineStyle(3, 0xCCCCCC); // 设置描边线宽和颜色
    g.drawRoundedRect(width / 2 - boardWidth / 2, height / 2 - boardHeight / 2, boardWidth, boardHeight, 30);

    g.lineStyle(1, 0xCCCCCC);
    const x = width / 2 - (cols - 1) / 2 * size
    const y = height / 2 - (rows - 1) / 2 * size
    g.drawRect(x, y, (cols - 1) * size, (rows - 1) * size);

    for (let i = 1; i < rows - 1; i++) {
      g.moveTo(x, y + i * size);
      g.lineTo(x + (cols - 1) * size, y + i * size);
    }

    for (let j = 1; j < cols - 1; j++) {
      g.moveTo(x + j * size, y);
      g.lineTo(x + j * size, y + (rows - 1) * size);
    }

  }, [board])

  const fontSize = 16


  return (
    <Stage width={width} height={height} options={{ backgroundColor: 0xF6F6F6 }} >
      <Container interactive={true} width={width} height={height}>
        <Graphics draw={drawBoard} />
        <PieceList pieces={board} />
        <MovingPieceList pieces={movingPiece} />
        <Text
          text={`颜色: ${playerColor ? (playerColor === 'red' ? '红方' : '黑方') : '待定'}`}
          x={100}
          y={10}
          style={new PIXI.TextStyle({
            fill: 0xffffff,
            fontSize: fontSize
          })}
        />
        <Text
          text={`状态: ${gameStatus}`}
          x={320}
          y={10}
          style={new PIXI.TextStyle({
            fill: 0xffffff,
            fontSize: fontSize
          })}
        />
        <Text
          text={` ${gameover ? "游戏结束" : (player === currentPlayer ? "我方回合" : "对方回合")}`}
          x={640}
          y={10}
          style={new PIXI.TextStyle({
            fill: 0xffffff,
            fontSize: fontSize
          })}
        />
      </Container>

    </Stage>
  );
}
