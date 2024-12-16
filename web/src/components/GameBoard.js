'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getValidMoves,
} from '@/lib/game-logic';


export default function Game({ player, room, gameState, onReveal, onMove, onBackdoor }) {
  const [board, setBoard] = useState(null);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [gameStatus, setGameStatus] = useState(`游戏开始`);
  const [gameover, setGameover] = useState(false);

  useEffect(() => {
    if (gameState) {
      setBoard(gameState.board);
      setCurrentPlayer(gameState.currentPlayer);
      setGameStatus(gameState.gameStatus);
      setPlayerColor(gameState.playerColorMap?.[player]);
      setGameover(gameState.gameover);
    }
  }, [gameState]);

  const handlePieceClick = (index) => {
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

  return (
    <div className="game-container">
      <div className="w-100 flex flex-col items-center align-top gap-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-2 text-gradient">动物棋，房间 {room.roomId} {room.players.join(', ')}</h1>

        <div className="flex justify-between w-full mb-4">
          <div className={`game-status ${currentPlayer === player ? 'active' : ''}`}>
            <p className="text-lg">
              颜色：{playerColor ? (playerColor === 'red' ? '红方' : '黑方') : '待定'}
            </p>
          </div>

          <div className="game-status">
            <p className="text-lg">{gameover ? '游戏结束' : (player === currentPlayer ? "我方回合" : "对方回合")}</p>
          </div>

          <div className="game-status">
            <p className="text-lg">{gameStatus}</p>
          </div>

        </div>

        <div className="game-board">
          <div className="board-grid">
            {/* 渲染格子 */}
            {Array(12).fill(null).map((_, index) => (
              <div key={index} className="grid-cell" />
            ))}

            {/* 渲染所有可能的位置 */}
            {board?.map((piece, index) => {
              const row = Math.floor(index / 5);
              const col = index % 5;
              const top = `${row * 33}%`;
              const left = `${col * 25}%`;
              const isCurrentPlayerPiece = piece?.color === playerColor && board[index].revealed;
              const isValidMove = selectedPiece !== null && getValidMoves(board, selectedPiece).includes(index);
              return (
                <div
                  key={index}
                  className={`piece ${piece?.revealed ? 'revealed' : ''}`}
                  style={{
                    top,
                    left,
                  }}
                >
                  <Card
                    className={`piece-content
                      ${selectedPiece === index ? 'shadow-lg ring-2 ring-blue-400' : ''}
                      ${isValidMove ? 'bg-green-200' : ''}
                      ${piece?.revealed ? (piece?.color === 'red' ? 'bg-orange-100' : 'bg-gray-100') : ''}
                      ${isCurrentPlayerPiece || !piece?.revealed ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${!piece ? 'opacity-0 hover:opacity-30' : ''}
                      transition-all duration-300 hover:shadow-lg`}
                    onClick={() => handlePieceClick(index)}
                  >
                    <div className="piece-front">
                      <div className="text-4xl text-gray-400">{piece && !piece.revealed ? '?' : ''}</div>
                    </div>
                    <div className={`piece-back ${isCurrentPlayerPiece && currentPlayer === player ? 'piece-back-active' : ''}`}>
                      {piece && (
                        <div className={`text-4xl ${piece.color === 'red' ? 'text-red-500' : 'text-black'}`}>
                          {piece.type}
                        </div>
                      )}
                    </div>

                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* <Button
          className="restart-button text-lg px-8 py-8 text-white rounded-full"
          onClick={restartGame}
        >
          重新开始游戏
        </Button>
        <Button
          className="restart-button text-lg px-8 py-8 text-white rounded-full"
          onClick={() => onBackdoor(backdoorData)}
        >
          通过后门
        </Button> */}
      </div>
    </div>
  );
}
