import React, { useState, useEffect } from 'react';
import { AdminRoute } from '../components/admin/AdminRoute';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Subscriber } from '../types';
import {
  subscribeToAllSubscribers,
  deleteSubscriber,
} from '../firebase/subscribersService';
import {
  Mail,
  Copy,
  Check,
  Search,
  Trash2,
  Calendar,
  Send,
  Download,
  Users,
  Bell,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const AdminSubscribersPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Subscribers — PawMart Admin';
    const unsub = subscribeToAllSubscribers((data) => {
      setSubscribers(data);
    });
    return () => unsub();
  }, []);

  const filteredSubscribers = subscribers.filter((s) => {
    const q = search.toLowerCase().trim();
    return (
      s.email.toLowerCase().includes(q) ||
      (s.source && s.source.toLowerCase().includes(q))
    );
  });

  const handleCopyAll = () => {
    const emails = subscribers.map((s) => s.email.trim()).filter(Boolean);
    if (emails.length === 0) return;
    const unique = Array.from(new Set(emails)).join(', ');
    navigator.clipboard.writeText(unique);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 3000);
  };

  const handleCopySingle = (id: string, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Are you sure you want to remove ${email} from subscribers?`)) return;
    try {
      await deleteSubscriber(id);
      setActionMessage(`Subscriber ${email} was removed.`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert('Failed to delete subscriber: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const header = 'Email,Subscription Date,Source,Status\n';
    const rows = subscribers
      .map((s) => `"${s.email}","${s.createdAt}","${s.source || 'newsletter'}","${s.status || 'active'}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pawmart-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminRoute>
      <AdminLayout title="Email Subscribers">
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-slate-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
                <Bell className="w-3.5 h-3.5" />
                <span>Audience & Notification List</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Subscriber Email List ({subscribers.length})
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                Every visitor who enters their email to subscribe and receive new product arrival notifications appears here automatically in real time.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleCopyAll}
                disabled={subscribers.length === 0}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                  copiedAll
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {copiedAll ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>All Emails Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy All Emails</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={subscribers.length === 0}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {actionMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Total Subscribers
                </span>
                <Mail className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{subscribers.length}</p>
              <p className="text-[11px] text-slate-400 mt-1">Real-time Firebase Firestore</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Status
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600">100%</p>
              <p className="text-[11px] text-slate-400 mt-1">Active verified email alerts</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Automated Updates
                </span>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-sm font-bold text-slate-800 mt-1">Instant sync on submit</p>
              <p className="text-[11px] text-slate-400 mt-1">Zero manual refresh required</p>
            </div>
          </div>

          {/* Search Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subscribers by email address or source..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <span className="text-xs text-slate-400 font-semibold self-end sm:self-auto">
              Showing {filteredSubscribers.length} of {subscribers.length} subscribers
            </span>
          </div>

          {/* Subscribers Table */}
          {filteredSubscribers.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-white border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No Subscribers Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {search
                  ? 'No subscriber email matches your search query. Try clearing the filter.'
                  : 'When visitors subscribe on the homepage newsletter, their email IDs will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Subscriber Email ID</th>
                      <th className="px-5 py-3.5">Subscribed Date</th>
                      <th className="px-5 py-3.5">Source / Origin</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Quick Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredSubscribers.map((sub) => {
                      const isCopied = copiedId === sub.id;

                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                <Mail className="w-4 h-4 text-amber-700" />
                              </div>
                              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                                {sub.email}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {new Date(sub.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(sub.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                              {sub.source ? sub.source.replace('_', ' ') : 'Homepage Newsletter'}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopySingle(sub.id, sub.email)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                                title="Copy Email ID"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-[10px] text-emerald-700">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span className="text-[10px]">Copy</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={`mailto:${sub.email}?subject=New Product Alerts from PawMart`}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                title="Send direct email"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </a>

                              <button
                                type="button"
                                onClick={() => handleDelete(sub.id, sub.email)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove subscriber"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};
