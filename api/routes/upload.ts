import { Router } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth';
import { getUploadRecords, addUploadRecord } from '../services/dataService';
import type { DataSource } from '../../shared/types';

const router = Router();

router.get('/records', authMiddleware('admin'), (_req, res) => {
  try {
    const records = getUploadRecords();
    res.json(records);
  } catch (e) {
    res.status(500).json({ error: '获取上传记录失败' });
  }
});

router.post('/', authMiddleware('admin'), (req: AuthRequest, res) => {
  try {
    const { fileName, source } = req.body as { fileName: string; source: DataSource };

    if (!fileName || !source) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    const record = addUploadRecord({
      fileName,
      uploadTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      source,
      status: 'success',
      recordCount: Math.floor(Math.random() * 2000) + 500
    });

    res.json(record);
  } catch (e) {
    res.status(500).json({ error: '上传数据失败' });
  }
});

export default router;
