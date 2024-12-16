import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import GameBoard from '@/components/GameBoard';
import GameBoardCanvas from '@/components/GameBoardCanvas';

import constants from '@/lib/constants';

import LoginForm from '@/components/LoginForm';
import RoomList from '@/components/RoomList';
import Head from 'next/head'

export default function Home() {
  const [socket, setSocket] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [player, setPlayer] = useState();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const roomId = localStorage.getItem('roomId');
    if (!isLoggedIn) {
      if (token) {
        setIsLoggedIn(true);
        const username = localStorage.getItem('username')
        setPlayer(username)
        return;
      }
    }

    if (isLoggedIn && !socket) {
      const newSocket = io(constants.host, {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        if (roomId) {
          newSocket.emit('joinRoom', roomId);
        }
      });

      newSocket.on('roomUpdate', (room) => {
        setCurrentRoom(room);
      });

      newSocket.on('gameStart', (initialGameState) => {
        setGameState(initialGameState);
      });

      newSocket.on('gameUpdate', (newGameState) => {
        setGameState(newGameState);
      });

      newSocket.on('playerLeft', () => {
        setGameState("对方离开了房间");
        //setCurrentRoom(null);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [isLoggedIn]);

  const handleLogin = (success) => {
    setIsLoggedIn(success);
  };

  const handleJoinRoom = (roomId) => {
    if (socket) {
      localStorage.setItem('roomId', roomId);
      socket.emit('joinRoom', roomId);
    }
  };

  const handleReveal = (index) => {
    if (socket && currentRoom) {
      socket.emit('reveal', {
        roomId: currentRoom.id,
        index
      });
    }
  };

  const handleMove = (selectedPiece, index) => {
    if (socket && currentRoom) {
      socket.emit('move', {
        roomId: currentRoom.id,
        selectedPiece,
        index
      });
    }
  };
  const handleBackdoor = (boardMockData) => {
    if (socket && currentRoom) {
      socket.emit('backdoor', {
        roomId: currentRoom.id,
        boardMockData
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roomId');
    setIsLoggedIn(false);
    setCurrentRoom(null);
    setGameState(null);
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div>
      <Head>
        <title>动物棋</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"></meta>
      </Head>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4">
          <header className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold">动物棋</h1>
            <span>{player}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-destructive rounded-md hover:bg-destructive/90"
            >
              退出登录
            </button>
          </header>

          {!currentRoom && (
            <RoomList onJoinRoom={handleJoinRoom} />
          )}

          {currentRoom && !gameState && (
            <div className="text-center mt-8">
              <h2 className="text-xl font-semibold mb-4">等待其他玩家加入...</h2>
              <p className="text-muted-foreground">房间号: {currentRoom.id}</p>
              <p className="text-muted-foreground">玩家: {currentRoom.players.join(', ')}</p>
            </div>
          )}

          {gameState && player != null && (
            <GameBoard room={currentRoom} player={player} gameState={gameState}
              onReveal={handleReveal}
              onMove={handleMove}
              onBackdoor={handleBackdoor} />
          )}

          {/* <GameBoardCanvas room={currentRoom} player={player} gameState={gameState}
            onReveal={handleReveal}
            onMove={handleMove}
            onBackdoor={handleBackdoor} /> */}

        </div>
      </div>

    </div>
  );
}
