'use client';

import { useState, useEffect } from 'react';
import { User, ArrowLeft, Loader2, Save, AlertCircle, Key, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { getCurrentUser, updateUser, ApiError } from '@/lib/api-client';
import { PORTRAITS } from '@/lib/philosopher-assets';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/proxy';

const TIMEZONES = [
  'Africa/Johannesburg', 'Africa/Cairo', 'Africa/Lagos', 'Africa/Nairobi',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Asia/Shanghai', 'Australia/Sydney', 'Australia/Melbourne',
  'Pacific/Auckland', 'UTC',
] as const;

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [timezone, setTimezone] = useState('UTC');

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const user = await getCurrentUser();
        setUserId(user.id);
        setDisplayName(user.name || '');
        setEmail(user.email || '');
        setTimezone((user as { timezone?: string }).timezone || 'UTC');
        const url = (user as { avatar_url?: string }).avatar_url || '';
        setAvatarUrl(url);
        // Sync to localStorage so sidebar picks it up
        localStorage.setItem('user_name', user.name || '');
        if (url) localStorage.setItem('user_avatar', url);
      } catch (err) {
        const msg = err instanceof ApiError ? err.detail : 'Failed to load profile';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      await updateUser(userId, {
        name: displayName,
        avatar_url: avatarUrl,
        timezone,
      });
      toast.success('Profile updated successfully');
    } catch (err) {
      const msg = err instanceof ApiError ? err.detail : 'Failed to update profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (portraitPath: string) => {
    setAvatarUrl(portraitPath);
    localStorage.setItem('user_avatar', portraitPath);

    // Auto-save the avatar selection
    if (userId) {
      try {
        await updateUser(userId, {
          name: displayName,
          avatar_url: portraitPath,
          timezone,
        });
        toast.success('Profile picture updated');
      } catch (err) {
        const msg = err instanceof ApiError ? err.detail : 'Failed to update avatar';
        toast.error(msg);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Failed to change password' }));
        throw new Error(err.detail || 'Failed to change password');
      }

      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content page-bg-marble fade-in">
        <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Loader2 size={28} color="var(--muted)" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--muted)', marginTop: 12, fontSize: 14 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !userId) {
    return (
      <div className="page-content page-bg-marble fade-in">
        <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <AlertCircle size={32} color="var(--error)" style={{ marginBottom: 12 }} />
          <p style={{ color: 'var(--foreground)', fontWeight: 600, marginBottom: 4 }}>Failed to load profile</p>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content page-bg-marble fade-in">
      <Link href="/settings" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--muted)', marginBottom: 16, textDecoration: 'none' }}>
        <ArrowLeft size={14} /> Back to Settings
      </Link>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0, fontFamily: 'var(--font-heading)' }}>Profile</h1>
        <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
          Your personal information and display name
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        {/* Profile Info Card */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Avatar Picker */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 10 }}>
                Profile Picture
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 10,
              }}>
                {Object.entries(PORTRAITS).map(([name, path]) => {
                  const isSelected = avatarUrl === path;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleAvatarSelect(path)}
                      title={name.charAt(0).toUpperCase() + name.slice(1)}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        border: isSelected ? '3px solid var(--gold, #C9A24D)' : '2px solid var(--border)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        padding: 0,
                        background: 'transparent',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <img
                        src={path}
                        alt={name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                        onError={e => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.style.background = 'var(--surface)';
                        }}
                      />
                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: 'var(--gold, #C9A24D)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Check size={12} color="#fff" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                Click a philosopher portrait to set as your profile picture
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Your display name"
                style={{ width: '100%' }}
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                readOnly
                style={{ width: '100%', cursor: 'not-allowed', opacity: 0.7 }}
                tabIndex={-1}
              />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Email is managed through your authentication provider
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                Timezone
              </label>
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                style={{ width: '100%' }}
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Password Change Card */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPasswordForm ? 20 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Key size={16} color="var(--accent)" />
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Change Password</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="btn btn-secondary"
              style={{ fontSize: 13, padding: '6px 14px' }}
            >
              {showPasswordForm ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showPasswordForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--foreground)', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  style={{ width: '100%' }}
                />
              </div>
              <button
                type="button"
                onClick={handlePasswordChange}
                disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}
              >
                {changingPassword ? (
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Key size={16} />
                )}
                {changingPassword ? 'Changing...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Save & Cancel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {saving ? (
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/settings" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>
            Cancel
          </Link>
        </div>
      </form>

      {/* Signup Link */}
      <div style={{
        marginTop: 32,
        padding: '16px 20px',
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 8,
        maxWidth: 560,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', margin: 0 }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            style={{
              color: 'var(--accent)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Create one
          </Link>
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
