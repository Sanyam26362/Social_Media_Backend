const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 

dotenv.config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comment');
const feedRoutes = require('./routes/feed');
const messageRoutes = require('./routes/message'); 

const app = express();
const server = http.createServer(app); 


const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});


const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();


const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('addUser', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} added with socket ID ${socket.id}`);
    io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    let userIdToRemove = null;
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        userIdToRemove = userId;
        break;
      }
    }
    if (userIdToRemove) {
      onlineUsers.delete(userIdToRemove);
      console.log(`User ${userIdToRemove} removed.`);
      io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    }
  });
});

app.use(express.json());


app.locals.io = io;
app.locals.onlineUsers = onlineUsers;

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/messages', messageRoutes); 

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});