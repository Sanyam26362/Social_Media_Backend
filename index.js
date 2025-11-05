const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http'); 
const { Server } = require('socket.io'); 
const cors = require('cors'); 

dotenv.config();


const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const feedRoutes = require('./routes/feed');
const messageRoutes = require('./routes/messages'); 


const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

app.use(cors()); 
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/messages', messageRoutes);

let onlineUsers = new Map(); 

const addUser = (userId, socketId) => {
  onlineUsers.set(userId, socketId);
};

const removeUser = (socketId) => {
  onlineUsers.forEach((value, key) => {
    if (value === socketId) {
      onlineUsers.delete(key);
    }
  });
};

const getUserSocket = (userId) => {
  return onlineUsers.get(userId);
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    console.log(`User ${userId} added with socket ${socket.id}`);
  });

  

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    removeUser(socket.id);
  });
});

app.set('socketio', io);
app.set('getUserSocket', getUserSocket);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});