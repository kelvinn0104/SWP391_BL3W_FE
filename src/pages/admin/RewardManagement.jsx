import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Edit2, 
  Clock, 
  Package,
  Layers,
  Zap,
  ArrowRight,
  ShieldCheck,
  X,
  CheckCircle2
} from 'lucide-react';
import AlertModal from '../../components/ui/AlertModal';

const INITIAL_POINT_RULES = [
  {
    id: 1,
    category: 'Nhựa',
    icon: 'zap',
    ranges: [
      { id: 1, min: 1, max: 5, points: 50 },
      { id: 2, min: 5, max: 10, points: 120 },
      { id: 3, min: 10, max: 20, points: 200 },
      { id: 4, min: 20, max: 35, points: 250 },
      { id: 5, min: 35, max: 50, points: 350 },
    ]
  },
  {
    id: 2,
    category: 'Kim Loại',
    icon: 'layers',
    ranges: [
      { id: 6, min: 1, max: 5, points: 75 },
      { id: 7, min: 5, max: 10, points: 150 },
      { id: 8, min: 10, max: 20, points: 250 },
      { id: 9, min: 20, max: 35, points: 350 },
      { id: 10, min: 35, max: 50, points: 500 },
    ]
  },
  {
    id: 3,
    category: 'Các loại rác chung',
    icon: 'package',
    ranges: [
      { id: 11, min: 1, max: 5, points: 50 },
      { id: 12, min: 5, max: 10, points: 120 },
      { id: 13, min: 10, max: 20, points: 200 },
      { id: 14, min: 20, max: 35, points: 250 },
      { id: 15, min: 35, max: 50, points: 350 },
    ]
  }
];

export default function RewardManagement() {
  const [pointRules, setPointRules] = useState(INITIAL_POINT_RULES);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: null });

  const showAlert = (title, message, type = 'warning', onConfirm = null) => {
    setAlertConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const handleEdit = (rule) => {
    setEditingRule(JSON.parse(JSON.stringify(rule))); // Deep clone to avoid direct state mutation
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedRule) => {
    setPointRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    setIsEditModalOpen(false);
    setEditingRule(null);
    showAlert("Thành công", `Đã cập nhật cấu hình điểm cho danh mục ${updatedRule.category}.`, "success");
  };

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight mb-1 md:mb-2">Cấu hình tích điểm</h1>
          <p className="text-sm md:text-lg text-on-surface-variant font-medium">Thiết lập điểm thưởng tự động dựa trên khối lượng rác thải.</p>
        </div>
      </header>

      {/* Grid of Rules */}
      <main className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {pointRules.map((rule) => (
          <motion.div 
            layout
            key={rule.id} 
            className="group bg-surface rounded-[2.5rem] border border-surface-container-high overflow-hidden botanical-shadow-lg p-6 space-y-6 hover:border-primary/40 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                 <div className="p-3.5 bg-gradient-to-br from-primary to-primary-dark rounded-[1.4rem] text-white shadow-xl shadow-primary/30">
                    {rule.category === 'Nhựa' ? <Zap className="w-6 h-6" /> : rule.category === 'Kim Loại' ? <Layers className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Danh mục</span>
                    <h3 className="text-xl font-black text-on-surface tracking-tighter leading-none">{rule.category}</h3>
                 </div>
              </div>
              <button 
                onClick={() => handleEdit(rule)}
                className="p-2.5 text-on-surface-variant/20 hover:text-primary transition-colors bg-surface-container-low rounded-xl"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <div className="h-[1.5px] w-6 bg-primary/20" />
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40">Quy tắc khối lượng</p>
              </div>
              
              <div className="space-y-2">
                {rule.ranges.map((range) => (
                  <motion.div 
                    key={range.id} 
                    whileHover={{ x: 5 }}
                    className="flex items-center justify-between p-3.5 bg-surface-container-low/60 rounded-[1.4rem] border border-surface-container-high group-hover:border-primary/20 transition-all shadow-inner"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-8 bg-primary/20 rounded-full group-hover:bg-primary transition-all duration-500" />
                      <div className="flex flex-col">
                         <span className="text-[9px] font-bold text-on-surface-variant/40 uppercase">Khoảng</span>
                         <span className="font-black text-on-surface text-lg tabular-nums tracking-tighter leading-none">{range.min} - {range.max} kg</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-bold text-primary opacity-60 uppercase mb-0.5">Cộng</span>
                       <div className="flex items-center gap-2 text-primary font-black scale-110 origin-right">
                          <Zap className="w-3 h-3" fill="currentColor" />
                          <span className="italic">{range.points}</span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="pt-6 border-t border-surface-container-high border-dashed flex justify-between items-center opacity-40 group-hover:opacity-100 transition-opacity">
               <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold italic">Cộng điểm ngay khi hoàn tất</span>
               </div>
               <ArrowRight className="w-4 h-4 text-primary" />
            </div>
          </motion.div>
        ))}
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingRule && (
          <EditRuleModal 
            rule={editingRule} 
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingRule(null);
            }} 
            onSave={handleSave} 
          />
        )}
      </AnimatePresence>

      <AlertModal 
        isOpen={alertConfig.isOpen}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={alertConfig.onConfirm}
      />
    </div>
  );
}

function EditRuleModal({ rule, onClose, onSave }) {
  const [tempRule, setTempRule] = useState(rule);

  const updateRangeField = (rangeId, field, value) => {
    setTempRule(prev => ({
      ...prev,
      ranges: prev.ranges.map(r => r.id === rangeId ? { ...r, [field]: parseInt(value) || 0 } : r)
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
       <motion.div 
         initial={{ opacity: 0 }} 
         animate={{ opacity: 1 }} 
         exit={{ opacity: 0 }} 
         onClick={onClose} 
         className="absolute inset-0 bg-black/60 backdrop-blur-md" 
       />
       <motion.div 
         initial={{ opacity: 0, scale: 0.9, y: 20 }} 
         animate={{ opacity: 1, scale: 1, y: 0 }} 
         exit={{ opacity: 0, scale: 0.9, y: 20 }} 
         className="relative bg-surface p-8 rounded-[3rem] w-full max-w-2xl space-y-8 botanical-shadow-lg border border-surface-container-high"
       >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  {tempRule.category === 'Nhựa' ? <Zap className="w-6 h-6" /> : tempRule.category === 'Kim Loại' ? <Layers className="w-6 h-6" /> : <Package className="w-6 h-6" />}
               </div>
               <div>
                  <h2 className="text-2xl font-black text-on-surface">Cấu hình quy tắc</h2>
                  <p className="text-xs font-bold text-on-surface-variant opacity-60">Danh mục: {tempRule.category}</p>
               </div>
            </div>
            <button onClick={onClose} className="p-3 bg-surface-container hover:bg-error/10 hover:text-error rounded-full transition-all group">
              <X className="w-6 h-6 group-active:scale-90 transition-transform" />
            </button>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {tempRule.ranges.map((range) => (
              <div key={range.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-surface-container-low rounded-2xl border border-surface-container-high transition-all focus-within:border-primary/40 focus-within:shadow-lg focus-within:shadow-primary/5">
                <div className="col-span-7 flex items-center gap-4">
                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant/40 mb-1">Từ (kg)</span>
                    <input 
                      type="number" 
                      value={range.min} 
                      onChange={(e) => updateRangeField(range.id, 'min', e.target.value)}
                      className="w-full bg-surface p-2.5 rounded-xl font-black text-on-surface text-lg focus:outline-none transition-all border border-transparent focus:border-primary/20"
                    />
                  </div>
                  <div className="pt-4 text-on-surface-variant/20 font-black">→</div>
                  <div className="flex flex-col flex-1">
                    <span className="text-[9px] font-black uppercase text-on-surface-variant/40 mb-1">Đến (kg)</span>
                    <input 
                      type="number" 
                      value={range.max} 
                      onChange={(e) => updateRangeField(range.id, 'max', e.target.value)}
                      className="w-full bg-surface p-2.5 rounded-xl font-black text-on-surface text-lg focus:outline-none transition-all border border-transparent focus:border-primary/20"
                    />
                  </div>
                </div>

                <div className="col-span-5 flex flex-col items-end pl-4 border-l border-surface-container-high border-dashed">
                  <span className="text-[9px] font-black uppercase text-primary mb-1 text-right w-full">Điểm cộng</span>
                  <div className="flex items-center gap-2 w-full justify-end">
                    <Zap className="w-4 h-4 text-primary opacity-40 shrink-0" />
                    <input 
                      type="number" 
                      value={range.points} 
                      onChange={(e) => updateRangeField(range.id, 'points', e.target.value)}
                      className="w-full max-w-[100px] bg-primary/5 p-2.5 rounded-xl font-black text-primary text-xl text-right focus:outline-none transition-all border border-primary/10 focus:border-primary/40"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              onClick={() => onSave(tempRule)}
              className="flex-[2] bg-primary text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Lưu cấu hình
            </button>
          </div>
       </motion.div>
    </div>
  );
}
