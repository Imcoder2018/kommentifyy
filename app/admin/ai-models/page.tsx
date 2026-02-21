'use client';

import { useEffect, useState } from 'react';

interface AIModel {
  id: string;
  modelId: string;
  name: string;
  provider: string;
  apiSource: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  maxContextTokens: number;
  maxOutputTokens: number;
  reasoningScore: number;
  writingScore: number;
  codingScore: number;
  speedScore: number;
  category: string;
  isReasoningModel: boolean;
  isMultimodal: boolean;
  isEnabled: boolean;
  isFeatured: boolean;
  description: string | null;
}

export default function AIModelsAdmin() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    provider: '',
    enabled: '',
    search: ''
  });
  const [stats, setStats] = useState<any>({});
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newModel, setNewModel] = useState<Partial<AIModel>>({
    modelId: '',
    name: '',
    provider: '',
    apiSource: 'openrouter',
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    maxContextTokens: 4096,
    maxOutputTokens: 4096,
    reasoningScore: 5,
    writingScore: 5,
    codingScore: 5,
    speedScore: 5,
    category: 'standard',
    isReasoningModel: false,
    isMultimodal: false,
    isEnabled: true,
    isFeatured: false,
    description: ''
  });

  useEffect(() => {
    fetchModels();
  }, [filter]);

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.provider) params.append('provider', filter.provider);
      if (filter.enabled) params.append('enabled', filter.enabled);

      const response = await fetch(`/api/admin/ai-models?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        let filteredModels = data.models;
        if (filter.search) {
          const search = filter.search.toLowerCase();
          filteredModels = filteredModels.filter((m: AIModel) =>
            m.name.toLowerCase().includes(search) ||
            m.modelId.toLowerCase().includes(search) ||
            m.provider.toLowerCase().includes(search)
          );
        }
        setModels(filteredModels);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = async (modelId: string, field: 'isEnabled' | 'isFeatured') => {
    try {
      const token = localStorage.getItem('adminToken');
      const model = models.find(m => m.modelId === modelId);
      if (!model) return;

      const response = await fetch('/api/admin/ai-models', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          modelId,
          [field]: !model[field]
        })
      });

      if (response.ok) {
        setModels(models.map(m => 
          m.modelId === modelId ? { ...m, [field]: !m[field] } : m
        ));
      }
    } catch (error) {
      console.error('Error toggling model:', error);
    }
  };

  const updateModel = async () => {
    if (!editingModel) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/ai-models', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingModel)
      });

      if (response.ok) {
        setModels(models.map(m => 
          m.modelId === editingModel.modelId ? editingModel : m
        ));
        setEditingModel(null);
      }
    } catch (error) {
      console.error('Error updating model:', error);
    }
  };

  const addModel = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/ai-models', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newModel)
      });

      if (response.ok) {
        fetchModels();
        setShowAddModal(false);
        setNewModel({
          modelId: '',
          name: '',
          provider: '',
          apiSource: 'openrouter',
          inputCostPer1M: 0,
          outputCostPer1M: 0,
          maxContextTokens: 4096,
          maxOutputTokens: 4096,
          reasoningScore: 5,
          writingScore: 5,
          codingScore: 5,
          speedScore: 5,
          category: 'standard',
          isReasoningModel: false,
          isMultimodal: false,
          isEnabled: true,
          isFeatured: false,
          description: ''
        });
      }
    } catch (error) {
      console.error('Error adding model:', error);
    }
  };

  const deleteModel = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/ai-models?modelId=${modelId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setModels(models.filter(m => m.modelId !== modelId));
      }
    } catch (error) {
      console.error('Error deleting model:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      premium: '#9333ea',
      standard: '#2563eb',
      budget: '#16a34a',
      free: '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      openai: '#10a37f',
      anthropic: '#d97706',
      google: '#4285f4',
      meta: '#0668E1',
      mistral: '#ff7000',
      deepseek: '#0066ff',
      xai: '#000000',
      perplexity: '#20808d'
    };
    return colors[provider] || '#6b7280';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading AI models...</div>;

  return (
    <div style={{ padding: '20px', background: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#693fe9', margin: 0 }}>
            AI Models Management
          </h1>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 24px',
              background: '#693fe9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            + Add New Model
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Models</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#693fe9' }}>{models.length}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Enabled</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{stats.total || models.filter(m => m.isEnabled).length}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Featured</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{models.filter(m => m.isFeatured).length}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>Premium</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9333ea' }}>{models.filter(m => m.category === 'premium').length}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search models..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px',
                minWidth: '250px'
              }}
            />
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            >
              <option value="">All Categories</option>
              <option value="premium">Premium</option>
              <option value="standard">Standard</option>
              <option value="budget">Budget</option>
              <option value="free">Free</option>
            </select>
            <select
              value={filter.provider}
              onChange={(e) => setFilter({ ...filter, provider: e.target.value })}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            >
              <option value="">All Providers</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google</option>
              <option value="meta">Meta</option>
              <option value="mistral">Mistral</option>
              <option value="deepseek">DeepSeek</option>
              <option value="xai">xAI</option>
              <option value="perplexity">Perplexity</option>
            </select>
            <select
              value={filter.enabled}
              onChange={(e) => setFilter({ ...filter, enabled: e.target.value })}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                fontSize: '14px'
              }}
            >
              <option value="">All Status</option>
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </div>
        </div>

        {/* Models Table */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Model</th>
                  <th style={{ padding: '15px 10px', textAlign: 'left', fontWeight: '600' }}>Provider</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>API</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Input $/1M</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Output $/1M</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Context</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Writing</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Speed</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Enabled</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Featured</th>
                  <th style={{ padding: '15px 10px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr key={model.modelId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: '600', color: '#333' }}>{model.name}</div>
                      <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace' }}>{model.modelId}</div>
                      {model.isReasoningModel && (
                        <span style={{ fontSize: '10px', background: '#fef3c7', color: '#92400e', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>
                          🧠 Reasoning
                        </span>
                      )}
                      {model.isMultimodal && (
                        <span style={{ fontSize: '10px', background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>
                          🖼️ Vision
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        background: getProviderColor(model.provider),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {model.provider}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <span style={{
                        background: getCategoryColor(model.category),
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {model.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '11px' }}>
                      {model.apiSource === 'openai' ? '🔑 OpenAI' : '🌐 OpenRouter'}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600' }}>
                      ${model.inputCostPer1M.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '600' }}>
                      ${model.outputCostPer1M.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center', fontSize: '12px' }}>
                      {model.maxContextTokens >= 1000000 
                        ? `${(model.maxContextTokens / 1000000).toFixed(1)}M` 
                        : model.maxContextTokens >= 1000 
                          ? `${(model.maxContextTokens / 1000).toFixed(0)}K` 
                          : model.maxContextTokens}
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: `linear-gradient(to top, #e0e0e0 ${100 - model.writingScore * 10}%, #693fe9 ${100 - model.writingScore * 10}%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {model.writingScore}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: `linear-gradient(to top, #e0e0e0 ${100 - model.speedScore * 10}%, #16a34a ${100 - model.speedScore * 10}%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {model.speedScore}
                      </div>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleModel(model.modelId, 'isEnabled')}
                        style={{
                          width: '50px',
                          height: '26px',
                          borderRadius: '13px',
                          border: 'none',
                          background: model.isEnabled ? '#16a34a' : '#d1d5db',
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: 'white',
                          position: 'absolute',
                          top: '2px',
                          left: model.isEnabled ? '26px' : '2px',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }} />
                      </button>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <button
                        onClick={() => toggleModel(model.modelId, 'isFeatured')}
                        style={{
                          fontSize: '20px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          filter: model.isFeatured ? 'none' : 'grayscale(100%)',
                          opacity: model.isFeatured ? 1 : 0.4
                        }}
                      >
                        ⭐
                      </button>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        <button
                          onClick={() => setEditingModel(model)}
                          style={{
                            padding: '6px 10px',
                            background: '#693fe9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteModel(model.modelId)}
                          style={{
                            padding: '6px 10px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {editingModel && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ marginTop: 0, color: '#693fe9' }}>Edit Model: {editingModel.name}</h2>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Display Name</label>
                  <input
                    type="text"
                    value={editingModel.name}
                    onChange={(e) => setEditingModel({ ...editingModel, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Input Cost $/1M</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingModel.inputCostPer1M}
                      onChange={(e) => setEditingModel({ ...editingModel, inputCostPer1M: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Output Cost $/1M</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingModel.outputCostPer1M}
                      onChange={(e) => setEditingModel({ ...editingModel, outputCostPer1M: parseFloat(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Max Context Tokens</label>
                    <input
                      type="number"
                      value={editingModel.maxContextTokens}
                      onChange={(e) => setEditingModel({ ...editingModel, maxContextTokens: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Max Output Tokens</label>
                    <input
                      type="number"
                      value={editingModel.maxOutputTokens}
                      onChange={(e) => setEditingModel({ ...editingModel, maxOutputTokens: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Reasoning</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingModel.reasoningScore}
                      onChange={(e) => setEditingModel({ ...editingModel, reasoningScore: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Writing</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingModel.writingScore}
                      onChange={(e) => setEditingModel({ ...editingModel, writingScore: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Coding</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingModel.codingScore}
                      onChange={(e) => setEditingModel({ ...editingModel, codingScore: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Speed</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingModel.speedScore}
                      onChange={(e) => setEditingModel({ ...editingModel, speedScore: parseInt(e.target.value) })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Category</label>
                  <select
                    value={editingModel.category}
                    onChange={(e) => setEditingModel({ ...editingModel, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                  >
                    <option value="premium">Premium</option>
                    <option value="standard">Standard</option>
                    <option value="budget">Budget</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description</label>
                  <textarea
                    value={editingModel.description || ''}
                    onChange={(e) => setEditingModel({ ...editingModel, description: e.target.value })}
                    rows={3}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', resize: 'vertical' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingModel.isReasoningModel}
                      onChange={(e) => setEditingModel({ ...editingModel, isReasoningModel: e.target.checked })}
                    />
                    Reasoning Model
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={editingModel.isMultimodal}
                      onChange={(e) => setEditingModel({ ...editingModel, isMultimodal: e.target.checked })}
                    />
                    Multimodal (Vision)
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setEditingModel(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={updateModel}
                  style={{
                    padding: '10px 20px',
                    background: '#693fe9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}>
              <h2 style={{ marginTop: 0, color: '#693fe9' }}>Add New AI Model</h2>
              <div style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Model ID *</label>
                    <input
                      type="text"
                      placeholder="openai/gpt-4o"
                      value={newModel.modelId}
                      onChange={(e) => setNewModel({ ...newModel, modelId: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Display Name *</label>
                    <input
                      type="text"
                      placeholder="GPT-4o"
                      value={newModel.name}
                      onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Provider *</label>
                    <input
                      type="text"
                      placeholder="openai"
                      value={newModel.provider}
                      onChange={(e) => setNewModel({ ...newModel, provider: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>API Source</label>
                    <select
                      value={newModel.apiSource}
                      onChange={(e) => setNewModel({ ...newModel, apiSource: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    >
                      <option value="openrouter">OpenRouter</option>
                      <option value="openai">OpenAI (Official)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Input Cost $/1M</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newModel.inputCostPer1M}
                      onChange={(e) => setNewModel({ ...newModel, inputCostPer1M: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Output Cost $/1M</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newModel.outputCostPer1M}
                      onChange={(e) => setNewModel({ ...newModel, outputCostPer1M: parseFloat(e.target.value) || 0 })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Category</label>
                  <select
                    value={newModel.category}
                    onChange={(e) => setNewModel({ ...newModel, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
                  >
                    <option value="premium">Premium</option>
                    <option value="standard">Standard</option>
                    <option value="budget">Budget</option>
                    <option value="free">Free</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description</label>
                  <textarea
                    value={newModel.description || ''}
                    onChange={(e) => setNewModel({ ...newModel, description: e.target.value })}
                    rows={2}
                    placeholder="Brief description of the model..."
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0', resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '25px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={addModel}
                  style={{
                    padding: '10px 20px',
                    background: '#693fe9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Add Model
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
