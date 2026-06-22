import { Router } from 'express';
import { authenticate } from '../services/dataService';
import type { LoginRequest } from '../../shared/types';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password, role } = req.body as LoginRequest;

  if (!username || !password || !role) {
    return res.status(400).json({ error: '请提供完整的登录信息' });
  }

  const result = authenticate({ username, password, role });
  if (!result) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  res.json(result);
});

export default router;
