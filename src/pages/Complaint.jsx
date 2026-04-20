import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, FileText, Loader2, ExternalLink, Paperclip } from 'lucide-react';
import { getMyComplaints } from '../api/complaintApi';
import { getApiBaseUrl } from '../lib/auth';

const ITEMS_PER_PAGE = 6;

function resolveFileUrl(path) {
  const s = String(path ?? '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s) || s.startsWith('//')) return s;
  const base = getApiBaseUrl().replace(/\/$/, '');
  return s.startsWith('/') ? `${base}${s}` : `${base}/${s}`;
}

function complaintStatusLabel(status) {
  const s = String(status ?? '').trim();
  switch (s) {
    case 'Submitted':
      return 'Đã gửi';
    case 'InReview':
      return 'Đang xử lý';
    case 'Resolved':
      return 'Đã xử lý';
    case 'Rejected':
      return 'Từ chối';
    default:
      return s || '—';
  }
}

function complaintStatusClass(status) {
  const s = String(status ?? '').trim();
  switch (s) {
    case 'Submitted':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'InReview':
      return 'bg-violet-50 text-violet-800 border-violet-200';
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'Rejected':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-surface-container-low text-on-surface-variant border-surface-container-high';
  }
}

function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(d);
}

export default function Complaint() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await getMyComplaints();
        if (!isMounted) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!isMounted) return;
        setItems([]);
        setError(e instanceof Error ? e.message : 'Không thể tải danh sách khiếu nại.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredSorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const ta = new Date(a?.createdAtUtc ?? 0).getTime();
      const tb = new Date(b?.createdAtUtc ?? 0).getTime();
      return tb - ta;
    });
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / ITEMS_PER_PAGE));
  const paginated = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSorted, page]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-8">
      <Link
        to="/report"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại báo cáo
      </Link>

      <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-rose-700 font-extrabold">
            <AlertTriangle className="w-5 h-5" />
            <span>Khiếu nại của tôi</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans italic text-on-surface">
            Đơn <span className="not-italic text-primary">đã gửi</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Theo dõi trạng thái các khiếu nại bạn đã gửi về báo cáo thu gom. Bạn có thể mở báo cáo gốc để xem ngữ cảnh.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-surface-container-high/60 bg-surface p-6 text-sm text-on-surface-variant inline-flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Đang tải danh sách khiếu nại…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200/70 bg-red-50/80 p-5 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : filteredSorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface-container-high p-10 text-center space-y-3">
            <p className="text-on-surface-variant font-semibold">Bạn chưa có khiếu nại nào.</p>
            <p className="text-sm text-on-surface-variant/80">
              Khiếu nại có thể gửi từ trang chi tiết báo cáo sau khi đơn được thu gom hoặc hủy.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              Đi tới báo cáo của tôi
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginated.map((c) => {
                const id = c?.id;
                const wasteReportId = c?.wasteReportId;
                const title = c?.reportTitle?.trim() || `Báo cáo #${wasteReportId ?? '—'}`;
                const evidenceList = Array.isArray(c?.evidenceFiles) ? c.evidenceFiles : [];
                return (
                  <article
                    key={String(id)}
                    className="rounded-2xl border border-surface-container-high/80 bg-surface p-5 sm:p-6 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-primary">
                          Khiếu nại #{id}
                        </p>
                        <h2 className="text-lg font-extrabold text-on-surface flex flex-wrap items-center gap-2">
                          <FileText className="w-5 h-5 shrink-0 text-primary" />
                          <span className="break-words">{title}</span>
                        </h2>
                        {wasteReportId != null ? (
                          <Link
                            to={`/report/${encodeURIComponent(String(wasteReportId))}`}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                          >
                            Xem báo cáo gốc
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        ) : null}
                      </div>
                      <span
                        className={`inline-flex items-center self-start rounded-2xl border px-3 py-1 text-xs font-extrabold ${complaintStatusClass(c?.status)}`}
                      >
                        {complaintStatusLabel(c?.status)}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                      <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Lý do</p>
                        <p className="font-semibold text-on-surface mt-0.5">{c?.reason || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Gửi lúc</p>
                        <p className="font-semibold text-on-surface mt-0.5">{formatDateTime(c?.createdAtUtc)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Nội dung</p>
                      <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">
                        {c?.description || '—'}
                      </p>
                    </div>

                    {c?.adminNote ? (
                      <div className="rounded-xl border border-surface-container-high bg-surface-container-low/50 p-3">
                        <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Ghi chú xử lý</p>
                        <p className="text-sm text-on-surface mt-1 whitespace-pre-wrap">{c.adminNote}</p>
                      </div>
                    ) : null}

                    {c?.status === 'Resolved' && c?.resolvedAtUtc ? (
                      <p className="text-xs text-on-surface-variant">
                        Xử lý{' '}
                        {c?.resolvedByName ? (
                          <span className="font-semibold text-on-surface">{c.resolvedByName}</span>
                        ) : null}
                        {c?.resolvedByName ? ' · ' : null}
                        {formatDateTime(c.resolvedAtUtc)}
                      </p>
                    ) : null}

                    {evidenceList.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-on-surface-variant inline-flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5" />
                          Minh chứng ({evidenceList.length})
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {evidenceList.map((ev) => {
                            const url = resolveFileUrl(ev?.fileUrl);
                            const name = ev?.originalFileName || 'Tệp';
                            const isImg = String(ev?.contentType ?? '').startsWith('image/') && url;
                            return (
                              <li key={ev?.id ?? url + name}>
                                {isImg ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-xl overflow-hidden border border-surface-container-high w-20 h-20 bg-surface-container-low"
                                  >
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                  </a>
                                ) : (
                                  <a
                                    href={url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-xl border border-surface-container-high bg-surface px-3 py-2 text-xs font-bold text-primary hover:bg-surface-container-low"
                                  >
                                    {name}
                                  </a>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}

                    <div className="pt-1 flex flex-wrap gap-2">
                      <Link
                        to={`/complaints/${encodeURIComponent(String(id))}`}
                        className="inline-flex items-center justify-center rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-extrabold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
                      >
                        Xem chi tiết khiếu nại
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredSorted.length > ITEMS_PER_PAGE ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-surface-container-high/50">
                <p className="text-sm text-on-surface-variant">
                  Trang {page} / {totalPages} · {filteredSorted.length} đơn
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-xl border border-surface-container-high px-4 py-2 text-sm font-bold text-on-surface disabled:opacity-40 hover:bg-surface-container-low"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-xl border border-surface-container-high px-4 py-2 text-sm font-bold text-on-surface disabled:opacity-40 hover:bg-surface-container-low"
                  >
                    Sau
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
