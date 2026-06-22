import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../../shared/types';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    tenantId?: string;
  };
}

export function authMiddleware(requiredRole?: UserRole) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授权，请先登录' });
    }

    const token = authHeader.substring(7);
    if (!token.startsWith('mock-token-')) {
      return res.status(401).json({ error: 'Token 无效' });
    }

    const parts = token.split('-');
    if (parts.length < 3) {
      return res.status(401).json({ error: 'Token 格式错误' });
    }

    const roleFromToken = parts[2] === 'admin' ? 'admin' : parts[2] === 'tenant' ? 'tenant' : null;
    if (!roleFromToken) {
      return res.status(401).json({ error: 'Token 格式错误' });
    }

    if (requiredRole && roleFromToken !== requiredRole) {
      return res.status(403).json({ error: '权限不足' });
    }

    req.user = {
      id: parts.slice(2, -1).join('-'),
      role: roleFromToken,
      tenantId: roleFromToken === 'tenant' ? `tenant-${parts[3]}` : undefined
    };

    next();
  };
}
