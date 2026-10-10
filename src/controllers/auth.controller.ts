import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { registerSchema, loginSchema } from '../utils/validators';

export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.registerUser(validatedData);
    res.status(201).json({ 
      success: true, 
      message: 'Registrasi berhasil', 
      data: user 
    });
  } catch (error: any) {
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Terjadi kesalahan', 
      error: { code: 'BAD_REQUEST' } });
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