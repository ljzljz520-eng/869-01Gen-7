import { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle, Camera, Wifi, FileSpreadsheet } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api } from '../utils/api';
import type { UploadRecord, DataSource } from '../../shared/types';

export default function UploadPage() {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [source, setSource] = useState<DataSource>('camera');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadRecords = async () => {
    try {
      const data = await api.getUploadRecords() as UploadRecord[];
      setRecords(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadData({
        fileName: file.name,
        source
      }) as UploadRecord;
      setRecords([result, ...records]);
      setSuccessMsg(`成功上传 ${file.name}，共 ${result.recordCount} 条记录`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e: any) {
      alert(e.message || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const statusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle size={18} className="text-emerald-400" />;
    if (status === 'processing') return <Clock size={18} className="text-amber-400 animate-spin" />;
    return <XCircle size={18} className="text-red-400" />;
  };

  const statusLabel = (status: string) => {
    if (status === 'success') return { text: '已完成', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (status === 'processing') return { text: '处理中', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    return { text: '失败', cls: 'bg-red-500/15 text-red-400 border-red-500/30' };
  };

  return (
    <div className="min-h-screen bg-grid">
      <Navbar />
      <div className="p-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Upload className="text-primary-400" /> 数据上传
          </h1>
          <p className="text-sm text-slate-400 mt-1">上传摄像头或 Wi-Fi 匿名统计的客流数据</p>
        </div>

        {successMsg && (
          <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle size={18} /> {successMsg}
          </div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7">
            <div className="card">
              <h2 className="font-semibold text-white mb-4">选择数据来源</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setSource('camera')}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    source === 'camera'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-primary-700/40 bg-white/5 hover:border-primary-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${source === 'camera' ? 'bg-primary-500' : 'bg-primary-700/50'}`}>
                      <Camera size={20} className={source === 'camera' ? 'text-primary-900' : 'text-primary-400'} />
                    </div>
                    <div className="font-semibold text-white">摄像头数据</div>
                  </div>
                  <div className="text-xs text-slate-400">匿名化的视频人流统计结果，支持 CSV 格式</div>
                </button>

                <button
                  onClick={() => setSource('wifi')}
                  className={`p-5 rounded-xl border-2 transition-all text-left ${
                    source === 'wifi'
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-primary-700/40 bg-white/5 hover:border-primary-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${source === 'wifi' ? 'bg-primary-500' : 'bg-primary-700/50'}`}>
                      <Wifi size={20} className={source === 'wifi' ? 'text-primary-900' : 'text-primary-400'} />
                    </div>
                    <div className="font-semibold text-white">Wi-Fi 探针</div>
                  </div>
                  <div className="text-xs text-slate-400">MAC 地址匿名化统计数据，支持 CSV 格式</div>
                </button>
              </div>

              <h2 className="font-semibold text-white mb-4">上传数据文件</h2>
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                  ${isDragging
                    ? 'border-primary-400 bg-primary-500/10'
                    : 'border-primary-700/50 bg-primary-900/30 hover:border-primary-500/50 hover:bg-primary-800/30'}
                `}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary-500/15 flex items-center justify-center mb-4">
                  <FileSpreadsheet size={40} className="text-primary-400" />
                </div>
                <div className="text-lg font-medium text-white mb-2">
                  {isDragging ? '松开以上传文件' : '拖拽文件到此处，或点击选择'}
                </div>
                <div className="text-sm text-slate-400 mb-5">
                  支持 CSV / Excel 格式，文件大小不超过 50MB
                </div>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={onFileInput} className="hidden" id="file-input" />
                <label
                  htmlFor="file-input"
                  className="btn-primary inline-flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={18} />
                  {uploading ? '上传中...' : '选择文件'}
                </label>
              </div>

              <div className="mt-6 p-4 bg-primary-900/40 rounded-xl border border-primary-700/30">
                <div className="text-sm font-medium text-primary-300 mb-2">📋 数据格式说明</div>
                <div className="text-xs text-slate-400 space-y-1 font-mono">
                  <div>CSV 格式需包含以下字段：</div>
                  <div className="text-primary-400">zone_id, date, hour, count, source</div>
                  <div>示例：zone-1-1,2026-06-21,14,156,camera</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <div className="card h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <FileText size={18} className="text-primary-400" /> 上传记录
                </h2>
                <button onClick={loadRecords} className="text-xs text-primary-400 hover:text-primary-300">
                  刷新
                </button>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto scrollbar-thin pr-2">
                {records.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">暂无上传记录</div>
                ) : (
                  records.map((record) => {
                    const status = statusLabel(record.status);
                    return (
                      <div key={record.id} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              record.source === 'camera' ? 'bg-blue-500/15' : 'bg-emerald-500/15'
                            }`}>
                              {record.source === 'camera'
                                ? <Camera size={18} className="text-blue-400" />
                                : <Wifi size={18} className="text-emerald-400" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">{record.fileName}</div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                {record.uploadTime} · {record.recordCount} 条记录
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {statusIcon(record.status)}
                            <span className={`text-xs px-2 py-1 rounded-md border ${status.cls}`}>
                              {status.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
