'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, ArrowLeft, Plus, X, Loader2, AlertCircle, UserMinus, Mail, Users, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const STORAGE_KEY = 'philosopher_team_members';

type Role = 'admin' | 'member' | 'viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'active' | 'pending';
  source: 'api' | 'local';
}

interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

type InviteForm = {
  name: string;
  email: string;
  role: Role;
};

const ROLE_CONFIG: Record<Role, { label: string; badgeColor: string; bgColor: string; description: string }> = {
  admin:  { label: 'Admin',  badgeColor: 'var(--gold)',       bgColor: 'rgba(168, 136, 58, 0.1)', description: 'Full access — manage team, settings, billing, all CRM data, and AI agents' },
  member: { label: 'Member', badgeColor: 'var(--info)',        bgColor: 'rgba(18, 60, 105, 0.1)', description: 'Can manage leads, clients, campaigns, tasks, and conversations' },
  viewer: { label: 'Viewer', badgeColor: 'var(--muted)',       bgColor: 'rgba(138, 133, 118, 0.1)', description: 'Read-only access — can view reports, analytics, and conversations but cannot modify data' },
};

const AVATAR_COLORS = [
  '#123C69', '#6F7D4F', '#8B2020', '#C9A24D', '#4A6741',
  '#2B5F6B', '#6B4E99', '#3B6B5E', '#4A4A7A', '#5A6B48',
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function RoleBadge({ role }: { role: Role }) {
  const config = ROLE_CONFIG[role];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 10px',
        fontSize: 11,
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        border: `1px solid ${config.badgeColor}`,
        borderRadius: 'var(--radius)',
        color: config.badgeColor,
        background: config.bgColor,
      }}
    >
      {config.label}
    </span>
  );
}

function StatusDot({ status }: { status: 'active' | 'pending' }) {
  const color = status === 'active' ? 'var(--success)' : 'var(--warning)';
  const label = status === 'active' ? 'Active' : 'Pending';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
      <span className="dot" style={{ background: color }} />
      {label}
    </span>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onCancel}
    >
      <div
        className="card scale-in"
        style={{
          padding: 28,
          maxWidth: 400,
          width: '90%',
          textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <AlertCircle size={32} color="var(--error)" style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--foreground)' }}>
          Confirm Removal
        </p>
        <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onCancel} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger btn-sm">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (form: InviteForm) => void;
}) {
  const [form, setForm] = useState<InviteForm>({ name: '', email: '', role: 'member' });
  const [valid, setValid] = useState(false);

  useEffect(() => {
    setValid(form.name.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email));
  }, [form]);

  const handleChange = (field: keyof InviteForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit(form);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card scale-in"
        style={{
          padding: 28,
          maxWidth: 440,
          width: '90%',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>
            Invite Member
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
              Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Full name"
              autoFocus
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
              Role
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([value, config]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleChange('role', value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: `1px solid ${form.role === value ? config.badgeColor : 'var(--border)'}`,
                    borderRadius: 'var(--radius)',
                    background: form.role === value ? config.bgColor : 'transparent',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    color: form.role === value ? config.badgeColor : 'var(--foreground-secondary)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={!valid} className="btn btn-primary btn-sm">
              <Mail size={14} />
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TeamSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Load members from API and localStorage
  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from API
      const token = localStorage.getItem('auth_token');
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://web-production-a93f0.up.railway.app/api/v1';

      let apiMembers: TeamMember[] = [];
      try {
        const res = await fetch(`${apiBase}/users/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          const items = data.items || data || [];
          apiMembers = (Array.isArray(items) ? items : []).map((u: ApiUser) => ({
            id: u.id,
            name: u.name || u.email || 'Unknown',
            email: u.email || '',
            role: (['admin', 'member', 'viewer'].includes(u.role) ? u.role : 'member') as Role,
            status: 'active' as const,
            source: 'api' as const,
          }));
        }
      } catch {
        // API unavailable — still show local members
      }

      // Load from localStorage
      let localMembers: TeamMember[] = [];
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            localMembers = parsed.map((m: TeamMember) => ({
              ...m,
              source: 'local' as const,
              status: m.status || 'pending',
            }));
          }
        }
      } catch {
        // ignore
      }

      // Merge: API members first, then local (dedup by email)
      const seen = new Set<string>();
      const merged: TeamMember[] = [];
      for (const m of [...apiMembers, ...localMembers]) {
        const key = m.email.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(m);
        }
      }

      setMembers(merged);
    } catch (err) {
      setError('Failed to load team members');
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleInvite = (form: InviteForm) => {
    const newMember: TeamMember = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      status: 'pending',
      source: 'local',
    };

    // Check for duplicate
    if (members.some(m => m.email.toLowerCase() === newMember.email)) {
      toast.error('A member with this email already exists');
      return;
    }

    const updated = [...members, newMember];
    setMembers(updated);

    // Persist local-only members to localStorage
    const localMembers = updated.filter(m => m.source === 'local');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localMembers));
    } catch {
      // storage full
    }

    setShowInviteModal(false);

    // Generate invite link for sharing
    const token = btoa(`${form.email}:${Date.now()}:${form.role}`).replace(/=/g, '');
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/signup?invite=${token}&email=${encodeURIComponent(form.email)}&name=${encodeURIComponent(form.name)}&role=${form.role}`;

    // Create a WhatsApp share URL
    const whatsappMessage = encodeURIComponent(
      `You've been invited to join Philosopher OS as a ${form.role.toUpperCase()}!\n\n` +
      `Click this link to accept: ${inviteLink}\n\n` +
      `Role: ${form.role.toUpperCase()} — ${ROLE_CONFIG[form.role].description}`
    );
    const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

    toast.success(`Invite created for ${form.name}`, {
      description: 'Share the invite link via WhatsApp or copy it.',
      duration: 15000,
      action: {
        label: 'Copy Link',
        onClick: () => {
          navigator.clipboard.writeText(inviteLink);
          toast.success('Invite link copied!');
        },
      },
    });

    // Also offer WhatsApp send
    if (confirm(`Send invite to ${form.name} via WhatsApp? Click OK to open WhatsApp.`)) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRemove = (id: string) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    const updated = members.filter(m => m.id !== id);
    setMembers(updated);

    // Persist local-only members
    const localMembers = updated.filter(m => m.source === 'local');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localMembers));
    } catch {
      // storage full
    }

    setRemovingId(null);
    toast.success(`${member.name} has been removed`);
  };

  if (loading) {
    return (
      <div className="page-content page-bg-marble fade-in">
        <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={28} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: 14 }}>Loading team...</p>
        </div>
      </div>
    );
  }

  if (error && members.length === 0) {
    return (
      <div className="page-content page-bg-marble fade-in">
        <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <AlertCircle size={32} color="var(--error)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: 4 }}>Failed to load team</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{error}</p>
          <button
            onClick={loadMembers}
            className="btn btn-primary btn-sm"
            style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Loader2 size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content page-bg-marble page-enter">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0, fontFamily: 'var(--font-heading)' }}>Team</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Manage team members and roles
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInviteModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Users size={40} color="var(--muted)" style={{ marginBottom: 16, opacity: 0.5 }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: 4 }}>No team members yet</p>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px', lineHeight: 1.5 }}>
            Invite your first team member to collaborate on campaigns, tasks, and more.
          </p>
          <button className="btn btn-primary" onClick={() => setShowInviteModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> Invite Member
          </button>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: getAvatarColor(member.id),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 600,
                          fontFamily: 'var(--font-label)',
                          flexShrink: 0,
                        }}
                      >
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--foreground)' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <RoleBadge role={member.role} />
                  </td>
                  <td>
                    <StatusDot status={member.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => setRemovingId(member.id)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--muted)' }}
                      title="Remove member"
                    >
                      <UserMinus size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {members.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 24, fontSize: 12, color: 'var(--muted)' }}>
          <span>{members.length} member{members.length !== 1 ? 's' : ''}</span>
          <span>{members.filter(m => m.status === 'active').length} active</span>
          <span>{members.filter(m => m.status === 'pending').length} pending</span>
          <span>{members.filter(m => m.role === 'admin').length} admin</span>
        </div>
      )}

      {/* Role Definitions */}
      <div className="card" style={{ padding: 24, marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
          <Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} color="var(--accent)" />
          Role Definitions
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).map(([role, config]) => (
            <div key={role} style={{
              padding: 14, borderRadius: 8,
              border: '1px solid var(--border-light)',
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <RoleBadge role={role} />
              <div style={{ fontSize: 13, color: 'var(--foreground-secondary)', lineHeight: 1.5 }}>
                {config.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInvite}
        />
      )}

      {/* Confirm Remove Dialog */}
      {removingId && (
        <ConfirmDialog
          message={`Are you sure you want to remove ${members.find(m => m.id === removingId)?.name || 'this member'}? This action cannot be undone.`}
          onConfirm={() => handleRemove(removingId)}
          onCancel={() => setRemovingId(null)}
        />
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
