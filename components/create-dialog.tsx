'use client';

import { useState, useEffect, type ReactNode, type FormEvent } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Field {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'date' | 'datetime-local';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string;
}

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: Field[];
  onSubmit: (values: Record<string, string>) => Promise<void>;
  submitting?: boolean;
  children?: ReactNode;
}

export function CreateDialog({ open, onClose, title, fields, onSubmit, submitting, children }: CreateDialogProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.name] = f.defaultValue || ''; });
    return init;
  });

  // Re-seed form state from field defaults whenever the dialog opens or the
  // field set changes (e.g. switching between "New" and "Edit" modes). Without
  // this, the lazy useState initializer only runs on first mount and the Edit
  // dialog shows blank/stale values.
  const defaultsKey = fields.map(f => `${f.name}=${f.defaultValue ?? ''}`).join('|');
  useEffect(() => {
    if (!open) return;
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.name] = f.defaultValue || ''; });
    setValues(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultsKey]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
    setValues({});
  };

  const handleClose = () => {
    setValues({});
    onClose();
  };

  const setValue = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
    }} onClick={handleClose}>
      <div className="card" style={{
        width: '100%', maxWidth: 480, padding: 0, overflow: 'hidden',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{title}</h2>
          <button className="btn btn-ghost" onClick={handleClose} style={{ padding: '4px 8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {fields.map(field => (
              <div key={field.name}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 4, color: 'var(--foreground-secondary)' }}>
                  {field.label}{field.required && <span style={{ color: '#ef4444' }}> *</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    value={values[field.name] || ''}
                    onChange={e => setValue(field.name, e.target.value)}
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={values[field.name] || ''}
                    onChange={e => setValue(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={3}
                  />
                ) : (
                  <input
                    type={field.type}
                    value={values[field.name] || ''}
                    onChange={e => setValue(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            {children}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {submitting && <Loader2 size={14} className="spin" />}
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
