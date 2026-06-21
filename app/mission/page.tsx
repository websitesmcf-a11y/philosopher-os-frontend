'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background, Controls, MiniMap, BackgroundVariant,
  useNodesState, useEdgesState, addEdge,
  ReactFlowProvider, useReactFlow, SelectionMode,
  type Connection, type Node, type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save, Zap, LayoutTemplate, Edit3, Crosshair } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { nodeTypes } from '@/components/strategeion/custom-nodes';
import NodePalette from '@/components/strategeion/node-palette';
import ConfigPanel from '@/components/strategeion/config-panel';
import { FLOW_TEMPLATES, type StrategeionNodeData, type NodeCategory } from '@/components/strategeion/types';
import { listFlows, createFlow, updateFlow, runFlow, getFlow, type FlowData } from '@/lib/api-client';

// ─── The actual builder (inside ReactFlowProvider) ─────────

function StrategeionBuilder() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [activated, setActivated] = useState(false);
  const [flowName, setFlowName] = useState('Untitled Flow');
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [saving, setSaving] = useState(false);
  const flowLoaded = useRef(false);

  // React Flow state (inside provider context)
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const { screenToFlowPosition } = useReactFlow();

  // Load flows list
  const { data: flowsData } = useQuery({
    queryKey: ['flows'],
    queryFn: () => listFlows(),
  });

  // Load first flow or create sample
  useEffect(() => {
    if (flowLoaded.current) return;
    if (flowsData?.flows?.length) {
      const first = flowsData.flows[0];
      setCurrentFlowId(first.id);
      setFlowName(first.name);
      if (first.node_count > 0) {
        getFlow(first.id).then((detail) => {
          if (detail?.data?.nodes?.length) {
            setNodes(detail.data.nodes.map((n: any) => ({ ...n, type: 'strategeion' })));
            setEdges(detail.data.edges || []);
          }
        }).catch(() => {});
      }
      flowLoaded.current = true;
    } else if (flowsData?.flows !== undefined) {
      // No flows — load sample
      setNodes([
        { id: 's-trigger', type: 'strategeion', position: { x: 55, y: 115 }, data: { label: 'NEW LEAD ADDED', category: 'trigger', subtitle: 'When a new lead enters the CRM', agentColor: '#1A5088', agentName: 'Trigger', agentInitial: 'NL', status: 'idle', config: {} } },
        { id: 's-plato', type: 'strategeion', position: { x: 330, y: 68 }, data: { label: 'PLATO', category: 'philosopher', subtitle: 'Vision & Strategy — Analyse this lead', agentColor: '#123C69', agentName: 'Plato', agentInitial: 'Pl', status: 'idle', config: { instruction: 'Analyse this lead\'s industry, company size, and role.' } } },
        { id: 's-whatsapp', type: 'strategeion', position: { x: 622, y: 48 }, data: { label: 'SEND WHATSAPP', category: 'action', subtitle: '+27 82 555 0100 · intro_lead_v2', agentColor: '#6F7D4F', agentName: 'WhatsApp', agentInitial: 'WA', status: 'idle', config: {} } },
        { id: 's-logic', type: 'strategeion', position: { x: 622, y: 238 }, data: { label: 'IF / ELSE', category: 'logic', subtitle: 'Lead score ≥ 70 → Branch A', agentColor: '#4A4A5A', agentName: 'Condition', agentInitial: 'IE', status: 'idle', config: {} } },
      ]);
      setEdges([
        { id: 'e1', source: 's-trigger', target: 's-plato' },
        { id: 'e2', source: 's-plato', target: 's-whatsapp' },
        { id: 'e3', source: 's-plato', target: 's-logic' },
      ]);
      flowLoaded.current = true;
    }
  }, [flowsData, setNodes, setEdges]);

  // Mutations
  const createMut = useMutation({
    mutationFn: createFlow,
    onSuccess: (res) => { setCurrentFlowId(res.id); toast.success('Flow saved'); },
    onError: () => toast.error('Failed to save flow'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateFlow(id, data),
    onSuccess: () => toast.success('Flow saved'),
    onError: () => toast.error('Failed to save'),
  });

  const runMut = useMutation({
    mutationFn: (flowId: string) => runFlow(flowId),
    onSuccess: (res) => {
      setRunning(true);
      toast.success(`Flow started — ${res.job_ids.length} job(s)`);
      setTimeout(() => setRunning(false), 3000);
    },
    onError: () => { toast.error('Failed to run flow'); setRunning(false); },
  });

  // Connection handler
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)),
    [setEdges],
  );

  // Drag-drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const raw = event.dataTransfer.getData('application/strategeion-node');
      if (!raw) return;

      try {
        const { category, label, data: nodeData } = JSON.parse(raw);
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });

        const colors: Record<string, string> = {
          trigger: '#1A5088', philosopher: '#123C69', god: '#7B5EA7',
          omega: '#6B21A8', action: '#6F7D4F', logic: '#4A4A5A',
        };
        const color = nodeData?.color || colors[category] || '#123C69';
        const initial = nodeData?.name?.slice(0, 2) || label.slice(0, 2);

        const subtitles: Record<string, string> = {
          trigger: 'Configure this trigger',
          philosopher: `${nodeData?.name || label} — Configure instruction`,
          god: `${nodeData?.name || label} — Domain execution`,
          omega: `${nodeData?.name || label} — Ω-tier capability`,
          action: 'Configure this action',
          logic: 'Set condition rules',
        };

        const newNode: Node = {
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'strategeion',
          position,
          data: {
            label: label.toUpperCase(),
            category: category as NodeCategory,
            subtitle: subtitles[category] || 'Configure this node',
            agentColor: color,
            agentName: nodeData?.name || label,
            agentInitial: initial,
            config: {},
            status: 'idle',
          },
        };
        setNodes((nds) => [...nds, newNode]);
        toast.success(`Added ${nodeData?.name || label}`);
      } catch (e) {
        console.error('Drop error:', e);
      }
    },
    [screenToFlowPosition, setNodes],
  );

  // Handlers
  const handleSave = useCallback(() => {
    setSaving(true);
    const flowData: FlowData = {
      nodes: nodes.map((n) => ({
        id: n.id, type: n.type || 'strategeion',
        position: n.position, data: n.data,
        width: n.width || 220, height: n.height,
      })),
      edges: edges.map((e) => ({
        id: e.id, source: e.source, target: e.target,
        sourceHandle: e.sourceHandle ?? undefined,
        targetHandle: e.targetHandle ?? undefined,
      })),
    };
    if (currentFlowId) {
      updateMut.mutate({ id: currentFlowId, data: { name: flowName, data: flowData } });
    } else {
      createMut.mutate({ name: flowName, data: flowData });
    }
    setSaving(false);
  }, [currentFlowId, flowName, nodes, edges, createMut, updateMut]);

  const handleRun = useCallback(() => {
    if (currentFlowId) runMut.mutate(currentFlowId);
    else toast.info('Save the flow first');
  }, [currentFlowId, runMut]);

  const handleTemplateSelect = useCallback((template: typeof FLOW_TEMPLATES[0]) => {
    setFlowName(template.title);
    setShowTemplates(false);
    setNodes([
      { id: 't-trig', type: 'strategeion', position: { x: 55, y: 130 }, data: { label: 'NEW LEAD ADDED', category: 'trigger', subtitle: 'When a new lead enters the CRM', agentColor: '#1A5088', agentName: 'Trigger', agentInitial: 'NL', status: 'idle', config: {} } },
      { id: 't-a1', type: 'strategeion', position: { x: 330, y: 60 }, data: { label: 'PLATO', category: 'philosopher', subtitle: 'Vision & Strategy — Analyse this lead', agentColor: '#123C69', agentName: 'Plato', agentInitial: 'Pl', status: 'idle', config: {} } },
      { id: 't-a2', type: 'strategeion', position: { x: 330, y: 240 }, data: { label: 'PYTHAGORAS', category: 'philosopher', subtitle: 'Score & Rank 0–100', agentColor: '#4A4A7A', agentName: 'Pythagoras', agentInitial: 'Py', status: 'idle', config: {} } },
      { id: 't-act', type: 'strategeion', position: { x: 620, y: 90 }, data: { label: 'SEND WHATSAPP', category: 'action', subtitle: 'Send template message', agentColor: '#6F7D4F', agentName: 'WhatsApp', agentInitial: 'WA', status: 'idle', config: {} } },
    ]);
    setEdges([
      { id: 'te1', source: 't-trig', target: 't-a1' },
      { id: 'te2', source: 't-trig', target: 't-a2' },
      { id: 'te3', source: 't-a1', target: 't-act' },
    ]);
    toast.success(`Loaded: ${template.title}`);
  }, [setNodes, setEdges]);

  const handleUpdateNode = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: newData } : n));
  }, [setNodes]);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F6F0E3', overflow: 'hidden' }}>

      {/* ══ TOP BAR ══════════════════════════════ */}
      <div style={{ height: 52, background: '#FCF8F0', borderBottom: '1px solid #DDD2BB', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 12, flexShrink: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(18,60,105,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 230 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg,#0F1722,#123C69)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(18,60,105,0.3)' }}>
            <Crosshair size={14} style={{ color: '#C9A24D' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 17, color: '#171A21', lineHeight: 1.1, letterSpacing: '-0.01em' }}>Strategeion</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#938C7A', lineHeight: 1, marginTop: 2 }}>Automation Builder</div>
          </div>
          <div style={{ width: 1, height: 26, background: '#DDD2BB', margin: '0 2px' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F6F0E3', border: '1px solid #DDD2BB', borderRadius: 9, padding: '5px 14px', minWidth: 220, maxWidth: 320 }}>
            <Edit3 size={12} style={{ color: '#938C7A', flexShrink: 0 }} />
            <input value={flowName} onChange={(e) => setFlowName(e.target.value)}
              style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 15, color: '#3D4047', background: 'transparent', border: 'none', outline: 'none', width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 310, justifyContent: 'flex-end' }}>
          <button onClick={() => setShowTemplates(!showTemplates)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #DDD2BB', background: 'transparent', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, color: '#3D4047', cursor: 'pointer' }}>
            <LayoutTemplate size={12} /> Templates
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 8, border: '1px solid #123C69', background: '#123C69', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, color: 'white', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            <Save size={12} /> {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleRun} disabled={runMut.isPending}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 8, border: 'none', background: running ? 'linear-gradient(135deg,#a8843a,#C9A24D)' : 'linear-gradient(135deg,#C9A24D,#D4B36A)', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 12, fontWeight: 600, color: '#0F1722', cursor: 'pointer', boxShadow: '0 2px 8px rgba(201,162,77,0.3)', opacity: runMut.isPending ? 0.6 : 1 }}>
            {runMut.isPending
              ? <div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(15,23,34,0.2)', borderTopColor: '#0F1722', animation: 'runSpin 0.8s linear infinite' }} />
              : <Zap size={13} />}
            {running ? 'Running…' : 'Run Flow'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#938C7A' }}>Activate</span>
            <div onClick={() => { setActivated(a => !a); toast.success(activated ? 'Deactivated' : 'Activated (will run on triggers)'); }}
              style={{ width: 34, height: 20, borderRadius: 10, background: activated ? '#4A7A3E' : '#DDD2BB', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', width: 14, height: 14, borderRadius: '50%', background: 'white', top: 3, left: activated ? 17 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Template dropdown */}
      {showTemplates && (
        <div style={{ position: 'absolute', top: 52, right: 280, zIndex: 100, background: '#FCF8F0', border: '1px solid #DDD2BB', borderRadius: 10, boxShadow: '0 8px 32px rgba(18,60,105,0.15)', padding: 12, width: 320 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#938C7A', marginBottom: 8 }}>Quick Start Templates</div>
          {FLOW_TEMPLATES.map((t) => (
            <div key={t.id} onClick={() => handleTemplateSelect(t)}
              style={{ padding: '10px 12px', borderRadius: 8, background: t.gradient, cursor: 'pointer', marginBottom: 6 }}>
              <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: 'white' }}>{t.title}</div>
              <div style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{t.desc}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{t.agents} · {t.nodes} nodes</div>
            </div>
          ))}
        </div>
      )}

      {/* ══ BODY ════════════════════════════════════════ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* ── LEFT PANEL ── */}
        <NodePalette onDragStart={() => {}} />

        {/* ── CANVAS ── */}
        <div style={{ flex: 1, position: 'relative' }} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{ style: { stroke: 'rgba(201,162,77,0.65)', strokeWidth: 2 }, type: 'smoothstep' }}
            connectionLineStyle={{ stroke: '#C9A24D', strokeWidth: 2 }}
            selectionMode={SelectionMode.Partial}
            fitView minZoom={0.25} maxZoom={2.5}
            style={{ background: '#EFE8D8' }}
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.5} color="rgba(178,158,122,0.42)" />
            <Controls style={{ display: 'flex', gap: 4, background: 'rgba(15,23,34,0.72)', borderRadius: 6, padding: 4, border: '1px solid rgba(255,255,255,0.1)' }} />
            <MiniMap style={{ width: 140, height: 84, background: 'rgba(15,23,34,0.72)', borderRadius: 7, border: '1px solid rgba(255,255,255,0.07)' }}
              maskColor="rgba(15,23,34,0.3)"
              nodeColor={(n) => (n.data as StrategeionNodeData).agentColor || '#1A5088'}
              pannable zoomable />
          </ReactFlow>
        </div>

        {/* ── RIGHT PANEL ── */}
        <ConfigPanel
          node={selectedNode as any}
          onClose={() => setSelectedNodeId(null)}
          onUpdateNode={handleUpdateNode}
        />

      </div>
    </div>
  );
}

// ─── Page export (wraps in ReactFlowProvider) ─────────────

export default function StrategeionPage() {
  return (
    <ReactFlowProvider>
      <StrategeionBuilder />
    </ReactFlowProvider>
  );
}
