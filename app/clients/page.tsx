'use client';

import { useQuery } from '@tanstack/react-query';
import { listClients, formatCurrency } from '@/lib/api-client';
import { Building2, Search, Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { usePageTitle } from '@/lib/use-page-title';

export default function ClientsPage() {
  usePageTitle('Clients');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => listClients({ page: 1, page_size: 50 }),
  });

  const clients = data?.items ?? [];
  const filtered = search
    ? clients.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()))
    : clients;

  return (
    <div className="page-content page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Clients</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Active client accounts and contracts
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Add Client
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." style={{ paddingLeft: 34, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' }} />
        </div>
      </div>

      <div className="etched-surface" style={{ overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Contract</th>
              <th>MRR</th>
              <th>LTV</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>No clients found</td></tr>
            )}
            {filtered.map(client => (
              <tr key={client.id}>
                <td style={{ fontWeight: 500 }}>{client.name}</td>
                <td>{client.company || '—'}</td>
                <td style={{ color: 'var(--foreground-secondary)' }}>{client.email || '—'}</td>
                <td>
                  <span className="badge" style={{
                    background: client.contract_status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
                    color: client.contract_status === 'active' ? '#22c55e' : 'var(--muted)',
                  }}>
                    {client.contract_status}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(client.mrr)}</td>
                <td style={{ fontWeight: 600 }}>{formatCurrency(client.lifetime_value)}</td>
                <td style={{ fontSize: 13, color: 'var(--muted)' }}>{client.created_at ? new Date(client.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-ghost" style={{ padding: '4px 8px' }}>
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
