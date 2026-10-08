import { prisma } from '../prisma'; 
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt.util';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../utils/validators';

export const registerUser = async (data: z.infer<typeof registerSchema>) => {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) throw new Error('Email sudah terdaftar');

  const hashedPassword = await bcrypt.hash(data.password, 10);

  return prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      role: data.role,
      patientProfile: data.role === 'PATIENT' ? { create: { namaLengkap: data.namaLengkap } } : undefined,
      nakesProfile: data.role === 'NAKES' ? { create: { namaLengkap: data.namaLengkap } } : undefined,
    },
    select: { id: true, email: true, role: true, createdAt: true }
  });
};

export const loginUser = async (data: z.infer<typeof loginSchema>) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw new Error('Kredensial tidak valid');

  const isValidPassword = await bcrypt.compare(data.password, user.password);
  if (!isValidPassword) throw new Error('Kredensial tidak valid');

  const token = generateToken(user.id, user.role);
  return { user: { id: user.id, email: user.email, role: user.role }, token };
};