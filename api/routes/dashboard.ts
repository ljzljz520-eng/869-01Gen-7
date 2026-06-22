import { Router } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth';
import { getOverviewData, getHeatmapData, getEntrancesData, getTrendData } from '../services/dataService';

const router = Router();

router.get('/overview', authMiddleware('admin'), (_req, res) => {
  try {
    const data = getOverviewData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: '获取总览数据失败' });
  }
});

router.get('/heatmap', authMiddleware('admin'), (req: AuthRequest, res) => {
  try {
    const floor = parseInt(req.query.floor as string) || 1;
    const data = getHeatmapData(floor);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: '获取热区数据失败' });
  }
});

router.get('/entrances', authMiddleware('admin'), (_req, res) => {
  try {
    const data = getEntrancesData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: '获取入口数据失败' });
  }
});

router.get('/trend', authMiddleware('admin'), (req: AuthRequest, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const data = getTrendData(days);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: '获取趋势数据失败' });
  }
});

export default router;
