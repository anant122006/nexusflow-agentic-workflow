import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { workflowRouter } from './routes/workflowRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

// Parameter: Security - CORS & Sanitization
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    agent: 'NexusFlow Enterprise Agentic Workflow Engine',
    version: '1.0.0',
    capabilities: [
      'Multi-Agent Context Extraction',
      'Logical Policy Decision Router',
      'Dynamic DAG Execution with Parallel Branching',
      'Zero-Trust Prompt Injection Guardrail',
      'Human-in-the-Loop (HITL) Safety Checkpoint',
      'WCAG 2.1 AA Certified Accessible Dashboard'
    ]
  });
});

// Workflow routes
app.use('/api', workflowRouter);

// Serve Frontend client build if dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n==================================================================`);
  console.log(`⚡  [NexusFlow Agentic Workflow Engine] Online!`);
  console.log(`🔗  Dashboard:   http://localhost:${PORT}`);
  console.log(`🚀  API Health:  http://localhost:${PORT}/api/health`);
  console.log(`==================================================================\n`);
});

export default app;
