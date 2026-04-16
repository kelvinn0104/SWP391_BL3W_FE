import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  User,
} from 'lucide-react';

export const FEEDBACK_ITEMS = [
  {
    id: 'FB-2026-001',
    sender: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    subject: 'Không nhận được điểm sau khi hoàn thành thu gom',
    message:
      'Tôi đã xác nhận đơn REQ-121 thành công từ hôm qua nhưng điểm vẫn chưa cộng vào tài khoản. Nhờ admin kiểm tra lại giúp.',
    status: 'open',
    priority: 'high',
    createdAt: '2026-04-16 08:20',
  },
  {
    id: 'FB-2026-002',
    sender: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    subject: 'Không mở được mã voucher sau khi đổi',
    message:
      'Tôi đổi voucher Highland nhưng khi vào lịch sử quà tặng thì mã hiển thị trắng. Mong được hỗ trợ sớm.',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2026-04-15 19:02',
  },
  {
    id: 'FB-2026-003',
    sender: 'Lê Văn C',
    email: 'levanc@gmail.com',
    subject: 'Địa chỉ thu gom bị sai vị trí',
    message:
      'Tôi chọn đúng địa chỉ nhưng khi lên bản đồ ở report detail thì lệch sang khu vực khác khoảng 2km.',
    status: 'resolved',
    priority: 'low',
    createdAt: '2026-04-14 14:35',
  },
  {
    id: 'FB-2026-004',
    sender: 'Phạm Minh D',
    email: 'phamminhd@gmail.com',
    subject: 'Không đăng nhập được sau khi reset mật khẩu',
    message:
      'Sau khi reset thành công, app vẫn báo sai mật khẩu ở lần đăng nhập tiếp theo. Tôi đã thử nhiều lần.',
    status: 'open',
    priority: 'high',
    createdAt: '2026-04-14 09:11',
  },
];

const STATUS_TABS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'open', label: 'Chờ xử lý' },
  { id: 'in_progress', label: 'Đang xử lý' },
  { id: 'resolved', label: 'Đã giải quyết' },
];

function statusBadge(status) {
  if (status === 'open') return 'bg-rose-100 text-rose-700';
  if (status === 'in_progress') return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
}

function statusText(status) {
  if (status === 'open') return 'Chờ xử lý';
  if (status === 'in_progress') return 'Đang xử lý';
  return 'Đã giải quyết';
}

function priorityBadge(priority) {
  if (priority === 'high') return 'bg-red-50 text-red-700 border-red-200';
  if (priority === 'medium') return 'bg-orange-50 text-orange-700 border-orange-200';
  return 'bg-blue-50 text-blue-700 border-blue-200';
}

function priorityText(priority) {
  if (priority === 'high') return 'Khẩn cấp';
  if (priority === 'medium') return 'Trung bình';
  return 'Thấp';
}

export default function AdminFeedback() {
  const [activeStatus, setActiveStatus] = useState('all');
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FEEDBACK_ITEMS.filter((item) => {
      const matchStatus = activeStatus === 'all' || item.status === activeStatus;
      const matchQuery =
        !q ||
        item.subject.toLowerCase().includes(q) ||
        item.sender.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [activeStatus, query]);

  const openCount = FEEDBACK_ITEMS.filter((x) => x.status === 'open').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-3">
        <h1 className="text-3xl font-serif italic text-on-surface">
          Quản lý <span className="not-italic text-primary font-black">Feedback</span>
        </h1>
        <p className="text-on-surface-variant font-medium">
          Theo dõi và xử lý danh sách khiếu nại người dùng gửi về hệ thống.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <article className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-5">
          <p className="text-xs uppercase tracking-widest font-black text-on-surface-variant">Tổng phản hồi</p>
          <p className="mt-2 text-3xl font-extrabold text-on-surface">{FEEDBACK_ITEMS.length}</p>
        </article>
        <article className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-5">
          <p className="text-xs uppercase tracking-widest font-black text-on-surface-variant">Chờ xử lý</p>
          <p className="mt-2 text-3xl font-extrabold text-rose-600">{openCount}</p>
        </article>
        <article className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-5">
          <p className="text-xs uppercase tracking-widest font-black text-on-surface-variant">Đã giải quyết</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">
            {FEEDBACK_ITEMS.filter((x) => x.status === 'resolved').length}
          </p>
        </article>
      </section>

      <section className="bg-surface-container-lowest rounded-2xl border border-surface-container-highest p-5 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatus(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                  activeStatus === tab.id
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                    : 'bg-surface text-on-surface-variant border-surface-container-high hover:text-primary hover:border-primary/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo mã, tên, tiêu đề..."
              className="w-full rounded-xl border border-surface-container-high bg-surface pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-on-surface-variant font-semibold">
              Không có khiếu nại phù hợp bộ lọc.
            </div>
          ) : (
            filteredItems.map((item) => (
              <Link
                key={item.id}
                to={`/admin/feedback/${encodeURIComponent(item.id)}`}
                className="block rounded-2xl border border-surface-container-high bg-surface p-5 space-y-3 hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-primary">{item.id}</p>
                    <h3 className="text-lg font-bold text-on-surface">{item.subject}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{item.message}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge(item.status)}`}>
                      {statusText(item.status)}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${priorityBadge(item.priority)}`}>
                      {priorityText(item.priority)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                  <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="w-4 h-4 text-primary" />
                      {item.sender} - {item.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="w-4 h-4 text-primary" />
                      {item.createdAt}
                    </span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {item.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Đã hoàn tất
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <AlertTriangle className="w-4 h-4" />
                        Cần theo dõi
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
