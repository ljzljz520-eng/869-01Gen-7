import { Router } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth';
import { getTenantData } from '../services/dataService';

const router = Router();

router.get('/dashboard', authMiddleware('tenant'), (req: AuthRequest, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(400).json({ error: '租户信息缺失' });
    }

    const data = getTenantData(tenantId);
    if (!data) {
      return res.status(404).json({ error: '租户不存在' });
    }

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: '获取租户数据失败' });
  }
});

export default router;
