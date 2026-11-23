import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { getApiBaseUrl } from '../../lib/api';
import { getAdminAuthHeaders } from '../../lib/adminAuth';

type ProviderTransaction = {
  id: string;
  referenceCode: string;
  status: 'awaiting_payment' | 'initiating' | 'pending' | 'paid' | 'failed';
  amountKes: number;
  phoneNumber: string;
  paymentReceiptNumber: string;
  message: string;
  createdAt: string | null;
  updatedAt: string | null;
  paidAt: string | null;
  providerName: string;
  providerPhone: string;
};

const statusBadgeClass: Record<string, string> = {
  awaiting_payment: 'bg-slate-100 text-slate-700',
  initiating: 'bg-blue-100 text-blue-800',
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800'
};

const statusLabel: Record<string, string> = {
  awaiting_payment: 'Awaiting payment',
  initiating: 'Initiating',
  pending: 'Pending confirmation',
  paid: 'Paid',
  failed: 'Failed'
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export const ProviderTransactionsManager: React.FC = () => {
  const api = getApiBaseUrl();
  const [transactions, setTransactions] = useState<ProviderTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'all' | ProviderTransaction['status']>('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${api}/api/admin/provider-transactions`, { headers: getAdminAuthHeaders() });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not load provider transactions.');
      setTransactions(Array.isArray(result.transactions) ? result.transactions : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load provider transactions.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transactions.filter(transaction => {
      if (status !== 'all' && transaction.status !== status) return false;
      if (!normalizedQuery) return true;
      return [transaction.referenceCode, transaction.providerName, transaction.providerPhone, transaction.phoneNumber, transaction.paymentReceiptNumber]
        .some(value => value?.toLowerCase().includes(normalizedQuery));
    });
  }, [query, status, transactions]);

  return <section className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-['Outfit'] text-2xl font-extrabold text-[#1A201C]">Provider transactions</h2>
        <p className="mt-1 text-sm text-[#635E59]">Track registration payment attempts and confirmed collections.</p>
      </div>
      <button onClick={() => void load()} className="inline-flex items-center gap-2 rounded-xl border border-[#D5C9BA] bg-white px-3 py-2 text-xs font-bold text-[#1A201C]">
        <RefreshCw className="h-4 w-4" /> Refresh
      </button>
    </header>

    <div className="grid gap-3 rounded-2xl border border-[#E8DFD3] bg-white p-4 sm:grid-cols-3">
      <label className="sm:col-span-2 text-xs font-bold text-[#635E59]">Search
        <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Reference, name, phone, receipt"
          className="mt-1.5 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm font-normal text-[#1A201C]" />
      </label>
      <label className="text-xs font-bold text-[#635E59]">Status
        <select value={status} onChange={event => setStatus(event.target.value as 'all' | ProviderTransaction['status'])}
          className="mt-1.5 w-full rounded-xl border border-[#D5C9BA] bg-[#FAF7F2] px-3 py-2 text-sm font-normal text-[#1A201C]">
          <option value="all">All statuses</option>
          <option value="awaiting_payment">Awaiting payment</option>
          <option value="initiating">Initiating</option>
          <option value="pending">Pending confirmation</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </label>
    </div>

    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

    {loading ? (
      <div className="flex items-center gap-2 rounded-2xl bg-white p-8 text-sm text-[#635E59]">
        <LoaderCircle className="h-5 w-5 animate-spin" /> Loading transactions…
      </div>
    ) : filteredTransactions.length === 0 ? (
      <div className="rounded-2xl border border-dashed border-[#D5C9BA] bg-white p-10 text-center text-sm text-[#635E59]">No transactions found.</div>
    ) : (
      <div className="overflow-x-auto rounded-2xl border border-[#E8DFD3] bg-white shadow-sm">
        <table className="min-w-[1200px] w-full divide-y divide-[#EFE8DE]">
          <thead className="bg-[#FAF7F2]">
            <tr className="text-left text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#7D766D]">
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Provider phone</th>
              <th className="px-4 py-3">Payment phone</th>
              <th className="px-4 py-3">Receipt</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3">Paid at</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2ECE1]">
            {filteredTransactions.map(transaction => <tr key={transaction.id} className="text-sm text-[#3D3A36] align-top">
              <td className="px-4 py-3">
                <p className="font-bold text-[#1A201C]">{transaction.referenceCode}</p>
                <p className="text-xs text-[#7D766D]">ID: {transaction.id}</p>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${statusBadgeClass[transaction.status] || 'bg-slate-100 text-slate-700'}`}>
                  {statusLabel[transaction.status] || transaction.status}
                </span>
              </td>
              <td className="px-4 py-3 font-bold text-[#1D432D]">KES {transaction.amountKes.toLocaleString()}</td>
              <td className="px-4 py-3">{transaction.providerName || '—'}</td>
              <td className="px-4 py-3">{transaction.providerPhone || '—'}</td>
              <td className="px-4 py-3">{transaction.phoneNumber || '—'}</td>
              <td className="px-4 py-3">{transaction.paymentReceiptNumber || '—'}</td>
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(transaction.createdAt)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(transaction.updatedAt)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{formatDate(transaction.paidAt)}</td>
              <td className="px-4 py-3 max-w-[340px]">{transaction.message || '—'}</td>
            </tr>)}
          </tbody>
        </table>
      </div>
    )}
  </section>;
};
