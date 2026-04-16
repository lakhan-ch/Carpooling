require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const sosRoutes = require('./routes/sosRoutes');

// Configure Passport strategies
require('./config/passport')(passport);

// ─── App & Server Setup ────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// ─── Socket.IO — Real-time chat + live location ───────────────────────────────
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO room-based messaging
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Join a ride-specific chat room
  socket.on('join_ride_room', (rideId) => {
    socket.join(`ride_${rideId}`);
    console.log(`[Socket] ${socket.id} joined room ride_${rideId}`);
  });

  // Relay chat message to all users in the ride room
  socket.on('send_message', async (data) => {
    const { rideId, senderId, receiverId, content, senderName, senderAvatar } = data;

    // Persist to DB
    try {
      const Message = require('./models/Message');
      const msg = await Message.create({
        ride_id: rideId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      });
      io.to(`ride_${rideId}`).emit('receive_message', {
        _id: msg._id,
        content,
        sender_id: { _id: senderId, name: senderName, avatar: senderAvatar },
        createdAt: msg.createdAt,
      });
    } catch (err) {
      socket.emit('error', { message: 'Message failed to send.' });
    }
  });

  // Live location sharing
  socket.on('location_update', ({ rideId, lat, lng, userId }) => {
    socket.to(`ride_${rideId}`).emit('location_update', { lat, lng, userId });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to controllers via req.app.get('io')
app.set('io', io);

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Request Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later.' },
});
app.use(globalLimiter);

// ─── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sos', sosRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found.` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'An unexpected error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Database & Server Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/carpooling';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[MongoDB] Connected ✓');
    server.listen(PORT, () =>
      console.log(`[Server] Running on http://localhost:${PORT} ✓`)
    );
  })
  .catch((err) => {
    console.error('[MongoDB] Connection error:', err.message);
    process.exit(1);
  });

module.exports = { app, server };
