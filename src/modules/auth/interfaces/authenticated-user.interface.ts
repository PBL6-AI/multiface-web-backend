import { Request } from 'express';
import { SystemRole } from '../auth.constants';

export interface AuthenticatedUser {
  id: number;
  userCode: string;
  email: string;
  fullName: string;
  role: SystemRole;
  roleId: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
