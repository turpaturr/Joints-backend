import { NextFunction, Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { changePasswordSchema, registerSchema, loginSchema } from '../utils/validations/auth.validation';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    res.status(201).json({ success: true, message: 'Registrasi berhasil', data: user });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Terjadi kesalahan', error: { code: 'BAD_REQUEST' } });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.loginUser(validatedData);
    res.status(200).json({ success: true, message: 'Login berhasil', data: result });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message, error: { code: 'UNAUTHORIZED' } });
  }
};

export const currentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (typeof userId !== 'string') {
      return res.status(401).json({ success: false, message: 'Token pengguna tidak valid' });
    }

    const user = await authService.getUserProfile(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (typeof userId !== 'string') {
      return res.status(401).json({ success: false, message: 'Token pengguna tidak valid' });
    }

    const data = changePasswordSchema.parse(req.body);
    const changed = await authService.changeUserPassword(userId, data);
    if (!changed) {
      return res.status(400).json({ success: false, message: 'Password saat ini tidak sesuai' });
    }

    return res.status(200).json({ success: true, message: 'Password berhasil diubah' });
  } catch (error) {
    next(error);
  }
};