process.env.DISABLE_HMR = 'true';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Lightweight local rule-based advisor endpoint (No restricted external LLMs / 100% unrestricted publishing)
app.post('/api/coach', (req: Request, res: Response) => {
  const { query = '', userData = {} } = req.body;
  const currency = userData?.profile?.currencySymbol || '₹';
  const saved = userData?.dailyMoney?.saved ?? 320;
  const score = userData?.scores?.overall || 78;

  res.json({
    text: `Your Life Score is ${score}/100 with ${currency}${saved} daily savings pacing. Your routines are consistent. Focus on keeping your sleep schedule steady and maintaining your daily habit streaks.`,
    modelUsed: 'Local Rules Engine',
    actionableSteps: [
      'Complete remaining daily habits to preserve your active streak',
      'Maintain your daily savings target before discretionary spending',
      'Protect your wind-down recovery window tonight',
    ],
  });
});

app.post('/api/chat', (req: Request, res: Response) => {
  const { query = '', userData = {} } = req.body;
  const currency = userData?.profile?.currencySymbol || '₹';
  const saved = userData?.dailyMoney?.saved ?? 320;
  const score = userData?.scores?.overall || 78;

  res.json({
    text: `Your Life Score is ${score}/100 with ${currency}${saved} daily savings pacing. Keep momentum going by checking off your core habits!`,
    modelUsed: 'Local Rules Engine',
    actionableSteps: [
      'Log your evening habits before bed',
      'Review your 50-30-20 cashflow pacing',
    ],
  });
});

// Setup Vite middleware or static dist
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Wellth server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
