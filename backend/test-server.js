// test-server.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

app.post('/auth/login', (req, res) => {
  console.log('>>> /auth/login hit');
  res.cookie('token', 'dummy-token', {
    httpOnly: true,
    sameSite: 'lax',
  });
  res.json({ ok: true });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`TEST API on http://localhost:${PORT}`);
});
