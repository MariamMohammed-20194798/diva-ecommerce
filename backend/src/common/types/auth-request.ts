import { Request } from 'express';

export interface AuthUser {
  sub?: string;
  id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  cookies: {
    session_id?: string;
  };
}
