import React, { useEffect, useState, useMemo } from 'react';
import { 
  getWasteReportsByStatus, 
  getWasteReportStatusHistory 
} from '../../api/WasteReportapi';
import Pagination from '../../components/ui/Pagination';
import {  
  MapPin, 
  Scale, 
  Clock, 
  User, 
  CheckCircle2, 
  Search,
  Package,
  CheckCircle,
  Calendar,
  Truck,
  Info,
  X,
  FileText,
  ChevronRight,
  ClipboardCheck,
  Image as ImageIcon,
  Weight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { resolveImageUrl } from '../../lib/auth';

export default function CompletedTasks() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getWasteReportsByStatus('Collected');
      setReports(data);
    } catch (err) {
      console.error("Failed to load completed reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = useMemo(() => {
    if (!searchQuery) return reports;
    const query = searchQuery.toLowerCase();
    return reports.filter(r => 
      (r.citizenName || "").toLowerCase().includes(query) ||
      (r.collectorName || "").toLowerCase().includes(query) ||
      (r.address || r.locationText || "").toLowerCase().includes(query) ||
      (r.reportId?.toString() || "").includes(query) ||
      (r.id?.toString() || "").includes(query)
    );
  }, [reports, searchQuery]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    const totalWeight = reports.reduce((sum, r) => sum + parseFloat(r.actualTotalWeightKg || r.weightKg || 0), 0);
    return [
      { label: 'Đã hoàn thành', value: reports.length, icon: CheckCircle, color: 'text-emerald-500' },
      { label: 'Tổng khối lượng thu hồi', value: `${totalWeight.toFixed(1)}kg`, icon: Scale, color: 'text-primary' },
      { label: 'Trung bình/đơn', value: `${reports.length > 0 ? (totalWeight / reports.length).toFixed(1) : 0}kg`, icon: Weight, color: 'text-blue-500' },
    ];
  }, [reports]);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center opacity-40">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="font-black tracking-widest uppercase text-[10px]">Đang tải báo cáo hoàn thành...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Công việc đã hoàn tất</h1>
          <p className="text-on-surface-variant font-medium text-sm">Xem lại các báo cáo thu gom đã được Collector hoàn thành.</p>
        </div>
        <div className="flex wrap gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-surface-container-low border border-surface-container-high px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-surface-container-high ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/50">{stat.label}</p>
                <p className="text-base font-black text-on-surface leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-lowest/50 backdrop-blur-md rounded-3xl p-3 border border-surface-container-high flex flex-col xl:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/30" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, địa chỉ, mã báo cáo..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full bg-white border border-surface-container-high rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-3">
        <div className="px-8 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
          <div className="col-span-1">Mã số</div>
          <div className="col-span-3">Cư dân & Địa chỉ</div>
          <div className="col-span-2 text-center">Người thu gom</div>
          <div className="col-span-2 text-center">Khối lượng</div>
          <div className="col-span-2 text-center">Hoàn thành lúc</div>
          <div className="col-span-2 text-center">Thao tác</div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage + searchQuery}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {paginatedReports.length > 0 ? paginatedReports.map((report, idx) => (
                <ReportRow 
                  key={report.reportId || report.id} 
                  report={report} 
                  onView={() => setSelectedReport(report)}
                />
              )) : (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-surface-container-highest rounded-[3rem] text-on-surface-variant opacity-40">
                  <Package className="w-12 h-12 mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">Không có dữ liệu</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedReport && (
          <ReportDetailModal 
            reportId={selectedReport.reportId || selectedReport.id} 
            onClose={() => setSelectedReport(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportRow({ report, onView }) {
  const completedDate = report.completedAtUtc ? new Date(report.completedAtUtc) : null;

  return (
    <motion.div 
      whileHover={{ scale: 1.005, backgroundColor: 'white' }}
      onClick={onView}
      className="bg-white/60 backdrop-blur-sm border border-surface-container-high rounded-[1.5rem] p-4 grid grid-cols-12 gap-4 items-center cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all group"
    >
      <div className="col-span-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary/40 font-mono leading-none mb-1">REQ</span>
          <span className="text-sm font-black text-on-surface leading-none">{report.reportId || report.id}</span>
        </div>
      </div>
      <div className="col-span-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant font-black shrink-0 border border-white/50">
            {report.citizenName?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-on-surface text-sm truncate group-hover:text-primary transition-colors">
              {report.citizenName || 'Người dân'}
            </h4>
            <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/40 truncate">
              <MapPin className="w-3 h-3" />
              {report.locationText || report.address || 'Không rõ địa chỉ'}
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-2 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/30">
          <User className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-extrabold text-indigo-600 truncate max-w-[120px]">
            {report.collectorName || 'Collector'}
          </span>
        </div>
      </div>
      <div className="col-span-2 text-center">
        <div className="flex flex-col items-center">
          <span className="text-sm font-black text-on-surface">{report.actualTotalWeightKg || report.weightKg} kg</span>
          <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter">Đã xác nhận</span>
        </div>
      </div>
      <div className="col-span-2 text-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-black text-on-surface mb-1">
            <Calendar className="w-3.5 h-3.5 text-primary/50" />
            {completedDate ? completedDate.toLocaleDateString([], {day: '2-digit', month: '2-digit'}) : '---'}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/40">
            <Clock className="w-3.5 h-3.5" />
            {completedDate ? completedDate.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) : '---'}
          </div>
        </div>
      </div>
      <div className="col-span-2 flex justify-center">
        <button className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all">
          <Info className="w-3.5 h-3.5" /> Chi tiết
        </button>
      </div>
    </motion.div>
  );
}

function ReportDetailModal({ reportId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const history = await getWasteReportStatusHistory(reportId);
        setDetail(history);
      } catch (err) {
        console.error("Failed to fetch report detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [reportId]);

  if (loading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-md" />
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl relative z-10 flex flex-col items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Đang tải chi tiết...</p>
      </div>
    </div>
  );

  if (!detail) return null;

  const images = detail.proofImageUrls || [];
  const evidenceImages = detail.imageUrls || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-on-surface/80 backdrop-blur-md" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="bg-white w-full max-w-6xl overflow-hidden rounded-[3rem] shadow-2xl relative z-10 flex flex-col lg:flex-row h-full max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-3 hover:bg-on-surface/5 rounded-full text-on-surface/30 hover:text-on-surface z-50 transition-all">
          <X className="w-6 h-6" />
        </button>

        {/* Left: Images Column */}
        <div className="w-full lg:w-5/12 bg-surface-container-highest relative flex flex-col border-r border-on-surface/5 overflow-hidden">
          <div className="p-8 pb-4 shrink-0">
             <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/40 flex items-center gap-2 mb-4">
               <ImageIcon className="w-4 h-4" /> Minh chứng hoàn thành
             </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 pt-0 space-y-4 no-scrollbar">
            {images.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="rounded-3xl overflow-hidden bg-black/5 border border-white/50 shadow-sm">
                    <img src={resolveImageUrl(img)} alt={`Proof ${idx + 1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center bg-black/5 rounded-[2rem] text-on-surface-variant opacity-30">
                 <ImageIcon className="w-12 h-12 mb-2" />
                 <p className="text-[10px] font-black uppercase tracking-widest">Không có ảnh minh chứng</p>
              </div>
            )}

            <div className="pt-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/40 flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4" /> Ảnh hiện trường (Citizen)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {evidenceImages.map((img, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden bg-black/5 aspect-square border border-white/50">
                    <img src={resolveImageUrl(img)} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info Column */}
        <div className="flex-1 overflow-y-auto p-10 lg:p-14 no-scrollbar flex flex-col">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                Đã hoàn thành
              </div>
              <span className="text-sm font-black text-on-surface-variant/30 font-mono">#{detail.reportId}</span>
            </div>
            <h2 className="text-4xl font-black text-on-surface leading-tight mb-4 tracking-tight">Báo cáo của {detail.assignment?.collectorName || 'Collector'}</h2>
            <div className="flex items-center gap-3 text-on-surface-variant/60 font-bold">
              <Clock className="w-4 h-4 text-primary" />
              Hoàn thành vào {detail.completedAtUtc ? new Date(detail.completedAtUtc).toLocaleString() : 'Chưa xác định'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="bg-surface-container-low rounded-[2rem] p-8 border border-surface-container-high shadow-sm">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 flex items-center gap-2">
                 <ClipboardCheck className="w-3.5 h-3.5 text-primary" /> Kết quả thu gom
               </h4>
               <div className="space-y-4">
                 {detail.wasteItems.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center pb-3 border-b border-on-surface/5 last:border-0 last:pb-0">
                     <span className="text-xs font-black text-on-surface">{item.wasteCategoryName}</span>
                     <div className="text-right">
                       <p className="text-sm font-black text-primary leading-none">{item.actualWeightKg} kg</p>
                       <p className="text-[9px] font-bold text-on-surface-variant/30 uppercase mt-1">Ước tính: {item.estimatedWeightKg}kg</p>
                     </div>
                   </div>
                 ))}
                 <div className="pt-4 mt-4 border-t-2 border-dashed border-primary/10 flex justify-between items-center">
                    <span className="text-sm font-black text-on-surface">TỔNG KHỐI LƯỢNG</span>
                    <span className="text-xl font-black text-emerald-600">{detail.actualTotalWeightKg} kg</span>
                 </div>
               </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 relative overflow-hidden flex-1">
                 <div className="absolute top-0 right-0 p-6 opacity-5">
                   <FileText className="w-20 h-20" />
                 </div>
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-4">Ghi chú hoàn thành</h4>
                 <p className="text-sm font-bold text-on-surface leading-relaxed italic">
                   "{detail.completionNote || 'Không có ghi chú nào từ collector.'}"
                 </p>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-10 border-t border-on-surface/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                 <User className="w-7 h-7" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-0.5">Người dân yêu cầu</p>
                  <p className="text-lg font-black text-on-surface leading-tight">Cư dân EcoSort</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4 text-right">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-0.5">Nhân viên thực hiện</p>
                  <p className="text-lg font-black text-indigo-600 leading-tight">{detail.assignment?.collectorName || 'Collector'}</p>
                  <p className="text-xs font-bold text-on-surface-variant/60">{detail.assignment?.collectorPhone || '---'}</p>
               </div>
               <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 border border-indigo-100">
                 <Truck className="w-7 h-7" />
               </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-on-surface/5 hover:bg-on-surface/10 text-on-surface font-black uppercase tracking-[0.2em] text-xs rounded-2xl transition-all active:scale-95 border border-on-surface/5"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
