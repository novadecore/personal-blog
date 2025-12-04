// src/app.js
import express from 'express';
import morgan from 'morgan';
import authRouter from './routes/auth.js';
import postsRouter from './routes/posts.js';
import profileRouter from './routes/profile.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import uploadRouter from './routes/upload.js';



const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(morgan('dev'));

app.get('/ping', (req, res) => {
  res.json({ message: 'Backend is running' });
});
app.use('/auth', authRouter);
app.use('/posts', postsRouter);
app.use('/profile', profileRouter);
app.use('/upload', uploadRouter);

//app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

export default app;
