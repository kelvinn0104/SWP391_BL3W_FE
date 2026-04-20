import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  FileText,
  Loader2,
  Mail,
  Paperclip,
  User,
} from 'lucide-react';
import { getComplaintDetail } from '../api/complaintApi';
import { getApiBaseUrl } from '../lib/auth';

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

export default function ComplaintDetail() {
  const { id: rawId } = useParams();
  const id = rawId ? decodeURIComponent(rawId) : '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!id) {
        setData(null);
        setError('Thiếu mã khiếu nại.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      setData(null);
      try {
        const detail = await getComplaintDetail(id);
        if (!isMounted) return;
        setData(detail && typeof detail === 'object' ? detail : null);
      } catch (e) {
        if (!isMounted) return;
        setData(null);
        setError(e instanceof Error ? e.message : 'Không thể tải chi tiết khiếu nại.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const evidenceList = Array.isArray(data?.evidenceFiles) ? data.evidenceFiles : [];
  const wasteReportId = data?.wasteReportId;

  return (
    <div className="px-4 sm:px-6 md:px-16 py-10 sm:py-14 space-y-8">
      <Link
        to="/complaints"
        className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Danh sách khiếu nại
      </Link>

      <section className="bg-surface-container-lowest rounded-[2.5rem] sm:rounded-[3rem] p-7 sm:p-10 border border-surface-container-high/60 botanical-shadow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-rose-700 font-extrabold">
              <AlertTriangle className="w-5 h-5" />
              Chi tiết khiếu nại
            </div>
            <h1 className="text-3xl sm:text-4xl font-sans italic text-on-surface">
              {loading ? (
                <span className="not-italic text-on-surface-variant">Đang tải…</span>
              ) : data?.reportTitle?.trim() ? (
                <>
                  <span className="not-italic text-on-surface">{data.reportTitle}</span>
                </>
              ) : (
                <>
                  Khiếu nại <span className="not-italic text-primary">#{data?.id ?? id}</span>
                </>
              )}
            </h1>
            {!loading && data?.id != null ? (
              <p className="text-sm text-on-surface-variant font-semibold">
                Mã khiếu nại: <span className="text-on-surface">#{data.id}</span>
              </p>
            ) : null}
          </div>
          {!loading && data ? (
            <span
              className={`inline-flex items-center self-start rounded-2xl border px-4 py-1.5 text-sm font-extrabold ${complaintStatusClass(data.status)}`}
            >
              {complaintStatusLabel(data.status)}
            </span>
          ) : null}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-surface-container-high/60 bg-surface p-6 text-sm text-on-surface-variant inline-flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Đang tải chi tiết…
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200/70 bg-red-50/80 p-5 text-sm font-semibold text-red-800">
            {error}
          </div>
        ) : !data ? (
          <div className="rounded-2xl border border-dashed border-surface-container-high p-8 text-center text-on-surface-variant">
            Không có dữ liệu.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-surface-container-high/80 bg-surface p-4 space-y-1">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Người gửi
                </p>
                <p className="font-bold text-on-surface">{data.citizenName || '—'}</p>
                <p className="text-sm text-on-surface-variant inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {data.citizenEmail || '—'}
                </p>
                <p className="text-xs text-on-surface-variant">Mã người dùng: {data.citizenId ?? '—'}</p>
              </div>

              <div className="rounded-2xl border border-surface-container-high/80 bg-surface p-4 space-y-2">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide inline-flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Báo cáo liên quan
                </p>
                <p className="font-bold text-on-surface">
                  {data.reportTitle?.trim() || `Báo cáo #${wasteReportId ?? '—'}`}
                </p>
                {wasteReportId != null ? (
                  <Link
                    to={`/report/${encodeURIComponent(String(wasteReportId))}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                  >
                    Mở báo cáo thu gom
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : null}
                <p className="text-xs text-on-surface-variant">Mã báo cáo: {wasteReportId ?? '—'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-surface-container-high/80 bg-surface p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Lý do</p>
                <p className="font-semibold text-on-surface">{data.reason || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1">Nội dung chi tiết</p>
                <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap break-words">
                  {data.description || '—'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-surface-container-high/60 bg-surface-container-low/30 p-4 sm:p-5">
              <div className="flex gap-2">
                <CalendarDays className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Gửi lúc</p>
                  <p className="text-sm font-semibold text-on-surface">{formatDateTime(data.createdAtUtc)}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <CalendarDays className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Cập nhật</p>
                  <p className="text-sm font-semibold text-on-surface">{formatDateTime(data.updatedAtUtc)}</p>
                </div>
              </div>
              <div className="flex gap-2 sm:col-span-1">
                <CalendarDays className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Xử lý / kết thúc</p>
                  <p className="text-sm font-semibold text-on-surface">{formatDateTime(data.resolvedAtUtc)}</p>
                  {data.resolvedByName ? (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Bởi: <span className="font-semibold text-on-surface">{data.resolvedByName}</span>
                      {data.resolvedByUserId != null ? ` (ID: ${data.resolvedByUserId})` : null}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {data.adminNote ? (
              <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 space-y-2">
                <p className="text-xs font-bold text-primary uppercase tracking-wide">Ghi chú từ bộ phận xử lý</p>
                <p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">{data.adminNote}</p>
              </div>
            ) : null}

            {evidenceList.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-extrabold text-on-surface inline-flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-primary" />
                  Minh chứng đính kèm ({evidenceList.length})
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
                  {evidenceList.map((ev) => {
                    const url = resolveFileUrl(ev?.fileUrl);
                    const name = ev?.originalFileName || 'Tệp';
                    const isImg = String(ev?.contentType ?? '').startsWith('image/') && url;
                    return (
                      <li
                        key={ev?.id ?? `${url}-${name}`}
                        className="rounded-2xl border border-surface-container-high overflow-hidden bg-surface shadow-sm"
                      >
                        {isImg ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center bg-surface-container-low min-h-[min(72vh,520px)] sm:min-h-[440px] p-3 sm:p-4"
                          >
                            <img
                              src={url}
                              alt={name}
                              className="max-h-[min(72vh,520px)] w-full object-contain"
                            />
                          </a>
                        ) : (
                          <a
                            href={url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col justify-center min-h-[140px] sm:min-h-[160px] p-4 text-sm font-bold text-primary hover:bg-surface-container-low break-all"
                          >
                            {name}
                          </a>
                        )}
                        <p className="px-3 py-2 text-xs text-on-surface-variant truncate border-t border-surface-container-high/60 bg-surface" title={name}>
                          {name}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">Không có tệp minh chứng đính kèm.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
