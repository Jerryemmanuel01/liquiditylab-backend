import dotenv from 'dotenv';

// Catch uncaught exceptions first before any other execution
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Configure environment variables
dotenv.config();

import app from './app';
import { connectDB } from './config/db';

// Connect to Database
connectDB();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
