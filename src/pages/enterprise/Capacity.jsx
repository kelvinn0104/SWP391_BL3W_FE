import React, { useEffect, useState } from 'react';
import { getCapacity, updateCapacity } from '../../api/areaApi';
import { Save, Check, ShieldCheck, MapPin, Plus, X } from 'lucide-react';

const WASTE_TYPES = ['Plastic', 'Paper', 'Glass', 'Metals', 'E-Waste', 'Organic'];
const COMMON_DISTRICTS = ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Bình Thạnh', 'Phú Nhuận', 'Gò Vấp', 'Tân Bình', 'Tân Phú', 'Bình Tân', 'Thủ Đức', 'Bình Chánh', 'Hóc Môn', 'Củ Chi', 'Nhà Bè', 'Cần Giờ'];

export default function Capacity() {
  const [formData, setFormData] = useState({
    acceptedWasteTypes: [],
    monthlyCapacityKg: 0,
    serviceAreas: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newWard, setNewWard] = useState('');
  const [newDistrict, setNewDistrict] = useState(COMMON_DISTRICTS[0]);

  useEffect(() => {
    getCapacity().then(data => {
      setFormData(data);
      setLoading(false);
    });
  }, []);

  const toggleWasteType = (type) => {
    setFormData(prev => ({
      ...prev,
      acceptedWasteTypes: prev.acceptedWasteTypes.includes(type)
        ? prev.acceptedWasteTypes.filter(t => t !== type)
        : [...prev.acceptedWasteTypes, type]
    }));
  };

  const addServiceArea = () => {
    if (!newWard.trim()) return;
    const area = `${newWard.trim()}, ${newDistrict}`;
    if (!formData.serviceAreas.includes(area)) {
      setFormData(prev => ({ ...prev, serviceAreas: [...prev.serviceAreas, area] }));
    }
    setNewWard('');
  };

  const removeServiceArea = (area) => {
    setFormData(prev => ({ ...prev, serviceAreas: prev.serviceAreas.filter(a => a !== area) }));
  };

  const handleSave = async () => {
    setSaving(true);
    await updateCapacity(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight mb-2">Thiết lập Năng lực & Khu vực</h1>
          <p className="text-on-surface-variant font-medium">Cấu hình khả năng xử lý rác và khu vực hoạt động của bạn.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-6 py-3 rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
          {saved ? 'Đã lưu thành công' : 'Lưu thiết lập'}
        </button>
      </header>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-highest botanical-shadow">
        <div className="flex items-center gap-3 mb-6 border-b border-surface-container-high pb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-on-surface">Loại rác tiếp nhận</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">Chọn các loại rác mà cơ sở của bạn có thể xử lý.</p>
        <div className="flex flex-wrap gap-3">
          {WASTE_TYPES.map(type => {
            const isSelected = formData.acceptedWasteTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleWasteType(type)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                  isSelected 
                    ? 'border-primary bg-primary/10 text-primary scale-105' 
                    : 'border-surface-container-highest bg-surface-container text-on-surface-variant hover:border-primary/50'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-highest botanical-shadow">
        <div className="flex items-center gap-3 mb-6 border-b border-surface-container-high pb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-on-surface">Công suất xử lý hàng tháng</h2>
        </div>
        <div className="max-w-md">
          <label className="block text-sm font-bold text-on-surface-variant mb-2">Giới hạn công suất (Tính bằng Kg)</label>
          <div className="relative">
            <input 
              type="number" 
              className="w-full bg-surface-container border-2 border-surface-container-highest rounded-2xl px-5 py-4 font-bold text-lg text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={formData.monthlyCapacityKg}
              onChange={(e) => setFormData(prev => ({ ...prev, monthlyCapacityKg: parseInt(e.target.value) || 0 }))}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">Kg / Tháng</span>
          </div>
          <p className="text-xs mt-2 text-on-surface-variant/70">Thiết lập giới hạn chính xác giúp chúng tôi phân bổ lượng rác phù hợp cho bạn.</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl p-8 border border-surface-container-highest botanical-shadow">
        <div className="flex items-center gap-3 mb-6 border-b border-surface-container-high pb-4">
          <div className="p-2 bg-primary/10 rounded-xl text-primary"><ShieldCheck className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-on-surface">Khu vực phục vụ</h2>
        </div>
        <p className="text-sm text-on-surface-variant mb-4">Thêm chi tiết các Phường/Xã và Quận/Huyện tại TP.HCM mà bạn có thể hỗ trợ thu gom.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Phường / Xã</label>
            <input 
              type="text" 
              placeholder="VD: Phường Bến Nghé" 
              className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 font-bold text-sm text-on-surface focus:outline-none focus:border-primary transition-colors"
              value={newWard}
              onChange={(e) => setNewWard(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addServiceArea()}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">Quận / Huyện</label>
            <div className="relative">
              <select 
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-4 py-3 font-bold text-sm text-on-surface focus:outline-none focus:border-primary transition-colors appearance-none"
                value={newDistrict}
                onChange={(e) => setNewDistrict(e.target.value)}
              >
                {COMMON_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>
          <div className="flex items-end">
            <button 
              onClick={addServiceArea}
              disabled={!newWard.trim()}
              className="h-[46px] flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Thêm
            </button>
          </div>
        </div>

        <div className="bg-surface-container p-6 rounded-2xl border-2 border-dashed border-surface-container-highest">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">Các khu vực đã đăng ký</h3>
          {formData.serviceAreas.length === 0 ? (
            <p className="text-sm font-medium text-on-surface-variant/70 italic text-center py-4">Chưa có khu vực nào được cấu hình.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {formData.serviceAreas.map(area => (
                <div key={area} className="flex items-center gap-2 bg-white border border-surface-container-highest px-3 py-1.5 rounded-lg shadow-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-on-surface">{area}</span>
                  <button 
                    onClick={() => removeServiceArea(area)}
                    className="ml-1 p-1 hover:bg-error/10 text-on-surface-variant/50 hover:text-error rounded-md transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
