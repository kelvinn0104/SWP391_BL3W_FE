import {useEffect, useId, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Hash,
  ImagePlus,
  Loader2,
  MapPin,
  Package,
  PlusCircle,
  Tag,
  Type,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Nhựa & kim loại',
  'Giấy',
  'Nhựa',
  'Hỗn hợp tái chế',
  'Kim loại',
];

export default function CreateReport() {
  const navigate = useNavigate();
  const formId = useId();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [address, setAddress] = useState('');
  const [quantityKg, setQuantityKg] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  function onImageChange(e) {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      navigate('/report');
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = Boolean(title.trim()) && !submitting;

  return (
    <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-8">
      <Link
        to="/report"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </Link>

      <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-primary font-extrabold">
            <PlusCircle className="w-5 h-5" />
            <span>Tạo báo cáo mới</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif italic text-on-surface">
            Báo cáo <span className="not-italic text-primary">rác thải tái chế</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Điền tiêu đề, ảnh minh họa, thể loại, địa chỉ, số lượng (khối lượng ước tính) và mô tả để gửi
            yêu cầu thu gom.
          </p>
        </div>

        <form id={formId} onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor={`${formId}-title`}
              className="flex items-center gap-2 text-sm font-bold text-on-surface"
            >
              <Type className="w-4 h-4 text-primary" />
              Tiêu đề <span className="text-error">*</span>
            </label>
            <input
              id={`${formId}-title`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="VD: Nhựa và lon tại hẻm 12"
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <ImagePlus className="w-4 h-4 text-primary" />
              Ảnh minh họa
            </p>
            <label
              htmlFor={`${formId}-images`}
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-surface-container-high bg-surface-container-low/40 px-4 py-8 text-center cursor-pointer hover:border-primary/40 hover:bg-surface-container-low/70 transition-colors"
            >
              <span className="text-sm font-semibold text-on-surface">Chọn ảnh (có thể nhiều file)</span>
              <span className="text-xs text-on-surface-variant">PNG, JPG — tối đa theo trình duyệt</span>
              <input
                id={`${formId}-images`}
                type="file"
                accept="image/*"
                multiple
                onChange={onImageChange}
                className="sr-only"
              />
            </label>
            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-1">
                {imagePreviews.map((src) => (
                  <div
                    key={src}
                    className="h-24 w-24 overflow-hidden rounded-xl border border-surface-container-high bg-surface-container-low"
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-category`}
              className="flex items-center gap-2 text-sm font-bold text-on-surface"
            >
              <Tag className="w-4 h-4 text-primary" />
              Thể loại
            </label>
            <select
              id={`${formId}-category`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-address`}
              className="flex items-center gap-2 text-sm font-bold text-on-surface"
            >
              <MapPin className="w-4 h-4 text-primary" />
              Địa chỉ
            </label>
            <input
              id={`${formId}-address`}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Quận 3, TP.HCM — gần địa danh / hẻm"
              className="w-full rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-qty`}
              className="flex items-center gap-2 text-sm font-bold text-on-surface"
            >
              <Hash className="w-4 h-4 text-primary" />
              Số lượng (kg ước tính)
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <input
                id={`${formId}-qty`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={quantityKg}
                onChange={(e) => setQuantityKg(e.target.value)}
                placeholder="VD: 3.2"
                className="w-full sm:max-w-xs rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
              />
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant">
                <Package className="w-4 h-4 text-primary" />
                đơn vị: kg
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`${formId}-desc`}
              className="flex items-center gap-2 text-sm font-bold text-on-surface"
            >
              <FileText className="w-4 h-4 text-primary" />
              Mô tả
            </label>
            <textarea
              id={`${formId}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Mô tả ngắn vị trí đặt rác, loại vật liệu, lưu ý an toàn…"
              className="w-full resize-y min-h-[120px] rounded-2xl border border-surface-container-high bg-surface px-4 py-3 text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary transition-shadow"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Link
              to="/report"
              className="inline-flex items-center justify-center rounded-2xl border border-surface-container-high px-5 py-3 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={!canSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-container disabled:opacity-50 disabled:pointer-events-none text-white px-6 py-3 text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.99]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi…
                </>
              ) : (
                'Gửi báo cáo'
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
