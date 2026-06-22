import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getCompareData } from '../services/dataService';

const router = Router();

router.get('/', authMiddleware('admin'), (req, res) => {
  try {
    const { fromA, toA, fromB, toB } = req.query as {
      fromA: string; toA: string; fromB: string; toB: string;
    };

    if (!fromA || !toA || !fromB || !toB) {
      return res.status(400).json({ error: '请提供完整的时间范围参数' });
    }

    const result = getCompareData(fromA, toA, fromB, toB);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: '获取对比数据失败' });
  }
});

export default router;
