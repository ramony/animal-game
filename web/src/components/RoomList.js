import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { cn } from "../lib/utils"
import constants from "../lib/constants"

const RoomList = ({ onJoinRoom }) => {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRooms();
    // const interval = setInterval(() => {
    //   fetchRooms();
    // }, 2000);
    // return () => clearInterval(interval);
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch(constants.host + '/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        setError('获取房间列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  const createRoom = async () => {
    try {
      const response = await fetch(constants.host + '/rooms', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const room = await response.json();
        onJoinRoom(room.id);
      } else {
        setError('创建房间失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">游戏大厅{window.innerWidth}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={createRoom}
              className="w-full"
            >
              创建新房间
            </Button>

            {error && (
              <div className="text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card
                  key={room.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    "border-2",
                    room.players.length === 2 ? "border-muted" : "border-primary"
                  )}
                  onClick={() => room.players.length < 2 && onJoinRoom(room.id)}
                >
                  <CardContent className="p-4">
                    <div className="text-lg font-semibold mb-2">
                      房间 {room.id}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {room.players.length}/2 玩家
                    </div>
                    <div className="text-sm">
                      {room.players.join(', ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomList;
