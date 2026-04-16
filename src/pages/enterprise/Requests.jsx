import React, { useEffect, useState, useMemo } from 'react';
import { 
  getRequests, 
  getCollectors, 
  updateRequestStatus, 
  assignRequest 
} from '../../api/enterpriseApi';
import {  
  MapPin, 
  Scale, 
  Clock, 
  User, 
  CheckCircle2, 
  Search,
  ArrowRight,
  Package,
  CheckCircle,
  Users as UsersIcon,
  X,
  FileText,
  ChevronRight,
  Info,
  Calendar,
  Truck,
  HelpCircle,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [coordinatingRequest, setCoordinatingRequest] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqs, cols] = await Promise.all([getRequests(), getCollectors()]);
      setRequests(reqs);
      setCollectors(cols);
      } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (reqId, colId) => {
    try {
      await assignRequest(reqId, colId);
      setRequests(prev => prev.map(r => 
        r.id === reqId ? { ...r, status: 'Assigned', collectorId: colId } : r
      ));
    } catch (err) {
      console.error("Assignment failed", err);
    }
  };

  const handleStatus = async (reqId, status) => {
    try {
      await updateRequestStatus(reqId, status);
      setRequests(prev => prev.map(r => 
        r.id === reqId ? { ...r, status } : r
      ));
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const handleOpenCoordination = (req) => {
    setCoordinatingRequest(req);
  };

  const filteredRequests = useMemo(() => {
    let result = requests;
    if (activeTab !== 'All') {
      result = result.filter(r => r.status === activeTab);
    }
    if (searchQuery) {
      result = result.filter(r => 
        r.citizenName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [requests, searchQuery, activeTab]);

  const stats = useMemo(() => {
    const totalWeight = requests.reduce((sum, r) => sum + r.weightKg, 0);
    const pendingCount = requests.filter(r => r.status === 'Pending').length;
    const completedWeight = requests.filter(r => r.status === 'Collected').reduce((sum, r) => sum + r.weightKg, 0);
    
    return [
      { label: 'Tổng khối lượng', value: `${totalWeight.toFixed(1)}kg`, icon: Scale, color: 'text-primary' },
      { label: 'Yêu cầu mới', value: pendingCount, icon: Clock, color: 'text-amber-500' },
      { label: 'Đã thu hồi', value: `${completedWeight.toFixed(1)}kg`, icon: CheckCircle2, color: 'text-emerald-500' },
      { label: 'Đội ngũ', value: collectors.length, icon: UsersIcon, color: 'text-blue-500' },
    ];
  }, [requests, collectors]);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center opacity-40">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="font-black tracking-widest uppercase text-[10px]">Đang tải dữ liệu...</p>
    </div>
  );

  const tabs = [
    { id: 'All', label: 'Tất cả', count: requests.length },
    { id: 'Pending', label: 'Chờ duyệt', count: requests.filter(r => r.status === 'Pending').length, color: 'text-orange-500' },
    { id: 'Accepted', label: 'Đã duyệt', count: requests.filter(r => r.status === 'Accepted').length, color: 'text-blue-500' },
    { id: 'Assigned', label: 'Đang vận chuyển', count: requests.filter(r => r.status === 'Assigned').length, color: 'text-indigo-500' },
    { id: 'Collected', label: 'Đã hoàn thành', count: requests.filter(r => r.status === 'Collected').length, color: 'text-emerald-500' }
  ];

  return (
    <div className="h-full flex flex-col gap-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Quản lý Thu gom</h1>
          <p className="text-on-surface-variant font-medium text-sm">Xử lý tập trung các yêu cầu thu gom vật liệu từ cộng đồng.</p>
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
        <div className="flex overflow-x-auto no-scrollbar gap-1 p-1 bg-surface-container-high/30 rounded-2xl flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap
                ${activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-white/40'}
              `}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface-variant/40'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/30" />
            <input 
              type="text" 
              placeholder="Tìm kiếm cư dân, địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-surface-container-high rounded-2xl py-2.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <FileText className="w-4 h-4" />
            Báo cáo
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-3">
        <div className="px-8 grid grid-cols-12 gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
          <div className="col-span-1">Mã số</div>
          <div className="col-span-3">Cư dân & Địa chỉ</div>
          <div className="col-span-1 text-center">Vật liệu</div>
          <div className="col-span-2 text-center">Thời gian</div>
          <div className="col-span-2 text-center">Phụ trách</div>
          <div className="col-span-1 text-center font-bold">Trạng thái</div>
          <div className="col-span-2 text-center">Thao tác</div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar pb-10">
          <AnimatePresence mode="popLayout">
            {filteredRequests.length > 0 ? filteredRequests.map((req) => (
              <RequestRow 
                key={req.id} 
                req={req} 
                collectors={collectors}
                onStatus={handleStatus}
                onAssign={handleAssign}
                onView={() => setSelectedRequest(req)}
                onOpenCoordination={() => handleOpenCoordination(req)}
              />
            )) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-surface-container-highest rounded-[3rem] text-on-surface-variant"
              >
                <Package className="w-12 h-12 mb-4 opacity-10" />
                <p className="font-black uppercase tracking-widest text-xs">Không tìm thấy yêu cầu nào</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedRequest && (
          <RequestDetailModal 
            req={selectedRequest} 
            onClose={() => setSelectedRequest(null)} 
            collectors={collectors}
            onAssign={handleAssign}
            onStatus={handleStatus}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {coordinatingRequest && (
          <CoordinationDrawer 
            req={coordinatingRequest}
            collectors={collectors}
            onAssign={handleAssign}
            onClose={() => setCoordinatingRequest(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestRow({ req, collectors, onStatus, onAssign, onView, onOpenCoordination }) {
  const getStatusBadge = () => {
    switch(req.status) {
      case 'Pending': return { color: 'text-orange-500 bg-orange-50', icon: Clock, label: 'Mới' };
      case 'Accepted': return { color: 'text-blue-500 bg-blue-50', icon: CheckCircle2, label: 'Đã duyệt' };
      case 'Assigned': return { color: 'text-indigo-500 bg-indigo-50', icon: Truck, label: 'Đang đi' };
      case 'Collected': return { color: 'text-emerald-500 bg-emerald-50', icon: CheckCircle, label: 'Xong' };
      case 'Cancelled': return { color: 'text-on-surface-variant/40 bg-surface-container', icon: X, label: 'Hủy' };
      default: return { color: 'text-on-surface-variant/40 bg-surface-container', icon: HelpCircle, label: 'N/A' };
    }
  };

  const status = getStatusBadge();

  return (
    <motion.div 
      layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.98 }} whileHover={{ scale: 1.005, backgroundColor: 'white' }}
      onClick={onView}
      className="bg-white/60 backdrop-blur-sm border border-surface-container-high rounded-[1.5rem] p-4 grid grid-cols-12 gap-4 items-center cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all group relative"
    >
      <div className="col-span-1">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-primary/40 font-mono leading-none mb-1">REQ</span>
          <span className="text-sm font-black text-on-surface leading-none">
            {req.id?.includes('-') ? req.id.split('-')[1] : (req.id || 'N/A')}
          </span>
        </div>
        </div>
      <div className="col-span-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant font-black shrink-0 shadow-sm border border-white/50">
            {req.citizenName?.charAt(0) || '?'}
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-on-surface text-sm truncate group-hover:text-primary transition-colors">
              {req.citizenName || 'Khách vãng lai'}
            </h4>
            <div className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant/40 truncate">
              <MapPin className="w-3 h-3" />
              {req.address || 'Không rõ địa chỉ'}
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-1 text-center flex flex-col items-center">
          <p className="text-sm font-black text-on-surface flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-primary" />{req.weightKg} kg</p>
      </div>
      <div className="col-span-2 text-center flex justify-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5 text-xs font-black text-on-surface mb-1"><Calendar className="w-3.5 h-3.5 text-primary/50" />{new Date(req.createdAt).toLocaleDateString([], {day: '2-digit', month: '2-digit'})}</div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant/40"><Clock className="w-3.5 h-3.5" />{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</div>
        </div>
      </div>
      <div className="col-span-2 text-center flex justify-center">
        {req.collectorId && collectors.find(c => c.id === req.collectorId) ? (
          <div className="inline-flex items-center gap-2 bg-indigo-50/50 px-3 py-1.5 rounded-xl border border-indigo-100/30">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            <p className="text-[11px] font-extrabold text-indigo-600 truncate max-w-[80px]">
              {collectors.find(c => c.id === req.collectorId).name}
            </p>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm transition-all antialiased">
            <User className="w-4 h-4 text-indigo-400" />
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest leading-none">
              N/A
            </p>
          </div>
        )}
      </div>
      <div className="col-span-1 flex justify-center items-center">
          <div className={`p-2 rounded-2xl ${status.color} border border-white/50 flex flex-col items-center gap-1 min-w-[55px]`}>
          <status.icon className="w-4 h-4" />
          <span className="text-[9px] font-black uppercase tracking-tighter">{status.label}</span>
        </div>
      </div>
      <div className="col-span-2 flex items-center justify-center gap-2">
        {req.status === 'Pending' && (
          <div className="flex gap-1.5">
            <button onClick={(e) => { e.stopPropagation(); onStatus(req.id, 'Accepted'); }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Duyệt</button>
            <button onClick={(e) => { e.stopPropagation(); onStatus(req.id, 'Cancelled'); }} className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Hủy</button>
          </div>
        )}
        {req.status === 'Accepted' && (
           <button onClick={(e) => { e.stopPropagation(); onOpenCoordination(); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Điều phối <ChevronRight className="w-3 h-3" /></button>
        )}
        {(req.status === 'Assigned' || req.status === 'Collected') && (
          <button onClick={(e) => { e.stopPropagation(); onView(); }} className="px-5 py-2 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-500/20"><Edit className="w-3.5 h-3.5" /> Sửa</button>
        )}
      </div>
      </motion.div>
  );
}

function CoordinationDrawer({ req, collectors, onAssign, onClose }) {
  const [selectedCol, setSelectedCol] = useState(null);

  return (
    <div className="fixed inset-0 z-[150] flex justify-end overflow-hidden">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-surface-container-low shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col">
        <div className="p-8 border-b border-white/5 bg-surface-container-high/50">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 font-mono">Trung tâm điều phối</p>
              <h2 className="text-2xl font-black text-on-surface tracking-tight">Chọn nhân sự phụ trách</h2>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-surface-container-highest rounded-2xl transition-all"><X className="w-6 h-6 text-on-surface-variant/30" /></button>
          </div>
          <div className="bg-white/40 border border-white/50 rounded-3xl p-5 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">{req.citizenName.charAt(0)}</div>
                <div>
                   <h4 className="font-black text-on-surface leading-tight mb-1">{req.citizenName}</h4>
                   <p className="text-[10px] font-bold text-on-surface-variant/50 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary" />{req.address}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar bg-surface-container-low/50">
           <div className="grid grid-cols-2 gap-4">
              {collectors.map(c => (
                <button
                  key={c.id} onClick={() => setSelectedCol(c.id)}
                  className={`p-5 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-4 relative group ${selectedCol === c.id ? 'border-indigo-500 bg-white shadow-xl shadow-indigo-500/10' : 'border-transparent bg-on-surface/5 hover:bg-on-surface/10 hover:scale-[1.02]'}`}
                >
                  {selectedCol === c.id && <div className="absolute top-4 right-4 bg-indigo-500 text-white rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300"><CheckCircle className="w-3.5 h-3.5" /></div>}
                  <div className={`w-14 h-14 rounded-[1.8rem] flex items-center justify-center transition-all duration-300 ${selectedCol === c.id ? 'bg-indigo-500 text-white scale-110 shadow-lg shadow-indigo-500/30' : 'bg-surface-container-highest text-on-surface-variant/40'}`}><User className="w-7 h-7" /></div>
                  <div className="text-center">
                     <p className={`text-xs font-black tracking-tight mb-1 ${selectedCol === c.id ? 'text-indigo-700' : 'text-on-surface'}`}>{c.name}</p>
                     <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-tighter font-mono">{c.phone}</p>
                  </div>
                </button>
              ))}
           </div>
        </div>

        <div className="p-8 bg-surface-container-high/80 backdrop-blur-md border-t border-white/5">
           <button
             disabled={!selectedCol}
             onClick={() => { if(selectedCol) { onAssign(req.id, selectedCol); onClose(); } }}
             className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 ${
               selectedCol 
                 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-500/40' 
                 : 'bg-on-surface/5 text-on-surface-variant/20 cursor-not-allowed border-2 border-dashed border-on-surface/10'
             }`}
           >
             {selectedCol ? 'Xác nhận nhân viên' : 'Chọn nhân viên để tiếp tục'}
             <ArrowRight className={`w-4 h-4 ${!selectedCol && 'opacity-20'}`} />
           </button>
        </div>
      </motion.div>
    </div>
  );
}

function RequestDetailModal({ req, onClose, collectors, onAssign, onStatus }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-on-surface/60 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-surface-container-low w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[3rem] shadow-2xl relative z-10 flex flex-col md:flex-row">
        <div className="w-full md:w-5/12 bg-surface-container-high relative">
          {req.images && req.images.length > 0 ? <img src={req.images[0]} alt="Waste" className="w-full h-full object-cover" /> : <div className="w-full h-full flex flex-col items-center justify-center opacity-10"><Package className="w-24 h-24 mb-4" /><p className="font-black uppercase tracking-[0.2em] text-sm">No Image</p></div>}
        </div>
        <div className="flex-1 p-8 md:p-10 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 font-mono">#{req.id}</p>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">{req.citizenName}</h2>
              <div className="flex items-center gap-2 text-on-surface-variant/70 font-bold text-sm"><MapPin className="w-4 h-4 text-primary" />{req.address}</div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-surface-container-high rounded-2xl transition-all"><X className="w-6 h-6 text-on-surface-variant/30" /></button>
          </div>
          <div className="grid grid-cols-2 gap-6 mb-8">
             <div className="bg-surface-container rounded-[2rem] p-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4">Danh mục vật liệu</h4>
                <div className="space-y-3">
                  {req.materials ? req.materials.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
                        <span className="text-sm font-extrabold text-on-surface">{m.type}</span>
                      </div>
                      <span className="text-sm font-black text-on-surface-variant/50">{m.amount} {m.unit}</span>
                    </div>
                  )) : <p className="text-sm font-black">{req.weightKg} kg {req.wasteType}</p>}
                </div>
             </div>
             <div className="bg-surface-container p-6 rounded-[2rem] border-2 border-dashed border-surface-container-highest flex flex-col justify-center text-center">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                   {req.status === 'Collected' ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />}
                   <span className="text-2xl font-black">{req.status}</span>
                </div>
                <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em]">Trạng thái hiện tại</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-on-surface/[0.03] p-6 rounded-[2rem] border border-on-surface/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 flex items-center gap-2"><Info className="w-3.5 h-3.5" /> Ghi chú cư dân</h4>
                <p className="text-sm font-medium italic text-on-surface/70 leading-relaxed">"{req.note || "Không có ghi chú nào đi kèm."}"</p>
              </div>
              {(req.status !== 'Pending' && req.status !== 'Cancelled') && (
                <div className="bg-on-surface/[0.03] p-6 rounded-[2rem] border border-on-surface/5">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 flex items-center gap-2"><Truck className="w-3.5 h-3.5" /> Cập nhật trạng thái</h4>
                  <div className="flex gap-2">
                    {['Accepted', 'Assigned', 'Collected'].map(s => (
                      <button key={s} onClick={() => onStatus(req.id, s)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all ${req.status === s ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-container-highest/50 text-on-surface-variant/40 hover:bg-surface-container-highest'}`}>{s === 'Accepted' ? 'Duyệt' : s === 'Assigned' ? 'Đang đi' : 'Xong'}</button>
                    ))}
                  </div>
                </div>
              )}
           </div>
          {(req.status !== 'Pending' && req.status !== 'Cancelled') && (
             <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-4 flex items-center gap-2 px-4 text-center justify-center"><User className="w-3.5 h-3.5 text-indigo-500" /> Điều phối nhân viên</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {collectors.map(c => (
                    <button key={c.id} onClick={() => onAssign(req.id, c.id)} className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${req.collectorId === c.id ? 'border-indigo-500 bg-indigo-50 shadow-xl shadow-indigo-500/10' : 'border-transparent bg-on-surface/5 hover:bg-on-surface/10 hover:scale-[1.02]'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${req.collectorId === c.id ? 'bg-indigo-500 text-white' : 'bg-surface-container-highest text-on-surface-variant/40'}`}><User className="w-5 h-5" /></div>
                      <span className={`text-[11px] font-black truncate w-full text-center ${req.collectorId === c.id ? 'text-indigo-700' : 'text-on-surface/70'}`}>{c.name}</span>
                    </button>
                  ))}
                </div>
             </div>
           )}
          <div className="flex gap-4">
             {req.status === 'Pending' && <button onClick={() => { onStatus(req.id, 'Accepted'); onClose(); }} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Tiếp nhận hồ sơ</button>}
             {(req.status === 'Accepted' || req.status === 'Assigned' || req.status === 'Collected') && <div className="flex-1 py-4 text-center border-2 border-dashed border-primary/20 rounded-2xl bg-primary/5"><p className="text-[10px] font-black text-primary uppercase tracking-widest italic font-mono">- Chế độ chỉnh sửa đang bật -</p></div>}
             <button onClick={onClose} className="px-10 py-4 bg-surface-container-high text-on-surface-variant rounded-2xl font-black uppercase tracking-widest hover:bg-surface-container-highest transition-all">Đóng</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
