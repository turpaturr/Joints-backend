import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Belum terautentikasi', error: { code: 'UNAUTHORIZED' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    (req as any).user = payload; 
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token tidak valid', error: { code: 'INVALID_TOKEN' } });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Tidak memiliki akses', error: { code: 'FORBIDDEN' } });
    }
    next();
  };
};