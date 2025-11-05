// index.js (Render-ready)
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

['MONGO_URI', 'JWT_SECRET'].forEach((k) => {
  if (!process.env[k]) console.warn(`[WARN] Missing env ${k}`);
});

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const feedRoutes = require('./routes/feed');
const messageRoutes = require('./routes/messages');

const errorHandler = require('./middleware/errorHandler');

const parseOrigins = (csv) =>
  csv ? csv.split(',').map((s) => s.trim()).filter(Boolean) : '*';

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);

const io = new Server(server, {
  cors: {
    origin: parseOrigins(process.env.CORS_ORIGIN),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
  pingInterval: 25000,
  pingTimeout: 30000,
});

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error('Mongo connect error', err.message);
    process.exit(1);
  }
})();

app.use(helmet());
app.use(
  cors({
    origin: parseOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.get('/', (_req, res) => res.status(200).json({ ok: true }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/auth', authLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/messages', messageRoutes);

// ----- Socket presence map -----
const onlineUsers = new Map();
app.locals.io = io;
app.locals.onlineUsers = onlineUsers;

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('addUser', (userId) => {
    onlineUsers.set(String(userId), socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) {
        onlineUsers.delete(uid);
        break;
      }
    }
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log(`User disconnected: ${socket.id}`);
  });
});

app.use((req, res) => res.status(404).json({ msg: 'Not found' }));

app.use(errorHandler);

const shutdown = (signal) => {
  console.log(`[${signal}] shutting down...`);
  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log('Mongo connection closed');
    } finally {
      process.exit(0);
    }
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
