import React, { useEffect, useState, useMemo } from 'react';
import { getCapacity, updateCapacity, getCollectors, deleteArea, updateArea } from '../../api/areaApi';
import Pagination from '../../components/ui/Pagination';
import AlertModal from '../../components/ui/AlertModal';
import {
  MapPin,
  Trophy,
  X,
  Weight,
  ArrowLeft,
  Trash2,
  Home,
  Search,
  Plus,
  Edit,
  Check,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCheck
} from 'lucide-react';

const COMMON_DISTRICTS = [
  'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 
  'Quận Bình Thạnh', 'Quận Phú Nhuận', 'Quận Gò Vấp', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Bình Tân', 
  'Thành phố Thủ Đức', 'Huyện Bình Chánh', 'Huyện Hóc Môn', 'Huyện Củ Chi', 'Huyện Nhà Bè', 'Huyện Cần Giờ'
];

// Shared Utility for checking collector assignment
const findCollectorAssignment = (name, allAreas, excludeDistrict = null, excludeWard = null) => {
  if (!name || name === 'Chưa phân công' || !Array.isArray(allAreas)) return null;
  for (const a of allAreas) {
    const wards = a.wards || a.Wards;
    if (!wards) continue;
    for (const w of wards) {
      const actualCollectors = w.collectors || w.Collectors || (w.collectorName ? [w.collectorName] : []);
      if (actualCollectors.includes(name)) {
        // Tránh báo chính nó đang bận tại chính nó đang chỉnh sửa
        const wName = typeof w === 'string' ? w : (w.name || w.Name);
        if ((a.district || a.District) === excludeDistrict && wName === excludeWard) continue;
        return { district: a.district || a.District, ward: wName };
      }
    }
  }
  return null;
};

export default function Area() {
  const [areasData, setAreasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [collectors, setCollectors] = useState([]);
  const [isAddingCustomDistrict, setIsAddingCustomDistrict] = useState(false);
  const [customDistrictForm, setCustomDistrictForm] = useState({
    name: '',
    capacity: 0,
    quickAdd: false,
    wardName: '',
    wardCollectors: [],
    tempCollector: ''
  });
  const [showCustomCollectorDropdown, setShowCustomCollectorDropdown] = useState(false);
  const [pendingCustomTransfer, setPendingCustomTransfer] = useState(null);
  const [currentPageDistrict, setCurrentPageDistrict] = useState(1);
  const DISTRICTS_PER_PAGE = 32;
  const [editingArea, setEditingArea] = useState(null); // { district, capacity }
  const [editAreaForm, setEditAreaForm] = useState({ name: '', capacity: 0 });
  const [pendingDeleteDistrict, setPendingDeleteDistrict] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'warning', onConfirm: null });

  const showAlert = (title, message, type = 'warning', onConfirm = null) => {
    setAlertConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const resetCustomForm = () => {
    setCustomDistrictForm({ name: '', capacity: 0, quickAdd: false, wardName: '', wardCollectors: [], tempCollector: '' });
    setShowCustomCollectorDropdown(false);
  };

  useEffect(() => {
    getCapacity().then(data => {
      setAreasData(data.areas || []);
      setLoading(false);
    });
    getCollectors().then(setCollectors);
  }, []);

  const [updateTimer, setUpdateTimer] = useState(null);
  const timerRef = React.useRef(null);

  const handleUpdateArea = (updatedArea, collectorToMove = null) => {
    // Update local state immediately for UI responsiveness
    setAreasData(prev => {
      let filteredPrev = prev;

      if (collectorToMove) {
        filteredPrev = prev.map(a => ({
          ...a,
          wards: a.wards.map(w => ({
            ...w,
            collectors: (w.collectors || []).filter(c => c !== collectorToMove)
          }))
        }));
      }

      let nextState;
      if (!updatedArea) {
        nextState = filteredPrev;
      } else {
        const exists = filteredPrev.find(a => a.district === updatedArea.district);
        nextState = exists
          ? filteredPrev.map(a => a.district === updatedArea.district ? updatedArea : a)
          : [...filteredPrev, updatedArea];
      }

      // Handle Debounced Auto-Save
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        try {
          const result = await updateCapacity({ areas: nextState });
          if (result && result.areas) {
            setAreasData(result.areas);
          }
        } catch (err) {
          console.error("Auto-save failed", err);
        }
      }, 800); 

      return nextState;
    });
  };

  const handleRemoveArea = async (areaId, districtName) => {
    try {
      if (areaId && !areaId.toString().startsWith('area-custom')) {
        await deleteArea(areaId);
      }
      setAreasData(prev => {
        const nextState = prev.filter(a => a.id !== areaId && a.district !== districtName);
        updateCapacity({ areas: nextState });
        return nextState;
      });
      showAlert("Thành công", "Khu vực đã được xoá khỏi hệ thống.", "success");
    } catch (err) {
      showAlert("Lỗi", "Không thể xoá khu vực. Vui lòng thử lại sau.", "error");
    }
  };

  const startEditArea = (area) => {
    setEditingArea(area);
    setEditAreaForm({
      name: area.district,
      capacity: area.monthlyCapacityKg || 0
    });
  };

  const handleSaveAreaEdit = async () => {
    const newName = editAreaForm.name.trim();
    if (!newName) return;

    try {
      const updatedData = {
        ...editingArea,
        district: newName,
        monthlyCapacityKg: Number(editAreaForm.capacity) || 0
      };

      if (editingArea.id && !editingArea.id.toString().startsWith('area-custom')) {
        await updateArea(editingArea.id, updatedData);
        setAreasData(prev => prev.map(a => a.id === editingArea.id ? updatedData : a));
      } else {
        // Handle new/empty areas via Bulk Update
        setAreasData(prev => {
          const nextState = prev.find(a => a.district === editingArea.district)
            ? prev.map(a => a.district === editingArea.district ? updatedData : a)
            : [...prev, updatedData];
          
          updateCapacity({ areas: nextState });
          return nextState;
        });
      }
      
      setEditingArea(null);
      showAlert("Thành công", "Thông tin khu vực đã được cập nhật.", "success");
    } catch (err) {
      showAlert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại sau.", "error");
    }
  };

  // Tính toán Top 10 Hoàn thành tốt nhất
  const topCompleted = useMemo(() => {
    return [...areasData].sort((a, b) => (b.completedRequests || 0) - (a.completedRequests || 0)).slice(0, 10);
  }, [areasData]);

  // Tính toán Top 10 Công suất cao nhất (Dựa trên Đã xử lý thực tế)
  const topCapacity = useMemo(() => {
    return [...areasData].sort((a, b) => (b.processedThisMonthKg || 0) - (a.processedThisMonthKg || 0)).slice(0, 10);
  }, [areasData]);

  const maxCompleted = topCompleted.length > 0 ? topCompleted[0].completedRequests : 1;
  const maxCapacity = topCapacity.length > 0 ? topCapacity[0].processedThisMonthKg : 1;

  const allDistrictNames = useMemo(() => {
    const customNames = areasData
      .filter(a => !COMMON_DISTRICTS.includes(a.district))
      .map(a => a.district);
    const all = [...COMMON_DISTRICTS, ...customNames];
    
    if (!searchQuery.trim()) return all;
    
    const query = searchQuery.toLowerCase().trim();
    return all.filter(name => name.toLowerCase().includes(query));
  }, [areasData, searchQuery]);

  const totalPagesDistrict = Math.ceil(allDistrictNames.length / DISTRICTS_PER_PAGE);
  const displayedDistricts = allDistrictNames.slice(
    (currentPageDistrict - 1) * DISTRICTS_PER_PAGE,
    currentPageDistrict * DISTRICTS_PER_PAGE
  );

  const handleSaveCustomDistrict = () => {
    const dName = customDistrictForm.name.trim();
    if (!dName) {
      showAlert("Thiếu thông tin", "Vui lòng nhập tên định danh cho khu vực mới!", "info");
      return;
    }

    if (allDistrictNames.includes(dName)) {
      showAlert("Khu vực đã tồn tại", `Khu vực "${dName}" đã tồn tại trong hệ thống!`, 'warning');
      return;
    }

    if (customDistrictForm.quickAdd && !customDistrictForm.wardName.trim()) {
      showAlert("Thiếu thông tin", "Bạn đang bật chế độ nhập nhanh, vui lòng nhập tên Phường khởi tạo!", "info");
      return;
    }

    const newArea = {
      id: `area-custom-${Date.now()}`,
      district: dName,
      monthlyCapacityKg: Number(customDistrictForm.capacity) || 0,
      processedThisMonthKg: 0,
      completedRequests: 0,
      wards: customDistrictForm.quickAdd ? [
        {
          name: customDistrictForm.wardName.trim(),
          collectors: customDistrictForm.wardCollectors,
          collectedKg: 0,
          completedRequests: 0
        }
      ] : []
    };

    setAreasData(prev => {
      const updated = [...prev, newArea];
      setTimeout(() => updateCapacity({ areas: updated }), 500);
      return updated;
    });
    setIsAddingCustomDistrict(false);
    setCustomDistrictForm({
      name: '',
      capacity: 0,
      quickAdd: false,
      wardName: '',
      wardCollectors: [],
      tempCollector: ''
    });
  };

  const [activeChartTab, setActiveChartTab] = useState('completed');

  if (loading) return <div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  return (
    <div className="w-full space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {selectedDistrict ? (
        <DistrictDetailView
          area={areasData.find(a => a.district === selectedDistrict) || {
            id: `area-${Date.now()}`,
            district: selectedDistrict,
            monthlyCapacityKg: 0,
            processedThisMonthKg: 0,
            completedRequests: 0,
            wards: []
          }}
          allAreas={areasData}
          collectors={collectors}
          onBack={() => setSelectedDistrict(null)}
          onUpdate={handleUpdateArea}
          onRemove={handleRemoveArea}
          showAlert={showAlert}
        />
      ) : (
        <>
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight mb-1 md:mb-2">Bảng Xếp Hạng Khu Vực</h1>
              <p className="text-sm md:text-lg text-on-surface-variant font-medium">Phân tích hiệu suất và phân bổ mạng lưới cho toàn thành phố.</p>
            </div>
          </header>

          <div className="bg-surface-container-lowest rounded-3xl p-4 md:p-8 border border-surface-container-highest botanical-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Trophy className="w-6 h-6" /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-on-surface">Bảng Vàng Khu Vực</h2>
                  <p className="text-[10px] md:text-sm font-medium text-on-surface-variant mt-1">Biểu đồ vinh danh các Quận/Huyện có thành tích xuất sắc nhất.</p>
                </div>
              </div>

              <div className="flex bg-surface-container p-1 rounded-xl w-fit">
                <button
                  onClick={() => setActiveChartTab('completed')}
                  className={`px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeChartTab === 'completed' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  Hoàn Thành
                </button>
                <button
                  onClick={() => setActiveChartTab('capacity')}
                  className={`px-4 md:px-6 py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${activeChartTab === 'capacity' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                >
                  Công Suất
                </button>
              </div>
            </div>

            <div className="overflow-x-auto pb-4 no-scrollbar">
              <div className="h-64 md:h-80 flex items-end justify-center gap-2 sm:gap-4 mt-6 md:mt-10 px-2 sm:px-6 min-w-[600px] md:min-w-0">
                {activeChartTab === 'completed' ? (
                  topCompleted.length === 0 ? <p className="text-sm italic text-on-surface-variant/50 self-center">Chưa có dữ liệu giao dịch.</p> :
                    topCompleted.map((area, index) => {
                      const height = Math.max(35, ((area.completedRequests || 0) / maxCompleted) * 100);
                      return (
                        <div key={area.district} className="flex-1 h-full flex flex-col justify-end group cursor-pointer" onClick={() => setSelectedDistrict(area.district)}>
                          <div className="w-full bg-gradient-to-t from-primary to-primary-container rounded-t-2xl transition-all duration-1000 ease-out flex flex-col justify-end items-center relative overflow-hidden shadow-sm group-hover:scale-[1.02]" style={{ height: `${height}%` }}>
                            <span className="absolute top-3 font-black text-white/90 drop-shadow-md text-[10px] sm:text-sm">
                              {area.completedRequests}
                            </span>
                            <div className="absolute inset-0 flex items-end justify-center pb-6">
                              <span className="font-extrabold text-white drop-shadow-md text-[10px] sm:text-xs whitespace-nowrap -rotate-90 origin-center pointer-events-none tracking-widest uppercase">
                                {area.district}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  topCapacity.length === 0 ? <p className="text-sm italic text-on-surface-variant/50 self-center">Chưa có dữ liệu năng lực.</p> :
                    topCapacity.map((area, index) => {
                      const height = Math.max(35, ((area.monthlyCapacityKg || 0) / maxCapacity) * 100);
                      return (
                        <div key={area.district} className="flex-1 h-full flex flex-col justify-end group cursor-pointer" onClick={() => setSelectedDistrict(area.district)}>
                          <div className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t-2xl transition-all duration-1000 ease-out flex flex-col justify-end items-center relative overflow-hidden shadow-sm group-hover:scale-[1.02]" style={{ height: `${height}%` }}>
                            <span className="absolute top-3 font-black text-white/90 drop-shadow-md text-[10px] sm:text-sm">
                              {area.processedThisMonthKg >= 1000 ? `${(area.processedThisMonthKg / 1000).toFixed(1)}k` : area.processedThisMonthKg}
                            </span>
                            <div className="absolute inset-0 flex items-end justify-center pb-6">
                              <span className="font-extrabold text-white drop-shadow-md text-[10px] sm:text-xs whitespace-nowrap -rotate-90 origin-center pointer-events-none tracking-widest uppercase">
                                {area.district}
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

          <div>
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm"><MapPin className="w-6 h-6" /></div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-on-surface tracking-tight">Mạng Lưới Phân Bổ TP.HCM</h2>
                <p className="text-[10px] md:text-sm font-bold text-on-surface-variant/70 tracking-tight mt-1 uppercase tracking-widest leading-relaxed">Quản lý trạm điều hành và các cụm phường/xã.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8 px-2">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  placeholder="Tìm kiếm Quận/Huyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-lowest border-2 border-surface-container-highest rounded-2xl pl-12 pr-12 py-3 font-bold text-sm md:text-base text-on-surface focus:outline-none focus:border-primary transition-all shadow-sm group-hover:border-surface-container-high"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsAddingCustomDistrict(true)}
                className="flex items-center justify-center gap-2 bg-secondary/10 text-secondary border-2 border-secondary/20 hover:bg-secondary hover:text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span className="whitespace-nowrap">Thêm Khu Vực</span>
              </button>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 px-2">
              {displayedDistricts.map(districtName => {
                const existingData = areasData.find(a => (a.district || a.District) === districtName);
                const isActive = existingData && ((existingData.processedThisMonthKg || existingData.ProcessedThisMonthKg || 0) > 0 || (existingData.wards || existingData.Wards || []).length > 0);

                return (
                  <div
                    key={districtName}
                    onClick={() => setSelectedDistrict(districtName)}
                    className={`p-2 py-4 flex flex-col items-center text-center cursor-pointer group gap-1 border-2 transition-all duration-300 rounded-3xl relative ${isActive
                        ? 'border-primary/20 bg-surface botanical-shadow hover:border-primary/50 hover:-translate-y-1'
                        : 'border-surface-container-highest bg-surface-container/30 hover:border-surface-container-high hover:-translate-y-1'
                      }`}
                  >
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditArea(existingData || { district: districtName, monthlyCapacityKg: 0, wards: [] });
                        }}
                        className="p-1.5 bg-white shadow-md rounded-lg text-on-surface-variant hover:text-primary hover:scale-110 transition-all border border-surface-container-high"
                        title="Chỉnh sửa khu vực"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPendingDeleteDistrict(existingData || { district: districtName, isPlaceholder: true });
                        }}
                        className="p-1.5 bg-white shadow-md rounded-lg text-on-surface-variant hover:text-error hover:scale-110 transition-all border border-surface-container-high"
                        title="Xóa khu vực"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${isActive ? 'bg-primary text-white shadow-primary/20' : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                      <MapPin className="w-5 h-5" />
                    </div>

                    <h3 className={`font-extrabold text-[11px] md:text-xs transition-colors mt-2 leading-tight px-1 ${isActive ? 'text-on-surface' : 'text-on-surface-variant/70 group-hover:text-on-surface'}`}>
                      {districtName}
                    </h3>

                    <p className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase whitespace-nowrap mt-1 opacity-70">
                      {isActive ? `${(existingData.processedThisMonthKg || existingData.ProcessedThisMonthKg || 0) >= 1000 ? ((existingData.processedThisMonthKg || existingData.ProcessedThisMonthKg || 0) / 1000).toFixed(1) + 'k' : (existingData.processedThisMonthKg || existingData.ProcessedThisMonthKg || 0)} Kg` : 'Trống'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 md:mt-12 flex justify-center">
              <Pagination 
                currentPage={currentPageDistrict}
                totalPages={totalPagesDistrict}
                onPageChange={(p) => {
                  setCurrentPageDistrict(p);
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
              />
            </div>
          </div>

      {/* Modal Thêm Khu Vực Tùy Chỉnh */}
      {isAddingCustomDistrict && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-surface-container-highest rounded-3xl md:rounded-[40px] shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
            <div className="p-5 md:p-8 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-lowest/50 shrink-0">
              <h3 className="font-extrabold text-xl md:text-2xl text-on-surface flex items-center gap-3">
                <div className="p-2 md:p-2.5 bg-secondary/10 rounded-2xl text-secondary">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                Tạo Khu Vực Mới
              </h3>
              <button
                onClick={() => setIsAddingCustomDistrict(false)}
                className="text-on-surface-variant hover:text-error transition-all p-2 bg-surface-container rounded-xl hover:rotate-90 hover:bg-error/10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="p-6 md:p-10 overflow-y-auto no-scrollbar">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                 {/* Left Column: Area Info */}
                 <div className="space-y-6 md:space-y-8">
                    <div>
                      <h4 className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 md:mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                        Cấu hình cơ bản
                      </h4>
                      <div className="space-y-6 md:space-y-8">
                        {/* District Name */}
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant pl-1">Định danh khu vực</label>
                          <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-secondary transition-colors" />
                            <input
                              autoFocus
                              type="text"
                              className="w-full bg-surface-container border-2 border-surface-container-highest focus:border-secondary rounded-[20px] pl-12 pr-6 py-3.5 md:py-4 font-bold text-on-surface focus:outline-none transition-all shadow-inner"
                              placeholder="Ví dụ: Khu Công Nghiệp A"
                              value={customDistrictForm.name}
                              onChange={e => setCustomDistrictForm({ ...customDistrictForm, name: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Toggle Quick Add */}
                        <div className="p-5 md:p-6 bg-surface-container rounded-[2rem] border-2 border-surface-container-highest border-dashed transition-all hover:border-secondary/30">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-black text-on-surface">Chế độ nhập nhanh</p>
                            <button
                              onClick={() => setCustomDistrictForm({ ...customDistrictForm, quickAdd: !customDistrictForm.quickAdd })}
                              className={`w-12 h-7 md:w-14 md:h-8 rounded-full transition-all relative ${customDistrictForm.quickAdd ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-surface-container-highest'}`}
                            >
                              <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full bg-white shadow-md transition-all absolute top-1 ${customDistrictForm.quickAdd ? 'left-6 md:left-7' : 'left-1'}`} />
                            </button>
                          </div>
                          <p className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-wide leading-relaxed">
                            Kích hoạt sẽ mở thêm phần khởi tạo Phường & Phân công nhân sự ngay lập tức.
                          </p>
                        </div>
                      </div>
                    </div>
                 </div>

                 {/* Right Column: Ward Info or Placeholder */}
                 <div className="relative min-h-[250px] md:min-h-[300px]">
                   {customDistrictForm.quickAdd ? (
                     <div className="space-y-6 md:space-y-8 animate-in slide-in-from-right-8 duration-500">
                        <h4 className="text-[10px] md:text-xs font-black text-secondary uppercase tracking-[0.2em] mb-4 md:mb-6 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                          Chi tiết Phường/Xã
                        </h4>
                        
                        <div className="space-y-6 md:space-y-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant pl-1">Tên Phường Khởi Tạo</label>
                            <div className="relative group">
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                              <input
                                type="text"
                                className="w-full bg-surface-container border-2 border-surface-container-highest focus:border-primary rounded-[20px] pl-12 pr-6 py-3.5 md:py-4 font-bold text-on-surface focus:outline-none transition-all shadow-inner"
                                placeholder="Phường khởi tạo..."
                                value={customDistrictForm.wardName}
                                onChange={e => setCustomDistrictForm({ ...customDistrictForm, wardName: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant pl-1">Người phụ trách phần này</label>

                            <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto no-scrollbar">
                              {customDistrictForm.wardCollectors.map(name => (
                                <span key={name} className="flex items-center gap-2 bg-primary text-white px-3 py-1.5 rounded-xl font-bold text-[9px] md:text-[10px] animate-in zoom-in">
                                  {name}
                                  <button onClick={() => setCustomDistrictForm({ ...customDistrictForm, wardCollectors: customDistrictForm.wardCollectors.filter(c => c !== name) })} className="hover:text-error transition-colors">
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              ))}
                            </div>

                            <div className="relative">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4" />
                              <input
                                type="text"
                                placeholder="Chọn nhân sự..."
                                className="w-full bg-surface-container border-2 border-surface-container-highest rounded-[20px] pl-11 pr-4 py-3 md:py-3.5 font-bold text-xs md:text-sm text-on-surface focus:outline-none focus:border-primary transition-all"
                                value={customDistrictForm.tempCollector}
                                onChange={(e) => setCustomDistrictForm({ ...customDistrictForm, tempCollector: e.target.value })}
                                onFocus={() => setShowCustomCollectorDropdown(true)}
                              />

                              {showCustomCollectorDropdown && (
                                <div className="absolute z-[110] w-full mt-2 bg-surface border-2 border-surface-container-highest rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2">
                                  <div className="max-h-40 overflow-y-auto">
                                    {collectors
                                      .filter(c => {
                                        const search = customDistrictForm.tempCollector.toLowerCase();
                                        const name = (c.fullName || c.displayName || c.email || "").toLowerCase();
                                        return name.includes(search);
                                      })
                                      .map(c => {
                                        const isAlreadySelected = customDistrictForm.wardCollectors.includes(c.fullName || c.displayName || c.email);
                                        return (
                                          <button
                                            key={c.userId || c.id || c.email}
                                            disabled={isAlreadySelected}
                                            onClick={() => {
                                              const cName = c.fullName || c.displayName || c.email;
                                              const assignment = findCollectorAssignment(cName, areasData);
                                              if (assignment) {
                                                setPendingCustomTransfer({
                                                  name: cName,
                                                  fromDistrict: assignment.district,
                                                  fromWard: assignment.ward
                                                });
                                              } else {
                                                setCustomDistrictForm({
                                                  ...customDistrictForm,
                                                  wardCollectors: [...customDistrictForm.wardCollectors, cName],
                                                  tempCollector: ''
                                                });
                                              }
                                              setShowCustomCollectorDropdown(false);
                                            }}
                                            className={`w-full px-5 py-3 md:py-4 flex items-center justify-between hover:bg-primary/5 transition-all border-b border-surface-container-highest last:border-0 group ${isAlreadySelected ? 'opacity-50 cursor-not-allowed bg-surface-container' : 'cursor-pointer'}`}
                                          >
                                            <div className="flex flex-col text-left">
                                              <span className={`font-extrabold text-xs md:text-sm mb-1 transition-colors ${isAlreadySelected ? 'text-on-surface-variant' : 'text-primary group-hover:text-primary-dark'}`}>
                                                {(c.fullName || c.FullName || c.displayName || c.DisplayName || c.email || c.Email || c.userId || c.Id || "Người dùng không tên")} {isAlreadySelected && '(Đã chọn)'}
                                              </span>
                                              <div className="flex items-center gap-2">
                                                <span className="text-[9px] md:text-[10px] font-bold text-on-surface-variant/70 tracking-tight">
                                                  {c.phoneNumber || c.PhoneNumber || c.phone || "Chưa có SĐT"}
                                                </span>
                                                {(() => {
                                                  const cName = (c.fullName || c.FullName || c.displayName || c.DisplayName || c.email || c.Email);
                                                  const ownOccupancy = findCollectorAssignment(cName, areasData);
                                                  return ownOccupancy ? (
                                                    <span className="text-[7px] md:text-[8px] font-black text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-in fade-in">
                                                      Đang bận tại {ownOccupancy.district} - {ownOccupancy.ward}
                                                    </span>
                                                  ) : null;
                                                })()}
                                              </div>
                                            </div>
                                            {!isAlreadySelected && (
                                              <div className="p-1.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <Plus className="w-3.5 h-3.5" />
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-8 bg-surface-container/30 rounded-[2.5rem] border-2 border-dashed border-surface-container-highest animate-in fade-in zoom-in duration-500">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-on-surface-variant/20 mb-4 md:mb-6">
                           <MapPin className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <h5 className="text-xs md:text-sm font-black text-on-surface mb-2">Sẵn sàng vận hành trạm?</h5>
                        <p className="text-[9px] md:text-[10px] font-bold text-on-surface-variant uppercase tracking-wide max-w-[200px] leading-relaxed">
                          Bật chế độ nhập nhanh để cấu hình phường trực thuộc ngay lập tức.
                        </p>
                     </div>
                   )}
                 </div>
               </div>
            </div>

            <div className="p-5 md:p-8 border-t border-surface-container-highest bg-surface-container-lowest/50 flex gap-3 md:gap-4 shrink-0">
              <button
                onClick={() => setIsAddingCustomDistrict(false)}
                className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-[20px] font-black text-xs md:text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all active:scale-95"
              >
                Huỷ
              </button>
              <button
                onClick={handleSaveCustomDistrict}
                className="flex-[2] bg-emerald-500 text-white px-4 md:px-8 py-3 md:py-4 rounded-[20px] font-extrabold text-xs md:text-sm shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 md:w-5 md:h-5" />
                Xác Nhận Tạo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chỉnh Sửa Khu Vực */}
      {editingArea && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-surface-container-highest rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-sm md:max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 md:p-8 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-lowest/50">
              <h3 className="font-extrabold text-xl md:text-2xl text-on-surface flex items-center gap-3">
                <div className="p-2 md:p-2.5 bg-primary/10 rounded-2xl text-primary">
                  <Edit className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                Chỉnh Sửa
              </h3>
              <button
                onClick={() => setEditingArea(null)}
                className="text-on-surface-variant hover:text-error transition-all p-2 bg-surface-container rounded-xl hover:bg-error/10"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>

            <div className="p-6 md:p-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant pl-1">Tên Quận Huyện</label>
                <input
                  type="text"
                  className="w-full bg-surface-container border-2 border-surface-container-highest focus:border-primary rounded-[20px] px-6 py-3.5 md:py-4 font-bold text-on-surface focus:outline-none transition-all shadow-inner"
                  value={editAreaForm.name}
                  onChange={e => setEditAreaForm({ ...editAreaForm, name: e.target.value })}
                />
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-surface-container-highest bg-surface-container-lowest/50 flex gap-3 md:gap-4">
              <button
                onClick={() => setEditingArea(null)}
                className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-[20px] font-black text-xs md:text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all active:scale-95"
              >
                Huỷ
              </button>
              <button
                onClick={handleSaveAreaEdit}
                className="flex-[2] bg-primary text-white px-4 md:px-8 py-3 md:py-4 rounded-[20px] font-extrabold text-xs md:text-sm shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 md:w-5 md:h-5 " />
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Khu Vực (District) */}
      {pendingDeleteDistrict && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-error/20 rounded-[32px] shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden animate-in zoom-in-95 duration-300 p-6 md:p-8 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-on-surface mb-2">Xác nhận xóa hệ thống</h3>
            <p className="text-xs md:text-sm text-on-surface-variant mb-8 leading-relaxed">
              Bạn có chắc muốn xoá toàn bộ dữ liệu của <span className="text-error font-bold">{pendingDeleteDistrict?.district}</span>?<br />
              Hệ thống sẽ gỡ bỏ tất cả phường, xe thu gom và số liệu liên quan.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPendingDeleteDistrict(null)}
                className="flex-1 px-4 md:px-6 py-3 rounded-2xl font-bold text-xs md:text-sm text-on-surface-variant hover:bg-surface-container-highest transition-all active:scale-95"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  handleRemoveArea(pendingDeleteDistrict.id, pendingDeleteDistrict.district);
                  setPendingDeleteDistrict(null);
                }}
                className="flex-1 px-4 md:px-6 py-3 rounded-2xl font-bold text-xs md:text-sm bg-error text-white shadow-lg shadow-error/20 hover:bg-error/90 transition-all active:scale-95"
              >
                Xác nhận xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Điều Chuyển cho Khu Vực Mới */}
      {pendingCustomTransfer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-surface-container-highest rounded-3xl shadow-2xl w-full max-w-sm md:max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 p-6 md:p-8 text-center sm:text-left">
            <div className="space-y-6">
               <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto sm:mx-0">
                  <UserCheck className="w-7 h-7 md:w-8 md:h-8" />
               </div>

               <div className="space-y-2">
                 <h4 className="text-lg md:text-xl font-black text-on-surface">Xác nhận điều chuyển?</h4>
                 <p className="text-xs md:text-sm font-bold text-on-surface-variant leading-relaxed">
                   Nhân sự <span className="text-primary">{pendingCustomTransfer.name}</span> hiện đang bận quản lý tại <span className="font-black text-on-surface">{pendingCustomTransfer.fromDistrict} - {pendingCustomTransfer.fromWard}</span>.
                 </p>
               </div>

               <div className="bg-surface-container rounded-2xl p-4 md:p-5 border border-surface-container-highest border-dashed">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Mục tiêu chuyển đến</p>
                  <p className="text-xs md:text-sm font-bold text-on-surface">
                     {customDistrictForm.name || "Khu vực đang tạo"} - {customDistrictForm.wardName || "Phường mới"}
                  </p>
               </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
                <button
                  onClick={() => setPendingCustomTransfer(null)}
                  className="px-6 py-3 rounded-xl font-bold text-xs md:text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all active:scale-95"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    handleUpdateArea(null, pendingCustomTransfer.name); 
                    setCustomDistrictForm(prev => ({
                      ...prev,
                      wardCollectors: [...prev.wardCollectors, pendingCustomTransfer.name],
                      tempCollector: ''
                    }));
                    setPendingCustomTransfer(null);
                  }}
                  className="px-8 py-3 rounded-xl font-black bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    )}

      {/* Hệ thống Thông báo Tùy chỉnh */}
      <AlertModal 
        {...alertConfig}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}

// ===================================
// DISTRICT DETAIL COMPONENT
// ===================================
function DistrictDetailView({ area, allAreas, collectors, onBack, onUpdate, onRemove, showAlert }) {
  const [wardInput, setWardInput] = useState('');

  const isActive = area.monthlyCapacityKg > 0 || area.wards.length > 0;

  const handleUpdateCapacity = (val) => {
    onUpdate({ ...area, monthlyCapacityKg: val });
  };

  const handleAddWard = () => {
    const wName = wardInput.trim();
    if (!wName) {
      showAlert("Thiếu thông tin", "Vui lòng nhập tên phường trước khi thêm!", "info");
      return;
    }
    const exists = area.wards.find(w => (typeof w === 'string' ? w : w.name) === wName);
    if (exists) {
      showAlert("Phường đã tồn tại", `Phường "${wName}" đã tồn tại trong danh sách của quận này!`, "warning");
      return;
    }

    const newWard = {
      name: wName,
      collectors: [],
      collectedKg: 0,
      completedRequests: 0
    };
    onUpdate({ ...area, wards: [...area.wards, newWard] });
    setWardInput('');

    // Tự động nhảy đến trang cuối cùng để thấy Phường mới
    const newTotalCount = area.wards.length + 1;
    setCurrentPage(Math.ceil(newTotalCount / ITEMS_PER_PAGE));
  };

  const handleRemoveWard = (wardName) => {
    onUpdate({ ...area, wards: area.wards.filter(w => (typeof w === 'string' ? w : w.name) !== wardName) });
  };

  const [editingWardName, setEditingWardName] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', collectors: [], tempCollector: '' });
  const [showCollectorDropdown, setShowCollectorDropdown] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState(null); // { name, fromDistrict, fromWard }
  const [viewingWard, setViewingWard] = useState(null); // Detailed view state
  const [pendingDeleteWardName, setPendingDeleteWardName] = useState(null); // For deletion confirmation
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingWard, setIsAddingWard] = useState(false); // Mode thêm mới
  const ITEMS_PER_PAGE = 5;

  const cancelEdit = () => {
    setEditingWardName(null);
    setIsAddingWard(false);
  };

  const occupancy = useMemo(() => findCollectorAssignment(editForm.tempCollector, allAreas, area.district, editingWardName), [editForm.tempCollector, allAreas, area.district, editingWardName]);

  const topWard = useMemo(() => {
    const wards = area.wards || area.Wards;
    if (!wards || wards.length === 0) return null;
    return [...wards]
      .map(w => typeof w === 'string' ? { name: w, collectedKg: 0 } : w)
      .sort((a, b) => (b.collectedKg || b.CollectedKg || 0) - (a.collectedKg || a.CollectedKg || 0))[0];
  }, [area.wards, area.Wards]);

  const startEditWard = (ward) => {
    setIsAddingWard(false);
    setEditingWardName(ward.name || ward.Name);
    const wCollectors = ward.collectors || ward.Collectors || (ward.collectorName ? [ward.collectorName] : []);
    setEditForm({
      name: ward.name || ward.Name,
      collectors: Array.isArray(wCollectors) ? wCollectors : [],
      tempCollector: ''
    });
  };

  const startAddWard = () => {
    setIsAddingWard(true);
    setEditingWardName(null);
    setEditForm({ name: '', collectors: [], tempCollector: '' });
  };

  const saveEdit = () => {
    if (!editForm.name.trim()) return;

    if (isAddingWard) {
      // Logic THÊM MỚI
      const exists = area.wards.find(w => (typeof w === 'string' ? w : w.name) === editForm.name.trim());
      if (exists) {
        showAlert("Phường đã tồn tại", `Tên phường "${editForm.name.trim()}" đã có sẵn trong hệ thống!`, "warning");
        return;
      }

      const newWard = {
        name: editForm.name.trim(),
        collectors: editForm.collectors,
        collectedKg: 0,
        completedRequests: 0
      };

      onUpdate({ ...area, wards: [...area.wards, newWard] });
      setIsAddingWard(false);

      // Nhảy đến trang cuối
      const newCount = area.wards.length + 1;
      setCurrentPage(Math.ceil(newCount / ITEMS_PER_PAGE));
    } else {
      // Logic CHỈNH SỬA
      onUpdate({
        ...area,
        wards: area.wards.map(w => {
          const wName = typeof w === 'string' ? w : w.name;
          if (wName === editingWardName) {
            return {
              ...(typeof w === 'string' ? { name: wName, collectedKg: 0, completedRequests: 0 } : w),
              name: editForm.name.trim(),
              collectors: editForm.collectors
            };
          }
          return w;
        })
      });
      setEditingWardName(null);
    }
  };

  const handleClearAll = () => {
    showAlert(
      "Xác nhận huỷ",
      `Bạn có chắc chắn muốn huỷ toàn bộ dữ liệu của ${area.district}? Tất cả phường sẽ bị xoá khỏi quận này.`,
      "error",
      () => {
        onRemove(area.id);
        onBack();
      }
    );
  };

  return (
    <>
      <div className="w-full animate-in slide-in-from-right-8 duration-500 pb-20 px-2">

        <button
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-bold mb-6 md:mb-8 transition-colors group"
        >
          <div className="p-2 bg-surface-container group-hover:bg-primary/10 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <span className="text-sm md:text-base">Quay lại thư mục gốc</span>
        </button>

        <div className="bg-surface-container-lowest rounded-[2rem] md:rounded-[2.5rem] border border-surface-container-highest botanical-shadow overflow-hidden">

          {/* Banner/Header */}
          <div className="bg-gradient-to-br from-primary to-primary-container p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-[-50px] right-[-50px] w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 md:gap-5">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-md rounded-2xl border-2 border-white/30 flex items-center justify-center text-white shadow-xl shrink-0">
                  <Home className="w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-md">
                    {area.district}
                  </h1>
                  <p className="text-white/80 font-bold mt-1 tracking-widest uppercase text-[10px] md:text-sm">Trạm Quản Lý Vệ Tinh TP.HCM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Nhanh */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4 p-5 md:p-8 border-b border-surface-container-highest bg-surface/50">
            <div className="text-center p-2 rounded-2xl bg-surface-container/30 md:bg-transparent">
              <p className="text-[9px] md:text-xs font-bold text-on-surface-variant uppercase mb-1">Mức thu cao nhất</p>
              <p className="text-lg md:text-2xl font-black text-primary">
                {topWard ? `${(topWard.collectedKg || topWard.CollectedKg || 0) >= 1000 ? ((topWard.collectedKg || topWard.CollectedKg || 0)/1000).toFixed(1)+'k' : (topWard.collectedKg || topWard.CollectedKg || 0)} Kg` : "0 Kg"}
              </p>
              {topWard && (
                <p className="text-[8px] md:text-[10px] font-bold text-primary/70 uppercase tracking-tighter truncate mt-0.5 max-w-[100px] mx-auto">
                  ({topWard.name || topWard.Name})
                </p>
              )}
            </div>
            <div className="text-center p-2 rounded-2xl bg-surface-container/30 md:bg-transparent">
              <p className="text-[9px] md:text-xs font-bold text-on-surface-variant uppercase mb-1">Đã xử lý thực tế</p>
              <p className="text-lg md:text-2xl font-black text-secondary">
                {(area.processedThisMonthKg || area.ProcessedThisMonthKg || 0) >= 1000 ? ((area.processedThisMonthKg || area.ProcessedThisMonthKg || 0)/1000).toFixed(1)+'k' : (area.processedThisMonthKg || area.ProcessedThisMonthKg || 0)} Kg
              </p>
            </div>
            <div className="text-center p-2 rounded-2xl bg-surface-container/30 md:bg-transparent">
              <p className="text-[9px] md:text-xs font-bold text-on-surface-variant uppercase mb-1">Đơn hoàn thành</p>
              <p className="text-lg md:text-2xl font-black text-on-surface">{area.completedRequests || area.CompletedRequests || 0}</p>
            </div>
            <div className="text-center p-2 rounded-2xl bg-surface-container/30 md:bg-transparent">
              <p className="text-[9px] md:text-xs font-bold text-on-surface-variant uppercase mb-1">Phường trực thuộc</p>
              <p className="text-lg md:text-2xl font-black text-on-surface">{(area.wards || area.Wards || []).length}</p>
          </div>
        </div>

          {/* Công Cụ Quản Lý */}
          <div className="p-6 md:p-10 space-y-8 md:space-y-12">

            {/* Sửa Wards */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><MapPin className="w-5 h-5 md:w-6 md:h-6" /></div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-on-surface">Mạng Lưới Phường/Xã</h2>
                  <p className="text-xs md:text-sm font-medium text-on-surface-variant">Quản lý địa bàn và phân công nhân lực trực tiếp.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 w-full">
                <div className="flex flex-1 max-w-md gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4 group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm phường..."
                      className="w-full bg-surface-container-lowest border-2 border-surface-container-highest rounded-xl pl-10 pr-4 py-2.5 font-bold text-sm text-on-surface focus:outline-none focus:border-primary transition-all shadow-sm"
                      value={wardInput}
                      onChange={(e) => {
                        setWardInput(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={startAddWard}
                  className="flex items-center justify-center gap-2 bg-primary text-white border-2 border-primary hover:bg-primary/90 px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Phường
                </button>
              </div>

              <div className="bg-surface-container p-1 md:p-2 rounded-3xl min-h-[150px] border border-surface-container-highest">
                {area.wards.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40 py-12">
                    <MapPin className="w-12 h-12 mb-3" />
                    <p className="text-lg font-bold">Chưa có phường nào được thêm</p>
                  </div>
                ) : (() => {
                  const filteredWards = area.wards.filter(w => {
                    if (!wardInput.trim()) return true;
                    const wName = typeof w === 'string' ? w : w.name;
                    return wName.toLowerCase().includes(wardInput.toLowerCase().trim());
                  });

                  const totalPages = Math.ceil(filteredWards.length / ITEMS_PER_PAGE);
                  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
                  const paginatedWards = filteredWards.slice(startIndex, startIndex + ITEMS_PER_PAGE);

                  if (filteredWards.length === 0) {
                    return <div className="text-center py-10 text-on-surface-variant/60 italic text-sm">Không tìm thấy phường nào khớp định dạng.</div>;
                  }

                  return (
                    <div className="flex flex-col gap-3 p-2 md:p-4">
                      {/* Table Header (Desktop Only) */}
                      <div className="hidden md:grid grid-cols-12 items-center px-5 py-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest gap-4">
                        <div className="col-span-3">Tên Phường</div>
                        <div className="col-span-3">Người Phụ Trách</div>
                        <div className="col-span-2 text-center">Mức Thu</div>
                        <div className="col-span-2 text-center">Hoàn Thành</div>
                        <div className="col-span-2 text-center">Hành động</div>
                      </div>

                      {paginatedWards.map((w, idx) => { 
                        const wardObj = typeof w === 'string' ? { name: w, collectors: [], collectedKg: 0, completedRequests: 0 } : w;
                        const actualCollectors = wardObj.collectors || wardObj.Collectors || [];
                        return (
                          <div
                            key={`${wardObj.name}-${idx}`}
                            onClick={() => setViewingWard(wardObj)}
                            className="group relative flex flex-col md:grid md:grid-cols-12 md:items-center bg-surface-container-lowest border-2 border-surface-container-highest p-4 md:px-5 md:py-4 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all cursor-pointer gap-4 animate-in slide-in-from-right-4 duration-300"
                          >
                            <div className="col-span-3 flex items-center gap-3">
                              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                                <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-extrabold text-sm md:text-base text-on-surface truncate">{wardObj.name}</h4>
                                <p className="md:hidden text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5 opacity-60">Địa bàn trực tiếp</p>
                              </div>
                            </div>

                            <div className="col-span-3 space-y-1">
                              <div className="flex items-center justify-between md:justify-start gap-2">
                                <span className="md:hidden text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">Đội ngũ</span>
                                <div className="text-sm font-bold text-on-surface">
                                  {actualCollectors.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5 items-center justify-end md:justify-start">
                                      {actualCollectors.slice(0, 2).map(name => (
                                        <span key={name} className="text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full whitespace-nowrap">
                                          {name}
                                        </span>
                                      ))}
                                      {actualCollectors.length > 2 && (
                                        <span className="text-[10px] font-black text-on-surface-variant/40 bg-surface-container px-2 py-0.5 rounded-full">
                                           +{actualCollectors.length - 2}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-xs italic opacity-40">Chưa phân công</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Mobile Stats Rows */}
                            <div className="md:hidden flex flex-row gap-2">
                               <div className="flex-1 flex flex-col bg-primary/5 p-3 rounded-xl border border-primary/10">
                                  <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest mb-1">Mức thu (Kg)</span>
                                  <span className="text-sm font-black text-primary">
                                    {wardObj.collectedKg >= 1000 ? (wardObj.collectedKg/1000).toFixed(1)+'k' : wardObj.collectedKg.toLocaleString()}
                                  </span>
                               </div>
                               <div className="flex-1 flex flex-col bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                                  <span className="text-[9px] font-black text-secondary/50 uppercase tracking-widest mb-1">Hoàn tất</span>
                                  <span className="text-sm font-black text-secondary">{wardObj.completedRequests}</span>
                               </div>
                            </div>

                            {/* Desktop Stats (Grid Columns) */}
                            <div className="hidden md:block col-span-2 text-center">
                               <span className="text-sm md:text-base font-black text-primary">
                                  {wardObj.collectedKg >= 1000 ? (wardObj.collectedKg/1000).toFixed(1)+'k' : wardObj.collectedKg.toLocaleString()}
                               </span>
                            </div>

                            <div className="hidden md:block col-span-2 text-center">
                               <span className="text-sm md:text-base font-black text-secondary">{wardObj.completedRequests}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="absolute top-3 right-3 md:relative md:top-0 md:right-0 col-span-2 flex items-center justify-center gap-1 z-10">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEditWard(wardObj);
                                }}
                                className="text-on-surface-variant/40 hover:text-primary hover:bg-primary/10 p-2 md:p-1.5 rounded-lg transition-colors bg-surface-container md:bg-transparent shadow-sm md:shadow-none"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPendingDeleteWardName(wardObj.name);
                                }}
                                className="text-on-surface-variant/40 hover:text-error hover:bg-error/10 p-2 md:p-1.5 rounded-lg transition-colors bg-surface-container md:bg-transparent shadow-sm md:shadow-none"
                                title="Xoá"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        className="mt-6 md:mt-8 pb-4"
                      />
                    </div>
                  );
                })()}
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Modal Chỉnh Sửa / Thêm Mới Phường */}
      {(editingWardName || isAddingWard) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-surface-container-highest rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-surface-container-highest flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-bold text-xl text-on-surface flex items-center gap-2">
                {isAddingWard ? (
                  <>
                    <Plus className="w-5 h-5 text-primary" />
                    Thêm Phường Mới
                  </>
                ) : (
                  <>
                    <Edit className="w-5 h-5 text-primary" />
                    Sửa {editingWardName}
                  </>
                )}
              </h3>
              <button onClick={cancelEdit} className="text-on-surface-variant hover:text-error transition-colors p-2 bg-surface-container hover:bg-error/10 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tên Phường/Xã</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/50" />
                  <input
                    type="text"
                    className="w-full bg-surface-container-lowest border-2 border-surface-container-highest rounded-xl pl-11 pr-4 py-3 font-bold text-on-surface focus:outline-none focus:border-primary transition-colors shadow-sm"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Ví dụ: Phường Bến Nghé"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Đội Ngũ Phụ Trách ({editForm.collectors.length})</label>

                {/* Tags Hiển Thị Đội */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {editForm.collectors.length === 0 && (
                    <p className="text-xs italic text-on-surface-variant">Chưa có ai trong danh sách...</p>
                  )}
                  {editForm.collectors.map(name => (
                    <div key={name} className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl animate-in zoom-in-95">
                      <span className="text-sm font-bold">{name}</span>
                      <button
                        onClick={() => setEditForm({ ...editForm, collectors: editForm.collectors.filter(n => n !== name) })}
                        className="hover:bg-primary/20 p-0.5 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        className={`w-full bg-surface-container-lowest border-2 ${occupancy ? 'border-error/50 focus:border-error' : 'border-surface-container-highest focus:border-primary'} rounded-xl px-4 py-3 font-bold text-on-surface focus:outline-none transition-colors shadow-sm`}
                        value={editForm.tempCollector}
                        onChange={e => {
                          setEditForm({ ...editForm, tempCollector: e.target.value });
                          setShowCollectorDropdown(true);
                        }}
                        onFocus={() => setShowCollectorDropdown(true)}
                        placeholder="Tìm người để thêm..."
                      />

                      {showCollectorDropdown && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface-container-lowest border border-surface-container-highest rounded-xl shadow-xl overflow-hidden z-[110] max-h-48 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                          {collectors.filter(c => {
                            const cName = (c.fullName || c.FullName || c.displayName || c.DisplayName || c.email || c.Email || "").toLowerCase();
                            return cName.includes((editForm.tempCollector || '').toLowerCase());
                          }).length === 0 ? (
                            <div className="p-4 text-center text-xs text-on-surface-variant italic">Không tìm thấy nhân viên</div>
                          ) : (
                            collectors.filter(c => {
                              const cName = (c.fullName || c.FullName || c.displayName || c.DisplayName || c.email || c.Email || "").toLowerCase();
                              return cName.includes((editForm.tempCollector || '').toLowerCase());
                            }).map(c => {
                              const cName = (c.fullName || c.FullName || c.displayName || c.DisplayName || c.email || c.Email);
                              const isAlreadyInTeam = editForm.collectors.includes(cName);
                              return (
                                <div
                                  key={c.userId || c.userId || c.id || c.Id || cName}
                                  onClick={() => {
                                    if (!isAlreadyInTeam) {
                                      const assignment = findCollectorAssignment(cName, allAreas, area.district, editingWardName);
                                      if (assignment) {
                                        setPendingTransfer({
                                          name: cName,
                                          fromDistrict: assignment.district,
                                          fromWard: assignment.ward
                                        });
                                      } else {
                                        setEditForm({
                                          ...editForm,
                                          collectors: [...editForm.collectors, cName],
                                          tempCollector: ''
                                        });
                                      }
                                    }
                                    setShowCollectorDropdown(false);
                                  }}
                                  className={`p-4 border-b border-surface-container-highest last:border-none flex items-center justify-between group transition-all ${isAlreadyInTeam ? 'opacity-50 cursor-not-allowed bg-surface-container' : 'hover:bg-primary/5 cursor-pointer'}`}
                                >
                                  <div className="flex flex-col">
                                    <span className={`font-extrabold text-sm mb-1 transition-colors ${isAlreadyInTeam ? 'text-on-surface-variant' : 'text-primary group-hover:text-primary-dark'}`}>
                                      {cName} {isAlreadyInTeam && '(Đã chọn)'}
                                    </span>
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-bold text-on-surface-variant/70 tracking-tight">{c.phoneNumber || c.PhoneNumber || c.phone || "Chưa có SĐT"}</span>
                                      {(() => {
                                        const ownOccupancy = findCollectorAssignment(cName, allAreas, area.district, editingWardName);
                                        return ownOccupancy ? (
                                          <span className="text-[8px] font-black text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider animate-in fade-in">
                                            Đang bận tại {ownOccupancy.district} - {ownOccupancy.ward}
                                          </span>
                                        ) : null;
                                      })()}
                                    </div>
                                  </div>
                                  {!isAlreadyInTeam && (
                                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                      <Plus className="w-3.5 h-3.5 stroke-[3px]" />
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cảnh báo bận việc */}
                  {occupancy && (
                    <div className="mt-3 p-3 bg-error/5 border border-error/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                      <div className="w-2 h-2 rounded-full bg-error mt-1.5 animate-pulse shrink-0"></div>
                      <p className="text-xs font-bold text-error leading-tight">
                        Người này đang bận tại <span className="underline">{occupancy.district}</span> - <span className="italic">{occupancy.ward}</span>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-surface-container-highest bg-surface-container-lowest flex justify-end gap-3">
              <button onClick={cancelEdit} className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors">
                Huỷ
              </button>
              <button onClick={saveEdit} className="px-6 py-2.5 rounded-xl font-bold bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
                <Check className="w-4 h-4" />
                {isAddingWard ? 'Lưu Phường Mới' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Điều Chuyển (Light UI) */}
      {pendingTransfer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-surface-container-highest rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 p-8">
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                <h4 className="text-on-surface text-lg font-bold leading-relaxed">
                  Bạn có chắc muốn chuyển người này từ <span className="text-primary underline decoration-2 underline-offset-4">{pendingTransfer.fromDistrict} - {pendingTransfer.fromWard}</span> sang <span className="text-primary underline decoration-2 underline-offset-4">{area.district} - {editingWardName}</span> đây không?
                </h4>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={() => setPendingTransfer(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all active:scale-95"
                >
                  Huỷ
                </button>
                <button
                  onClick={() => {
                    // Cập nhật form tạm thời để hiển thị ngay trong danh sách tag
                    setEditForm(prev => ({
                      ...prev,
                      collectors: [...prev.collectors, pendingTransfer.name]
                    }));
                    
                    // Kích hoạt việc xóa collector khỏi các nơi khác trong global state
                    onUpdate(area, pendingTransfer.name);
                    setPendingTransfer(null);
                  }}
                  className="px-8 py-2.5 rounded-xl font-bold bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95"
                >
                  Xác nhận chuyển
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Phường */}
      {pendingDeleteWardName && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-error/20 rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-on-surface mb-2">Xác nhận xóa khu vực</h3>
            <p className="text-on-surface-variant mb-8 leading-relaxed">
              Bạn có chắc muốn xoá khu vực <span className="text-error font-bold">{pendingDeleteWardName}</span> này không? <br />
              <span className="text-xs italic">(Hành động này không thể hoàn tác)</span>
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPendingDeleteWardName(null)}
                className="flex-1 px-6 py-3 rounded-2xl font-bold text-on-surface-variant hover:bg-surface-container-highest transition-all active:scale-95"
              >
                Huỷ
              </button>
              <button
                onClick={() => {
                  handleRemoveWard(pendingDeleteWardName);
                  setPendingDeleteWardName(null);
                }}
                className="flex-1 px-6 py-3 rounded-2xl font-bold bg-error text-white shadow-lg shadow-error/20 hover:bg-error/90 transition-all active:scale-95"
              >
                Xác nhận xoá
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi Tiết Phường */}
      {viewingWard && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-surface border border-surface-container-highest rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-8 border-b border-surface-container-highest flex justify-between items-start bg-surface-container-lowest/50">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-1">
                  <MapPin className="w-3 h-3" />
                  {area.district}
                </div>
                <h3 className="text-3xl font-black text-on-surface tracking-tight">
                  {viewingWard.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingWard(null)}
                className="text-on-surface-variant hover:text-error transition-colors p-3 bg-surface-container hover:bg-error/10 rounded-2xl group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-primary/5 border border-primary/10 p-5 rounded-3xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-70">Tổng Mức Thu</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-primary">{viewingWard.collectedKg.toLocaleString()}</span>
                    <span className="text-xs font-bold text-primary/60">Kg</span>
                  </div>
                </div>
                <div className="bg-secondary/5 border border-secondary/10 p-5 rounded-3xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest opacity-70">Đơn Hoàn Thành</span>
                  <span className="text-2xl font-black text-secondary">{viewingWard.completedRequests}</span>
                </div>
                <div className="bg-on-surface/5 border border-on-surface/5 p-5 rounded-3xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-70">Nhân Sự</span>
                  <span className="text-2xl font-black text-on-surface">{viewingWard.collectors?.length || 0}</span>
                </div>
              </div>

              {/* Personnel Section */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                  Đội Ngũ Nhân Sự Phụ Trách
                  <div className="flex-1 h-[1px] bg-surface-container-highest"></div>
                </h4>

                <div className="space-y-2">
                  {(!viewingWard.collectors || viewingWard.collectors.length === 0) ? (
                    <div className="text-center py-8 bg-surface-container/30 rounded-2xl border-2 border-dashed border-surface-container-highest italic text-on-surface-variant/60 text-sm">
                      Chưa có nhân sự nào được gán cho khu vực này.
                    </div>
                  ) : (
                    viewingWard.collectors.map(name => {
                      const collectorDetails = collectors.find(c => 
                        (c.fullName || c.FullName || c.displayName || c.DisplayName || c.name || c.Name) === name
                      );
                      const displayPhone = collectorDetails?.phoneNumber || collectorDetails?.PhoneNumber || collectorDetails?.phone || 'Chưa có SĐT';
                      return (
                        <div key={name} className="flex items-center justify-between p-4 bg-surface-container-lowest border border-surface-container-highest rounded-2xl hover:border-primary/30 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{name}</span>
                              <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">{displayPhone}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-success/10 text-success text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></div>
                            Đang làm việc
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-surface-container-highest flex justify-end">
              <button
                onClick={() => setViewingWard(null)}
                className="px-8 py-3 rounded-2xl font-bold bg-primary text-white shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
