const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const pinoHttp = require('pino-http');
const { globalLimiter } = require('./middleware/rateLimiter');
const chatHandler = require('./sockets/chatHandler');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Structured Pino Logging Middleware
const logger = pinoHttp({
  level: process.env.LOG_LEVEL || 'info',
  autoLogging: true,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 500 || err) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  }
});

// Security & Parsing Middlewares
app.use(logger);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// NoSQL Injection Sanitization
app.use(mongoSanitize());

// Global Rate Limiter
app.use('/api', globalLimiter);

// Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.IO real-time notification & chat engine
app.set('socketio', io);
io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    }
  });

  // Register real-time chat handler
  chatHandler(io, socket);

  socket.on('disconnect', () => {
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// Database Connection with graceful fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/borrow_db';
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 2000
})
.then(() => {
  console.log('✅ Connected to MongoDB database');
})
.catch((err) => {
  console.log('⚠️ MongoDB connection offline/failed. Running with in-memory seed database adapter.');
  const mockDb = require('./utils/mockDb');
  mockDb.initMockData();
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/borrow', require('./routes/borrow'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/chat', require('./routes/chat'));

// Root Status Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Borrow Instead of Buy API',
    version: '1.0.0',
    mongoConnected: mongoose.connection.readyState === 1,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  req.log.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [http://localhost:${PORT}]`);
});
