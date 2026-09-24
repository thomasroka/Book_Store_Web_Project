import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
  if (typeof decoded.sub !== 'string' || typeof decoded.role !== 'string') {
    throw new jwt.JsonWebTokenError('Invalid token payload');
  }
  return { sub: decoded.sub, role: decoded.role };
}