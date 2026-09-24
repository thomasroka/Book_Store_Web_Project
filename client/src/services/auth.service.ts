import { api, unwrap } from './api';
import type { AuthResponse, User } from '../types';

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterInput extends Credentials {
  name: string;
}

export const authService = {
  async login(input: Credentials): Promise<AuthResponse> {
    return unwrap(api.post('/auth/login', input));
  },
  async register(input: RegisterInput): Promise<AuthResponse> {
    return unwrap(api.post('/auth/register', input));
  },
  async me(): Promise<{ user: User }> {
    return unwrap(api.get('/auth/me'));
  },
  async updateProfile(name: string): Promise<{ user: User }> {
    return unwrap(api.put('/auth/profile', { name }));
  },
};