import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  Package,
  Star,
  User,
  History,
  Tags,
  X,
  Image as ImageIcon,
  Upload,
  Key,
  Info,
  Calendar,
  Layers,
  Hash
} from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import AlertModal from '../../components/ui/AlertModal';
import { getUser, getApiBaseUrl, resolveImageUrl } from '../../lib/auth';
import { 
  getVouchers, 
  getVoucherCategories, 
  createVoucher, 
  updateVoucher, 
  deleteVoucher, 
  createCategory,
  updateCategory,
  deleteCategory, 
  getRedemptionHistory 
} from '../../api/voucherApi';

// Assets path mock
const ASSET_PATH = '/src/assets/voucher/';

export default function VoucherManagement() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [vouchers, setVouchers] = useState([]);
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modals state
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'add', data: null });
  const [voucherModal, setVoucherModal] = useState({ open: false, mode: 'add', data: null });
  const [detailModal, setDetailModal] = useState({ open: false, type: 'voucher', data: null });
  
  // Unified Alert/Confirm State for AlertModal.jsx
  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    title: '', 
    message: '', 
    type: 'info', 
    onConfirm: null 
  });

  // Form States
  const [catName, setCatName] = useState('');
  const [voucherForm, setVoucherForm] = useState({
    title: '', points: 0, category: '', stock: 0, imageName: '', imagePreview: null, imageFile: null, codes: []
  });

  const fileInputRef = useRef(null);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [vData, cData, hData] = await Promise.all([
        getVouchers(),
        getVoucherCategories(),
        getRedemptionHistory()
      ]);
      setVouchers(vData || []);
      setCategories(cData || []);
      setHistory(hData || []);
    } catch (err) {
      showAlert("Lỗi", "Không thể tải dữ liệu từ máy chủ.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => { setCurrentPage(1); }, [activeTab, searchQuery]);

  // Alert Helpers
  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ isOpen: true, title, message, type, onConfirm: null });
  };

  const showConfirm = (title, message, onConfirm, type = 'warning') => {
    setAlertConfig({ isOpen: true, title, message, type, onConfirm });
  };

  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  const handleStockChange = (count) => {
    const val = parseInt(count) || 0;
    const newCodes = [...voucherForm.codes];
    if (val > newCodes.length) {
      for (let i = newCodes.length; i < val; i++) newCodes.push('');
    } else {
      newCodes.splice(val);
    }
    setVoucherForm({ ...voucherForm, stock: val, codes: newCodes });
  };

  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    
    // Check duplication
    const isDuplicate = vouchers.some(v => 
      v.title.toLowerCase().trim() === voucherForm.title.toLowerCase().trim() && 
      v.id !== voucherModal.data?.id
    );

    if (isDuplicate) {
      showAlert("Trùng tên Voucher", "Tên Voucher này đã tồn tại! Vui lòng chọn tên khác.", "error");
      return;
    }

    if (voucherForm.points <= 0) {
      showAlert("Giá trị không hợp lệ", "Điểm đổi Voucher phải lớn hơn 0.", "error");
      return;
    }

    if (voucherForm.stock <= 0) {
      showAlert("Số lượng không hợp lệ", "Số lượng mã Voucher nhập kho phải lớn hơn 0.", "error");
      return;
    }

    const formData = new FormData();
    formData.append('Title', voucherForm.title);
    formData.append('Points', voucherForm.points);
    formData.append('Category', voucherForm.category);
    formData.append('Stock', voucherForm.stock);
    
    if (voucherForm.imageFile) {
      formData.append('ImageFile', voucherForm.imageFile);
    } else if (voucherForm.imagePreview) {
      // If no new file but we have a preview (existing image from DB)
      formData.append('Image', voucherForm.imagePreview);
    }

    // Append codes
    voucherForm.codes.forEach(code => {
      formData.append('Codes', code);
    });

    try {
      if (voucherModal.mode === 'add') {
        await createVoucher(formData);
        showAlert("Thành công", "Đã thêm voucher mới!", "success");
      } else {
        await updateVoucher(voucherModal.data.id, formData);
        showAlert("Thành công", "Đã cập nhật voucher!", "success");
      }
      fetchData(); // Refresh data
      setVoucherModal({ open: false, mode: 'add', data: null });
    } catch (err) {
      showAlert("Lỗi", "Không thể lưu voucher: " + err.message, "error");
    }
};

  const paginateData = data => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };

  const filterVouchers = vouchers.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filterCategories = categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filterHistory = history.filter(h => h.user.toLowerCase().includes(searchQuery.toLowerCase()) || h.gift.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col mb-4 md:mb-6 px-2">
        <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">Quản lý Voucher</h1>
        <p className="text-sm md:text-base text-on-surface-variant font-bold mt-1 opacity-60">
          Hệ thống quản lý kho ưu đãi, phân loại quà tặng và theo dõi lịch sử đổi thưởng của người dùng.
        </p>
      </div>

      {/* AlertModal Integration */}
      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
      />

      {/* Header Area: Tabs & Actions */}
      <div className="bg-surface-container-lowest p-4 rounded-[1.5rem] md:rounded-[2rem] border border-surface-container-high/60 botanical-shadow flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Scrollable Tabs */}
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
          <div className="flex p-1 bg-surface-container-low rounded-xl w-fit min-w-max">
            {['inventory', 'categories', 'history'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)} 
                className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-black transition-all uppercase tracking-wider ${activeTab === tab ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
              >
                {tab === 'inventory' ? 'Kho Voucher' : tab === 'categories' ? 'Phân loại' : 'Lịch sử đổi'}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Add Actions */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
          <div className="relative group w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Tìm kiếm nhanh..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-10 pr-4 py-2.5 bg-surface-container-low border-none rounded-xl focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm w-full outline-none" 
            />
          </div>
          {activeTab !== 'history' && (
            <button 
              onClick={activeTab === 'inventory' ? () => {
                setVoucherForm({ title: '', points: 0, category: categories[0]?.name || '', stock: 0, imageName: '', imagePreview: null, imageFile: null, codes: [] });
                setVoucherModal({ open: true, mode: 'add', data: null });
              } : () => {
                setCatName('');
                setCategoryModal({ open: true, mode: 'add', data: null });
              }}
              className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-black text-sm hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/25 transition-all shadow-lg w-full md:w-auto"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              <span className="md:hidden lg:inline">{activeTab === 'inventory' ? 'Thêm Voucher' : 'Thêm phân loại'}</span>
              <span className="hidden md:inline lg:hidden">Thêm</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : activeTab === 'inventory' ? (
          <motion.div key="inventory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-surface-container-lowest border border-surface-container-high/60 rounded-[2rem] overflow-hidden botanical-shadow">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-surface-container-high/50 text-on-surface-variant/60 uppercase text-[10px] font-black tracking-widest">
                    <th className="px-8 py-5 text-center w-20">ID</th>
                    <th className="px-8 py-5">Voucher</th>
                    <th className="px-8 py-5">Phân loại</th>
                    <th className="px-8 py-5">Điểm đổi</th>
                    <th className="px-8 py-5">Tồn kho</th>
                    <th className="px-8 py-5 text-right w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30 font-bold">
                  {paginateData(filterVouchers).map((v) => (
                    <tr 
                      key={v.id} 
                      onClick={() => setDetailModal({ open: true, type: 'voucher', data: v })}
                      className="hover:bg-primary/[0.02] transition-colors cursor-pointer group"
                    >
                      <td className="px-8 py-4 text-center opacity-40 font-mono text-xs">#{v.id}</td>
                      <td className="px-8 py-4"><div className="flex items-center gap-3"><img src={resolveImageUrl(v.image)} className="w-10 h-10 rounded-lg object-cover shadow-sm bg-surface-container-low" alt="" onError={e => e.target.src = 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=400&auto=format&fit=crop'} /><span className="text-on-surface font-black group-hover:text-primary transition-colors">{v.title}</span></div></td>
                      <td className="px-8 py-4"><span className="px-2.5 py-1 bg-surface-container-high rounded-full text-[10px] text-on-surface-variant uppercase">{v.category}</span></td>
                      <td className="px-8 py-4 text-primary font-black"><div className="flex items-center gap-1.5"><Star className="w-4 h-4" fill="currentColor" />{v.points}</div></td>
                      <td className="px-8 py-4 text-on-surface-variant">{v.stock}</td>
                      <td className="px-8 py-4 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setVoucherForm({ ...v, imagePreview: v.image, codes: v.codes || [] }); setVoucherModal({ open: true, mode: 'edit', data: v }); }} className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => { showConfirm("Xác nhận xóa", `Bạn có chắc chắn muốn xóa Voucher "${v.title}" không?`, async () => {
                            try {
                              await deleteVoucher(v.id);
                              fetchData();
                              showAlert("Thành công", "Đã xóa voucher!", "success");
                            } catch (err) {
                              showAlert("Lỗi", "Không thể xóa voucher.", "error");
                            }
                          }); }} className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginateData(filterVouchers).map((v) => (
                <div 
                  key={v.id} 
                  onClick={() => setDetailModal({ open: true, type: 'voucher', data: v })}
                  className="bg-surface-container-lowest p-4 rounded-3xl border border-surface-container-high botanical-shadow relative group active:scale-[0.98] transition-all"
                >
                   <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm bg-surface-container-low">
                      <img src={resolveImageUrl(v.image)} className="w-full h-full object-cover" alt="" onError={e => e.target.src = 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=400&auto=format&fit=crop'} />
                      <div className="absolute top-2 right-2 px-3 py-1 bg-primary text-white text-xs font-black rounded-full shadow-lg flex items-center gap-1">
                        <Star className="w-3 h-3" fill="currentColor" /> {v.points}
                      </div>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-lg border border-white/20">
                        {v.category}
                      </div>
                   </div>
                   <div className="flex justify-between items-start mb-4 px-1">
                      <div>
                        <h3 className="text-on-surface font-black leading-tight group-hover:text-primary transition-colors line-clamp-1">{v.title}</h3>
                        <p className="text-[10px] font-bold text-on-surface-variant/50 uppercase flex items-center gap-1 mt-1">
                          <Package size={10} /> Tồn kho: <span className="text-on-surface-variant">{v.stock}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-mono opacity-30 mt-1">#{v.id}</span>
                   </div>
                   <div className="flex gap-2 pt-4 border-t border-surface-container-high/50" onClick={e => e.stopPropagation()}>
                      <button onClick={() => { 
                        setVoucherForm({ 
                          ...v, 
                          imagePreview: v.image, 
                          imageFile: null,
                          codes: v.codes || [] 
                        }); 
                        setVoucherModal({ open: true, mode: 'edit', data: v }); 
                      }} className="flex-1 py-2.5 rounded-xl bg-surface-container-low text-on-surface-variant font-black text-xs flex items-center justify-center gap-2 active:bg-primary/10 transition-colors border border-surface-container-high">
                        <Edit2 className="w-3.5 h-3.5" /> Sửa
                      </button>
                      <button onClick={() => { showConfirm("Xác nhận xóa", `Bạn có chắc chắn muốn xóa Voucher "${v.title}" không?`, async () => {
                        try {
                          await deleteVoucher(v.id);
                          fetchData();
                          showAlert("Thành công", "Đã xóa voucher!", "success");
                        } catch (err) {
                          showAlert("Lỗi", "Không thể xóa voucher.", "error");
                        }
                      }); }} className="flex-1 py-2.5 rounded-xl bg-error/5 text-error font-black text-xs flex items-center justify-center gap-2 active:bg-error/10 transition-colors border border-error/10">
                        <Trash2 className="w-3.5 h-3.5" /> Xóa
                      </button>
                   </div>
                </div>
              ))}
            </div>
            
            <Pagination currentPage={currentPage} totalPages={Math.ceil(filterVouchers.length / pageSize)} onPageChange={setCurrentPage} />
          </motion.div>
        ) : activeTab === 'categories' ? (
          <motion.div key="categories" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="hidden lg:block bg-surface-container-lowest border border-surface-container-high/60 rounded-[2rem] overflow-hidden botanical-shadow text-sm font-bold">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-surface-container-high/50 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">
                    <th className="px-8 py-5">Tên phân loại</th>
                    <th className="px-8 py-5 text-center">Số lượng Voucher</th>
                    <th className="px-8 py-5 text-right w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {paginateData(filterCategories).map(cat => (
                    <tr key={cat.id} className="hover:bg-primary/[0.02] transition-colors group">
                      <td className="px-8 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Tags className="w-4 h-4" />
                        </div>
                        <span className="text-on-surface font-black">{cat.name}</span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className="px-3 py-1 bg-surface-container-low rounded-lg text-on-surface-variant font-black border border-surface-container-high/50">
                          {cat.voucherCount} Voucher
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setCatName(cat.name); setCategoryModal({ open: true, mode: 'edit', data: cat }); }} className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); showConfirm("Xóa phân loại", `Xóa "${cat.name}" sẽ ảnh hưởng đến các voucher thuộc loại này. Tiếp tục?`, async () => {
                            try {
                              await deleteCategory(cat.id);
                              fetchData();
                              showAlert("Thành công", "Đã xóa phân loại!", "success");
                            } catch (err) {
                              showAlert("Lỗi", "Không thể xóa phân loại. Có thể vẫn còn voucher thuộc loại này.", "error");
                            }
                          }); }} className="p-2 text-error hover:bg-error/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
               {paginateData(filterCategories).map(cat => (
                 <div key={cat.id} className="bg-surface-container-lowest p-5 rounded-3xl border border-surface-container-high botanical-shadow flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                          <Tags className="w-6 h-6" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-on-surface">{cat.name}</h3>
                          <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{cat.voucherCount} Voucher</p>
                       </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-surface-container-high/50">
                       <button onClick={() => { setCatName(cat.name); setCategoryModal({ open: true, mode: 'edit', data: cat }); }} className="flex-1 py-3 rounded-xl bg-surface-container-low text-primary font-black text-xs flex items-center justify-center gap-2 border border-primary/20">
                          <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                       </button>
                       <button onClick={() => { showConfirm("Xóa phân loại", `Xóa "${cat.name}" sẽ ảnh hưởng đến các voucher thuộc loại này. Tiếp tục?`, async () => {
                          try {
                            await deleteCategory(cat.id);
                            fetchData();
                            showAlert("Thành công", "Đã xóa phân loại!", "success");
                          } catch (err) {
                            showAlert("Lỗi", "Không thể xóa phân loại.", "error");
                          }
                       }); }} className="flex-1 py-3 rounded-xl bg-error/5 text-error font-black text-xs flex items-center justify-center gap-2 border border-error/20">
                          <Trash2 className="w-3.5 h-3.5" /> Xóa
                       </button>
                    </div>
                 </div>
               ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={Math.ceil(filterCategories.length / pageSize)} onPageChange={setCurrentPage} />
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="hidden lg:block bg-surface-container-lowest border border-surface-container-high/60 rounded-[2rem] overflow-hidden botanical-shadow text-sm font-bold">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low/30 border-b border-surface-container-high/50 text-[10px] uppercase font-black tracking-widest text-on-surface-variant/60">
                    <th className="px-8 py-5">Người đổi</th>
                    <th className="px-8 py-5">Voucher</th>
                    <th className="px-8 py-5 text-center">Điểm tiêu hao</th>
                    <th className="px-8 py-5 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/30">
                  {paginateData(filterHistory).map(item => (
                    <tr 
                      key={item.id} 
                      onClick={() => setDetailModal({ open: true, type: 'history', data: item })}
                      className="hover:bg-primary/[0.02] cursor-pointer group"
                    >
                      <td className="px-8 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                          {item.user[0]}
                        </div>
                        <span className="text-on-surface">{item.user}</span>
                      </td>
                      <td className="px-8 py-4 text-on-surface-variant">{item.gift}</td>
                      <td className="px-8 py-4 text-center text-primary font-black">
                        <div className="flex items-center justify-center gap-1">
                          <Star fill="currentColor" size={12} />
                          {item.points}
                        </div>
                      </td>
                      <td className="px-8 py-4 text-right">
                         <span className="px-3 py-1 bg-success/10 border border-success/20 text-success rounded-md text-[10px] font-black uppercase tracking-wider">
                           Đã cấp
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
               {paginateData(filterHistory).map(item => (
                  <div key={item.id} onClick={() => setDetailModal({ open: true, type: 'history', data: item })} className="bg-white p-5 rounded-3xl border border-surface-container-high shadow-sm flex flex-col gap-4 active:scale-95 transition-all">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                              {item.user[0]}
                           </div>
                           <div>
                              <h3 className="text-sm font-black text-on-surface">{item.user}</h3>
                              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-wider">{item.date}</p>
                           </div>
                        </div>
                        <span className="px-2 py-0.5 bg-success/10 text-success text-[8px] font-black uppercase rounded border border-success/20">Đã cấp</span>
                     </div>
                     <div className="p-4 bg-surface-container-low/50 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                           <span className="text-[9px] font-black uppercase text-on-surface-variant/40 tracking-widest">Sản phẩm</span>
                           <span className="text-xs font-black text-on-surface line-clamp-1">{item.gift}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-[9px] font-black uppercase text-on-surface-variant/40 tracking-widest">Điểm tiêu hao</span>
                           <span className="text-sm font-black text-primary flex items-center gap-1"><Star size={12} fill="currentColor" /> {item.points}</span>
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            <Pagination currentPage={currentPage} totalPages={Math.ceil(filterHistory.length / pageSize)} onPageChange={setCurrentPage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal — portal: sidebar (z-50) stacks above main; fixed inside main stays under it */}
      {createPortal(
      <AnimatePresence>
        {detailModal.open && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-on-surface/50 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }} 
              className="bg-surface-container-lowest w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 botanical-shadow-lg border border-surface-container-high max-h-[95vh] overflow-y-auto no-scrollbar my-auto"
            >
              <div className="flex justify-between items-center mb-6 md:mb-10 pb-4 md:pb-6 border-b border-surface-container-high/50">
                <h2 className="text-xl md:text-3xl font-black text-on-surface flex items-center gap-3 md:gap-4">
                  {detailModal.type === 'voucher' ? <Info className="text-primary w-5 h-5 md:w-8 md:h-8" /> : <History className="text-primary w-5 h-5 md:w-8 md:h-8" />}
                  <span className="truncate">Chi tiết {detailModal.type === 'voucher' ? 'Voucher' : 'Lịch sử'}</span>
                </h2>
                <button onClick={() => setDetailModal({ ...detailModal, open: false })} className="p-2 md:p-3 hover:bg-surface-container-high rounded-full transition-colors"><X className="w-6 h-6 md:w-8 md:h-8" /></button>
              </div>

              {detailModal.type === 'voucher' ? (
                <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                  {/* Left Column */}
                  <div className="lg:w-2/5 space-y-6 md:space-y-8">
                    <div className="relative group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-white shadow-2xl aspect-video">
                      <img 
                        src={resolveImageUrl(detailModal.data.image)}
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=800&auto=format&fit=crop'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 md:p-6">
                         <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg leading-tight">{detailModal.data.title}</h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                      <div className="p-4 md:p-5 bg-primary/[0.03] rounded-2xl md:rounded-3xl border border-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
                        <p className="text-[9px] md:text-[10px] font-black uppercase text-primary/60 tracking-widest whitespace-nowrap">Điểm đổi</p>
                        <p className="text-lg md:text-2xl font-black text-primary flex items-center gap-1.5"><Star fill="currentColor" className="w-4 h-4 md:w-5 md:h-5" />{detailModal.data.points}</p>
                      </div>
                      <div className="p-4 md:p-5 bg-surface-container-low rounded-2xl md:rounded-3xl border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-1">
                        <p className="text-[9px] md:text-[10px] font-black uppercase text-on-surface-variant/60 tracking-widest whitespace-nowrap">Số lượng tồn</p>
                        <p className="text-lg md:text-2xl font-black text-on-surface flex items-center gap-1.5"><Layers className="opacity-40 w-4 h-4 md:w-5 md:h-5" />{detailModal.data.stock}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="lg:w-3/5 space-y-4 flex flex-col">
                    <div className="flex items-center gap-2 text-on-surface-variant/70 px-1">
                        <Key className="w-4 h-4" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Danh sách mã sẵn có ({detailModal.data.stock})</span>
                    </div>
                    <div className="flex-1 p-4 md:p-6 bg-surface-container-low/40 rounded-[1.5rem] md:rounded-[2.5rem] border border-surface-container-high/40 overflow-y-auto max-h-[300px] md:max-h-[400px] no-scrollbar shadow-inner">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:grid-cols-2 md:gap-3">
                        {detailModal.data.codes?.map((code, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 bg-white rounded-2xl shadow-sm border border-surface-container-high/40 font-mono text-xs font-black text-primary hover:border-primary/30 transition-colors group/code">
                            <span className="opacity-20 text-[10px] font-black text-on-surface tracking-tighter group-hover/code:opacity-40 transition-opacity">#{idx+1}</span>
                            {code}
                            <Hash className="w-3 h-3 opacity-10" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  {/* Compact Header */}
                  <div className="flex items-center gap-4 p-5 bg-primary/[0.03] rounded-[2rem] border border-primary/10">
                    <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-black shadow-lg">
                      {detailModal.data.user[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-on-surface">{detailModal.data.user}</h3>
                      <p className="text-[10px] font-bold text-on-surface-variant/50 flex items-center gap-1 uppercase tracking-wider">
                        <Calendar size={12} /> {detailModal.data.date}
                      </p>
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-container-low rounded-[1.5rem] border border-surface-container-high">
                      <p className="text-[9px] font-black uppercase text-on-surface-variant/40 mb-2 tracking-widest">Sản phẩm</p>
                      <p className="text-sm font-black text-on-surface leading-tight">{detailModal.data.gift}</p>
                    </div>
                    <div className="p-4 bg-surface-container-low rounded-[1.5rem] border border-surface-container-high">
                       <p className="text-[9px] font-black uppercase text-on-surface-variant/40 mb-2 tracking-widest">Điểm đổi</p>
                       <p className="text-xl font-black text-primary flex items-center gap-2">
                        <Star fill="currentColor" size={16} /> {detailModal.data.points}
                       </p>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="p-6 bg-surface-container-lowest rounded-[2rem] border border-surface-container-high/60 space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs font-bold pb-2 border-b border-surface-container-high/30">
                      <span className="text-on-surface-variant/60">Mã Voucher:</span>
                      <span className="font-mono text-primary font-black bg-primary/5 px-3 py-1 rounded-lg border border-primary/10 tracking-tighter">
                        {detailModal.data.codeUsed}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                       <span className="text-on-surface-variant/40 uppercase tracking-widest">ID Giao dịch:</span>
                       <span className="font-mono text-on-surface opacity-60">{detailModal.data.transactionId}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Voucher Add/Edit Modal */}
      {createPortal(
      <AnimatePresence>
        {voucherModal.open && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-on-surface/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 12 }}
              className="bg-surface-container-lowest w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 botanical-shadow-lg max-h-[min(95vh,100%)] overflow-y-auto no-scrollbar border border-surface-container-high my-auto"
            >
              <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-surface-container-lowest z-10 py-1 md:py-2 border-b border-surface-container-high/50">
                <h2 className="text-xl md:text-3xl font-black text-on-surface flex items-center gap-3 md:gap-4">
                  <Ticket className="text-primary w-6 h-6 md:w-8 md:h-8" /> 
                  <span>{voucherModal.mode === 'add' ? 'Thêm Voucher mới' : 'Cập nhật Voucher'}</span>
                </h2>
                <button onClick={() => setVoucherModal({ ...voucherModal, open: false })} className="p-2 md:p-3 hover:bg-surface-container-high rounded-full transition-colors"><X className="w-6 h-6 md:w-8 md:h-8" /></button>
              </div>

              <form onSubmit={handleSaveVoucher} className="space-y-6 md:space-y-8">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                  {/* Left Column: Visuals */}
                  <div className="lg:w-2/5 space-y-4 md:space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-on-surface-variant/40 ml-2 tracking-widest opacity-70">Tên hiển thị Voucher</label>
                       <input 
                        required 
                        value={voucherForm.title} 
                        onChange={e => setVoucherForm({...voucherForm, title: e.target.value})} 
                        placeholder="Nhập tên Voucher..."
                        className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-surface-container-low border border-surface-container-high font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm" 
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-on-surface-variant/40 ml-2 tracking-widest opacity-70">Hình ảnh Voucher</label>
                       <div onClick={() => fileInputRef.current?.click()} className="group relative cursor-pointer aspect-video bg-primary/[0.02] rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 overflow-hidden transition-all hover:bg-primary/[0.04]">
                         <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={(e) => { 
                           const f = e.target.files[0]; 
                           if(f) {
                             setVoucherForm({
                               ...voucherForm, 
                               imageName: f.name, 
                               imageFile: f,
                               imagePreview: URL.createObjectURL(f)
                             }); 
                           }
                         }} />
                         {voucherForm.imagePreview ? (
                           <img src={resolveImageUrl(voucherForm.imagePreview)} className="absolute inset-0 w-full h-full object-cover" alt="" />
                         ) : (
                           <>
                            <div className="p-3 md:p-4 bg-primary/10 rounded-2xl text-primary transform group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            <p className="text-[8px] md:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-tighter text-center px-4 leading-tight">Gợi ý tỉ lệ 16:9<br/>(Dạng ngang)</p>
                           </>
                         )}
                         <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-black tracking-widest backdrop-blur-sm transition-opacity">THAY ĐỔI ẢNH</div>
                       </div>
                    </div>
                  </div>

                  {/* Right Column: Details & Inventory */}
                  <div className="lg:w-3/5 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant/40 ml-2 tracking-widest opacity-70">Phân loại</label>
                        <select value={voucherForm.category} onChange={e => setVoucherForm({...voucherForm, category: e.target.value})} className="w-full px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-surface-container-low border border-surface-container-high font-bold outline-none appearance-none">
                          {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant/40 ml-2 tracking-widest opacity-70">Điểm đổi</label>
                        <div className="relative">
                          <Star className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-primary" fill="currentColor" />
                          <input type="number" min="1" required value={voucherForm.points} onChange={e => setVoucherForm({...voucherForm, points: parseInt(e.target.value) || 0})} className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-surface-container-low border-primary/20 font-black text-primary text-lg md:text-xl outline-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-on-surface-variant/40 ml-2 tracking-widest opacity-70">Số lượng nhập kho (Mã code)</label>
                       <div className="relative">
                         <Layers className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-on-surface-variant/40" />
                         <input type="number" min="1" required value={voucherForm.stock} onChange={e => handleStockChange(e.target.value)} className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl bg-surface-container-low border border-surface-container-high font-black text-lg md:text-xl outline-none" />
                       </div>
                    </div>

                    {voucherForm.stock > 0 && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-on-surface-variant/40 ml-2 tracking-widest flex items-center gap-2 opacity-70">
                          <Key size={12} /> Danh sách mã ({voucherForm.stock})
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:grid-cols-2 md:gap-3 p-4 md:p-6 bg-surface-container-low/40 rounded-[1.5rem] md:rounded-[2rem] border border-surface-container-high/40 max-h-40 md:max-h-56 overflow-y-auto no-scrollbar shadow-inner">
                          {voucherForm.codes.map((code, idx) => (
                            <div key={idx} className="relative group/idx">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-on-surface-variant/20 whitespace-nowrap overflow-hidden w-6">#{idx+1}</span>
                              <input 
                                required 
                                value={code} 
                                onChange={(e) => { const nc = [...voucherForm.codes]; nc[idx] = e.target.value; setVoucherForm({...voucherForm, codes: nc}); }} 
                                placeholder="Gắn mã code..." 
                                className="w-full pl-9 pr-3 py-2 rounded-lg md:rounded-xl bg-white border border-surface-container-high font-black text-[10px] md:text-xs text-primary focus:border-primary/40 outline-none transition-all" 
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-6 pt-4 md:pt-6 border-t border-surface-container-high/50 sticky bottom-0 bg-surface-container-lowest">
                  <button type="button" onClick={() => setVoucherModal({ ...voucherModal, open: false })} className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black bg-surface-container-low hover:bg-surface-container-high transition-all order-2 sm:order-1">Hủy bỏ</button>
                  <button type="submit" className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all order-1 sm:order-2">Lưu thay đổi</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}

      {/* Category Modal */}
      {createPortal(
      <AnimatePresence>
        {categoryModal.open && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-on-surface/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-surface-container-lowest w-full max-w-2xl rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-surface-container-high botanical-shadow-lg my-auto"
            >
              <div className="flex items-center justify-between mb-6 md:mb-10 pb-4 md:pb-6 border-b border-surface-container-high/50">
                <h2 className="text-xl md:text-3xl font-black text-on-surface flex items-center gap-3 md:gap-4">
                  <Tags className="text-primary w-6 h-6 md:w-8 md:h-8" /> 
                  <span>{categoryModal.mode === 'add' ? 'Thêm phân loại' : 'Sửa phân loại'}</span>
                </h2>
                <button onClick={() => setCategoryModal({ ...categoryModal, open: false })} className="p-2 md:p-3 hover:bg-surface-container-high rounded-full transition-colors"><X className="w-6 h-6 md:w-8 md:h-8" /></button>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault(); 
                const isDuplicate = categories.some(c => 
                  c.name.toLowerCase().trim() === catName.toLowerCase().trim() && 
                  c.id !== categoryModal.data?.id
                );
                if (isDuplicate) {
                  showAlert("Trùng phân loại", "Tên phân loại này đã tồn tại!", "error");
                  return;
                }

                try {
                  if(categoryModal.mode === 'add') {
                    await createCategory({ name: catName });
                    showAlert("Thành công", "Đã thêm phân loại mới!", "success");
                  } else {
                    await updateCategory(categoryModal.data.id, { name: catName });
                    showAlert("Thành công", "Đã cập nhật phân loại!", "success");
                  }
                  fetchData();
                  setCategoryModal({open: false}); 
                } catch (err) {
                  showAlert("Lỗi", "Không thể lưu phân loại.", "error");
                }
              }} className="space-y-6 md:space-y-8">
                <div className="space-y-3 md:space-y-4">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant/40 ml-2 md:ml-4 tracking-widest opacity-70">Tên phân loại hàng hóa / dịch vụ</label>
                  <div className="relative group">
                    <Tags className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      required 
                      autoFocus
                      value={catName} 
                      onChange={e => setCatName(e.target.value)} 
                      placeholder="Nhập tên phân loại mới..." 
                      className="w-full pl-12 md:pl-16 pr-6 md:pr-8 py-4 md:py-6 rounded-xl md:rounded-[2rem] bg-surface-container-low border border-surface-container-high font-black text-lg md:text-xl outline-none focus:ring-8 focus:ring-primary/5 transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-6 pt-4 md:pt-6">
                  <button type="button" onClick={() => setCategoryModal({ ...categoryModal, open: false })} className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black bg-surface-container-low hover:bg-surface-container-high transition-all order-2 sm:order-1">Hủy bỏ</button>
                  <button type="submit" className="flex-1 py-4 md:py-5 rounded-xl md:rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/30 active:scale-95 transition-all order-1 sm:order-2">Lưu thay đổi</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </div>
  );
}
