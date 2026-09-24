import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

async function start(): Promise<void> {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`[server] API listening on http://localhost:${env.port}/api/v1`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

void start();