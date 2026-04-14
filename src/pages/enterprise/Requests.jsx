import React, { useEffect, useState } from 'react';
import { getRequests, getCollectors, updateRequestStatus, assignRequest } from '../../api/enterpriseApi';
import { MoreVertical, MapPin, Scale, Clock, User, CheckCircle2, CircleDashed } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRequests(), getCollectors()]).then(([reqs, cols]) => {
      setRequests(reqs);
      setCollectors(cols);
      setLoading(false);
    });
  }, []);

  const handleAssign = async (reqId, colId) => {
    const updated = await assignRequest(reqId, colId);
    setRequests(prev => prev.map(r => r.id === reqId ? updated : r));
  };

  const handleStatus = async (reqId, status) => {
    const updated = await updateRequestStatus(reqId, status);
    setRequests(prev => prev.map(r => r.id === reqId ? updated : r));
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  const cols = [
    { id: 'Pending', title: 'Yêu cầu mới', bg: 'bg-orange-50', dot: 'bg-orange-400' },
    { id: 'Assigned', title: 'Đang thực hiện (Đã duyệt)', bg: 'bg-blue-50', dot: 'bg-blue-400' },
    { id: 'Completed', title: 'Đã hoàn thành', bg: 'bg-green-50', dot: 'bg-green-400' }
  ];

  return (
    <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-700 flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Bảng Điều Phối</h1>
        <p className="text-on-surface-variant font-medium">Quản lý các yêu cầu thu gom rác từ người dân và điều phối nhân viên.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {cols.map(col => (
          <div key={col.id} className={`${col.bg} rounded-3xl p-5 border border-black/5 flex flex-col h-full max-h-[70vh]`}>
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${col.dot}`}></div>
                <h2 className="font-bold text-on-surface">{col.title}</h2>
              </div>
              <span className="bg-white/50 text-on-surface-variant text-xs font-bold px-2 py-1 rounded-full">
                {requests.filter(r => r.status === col.id).length}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide pb-10">
              {requests.filter(r => r.status === col.id).map(req => (
                <RequestCard 
                  key={req.id} 
                  req={req} 
                  collectors={collectors} 
                  onAssign={handleAssign} 
                  onStatus={handleStatus} 
                />
              ))}
              {requests.filter(r => r.status === col.id).length === 0 && (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-black/10 rounded-2xl">
                  <p className="text-sm font-bold text-on-surface-variant/50">Không có yêu cầu nảo.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RequestCard({ req, collectors, onAssign, onStatus }) {
  const [openSelect, setOpenSelect] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">
        <span className="bg-surface-container text-on-surface-variant px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
          {req.wasteType}
        </span>
        <button className="text-on-surface-variant/40 hover:text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      <h3 className="font-bold text-on-surface mb-2 truncate text-lg">{req.citizenName}</h3>
      
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <WeightIcon />
          <span className="font-medium">{req.weightKg} kg</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <MapPin className="w-4 h-4 text-primary/70 shrink-0" />
          <span className="truncate">{req.address}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Clock className="w-4 h-4 text-primary/70 shrink-0" />
          <span>{new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </div>

      <div className="border-t border-surface-container pt-4 mt-auto">
        {req.status === 'Pending' && (
          <div className="relative">
            {openSelect ? (
              <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-lg absolute bottom-full w-full mb-2 z-10 animate-in zoom-in-95 duration-150">
                <div className="bg-surface-container px-3 py-2 text-xs font-bold text-on-surface-variant">Điều phối cho...</div>
                {collectors.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => { onAssign(req.id, c.id); setOpenSelect(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-primary/5 hover:text-primary transition-colors border-b border-surface-container-high last:border-0"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            ) : null}
            <button 
              onClick={() => setOpenSelect(!openSelect)}
              className="w-full bg-primary hover:bg-primary-container text-white py-2.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2"
            >
              <User className="w-4 h-4" />
              Gán Nhân Viên
            </button>
          </div>
        )}

        {req.status === 'Assigned' && (
           <div className="flex gap-2">
             <div className="flex-1 bg-surface-container-low px-3 py-2.5 rounded-xl text-xs font-bold text-on-surface flex flex-col justify-center">
               <span className="text-on-surface-variant font-medium mb-0.5">Người phụ trách:</span>
               {collectors.find(c => c.id === req.collectorId)?.name || req.collectorId}
             </div>
             <button title="Đánh dấu Hoàn Thành" onClick={() => onStatus(req.id, 'Completed')} className="bg-surface-container hover:bg-green-100 hover:text-green-700 text-on-surface-variant p-2.5 rounded-xl transition-colors">
               <CheckCircle2 className="w-5 h-5" />
             </button>
           </div>
        )}

        {req.status === 'Completed' && (
          <div className="flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2.5 rounded-xl text-sm font-bold">
            <CheckCircle2 className="w-5 h-5" />
            Đã thu gom xong
          </div>
        )}
      </div>
    </div>
  );
}

function WeightIcon() {
  return <Scale className="w-4 h-4 text-primary/70 shrink-0" />;
}
