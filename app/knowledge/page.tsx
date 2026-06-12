'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { searchKnowledge, addKnowledge, deleteKnowledge } from '@/lib/api-client';
import { BookOpen, Search, Plus, FileText, Trash2 } from 'lucide-react';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';

export default function KnowledgePage() {
  usePageTitle('Knowledge Base');
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['knowledge', query],
    queryFn: () => searchKnowledge(query || undefined),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['knowledge'] });

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) => addKnowledge({
      title: values.title,
      content: values.content,
      category: values.category || undefined,
      tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    }),
    onSuccess: () => {
      toast.success('Article added');
      setDialogOpen(false);
      invalidate();
    },
    onError: (e: Error) => toast.error(`Failed to add article: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteKnowledge(id),
    onSuccess: () => { toast.success('Article deleted'); invalidate(); },
    onError: (e: Error) => toast.error(`Failed to delete article: ${e.message}`),
  });

  const results = data?.items ?? [];

  return (
    <div className="page-content page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, fontFamily: 'var(--font-heading)' }}>Knowledge Base</h1>
          <p style={{ fontSize: 14, color: 'var(--foreground-secondary)', marginTop: 4 }}>
            Search and manage your agency knowledge
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
          <Plus size={16} /> Add Article
        </button>
      </div>

      <CreateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Add Article"
        submitting={createMut.isPending}
        onSubmit={async values => { await createMut.mutateAsync(values); }}
        fields={[
          { name: 'title', label: 'Title', type: 'text', placeholder: 'Article title', required: true },
          { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Write the article (markdown supported)', required: true },
          { name: 'category', label: 'Category', type: 'text', placeholder: 'e.g. sales, process, research' },
          { name: 'tags', label: 'Tags', type: 'text', placeholder: 'Comma-separated, e.g. pricing, onboarding' },
        ]}
      />

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search knowledge base..."
          style={{ paddingLeft: 40, fontSize: 15, paddingTop: 10, paddingBottom: 10, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' }}
        />
      </div>

      {isLoading && (
        <div className="etched-surface" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)' }}>{query ? 'Searching...' : 'Loading articles...'}</p>
        </div>
      )}

      {!isLoading && results.length === 0 && (
        <div className="etched-surface" style={{ padding: 60, textAlign: 'center' }}>
          <BookOpen size={40} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
          <p style={{ color: 'var(--muted)' }}>
            {query
              ? <>No results found for &ldquo;{query}&rdquo;</>
              : 'No articles yet — add your first with "Add Article"'}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {results.map(item => (
            <div key={item.id} className="etched-surface" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <FileText size={18} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
                    {item.content.slice(0, 200)}{item.content.length > 200 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    {item.category && (
                      <span className="badge" style={{ background: 'var(--border)', color: 'var(--foreground-secondary)', fontSize: 10 }}>
                        {item.category}
                      </span>
                    )}
                    {item.tags?.map(tag => (
                      <span key={tag} className="badge" style={{
                        background: 'var(--accent-subtle)',
                        color: 'var(--accent)',
                        fontSize: 10,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  className="btn btn-ghost" style={{ padding: '4px 8px', flexShrink: 0 }} title="Delete article"
                  disabled={deleteMut.isPending}
                  onClick={() => { if (confirm(`Delete article "${item.title}"?`)) deleteMut.mutate(item.id); }}
                >
                  <Trash2 size={15} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
