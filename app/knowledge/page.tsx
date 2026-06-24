'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, useNodesState, useEdgesState,
  ReactFlowProvider,
  type Node, type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Network, List, Plus, Upload, X, FileText,
  Trash2, Loader2, Search, BookOpen, RefreshCw,
} from 'lucide-react';
import {
  searchKnowledge, addKnowledge, deleteKnowledge, uploadKnowledgeFile,
  getKnowledgeGraph, request,
  type KnowledgeGraphNode, type KnowledgeGraphEdge,
} from '@/lib/api-client';
import { usePageTitle } from '@/lib/use-page-title';
import { CreateDialog } from '@/components/create-dialog';
import { PageHeader } from '@/components/ui/page-header';

// ─── Color by category ───────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  general: '#6b7280',
  sales: '#d4a017',
  process: '#123c69',
  research: '#2d6a4f',
  finance: '#7b2d8b',
  marketing: '#c45c2e',
  technical: '#2563eb',
  uploaded_files: '#4a5568',
};

function catColor(category: string) {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? '#6b7280';
}

// ─── Build React Flow data ────────────────────────────

function buildNodes(graphNodes: KnowledgeGraphNode[]): Node[] {
  const total = graphNodes.length;
  const radius = Math.max(200, total * 55);
  return graphNodes.map((n, i) => {
    const angle = (2 * Math.PI * i) / Math.max(total, 1);
    return {
      id: n.id,
      position: { x: Math.cos(angle) * radius + radius, y: Math.sin(angle) * radius + radius },
      data: { label: n.title, node: n },
      style: {
        background: catColor(n.category),
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        padding: '7px 11px',
        fontSize: 11,
        fontWeight: 600,
        maxWidth: 150,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        whiteSpace: 'normal' as const,
        textAlign: 'center' as const,
      },
    };
  });
}

function buildEdges(graphEdges: KnowledgeGraphEdge[]): Edge[] {
  return graphEdges.map(e => ({
    id: `${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    style: {
      stroke: '#d4a017',
      strokeWidth: Math.max(1, Math.round(e.similarity * 3)),
      strokeOpacity: 0.3 + e.similarity * 0.5,
    },
  }));
}

// ─── Graph canvas ─────────────────────────────────────

function GraphCanvas({ onNodeClick }: { onNodeClick: (n: KnowledgeGraphNode) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['knowledge-graph'],
    queryFn: getKnowledgeGraph,
  });

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (data) {
      setNodes(buildNodes(data.nodes));
      setEdges(buildEdges(data.edges ?? []));
    }
  }, [data, setNodes, setEdges]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    onNodeClick(node.data.node as KnowledgeGraphNode);
  }, [onNodeClick]);

  if (isLoading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <p style={{ color: 'var(--muted)' }}>Building memory graph...</p>
      </div>
    );
  }

  if (!data?.nodes.length) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <Network size={48} color="var(--muted)" style={{ opacity: 0.3 }} />
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>No articles yet — add your first to see the memory graph</p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border, #e5e0d8)" />
      <Controls />
      <MiniMap
        nodeColor={n => catColor((n.data?.node as KnowledgeGraphNode)?.category ?? '')}
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      />
    </ReactFlow>
  );
}

// ─── Page ─────────────────────────────────────────────

export default function KnowledgePage() {
  usePageTitle('Memory Graph');
  const [view, setView] = useState<'graph' | 'list'>('graph');
  const [query, setQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selected, setSelected] = useState<KnowledgeGraphNode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['knowledge', query],
    queryFn: () => searchKnowledge(query || undefined),
    enabled: view === 'list',
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['knowledge'] });
    queryClient.invalidateQueries({ queryKey: ['knowledge-graph'] });
  };

  const createMut = useMutation({
    mutationFn: (values: Record<string, string>) =>
      addKnowledge({
        title: values.title,
        content: values.content,
        category: values.category || undefined,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }),
    onSuccess: () => { toast.success('Article added'); setDialogOpen(false); invalidate(); },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteKnowledge(id),
    onSuccess: () => { toast.success('Deleted'); setSelected(null); invalidate(); },
    onError: (e: Error) => toast.error(`Failed: ${e.message}`),
  });

  return (
    <div className="page-content page-bg-treasury page-enter">
      {/* ── Header ── */}
      <PageHeader
        title="Memory Graph"
        description="Semantic knowledge map — click any node to read"
        icon={Network}
        iconColor="#123C69"
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'var(--border)', borderRadius: 6, padding: 2, gap: 2 }}>
              <button
                className="btn btn-ghost"
                onClick={() => setView('graph')}
                style={{ padding: '4px 10px', fontSize: 12, gap: 4, background: view === 'graph' ? 'var(--surface)' : 'transparent', borderRadius: 4 }}
              >
                <Network size={13} /> Graph
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setView('list')}
                style={{ padding: '4px 10px', fontSize: 12, gap: 4, background: view === 'list' ? 'var(--surface)' : 'transparent', borderRadius: 4 }}
              >
                <List size={13} /> List
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.docx,.csv,.json"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const result = await uploadKnowledgeFile(file);
                  toast.success(result.message);
                  invalidate();
                } catch (err: unknown) {
                  toast.error((err as Error)?.message || 'Upload failed');
                } finally {
                  setUploading(false);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }
              }}
            />
            <button className="btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={15} /> : <Upload size={15} />}
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <button
              className="btn"
              onClick={async () => {
                setSyncing(true);
                try {
                  const result = await request<{ added_to_graph: number; leads: number; clients: number; campaigns: number; conversations: number; obsidian: { status: string; files_written: number }; message: string }>('/knowledge/sync-everything', { method: 'POST' });
                  toast.success(result.message);
                  invalidate();
                } catch (e: unknown) {
                  toast.error((e as Error)?.message || 'Sync failed');
                } finally {
                  setSyncing(false);
                }
              }}
              disabled={syncing}
              title="Pull leads, clients, campaigns & chats into the memory graph"
            >
              {syncing ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <RefreshCw size={15} />}
              {syncing ? 'Syncing…' : 'Sync Everything'}
            </button>
            <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
              <Plus size={15} /> Add Article
            </button>
          </div>
        }
      />

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

      {/* ── Main area ── */}
      <div style={{ position: 'relative', marginTop: 24 }}>

        {view === 'graph' ? (
          /* Graph canvas with explicit height so ReactFlow renders */
          <div style={{ height: 'calc(100vh - 240px)', minHeight: 500, position: 'relative' }}>
            <ReactFlowProvider>
              <GraphCanvas onNodeClick={setSelected} />
            </ReactFlowProvider>

            {/* Node detail panel — absolute over the graph */}
            {selected && (
              <div style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 320,
                background: 'var(--surface)', borderLeft: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', zIndex: 10,
                boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
                borderRadius: '0 12px 12px 0',
              }}>
                <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: catColor(selected.category), color: '#fff', fontSize: 10 }}>
                        {selected.category}
                      </span>
                      {selected.tags?.map(t => (
                        <span key={t} className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: 10 }}>{t}</span>
                      ))}
                    </div>
                    <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, fontFamily: 'var(--font-heading)', lineHeight: 1.3 }}>
                      {selected.title}
                    </h2>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: '4px 6px', flexShrink: 0 }} onClick={() => setSelected(null)}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                  <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--foreground-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {selected.content}
                  </p>
                </div>
                <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
                  <button
                    className="btn"
                    style={{ width: '100%', justifyContent: 'center', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}
                    onClick={() => { if (confirm(`Delete "${selected.title}"?`)) deleteMut.mutate(selected.id); }}
                    disabled={deleteMut.isPending}
                  >
                    <Trash2 size={14} /> Delete Article
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ── List view ── */
          <div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <Search size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search knowledge base…"
                style={{ paddingLeft: 40, fontSize: 15, paddingTop: 10, paddingBottom: 10, boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.12)' }}
              />
            </div>

            {listLoading && (
              <div className="etched-surface" style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: 'var(--muted)' }}>Loading…</p>
              </div>
            )}

            {!listLoading && (listData?.items ?? []).length === 0 && (
              <div className="etched-surface" style={{ padding: 60, textAlign: 'center' }}>
                <BookOpen size={40} color="var(--muted)" style={{ marginBottom: 12, opacity: 0.5 }} />
                <p style={{ color: 'var(--muted)' }}>
                  {query ? <>No results for &ldquo;{query}&rdquo;</> : 'No articles yet — add your first with "Add Article"'}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(listData?.items ?? []).map(item => (
                <div key={item.id} className="etched-surface" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <FileText size={18} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 4px', fontFamily: 'var(--font-heading)' }}>{item.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--foreground-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>
                        {item.content.slice(0, 200)}{item.content.length > 200 ? '…' : ''}
                      </p>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        {item.category && (
                          <span className="badge" style={{ background: 'var(--border)', color: 'var(--foreground-secondary)', fontSize: 10 }}>
                            {item.category}
                          </span>
                        )}
                        {item.tags?.map(tag => (
                          <span key={tag} className="badge" style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', fontSize: 10 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: '4px 8px', flexShrink: 0 }}
                      disabled={deleteMut.isPending}
                      onClick={() => { if (confirm(`Delete "${item.title}"?`)) deleteMut.mutate(item.id); }}
                    >
                      <Trash2 size={15} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
