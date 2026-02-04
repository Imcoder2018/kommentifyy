'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { emailTemplates } from '@/lib/email-templates-library';
import { htmlEmailTemplates, generateCompleteEmail, type HTMLEmailTemplate, type EmailSection } from '@/lib/html-email-templates';

// Email Node Component
function EmailNode({ data, id }: any) {
  return (
    <div style={{
      padding: '15px',
      borderRadius: '8px',
      border: data.isActive ? '2px solid #10b981' : '2px solid #6b7280',
      background: 'white',
      minWidth: '280px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#3b82f6', width: '12px', height: '12px' }} />
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (data.onDelete) data.onDelete(id);
        }}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          border: 'none',
          background: '#ef4444',
          color: 'white',
          cursor: 'pointer',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          zIndex: 10
        }}
        title="Delete email"
      >
        ×
      </button>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#6b7280', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', paddingRight: '30px' }}>
        <span>📧 Email {data.position + 1}</span>
        <span style={{ color: data.isActive ? '#10b981' : '#ef4444', fontSize: '10px' }}>
          {data.isActive ? '✓ Active' : '✗ Inactive'}
        </span>
      </div>
      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
        {data.subject || 'Untitled Email'}
      </div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px', maxHeight: '60px', overflow: 'hidden' }}>
        {data.body?.substring(0, 100) || 'No content'}...
      </div>
      <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600' }}>
        ⏱️ Delay: {data.delayHours || 0}h {data.delayMinutes || 0}m
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#10b981', width: '12px', height: '12px' }} />
    </div>
  );
}

function TriggerNode({ data }: any) {
  return (
    <div style={{
      padding: '20px',
      borderRadius: '50%',
      border: '3px solid #3b82f6',
      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      width: '120px',
      height: '120px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
      position: 'relative'
    }}>
      <div>
        <div style={{ fontSize: '24px', marginBottom: '5px' }}>🚀</div>
        <div style={{ fontSize: '12px' }}>{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#3b82f6', width: '14px', height: '14px', bottom: '-7px' }} />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  emailNode: EmailNode,
  triggerNode: TriggerNode,
};

export default function EmailSequencesPage() {
  const router = useRouter();
  const [sequences, setSequences] = useState<any[]>([]);
  const [selectedSequence, setSelectedSequence] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState<any>({ pending: 0, sent: 0, failed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [editingNode, setEditingNode] = useState<any>(null);
  const [seeding, setSeeding] = useState(false);
  const [showCreateSequence, setShowCreateSequence] = useState(false);
  const [showQueueDetails, setShowQueueDetails] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showHTMLDesigner, setShowHTMLDesigner] = useState(false);
  const [selectedHTMLTemplate, setSelectedHTMLTemplate] = useState<HTMLEmailTemplate | null>(null);
  const [queueEmails, setQueueEmails] = useState<any[]>([]);
  const [newSequence, setNewSequence] = useState({ name: '', description: '', type: '', trigger: 'manual' });
  const [showHTMLPreview, setShowHTMLPreview] = useState(false);
  const [showCustomHTML, setShowCustomHTML] = useState(false);
  const [editablePreviewMode, setEditablePreviewMode] = useState(false);
  const editablePreviewRef = useRef<HTMLDivElement>(null);
  
  // Update editable preview content when mode changes
  useEffect(() => {
    if (editablePreviewMode && editablePreviewRef.current && editingNode) {
      editablePreviewRef.current.innerHTML = editingNode.data.body;
      
      // Add click handlers for links and buttons
      const handleLinkClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if (link) {
          setSelectedLinkElement(link);
          setLinkEditData({
            text: link.textContent || '',
            url: link.getAttribute('href') || ''
          });
          setShowLinkEditor(true);
        }
      };
      
      // Add delete buttons to sections
      const sections = editablePreviewRef.current.querySelectorAll('table, tr, td, div[style*="background"], div[style*="padding"]');
      sections.forEach((section: Element) => {
        if ((section as HTMLElement).dataset.deleteBtn) return;
        (section as HTMLElement).dataset.deleteBtn = 'true';
        section.addEventListener('contextmenu', (e: Event) => {
          e.preventDefault();
          if (confirm('Delete this section?')) {
            section.remove();
          }
        });
      });
      
      const links = editablePreviewRef.current.querySelectorAll('a');
      links.forEach((link: Element) => {
        link.addEventListener('click', handleLinkClick);
        (link as HTMLElement).style.cursor = 'pointer';
        (link as HTMLElement).title = 'Click to edit link';
      });
      
      return () => {
        links.forEach((link: Element) => {
          link.removeEventListener('click', handleLinkClick);
        });
      };
    }
  }, [editablePreviewMode, editingNode]);
  const [customHTML, setCustomHTML] = useState('');
  const [showLinkEditor, setShowLinkEditor] = useState(false);
  const [selectedLinkElement, setSelectedLinkElement] = useState<HTMLElement | null>(null);
  const [linkEditData, setLinkEditData] = useState({ text: '', url: '' });

  // Fetch sequences
  const fetchSequences = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin-login');
      return;
    }

    try {
      const res = await fetch('/api/admin/email-sequences', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) { router.push('/admin-login'); return; }
      const data = await res.json();
      if (data.success) {
        setSequences(data.sequences);
        setSettings(data.settings);
        setStats(data.stats);
        if (data.sequences.length > 0 && !selectedSequence) {
          loadSequence(data.sequences[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  }, [router, selectedSequence]);

  useEffect(() => { fetchSequences(); }, [fetchSequences]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId));
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  const loadSequence = (sequence: any) => {
    setSelectedSequence(sequence);
    try {
      const parsedNodes = sequence.nodes ? JSON.parse(sequence.nodes) : [];
      const parsedEdges = sequence.edges ? JSON.parse(sequence.edges) : [];
      
      if (parsedNodes.length === 0 || !Array.isArray(parsedNodes)) {
        const defaultNodes: Node[] = [
          { id: 'trigger', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: sequence.trigger || 'Trigger' } }
        ];
        const defaultEdges: Edge[] = [];
        
        if (sequence.emails && Array.isArray(sequence.emails)) {
          sequence.emails.forEach((email: any, index: number) => {
            const nodeId = `email_${index}`;
            defaultNodes.push({
              id: nodeId,
              type: 'emailNode',
              position: { x: 250, y: 200 + (index * 200) },
              data: {
                position: index,
                subject: email.subject,
                body: email.body,
                delayHours: email.delayHours,
                delayMinutes: email.delayMinutes,
                isActive: email.isActive,
                emailId: email.id,
                onDelete: deleteNode
              }
            });
            
            if (index === 0) {
              defaultEdges.push({ id: `trigger-${nodeId}`, source: 'trigger', target: nodeId, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } });
            } else {
              defaultEdges.push({ id: `email_${index - 1}-${nodeId}`, source: `email_${index - 1}`, target: nodeId, animated: true, style: { stroke: '#10b981', strokeWidth: 2 } });
            }
          });
        }
        
        setNodes(defaultNodes);
        setEdges(defaultEdges);
      } else {
        // Add delete handler to existing nodes
        const nodesWithDelete = parsedNodes.map((n: Node) => ({
          ...n,
          data: { ...n.data, onDelete: deleteNode }
        }));
        setNodes(nodesWithDelete);
        setEdges(parsedEdges);
      }
    } catch (error) {
      console.error('Parse error:', error);
      setNodes([]);
      setEdges([]);
    }
  };

  const addEmailNode = () => {
    const newNodeId = `email_${nodes.filter(n => n.type === 'emailNode').length}`;
    const lastEmailNode = nodes.filter(n => n.type === 'emailNode').pop();
    
    const newNode: Node = {
      id: newNodeId,
      type: 'emailNode',
      position: { x: lastEmailNode ? lastEmailNode.position.x : 250, y: lastEmailNode ? lastEmailNode.position.y + 200 : 250 },
      data: { 
        position: nodes.filter(n => n.type === 'emailNode').length, 
        subject: 'New Email', 
        body: 'Email content here...', 
        delayHours: 24, 
        delayMinutes: 0, 
        isActive: true,
        onDelete: deleteNode
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    if (lastEmailNode) {
      setEdges((eds) => [...eds, { id: `${lastEmailNode.id}-${newNodeId}`, source: lastEmailNode.id, target: newNodeId, animated: true, style: { stroke: '#10b981', strokeWidth: 2 } }]);
    } else {
      const triggerNode = nodes.find(n => n.type === 'triggerNode');
      if (triggerNode) {
        setEdges((eds) => [...eds, { id: `${triggerNode.id}-${newNodeId}`, source: triggerNode.id, target: newNodeId, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }]);
      }
    }
  };

  const onNodeClick = useCallback((_: any, node: Node) => {
    if (node.type === 'emailNode') {
      setEditingNode(node);
      setShowNodeEditor(true);
    }
  }, []);

  const saveNodeEdits = async () => {
    if (!editingNode) return;
    
    // Update local nodes state
    const updatedNodes = nodes.map((node) => 
      node.id === editingNode.id ? { ...node, data: { ...node.data, ...editingNode.data } } : node
    );
    setNodes(updatedNodes);
    setShowNodeEditor(false);
    setEditingNode(null);
    setEditablePreviewMode(false);
    
    // Auto-save to database
    if (selectedSequence) {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      
      try {
        const emailNodes = updatedNodes.filter(n => n.type === 'emailNode');
        const emails = emailNodes.map((node, index) => ({
          nodeId: node.id,
          position: index,
          subject: node.data.subject,
          body: node.data.body,
          delayHours: node.data.delayHours || 0,
          delayMinutes: node.data.delayMinutes || 0,
          isActive: node.data.isActive !== false,
          emailId: node.data.emailId
        }));
        
        const res = await fetch('/api/admin/email-sequences', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedSequence.id,
            name: selectedSequence.name,
            type: selectedSequence.type,
            description: selectedSequence.description,
            trigger: selectedSequence.trigger,
            isActive: selectedSequence.isActive,
            nodes: updatedNodes,
            edges: edges,
            emails: emails
          })
        });
        
        const data = await res.json();
        if (data.success) {
          console.log('✅ Email changes auto-saved');
        } else {
          console.error('❌ Auto-save failed:', data.error);
        }
      } catch (error) {
        console.error('❌ Auto-save error:', error);
      } finally {
        setSaving(false);
      }
    }
  };

  const saveSequence = async () => {
    if (!selectedSequence) return;
    setSaving(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const emailNodes = nodes.filter(n => n.type === 'emailNode');
      const emails = emailNodes.map((node, index) => ({
        nodeId: node.id,
        position: index,
        subject: node.data.subject,
        body: node.data.body,
        delayHours: node.data.delayHours || 0,
        delayMinutes: node.data.delayMinutes || 0,
        isActive: node.data.isActive !== false,
        emailId: node.data.emailId
      }));
      
      const res = await fetch('/api/admin/email-sequences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSequence.id,
          name: selectedSequence.name,
          type: selectedSequence.type,
          description: selectedSequence.description,
          trigger: selectedSequence.trigger,
          isActive: selectedSequence.isActive,
          nodes: nodes,
          edges: edges,
          emails: emails
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert('✅ Sequence saved!');
        fetchSequences();
      } else {
        alert('❌ Failed: ' + data.error);
      }
    } catch (error) {
      alert('❌ Save failed');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      await fetch('/api/admin/email-sequences', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('✅ Settings updated!');
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const seedSequences = async () => {
    setSeeding(true);
    const token = localStorage.getItem('adminToken');
    
    try {
      const res = await fetch('/api/admin/email-sequences/seed', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`✅ Seeded ${data.created?.length || 0} sequences successfully!`);
        fetchSequences();
      } else {
        alert('❌ Failed to seed: ' + data.error);
      }
    } catch (error) {
      console.error('Seed error:', error);
      alert('❌ Failed to seed sequences');
    } finally {
      setSeeding(false);
    }
  };

  const createNewSequence = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/api/admin/email-sequences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSequence.name,
          type: newSequence.type || `custom_${Date.now()}`,
          description: newSequence.description,
          trigger: newSequence.trigger,
          isActive: true,
          nodes: JSON.stringify([{ id: 'trigger', type: 'triggerNode', position: { x: 250, y: 50 }, data: { label: newSequence.trigger } }]),
          edges: JSON.stringify([]),
          emails: []
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Sequence created!');
        setShowCreateSequence(false);
        setNewSequence({ name: '', description: '', type: '', trigger: 'manual' });
        fetchSequences();
      }
    } catch (error) {
      console.error('Create error:', error);
    }
  };

  const fetchQueueDetails = useCallback(async (status: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('Please login first');
      router.push('/admin-login');
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/email-sequences/queue?status=${status}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        alert('Session expired. Please login again');
        localStorage.removeItem('adminToken');
        router.push('/admin-login');
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setQueueEmails(data.emails || []);
        setShowQueueDetails(true);
      } else {
        alert('Failed to fetch queue details: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Queue fetch error:', error);
      alert('Failed to fetch queue details');
    }
  }, [router]);

  const toggleSequenceActive = async (sequenceId: string, isActive: boolean) => {
    const token = localStorage.getItem('adminToken');
    try {
      const seq = sequences.find(s => s.id === sequenceId);
      await fetch('/api/admin/email-sequences', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...seq, isActive })
      });
      fetchSequences();
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  const deleteSequence = async (sequenceId: string) => {
    if (!confirm('Are you sure you want to delete this sequence? This cannot be undone.')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`/api/admin/email-sequences?id=${sequenceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Sequence deleted!');
        fetchSequences();
        setSelectedSequence(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete sequence');
    }
  };

  const applyTemplate = (template: any) => {
    if (editingNode) {
      setEditingNode({
        ...editingNode,
        data: {
          ...editingNode.data,
          subject: template.subject,
          body: template.body
        }
      });
    }
    setShowTemplateSelector(false);
  };

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      <div style={{ background: 'white', padding: '20px 30px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>📧 Email Sequence Builder</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Visual drag-and-drop email automation</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCreateSequence(true)} style={{
            padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
          }}>
            ➕ New Sequence
          </button>
          <button onClick={saveSequence} disabled={saving || !selectedSequence} style={{
            padding: '10px 20px', background: saving ? '#9ca3af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '600'
          }}>
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ width: '320px', background: 'white', borderRight: '1px solid #e5e7eb', overflow: 'auto' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#6b7280' }}>
              QUEUE STATS 
              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'normal', marginLeft: '8px' }}>(click to view details)</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div onClick={() => fetchQueueDetails('pending')} style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending || 0}</div>
                <div style={{ fontSize: '11px', color: '#92400e' }}>Pending</div>
              </div>
              <div onClick={() => fetchQueueDetails('sent')} style={{ padding: '12px', background: '#d1fae5', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{stats.sent || 0}</div>
                <div style={{ fontSize: '11px', color: '#065f46' }}>Sent</div>
              </div>
              <div onClick={() => fetchQueueDetails('failed')} style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{stats.failed || 0}</div>
                <div style={{ fontSize: '11px', color: '#991b1b' }}>Failed</div>
              </div>
              <div onClick={() => fetchQueueDetails('cancelled')} style={{ padding: '12px', background: '#e5e7eb', borderRadius: '8px', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>{stats.cancelled || 0}</div>
                <div style={{ fontSize: '11px', color: '#374151' }}>Cancelled</div>
              </div>
            </div>
          </div>

          {settings && (
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#6b7280' }}>AUTOMATION SETTINGS</h3>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '5px' }}>
                  Batch Size (emails per run)
                </label>
                <input 
                  type="number" 
                  value={settings.batchSize} 
                  onChange={(e) => setSettings({ ...settings, batchSize: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} 
                />
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                  Recommended: 50 (free), 100 (10K users), 500 (100K users)
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={settings.isEnabled}
                    onChange={(e) => setSettings({ ...settings, isEnabled: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Automation Enabled</span>
                </label>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', marginLeft: '24px' }}>
                  {settings.isEnabled ? '✅ Active - Processing queue every minute' : '⏸️ Paused - Not processing emails'}
                </div>
              </div>
              <button onClick={updateSettings} style={{ width: '100%', padding: '10px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                💾 Update Settings
              </button>
            </div>
          )}

          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#6b7280' }}>SEQUENCES ({sequences.length})</h3>
            {sequences.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', background: '#f9fafb', borderRadius: '8px', border: '2px dashed #d1d5db' }}>
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>📧</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '10px' }}>No sequences found</div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>Get started by seeding default sequences</div>
                <button
                  onClick={seedSequences}
                  disabled={seeding}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: seeding ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: seeding ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  {seeding ? '🌱 Seeding...' : '🌱 Seed Default Sequences'}
                </button>
              </div>
            ) : (
              <>
                {sequences.map((seq) => (
                  <div key={seq.id} style={{
                    padding: '12px', marginBottom: '8px', background: selectedSequence?.id === seq.id ? '#ede9fe' : '#f9fafb',
                    border: selectedSequence?.id === seq.id ? '2px solid #8b5cf6' : '1px solid #e5e7eb', borderRadius: '8px'
                  }}>
                    <div onClick={() => loadSequence(seq)} style={{ cursor: 'pointer', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>{seq.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <label onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={seq.isActive}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSequenceActive(seq.id, e.target.checked);
                              }}
                              style={{ width: '14px', height: '14px' }}
                            />
                            <span style={{ fontSize: '10px', color: seq.isActive ? '#10b981' : '#ef4444', fontWeight: '600' }}>
                              {seq.isActive ? 'ON' : 'OFF'}
                            </span>
                          </label>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSequence(seq.id);
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}
                            title="Delete sequence"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>
                        {seq.emails?.length || 0} emails • {seq.trigger}
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={seedSequences}
                  disabled={seeding}
                  style={{
                    width: '100%',
                    padding: '10px',
                    background: seeding ? '#9ca3af' : '#fbbf24',
                    color: seeding ? 'white' : '#78350f',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: seeding ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    fontSize: '12px',
                    marginTop: '10px'
                  }}
                >
                  {seeding ? '🌱 Loading...' : '🌱 Load More Sequences'}
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {selectedSequence ? (
            <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
              onConnect={onConnect} onNodeClick={onNodeClick} nodeTypes={nodeTypes} fitView>
              <Background />
              <Controls />
              <MiniMap />
              <Panel position="top-right">
                <button onClick={addEmailNode} style={{ padding: '12px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  + Add Email
                </button>
              </Panel>
            </ReactFlow>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', background: '#f9fafb' }}>
              <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>📧</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', marginBottom: '15px' }}>
                  {sequences.length === 0 ? 'Welcome to Email Sequences!' : 'Select a sequence to edit'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '30px' }}>
                  {sequences.length === 0 ? (
                    <>Start by seeding default email sequences from the sidebar. You'll get 3 pre-built sequences: Onboarding (5 emails), Expired Trial (4 emails), and Paid Customer (3 emails).</>
                  ) : (
                    <>Click on a sequence from the left sidebar to view and edit the email flow. You can drag nodes, edit content, add delays, and customize everything visually.</>
                  )}
                </div>
                {sequences.length === 0 && (
                  <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#1f2937' }}>
                      Quick Start Guide:
                    </div>
                    <ol style={{ textAlign: 'left', fontSize: '13px', color: '#6b7280', lineHeight: '1.8', paddingLeft: '20px' }}>
                      <li>Look at the left sidebar</li>
                      <li>Click "🌱 Seed Default Sequences"</li>
                      <li>Select a sequence to start editing</li>
                      <li>Click nodes to edit content</li>
                      <li>Save your changes</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showNodeEditor && editingNode && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '900px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Edit Email</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Subject</label>
              <input value={editingNode.data.subject} onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, subject: e.target.value } })}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>Body</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setShowHTMLDesigner(true)} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>
                    🎨 HTML Design
                  </button>
                  <button onClick={() => setShowTemplateSelector(true)} style={{ padding: '6px 12px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    📧 Text Template
                  </button>
                  <button onClick={() => {
                    setCustomHTML(editingNode.data.body);
                    setShowCustomHTML(true);
                  }} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>
                    📝 Paste HTML
                  </button>
                </div>
              </div>
              {editingNode.data.body.includes('<!DOCTYPE html>') || editingNode.data.body.includes('<table') ? (
                <div>
                  <div style={{ 
                    maxHeight: '500px', 
                    overflow: 'auto', 
                    border: editablePreviewMode ? '2px solid #3b82f6' : '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    padding: '15px',
                    background: editablePreviewMode ? '#eff6ff' : '#f9fafb',
                    position: 'relative'
                  }}>
                    {editablePreviewMode && (
                      <div style={{
                        position: 'sticky',
                        top: '0',
                        left: '0',
                        right: '0',
                        background: '#3b82f6',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        zIndex: 10
                      }}>
                        ✏️ EDIT MODE: Click text to edit • Click links/buttons to change URL • Right-click sections to delete
                      </div>
                    )}
                    {editablePreviewMode ? (
                      <div 
                        ref={editablePreviewRef}
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        style={{
                          outline: '2px dashed #3b82f6',
                          outlineOffset: '4px',
                          minHeight: '100px',
                          cursor: 'text'
                        }}
                      />
                    ) : (
                      <div 
                        style={{
                          minHeight: '100px'
                        }}
                        dangerouslySetInnerHTML={{ __html: editingNode.data.body }}
                      />
                    )}
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowHTMLPreview(!showHTMLPreview)} style={{ 
                      flex: 1,
                      padding: '8px', 
                      background: '#6b7280', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      cursor: 'pointer' 
                    }}>
                      {showHTMLPreview ? '📝 Edit Code' : '👁️ View Code'}
                    </button>
                    <button onClick={() => {
                      if (editablePreviewMode) {
                        // Save changes from editable preview
                        if (editablePreviewRef.current) {
                          const updatedHTML = editablePreviewRef.current.innerHTML;
                          setEditingNode({ ...editingNode, data: { ...editingNode.data, body: updatedHTML } });
                          alert('✅ Changes saved! Click "Save Changes" below to persist.');
                        }
                      }
                      setEditablePreviewMode(!editablePreviewMode);
                    }} style={{ 
                      flex: 1,
                      padding: '8px', 
                      background: editablePreviewMode ? '#10b981' : '#3b82f6', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px', 
                      fontSize: '12px', 
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}>
                      {editablePreviewMode ? '💾 Save Edits' : '🎨 Edit Design'}
                    </button>
                  </div>
                  {showHTMLPreview && (
                    <textarea 
                      value={editingNode.data.body} 
                      onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, body: e.target.value } })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '11px', minHeight: '200px', marginTop: '10px', fontFamily: 'monospace' }} 
                      placeholder="HTML code..."
                    />
                  )}
                </div>
              ) : (
                <textarea 
                  value={editingNode.data.body} 
                  onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, body: e.target.value } })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', minHeight: '200px' }} 
                  placeholder="Email body..."
                />
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Delay (hours)</label>
                <input type="number" value={editingNode.data.delayHours} onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, delayHours: parseInt(e.target.value) } })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Delay (minutes)</label>
                <input type="number" value={editingNode.data.delayMinutes} onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, delayMinutes: parseInt(e.target.value) } })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={saveNodeEdits} style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Save Changes
              </button>
              <button onClick={() => {
                setShowNodeEditor(false);
                setEditablePreviewMode(false);
              }} style={{ flex: 1, padding: '12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Sequence Modal */}
      {showCreateSequence && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Create New Sequence</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Sequence Name</label>
              <input value={newSequence.name} onChange={(e) => setNewSequence({ ...newSequence, name: e.target.value })}
                placeholder="e.g., Black Friday Campaign"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Description (optional)</label>
              <input value={newSequence.description} onChange={(e) => setNewSequence({ ...newSequence, description: e.target.value })}
                placeholder="Brief description"
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Trigger</label>
              <select value={newSequence.trigger} onChange={(e) => setNewSequence({ ...newSequence, trigger: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}>
                <option value="manual">Manual</option>
                <option value="signup">User Signup</option>
                <option value="trial_expired">Trial Expired</option>
                <option value="payment">Payment Received</option>
                <option value="inactive_30_days">Inactive 30 Days</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={createNewSequence} disabled={!newSequence.name} style={{ flex: 1, padding: '12px', background: newSequence.name ? '#10b981' : '#9ca3af', color: 'white', border: 'none', borderRadius: '8px', cursor: newSequence.name ? 'pointer' : 'not-allowed', fontWeight: '600' }}>
                Create Sequence
              </button>
              <button onClick={() => { setShowCreateSequence(false); setNewSequence({ name: '', description: '', type: '', trigger: 'manual' }); }} style={{ flex: 1, padding: '12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Queue Details Modal */}
      {showQueueDetails && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            {/* Sticky Header with Close Button */}
            <div style={{ 
              position: 'sticky', 
              top: 0, 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              padding: '20px 25px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              zIndex: 10,
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, color: 'white' }}>📧 Queue Details</h2>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{queueEmails.length} emails in queue</p>
              </div>
              <button 
                onClick={() => setShowQueueDetails(false)}
                style={{ 
                  padding: '10px 20px', 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  border: '2px solid rgba(255,255,255,0.3)', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }}
              >
                ✕ Close
              </button>
            </div>
            
            {/* Scrollable Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '20px 25px' }}>
              {queueEmails.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                  <p style={{ color: '#6b7280', fontSize: '16px' }}>No emails in this category</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {queueEmails.map((email: any, idx: number) => (
                    <div key={idx} style={{ 
                      padding: '18px', 
                      background: '#f9fafb', 
                      borderRadius: '12px', 
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', gap: '15px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                            {email.subject || `${email.sequenceType} - Email #${email.emailNumber}`}
                          </div>
                          <div style={{ fontSize: '13px', color: '#667eea', fontWeight: '500' }}>
                            To: {email.recipientEmail || email.recipientName || 'Unknown'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                            {new Date(email.scheduledFor || email.sentAt).toLocaleString()}
                          </div>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '3px 8px', 
                            borderRadius: '4px', 
                            fontSize: '10px', 
                            fontWeight: '600',
                            background: email.status === 'sent' ? '#d1fae5' : email.status === 'failed' ? '#fee2e2' : email.status === 'cancelled' ? '#e5e7eb' : '#fef3c7',
                            color: email.status === 'sent' ? '#065f46' : email.status === 'failed' ? '#991b1b' : email.status === 'cancelled' ? '#374151' : '#92400e'
                          }}>
                            {email.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap' }}>
                        <span>📋 Sequence: <strong>{email.sequenceType}</strong></span>
                        <span>📧 Email #{email.emailNumber}</span>
                        <span>🔄 Attempts: {email.attempts || 0}</span>
                        {email.error && <span style={{ color: '#dc2626' }}>❌ {email.error}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer with Close Button (for convenience) */}
            <div style={{ 
              padding: '15px 25px', 
              background: '#f9fafb', 
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button 
                onClick={() => setShowQueueDetails(false)}
                style={{ 
                  padding: '12px 30px', 
                  background: '#6b7280', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Close Queue Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '800px', maxHeight: '80vh', overflow: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Choose Email Template</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {emailTemplates.map((template) => (
                <div key={template.id} onClick={() => applyTemplate(template)} style={{
                  padding: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: '#ffffff'
                }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.background = '#faf5ff'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#ffffff'; }}>
                  <div style={{ fontSize: '11px', color: '#8b5cf6', fontWeight: '600', marginBottom: '8px' }}>
                    {template.category}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                    {template.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                    {template.subject}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4' }}>
                    {template.body.substring(0, 80)}...
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowTemplateSelector(false)} style={{ width: '100%', marginTop: '20px', padding: '12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* HTML Email Designer Modal */}
      {showHTMLDesigner && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '95%', maxWidth: '1400px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🎨 HTML Email Designer</h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '5px 0 0 0' }}>Choose a template and customize it visually</p>
              </div>
              <button onClick={() => {
                setShowHTMLDesigner(false);
                setSelectedHTMLTemplate(null);
              }} style={{ padding: '8px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                Close
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {!selectedHTMLTemplate ? (
                /* Template Selection */
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>Choose a Design Template</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {htmlEmailTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedHTMLTemplate({ ...template })}
                        style={{
                          padding: '20px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '15px' }}>{template.thumbnail}</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '5px', textAlign: 'center' }}>
                          {template.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#3b82f6', textAlign: 'center', marginBottom: '10px' }}>
                          {template.category}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                          {template.sections.length} sections
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Template Customization */
                <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px', height: '100%' }}>
                  {/* Left: Sections Editor */}
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '20px', overflow: 'auto' }}>
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Sections</h3>
                      <button 
                        onClick={() => setSelectedHTMLTemplate(null)}
                        style={{ padding: '6px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        ← Back
                      </button>
                    </div>

                    {selectedHTMLTemplate.sections.map((section, idx) => (
                      <div key={section.id} style={{ marginBottom: '15px', background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
                            {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                          </div>
                          {section.editable && (
                            <button
                              onClick={() => {
                                const newSections = selectedHTMLTemplate.sections.filter((_, i) => i !== idx);
                                setSelectedHTMLTemplate({ ...selectedHTMLTemplate, sections: newSections });
                              }}
                              style={{ padding: '4px 8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' }}
                            >
                              Delete
                            </button>
                          )}
                        </div>

                        {section.editable && (
                          <div style={{ fontSize: '11px' }}>
                            {Object.entries(section.content).map(([key, value]) => (
                              <div key={key} style={{ marginBottom: '8px' }}>
                                <label style={{ display: 'block', color: '#6b7280', marginBottom: '3px', fontSize: '10px', textTransform: 'capitalize' }}>
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                {key.includes('Text') || key.includes('text') || key === 'subtitle' ? (
                                  <textarea
                                    value={value}
                                    onChange={(e) => {
                                      const newSections = [...selectedHTMLTemplate.sections];
                                      newSections[idx].content[key] = e.target.value;
                                      setSelectedHTMLTemplate({ ...selectedHTMLTemplate, sections: newSections });
                                    }}
                                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '11px', minHeight: '60px' }}
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => {
                                      const newSections = [...selectedHTMLTemplate.sections];
                                      newSections[idx].content[key] = e.target.value;
                                      setSelectedHTMLTemplate({ ...selectedHTMLTemplate, sections: newSections });
                                    }}
                                    style={{ width: '100%', padding: '6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '11px' }}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        const newSection: EmailSection = {
                          id: `section_${Date.now()}`,
                          type: 'text',
                          editable: true,
                          content: { text: 'New section content' }
                        };
                        setSelectedHTMLTemplate({
                          ...selectedHTMLTemplate,
                          sections: [...selectedHTMLTemplate.sections, newSection]
                        });
                      }}
                      style={{ width: '100%', padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      + Add Section
                    </button>
                  </div>

                  {/* Right: Live Preview */}
                  <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '20px', overflow: 'auto' }}>
                    <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>Preview</h3>
                      <button
                        onClick={() => {
                          const html = generateCompleteEmail(selectedHTMLTemplate);
                          if (editingNode) {
                            setEditingNode({
                              ...editingNode,
                              data: {
                                ...editingNode.data,
                                body: html
                              }
                            });
                          }
                          setShowHTMLDesigner(false);
                          setSelectedHTMLTemplate(null);
                          alert('✅ HTML design applied to email!');
                        }}
                        style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        Apply Design
                      </button>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', maxWidth: '600px', margin: '0 auto' }}>
                      <div dangerouslySetInnerHTML={{ __html: generateCompleteEmail(selectedHTMLTemplate) }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Link Editor Modal */}
      {showLinkEditor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', width: '450px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>🔗 Edit Link</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Link Text</label>
              <input
                value={linkEditData.text}
                onChange={(e) => setLinkEditData({ ...linkEditData, text: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                placeholder="Button text..."
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px' }}>Link URL</label>
              <input
                value={linkEditData.url}
                onChange={(e) => setLinkEditData({ ...linkEditData, url: e.target.value })}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                placeholder="https://..."
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  if (selectedLinkElement) {
                    selectedLinkElement.textContent = linkEditData.text;
                    selectedLinkElement.setAttribute('href', linkEditData.url);
                    // Update the editingNode with new HTML
                    if (editablePreviewRef.current) {
                      setEditingNode({
                        ...editingNode,
                        data: { ...editingNode.data, body: editablePreviewRef.current.innerHTML }
                      });
                    }
                  }
                  setShowLinkEditor(false);
                  setSelectedLinkElement(null);
                }}
                style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Save Link
              </button>
              <button
                onClick={() => {
                  if (selectedLinkElement && confirm('Delete this link/button?')) {
                    selectedLinkElement.remove();
                    if (editablePreviewRef.current) {
                      setEditingNode({
                        ...editingNode,
                        data: { ...editingNode.data, body: editablePreviewRef.current.innerHTML }
                      });
                    }
                  }
                  setShowLinkEditor(false);
                  setSelectedLinkElement(null);
                }}
                style={{ padding: '12px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                🗑️ Delete
              </button>
              <button
                onClick={() => {
                  setShowLinkEditor(false);
                  setSelectedLinkElement(null);
                }}
                style={{ padding: '12px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom HTML Paste Modal */}
      {showCustomHTML && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1003 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '900px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>📝 Paste Your HTML Code</h2>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
              Paste your custom HTML email code below. You can use variables like {`{{firstName}}`}, {`{{productName}}`}, etc.
            </p>
            
            <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>HTML Code</label>
                <textarea
                  value={customHTML}
                  onChange={(e) => setCustomHTML(e.target.value)}
                  style={{
                    width: '100%',
                    height: 'calc(100% - 30px)',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    resize: 'none'
                  }}
                  placeholder="Paste your HTML code here..."
                />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>Preview</label>
                <div style={{
                  width: '100%',
                  height: 'calc(100% - 30px)',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'auto',
                  background: '#f9fafb',
                  padding: '12px'
                }}>
                  {customHTML ? (
                    <div dangerouslySetInnerHTML={{ __html: customHTML }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 20px' }}>
                      Preview will appear here...
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  if (editingNode && customHTML) {
                    setEditingNode({
                      ...editingNode,
                      data: {
                        ...editingNode.data,
                        body: customHTML
                      }
                    });
                    setShowCustomHTML(false);
                    setCustomHTML('');
                    alert('✅ Custom HTML applied!');
                  } else {
                    alert('Please paste HTML code first');
                  }
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ✅ Apply HTML
              </button>
              <button
                onClick={() => {
                  setShowCustomHTML(false);
                  setCustomHTML('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
