import React, { useEffect, useState } from 'react';
import { getApiBaseUrl } from '../../lib/api';
import { getAdminAuthHeaders } from '../../lib/adminAuth';
import type { AdminWorkItemType } from '../../types';

export type ActiveAdministrator = {
  email: string;
  display_name: string | null;
};

export const useActiveAdministrators = () => {
  const [administrators, setAdministrators] = useState<ActiveAdministrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const api = getApiBaseUrl();

  useEffect(() => {
    let active = true;
    const loadAdministrators = async () => {
      try {
        const response = await fetch(`${api}/api/admin/users`, { headers: getAdminAuthHeaders() });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Unable to load administrators.');
        if (active) {
          setAdministrators(
            (result.administrators || []).filter((administrator: { status?: string }) => administrator.status === 'active')
          );
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Unable to load administrators.');
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAdministrators();
    return () => { active = false; };
  }, [api]);

  return { administrators, loading, error };
};

type AdminFollowUpPanelProps = {
  type: AdminWorkItemType;
  recordId: string;
  assignedAdminEmail?: string;
  followUpAt?: string;
  isOpen: boolean;
  administrators: ActiveAdministrator[];
  administratorsLoading: boolean;
  administratorsError: string;
  onSaved: (assignedAdminEmail: string | null, followUpAt: string | null) => void;
};

const toLocalDateTimeInput = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

export const AdminFollowUpPanel: React.FC<AdminFollowUpPanelProps> = ({
  type,
  recordId,
  assignedAdminEmail,
  followUpAt,
  isOpen,
  administrators,
  administratorsLoading,
  administratorsError,
  onSaved
}) => {
  const [assignedDraft, setAssignedDraft] = useState(assignedAdminEmail || '');
  const [followUpDraft, setFollowUpDraft] = useState(toLocalDateTimeInput(followUpAt));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const storedFollowUpDraft = toLocalDateTimeInput(followUpAt);
  const isDirty = assignedDraft !== (assignedAdminEmail || '') || followUpDraft !== storedFollowUpDraft;

  useEffect(() => {
    setAssignedDraft(assignedAdminEmail || '');
    setFollowUpDraft(toLocalDateTimeInput(followUpAt));
  }, [assignedAdminEmail, followUpAt]);

  const dueDate = followUpAt ? new Date(followUpAt) : null;
  const hasValidDueDate = dueDate && !Number.isNaN(dueDate.getTime());
  const isOverdue = isOpen && hasValidDueDate && dueDate.getTime() < Date.now();
  const dueToday = hasValidDueDate && dueDate.toDateString() === new Date().toDateString();

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const response = await fetch(`${getApiBaseUrl()}/api/admin/work-items/${type}/${encodeURIComponent(recordId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
        body: JSON.stringify({
          assignedAdminEmail: assignedDraft || null,
          followUpAt: followUpDraft ? new Date(followUpDraft).toISOString() : null
        })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to save follow-up details.');
      onSaved(result.assignedAdminEmail ?? null, result.followUpAt ?? null);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save follow-up details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E8DFD3] bg-[#FAF7F2] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-[#635E59]">Owner & follow-up</p>
        {hasValidDueDate && (
          <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${isOverdue ? 'bg-red-100 text-red-800' : !isOpen ? 'bg-slate-100 text-slate-700' : dueToday ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {!isOpen ? 'Closed' : isOverdue ? 'Overdue' : dueToday ? 'Due today' : 'Scheduled'}
            {' · '}{dueDate.toLocaleString()}
          </span>
        )}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <label className="text-[11px] font-semibold text-[#524D47]">
          Assigned admin
          <select
            value={assignedDraft}
            onChange={event => { setAssignedDraft(event.target.value); setSaved(false); }}
            disabled={administratorsLoading || Boolean(administratorsError)}
            className="mt-1 block w-full rounded-lg border border-[#D5C9BA] bg-white px-2.5 py-2 text-xs text-[#1A201C] disabled:opacity-60"
          >
            <option value="">Unassigned</option>
            {assignedAdminEmail && !administrators.some(administrator => administrator.email === assignedAdminEmail) && (
              <option value={assignedAdminEmail}>{assignedAdminEmail} (not active)</option>
            )}
            {administrators.map(administrator => (
              <option key={administrator.email} value={administrator.email}>
                {administrator.display_name ? `${administrator.display_name} · ${administrator.email}` : administrator.email}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[11px] font-semibold text-[#524D47]">
          Follow-up due
          <input
            type="datetime-local"
            value={followUpDraft}
            onChange={event => { setFollowUpDraft(event.target.value); setSaved(false); }}
            className="mt-1 block w-full rounded-lg border border-[#D5C9BA] bg-white px-2.5 py-2 text-xs text-[#1A201C]"
          />
        </label>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || administratorsLoading || Boolean(administratorsError) || !isDirty}
          className="rounded-lg bg-[#1D432D] px-3 py-2 text-xs font-bold text-white hover:bg-[#143020] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save follow-up'}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
      {saved && <p role="status" className="mt-2 text-xs font-semibold text-emerald-800">Follow-up details saved.</p>}
    </div>
  );
};
