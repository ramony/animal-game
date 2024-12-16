const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const gameLogic = require('./game-logic-server');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 启用 CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// 启用 JSON 解析
app.use(express.json());

// 预设用户
const users = {
  'user1': { password: 'pass1' },
  'user2': { password: 'pass2' }
};

// 房间状态
const rooms = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  players: [],
  gameState: null
}));

// 身份验证中间件
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    socket.username = decoded.username;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// 登录路由
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // 验证用户名和密码
  if (users[username] && users[username].password === password) {
    const token = jwt.sign({ username }, 'your-secret-key', { expiresIn: '24h' });
    res.json({ token, username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

//rooms路由
app.get('/rooms', (req, res) => {
  res.json(rooms);
});

app.post('/rooms', (req, res) => {
  const newRoom = {
    id: rooms.length + 1,
    players: [],
    gameState: null
  };
  rooms.push(newRoom);
  res.json(newRoom);
});

function registerEvent(io, socket, eventHandler, globalData) {
  for (const [message, handler] of Object.entries(eventHandler)) {
    socket.on(message, (data) => {
      const result = handler(data, globalData, socket, io);
      if (result) {
        if (result.to === 'me') {
          socket.emit(result.type, result.data);
        } else {
          io.to(result.to).emit(result.type, result.data);
        }
      }
    });
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.username);
  registerEvent(io, socket, gameLogic.ANIMAL_EVENT_HANDLER, rooms);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
