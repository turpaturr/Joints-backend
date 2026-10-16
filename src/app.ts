import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes';
import therapyRoutes from './routes/therapy.routes';
import therapySessionRoutes from './routes/therapy-session.routes';
import medicationRoutes from './routes/medication.routes';
import connectionRoutes from './routes/connection.routes';
import consultationRoutes from './routes/consultation.routes';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
const standardJsonParser = express.json();
app.use((req: Request, res: Response, next: NextFunction) => {
  if (
    (req.method === 'POST' || req.method === 'PATCH')
    && req.path === '/api/therapy/movements'
  ) {
    return next();
  }
  standardJsonParser(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/therapy', therapyRoutes);
app.use('/api/therapy-sessions', therapySessionRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/consultations', consultationRoutes);
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: Error & { status?: number; type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status === 413 ? 413 : err.status === 400 ? 400 : 500;
  const code = statusCode === 413
    ? 'PAYLOAD_TOO_LARGE'
    : statusCode === 400
      ? 'INVALID_REQUEST'
      : 'INTERNAL_SERVER_ERROR';
  if (statusCode === 500) console.error(err.stack);
  res.status(statusCode).json({
    success: false,
    message: statusCode === 413 ? 'Ukuran request terlalu besar' : statusCode === 400 ? 'Request tidak valid' : 'Terjadi kesalahan internal',
    error: { code },
  });
});

export default app;