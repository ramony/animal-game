'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  PLAYER_RED,
  PLAYER_BLACK,
  PLAYER_ONE,
  PLAYER_TWO,
  GAME_PHASE,
  INITIAL_BOARD,
  canCapture,
  getValidMoves,
  checkGameOver,
  shuffleBoard,
} from '@/lib/game-logic';

import '../styles/game.css';

export default function Game() {
  const [board, setBoard] = useState(INITIAL_BOARD);
  const [revealed, setRevealed] = useState(Array(20).fill(false));
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_RED);
  const [playerColor, setPlayerColor] = useState(null);
  const [opponentColor, setOpponentColor] = useState(null);
  const [gamePhase, setGamePhase] = useState(GAME_PHASE.REVEAL);
  const [gameStatus, setGameStatus] = useState(`游戏开始！${PLAYER_ONE}先翻开棋子`);
  const [revealTurn, setRevealTurn] = useState(PLAYER_RED);
  const [firstRevealedColor, setFirstRevealedColor] = useState(null);

  // 在客户端初始化棋盘
  useEffect(() => {
    setBoard(shuffleBoard(INITIAL_BOARD));
  }, []);

  const handlePieceClick = (index) => {
    if (gamePhase === GAME_PHASE.REVEAL && !playerColor) {
      if (!revealed[index]) {
        if (revealTurn !== currentPlayer) {
          setGameStatus(`现在是${revealTurn === PLAYER_RED ? PLAYER_ONE : PLAYER_TWO}翻开回合`);
          return;
        }

        const newRevealed = [...revealed];
        newRevealed[index] = true;
        setRevealed(newRevealed);

        const currentPiece = board[index];

        if (!firstRevealedColor) {
          setFirstRevealedColor(currentPiece.color);
          setGameStatus(`翻开了${currentPiece.color === PLAYER_RED ? '红' : '黑'}色棋子，轮到对方翻开`);
        } else if (currentPiece.color !== firstRevealedColor) {
          setPlayerColor(revealTurn === PLAYER_RED ? currentPiece.color : firstRevealedColor);
          setOpponentColor(revealTurn === PLAYER_RED ? firstRevealedColor : currentPiece.color);
          setGamePhase(GAME_PHASE.PLAY);
          setCurrentPlayer(PLAYER_RED);
          setGameStatus(`颜色确定！${PLAYER_ONE}先行`);
          return;
        }

        setRevealTurn(revealTurn === PLAYER_RED ? PLAYER_BLACK : PLAYER_RED);
        setCurrentPlayer(revealTurn === PLAYER_RED ? PLAYER_BLACK : PLAYER_RED);
      }
    } else {
      const currentPlayerColor = currentPlayer === PLAYER_RED ? playerColor : opponentColor;

      if (selectedPiece === null) {
        if (!revealed[index]) {
          const newRevealed = [...revealed];
          newRevealed[index] = true;
          setRevealed(newRevealed);
          const revealedPiece = board[index];

          const nextPlayer = currentPlayer === PLAYER_RED ? PLAYER_BLACK : PLAYER_RED;
          setCurrentPlayer(nextPlayer);

          setGameStatus(`翻开了${revealedPiece.color === PLAYER_RED ? '红' : '黑'}方${revealedPiece.type}！轮到${nextPlayer === PLAYER_RED ? PLAYER_ONE : PLAYER_TWO}行动`);
        } else if (board[index]?.color === currentPlayerColor) {
          setSelectedPiece(index);
          setGameStatus(`已选择${board[index].type}，请选择移动位置`);
        } else {
          setGameStatus(`现在是${currentPlayer === PLAYER_RED ? PLAYER_ONE : PLAYER_TWO}行动`);
        }
      } else {
        if (index === selectedPiece) {
          setSelectedPiece(null);
          setGameStatus(`已取消选择，请重新选择棋子`);
          return;
        }

        const validMoves = getValidMoves(board, selectedPiece, revealed);
        if (validMoves.includes(index)) {
          const newBoard = [...board];
          const capturedPiece = newBoard[index];
          newBoard[index] = board[selectedPiece];
          newBoard[selectedPiece] = null;
          setBoard(newBoard);

          if (!revealed[index]) {
            const newRevealed = [...revealed];
            newRevealed[index] = true;
            setRevealed(newRevealed);
          }

          const nextPlayer = currentPlayer === PLAYER_RED ? PLAYER_BLACK : PLAYER_RED;
          setCurrentPlayer(nextPlayer);

          if (capturedPiece) {
            setGameStatus(`${currentPlayer === PLAYER_RED ? PLAYER_ONE : PLAYER_TWO}的${board[selectedPiece].type}吃掉了${capturedPiece.type}！轮到${nextPlayer === PLAYER_RED ? PLAYER_ONE : PLAYER_TWO}行动`);
          } else {
            setGameStatus(`${currentPlayer === PLAYER_RED ? PLAYER_ONE : PLAYER_TWO}的${board[selectedPiece].type}移动到新位置！轮到${nextPlayer === PLAYER_RED ? PLAYER_ONE : PLAYER_TWO}行动`);
          }

          const winner = checkGameOver(newBoard, revealed, currentPlayer, playerColor, opponentColor);
          if (winner) {
            setGameStatus(`游戏结束！${winner === PLAYER_RED ? '红' : '黑'}方获胜！`);
          }
        } else {
          setGameStatus(`不能移动到该位置，请重新选择`);
        }
        setSelectedPiece(null);
      }
    }
  };

  const restartGame = () => {
    setBoard(shuffleBoard(INITIAL_BOARD));
    setRevealed(Array(20).fill(false));
    setPlayerColor(null);
    setOpponentColor(null);
    setFirstRevealedColor(null);
    setSelectedPiece(null);
    setGamePhase(GAME_PHASE.REVEAL);
    setCurrentPlayer(PLAYER_RED);
    setRevealTurn(PLAYER_RED);
    setGameStatus(`游戏开始！${PLAYER_ONE}先翻开棋子`);
  };

  return (
    <div className="game-container">
      <div className="flex flex-col items-center gap-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-gradient">动物棋</h1>

        <div className="flex justify-between w-full mb-4">
          <div className={`player-card ${currentPlayer === PLAYER_RED ? 'active' : ''}`}>
            <div className="text-xl">
              {PLAYER_ONE}
              <span className="ml-2 font-semibold">
                {playerColor ? (playerColor === PLAYER_RED ? '红方' : '黑方') : '待定'}
              </span>
            </div>
          </div>

          <div className="game-status">
            <p className="text-xl">{gameStatus}</p>
          </div>

          <div className={`player-card ${currentPlayer === PLAYER_BLACK ? 'active' : ''}`}>
            <div className="text-xl">
              {PLAYER_TWO}
              <span className="ml-2 font-semibold">
                {opponentColor ? (opponentColor === PLAYER_RED ? '红方' : '黑方') : '待定'}
              </span>
            </div>
          </div>
        </div>

        <div className="game-board">
          <div className="grid grid-cols-5 gap-4">
            {board.map((piece, index) => {
              const isCurrentPlayerPiece = piece?.color === (currentPlayer === PLAYER_RED ? playerColor : opponentColor) && revealed[index];
              const isValidMove = selectedPiece !== null && getValidMoves(board, selectedPiece, revealed).includes(index);

              return (
                <div
                  key={index}
                  className={`piece ${revealed[index] ? 'revealed' : ''}`}
                >
                  <Card
                    className={`w-32 h-32 piece-content
                      ${selectedPiece === index ? 'shadow-lg ring-2 ring-blue-400' : ''}
                      ${isValidMove ? 'bg-green-200' : ''}
                      ${revealed[index] ? (piece?.color === PLAYER_RED ? 'bg-orange-100' : 'bg-gray-100') : ''}
                      ${isCurrentPlayerPiece || !revealed[index] ? 'cursor-pointer' : 'cursor-not-allowed'}
                      transition-all duration-300 hover:shadow-lg`}
                    onClick={() => handlePieceClick(index)}
                  >
                    <div className="piece-front">
                      <div className="text-4xl text-gray-400">?</div>
                    </div>
                    <div className="piece-back">
                      {piece && (
                        <div className={`text-4xl ${piece.color === PLAYER_RED ? 'text-red-500' : 'text-black'}`}>
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

        <Button
          className="restart-button text-lg px-8 py-8 text-white rounded-full"
          onClick={restartGame}
        >
          重新开始游戏
        </Button>
      </div>
    </div>
  );
}
