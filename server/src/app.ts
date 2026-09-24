import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import { uploadsDir } from './middleware/upload.js';

export const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/uploads', express.static(uploadsDir, { maxAge: '7d', immutable: false }));

app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'online-book-store-api' } });
});

app.use('/api/v1', apiRouter);

app.use(notFound);
app.use(errorHandler);