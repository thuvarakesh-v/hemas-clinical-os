import { useState, useEffect, useRef } from 'react';
import { documents as docsAPI } from '../services/api';

const CATS = ['all','lab_report','prescription','imaging','discharge','consultation','vaccination','other'];

export default function Vault() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [cat, setCat] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const fileRef = useRef();

  async function load() {
    setLoading(true);
    try {
      const params = {};
      if (cat !== 'all') params.category = cat;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const { data } = await docsAPI.getAll(params);
      setDocs(data.data?.docs || []);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [cat, startDate, endDate]);

  async function openDoc(doc) {
    setSelected(doc);
    setAnalysis(null);
    setAnalysisLoading(true);
    try {
      const { data } = await docsAPI.getAnalysis(doc.id);
      setAnalysis(data.data);
    } finally { setAnalysisLoading(false); }
  }

  async function handleUpload(e) {
    e.preventDefault();
    const file = fileRef.current?.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('category', e.target.category.value || 'other');
      fd.append('title', e.target.title.value || file.name);
      await docsAPI.upload(fd);
      setShowUpload(false);
      load();
      alert('Document uploaded! AI analysis will be ready shortly for PDF files.');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  }

  const urgencyColor = { routine: '#10b981', soon: '#f59e0b', urgent: '#ef4444', emergency: '#7f1d1d' };

  return (
    <div className="page-content">
      <div className="page-header" style={{ background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <h1>📁 Health Vault</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>+ Upload</button>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 16px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: cat === c ? '#2563eb' : '#f1f5f9', color: cat === c ? '#fff' : '#64748b', border: 'none', cursor: 'pointer' }}>
              {c.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <input type="date" className="input" style={{ flex: 1 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
          <span style={{ alignSelf: 'center', color: '#94a3b8' }}>–</span>
          <input type="date" className="input" style={{ flex: 1 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Document List */}
      <div style={{ padding: '16px' }}>
        {loading ? <div className="page-center"><div className="spinner" /></div> :
          docs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <p style={{ fontSize: 16, fontWeight: 600 }}>No documents yet</p>
              <p style={{ fontSize: 14, marginTop: 4 }}>Upload your medical reports and they'll appear here</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setShowUpload(true)}>Upload First Document</button>
            </div>
          ) : docs.map(doc => (
            <div key={doc.id} className="card" style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => openDoc(doc)}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{doc.mime_type === 'application/pdf' ? '📄' : '🖼️'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{doc.title || doc.original_name}</p>
                  <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{doc.document_date} · {doc.category.replace('_',' ')}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{(doc.file_size / 1024).toFixed(0)} KB</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  {doc.is_ai_analyzed && <span className="badge badge-blue" style={{ fontSize: 10 }}>AI ✓</span>}
                  <span className={`badge ${doc.uploaded_by_type === 'staff' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: 10 }}>
                    {doc.uploaded_by_type}
                  </span>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {/* Document Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, overflowY: 'auto', padding: '20px 16px' }}>
          <div style={{ background: '#fff', borderRadius: 20, maxWidth: 500, margin: '0 auto', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>📄 Document Details</h2>
              <button onClick={() => setSelected(null)} style={{ fontSize: 22, background: 'none', color: '#94a3b8' }}>×</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontWeight: 700 }}>{selected.title || selected.original_name}</p>
              <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{selected.document_date} · {selected.category}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <a href={selected.file_path} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">View Original</a>
              </div>
            </div>

            {analysisLoading ? (
              <div style={{ textAlign: 'center', padding: 24 }}>
                <div className="spinner" />
                <p style={{ marginTop: 12, color: '#64748b', fontSize: 14 }}>Loading AI Analysis…</p>
              </div>
            ) : !analysis ? (
              <div style={{ background: '#fef3c7', padding: 16, borderRadius: 10, fontSize: 14, color: '#92400e' }}>
                ⏳ AI analysis is processing. Check back shortly.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '6px 12px' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>AI CONFIDENCE</p>
                    <p style={{ fontWeight: 700, color: '#2563eb' }}>{Math.round((analysis.result?.confidenceScore || 0) * 100)}%</p>
                  </div>
                  <div style={{ flex: 1, background: '#f8fafc', borderRadius: 8, padding: '6px 12px' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8' }}>URGENCY</p>
                    <p style={{ fontWeight: 700, color: urgencyColor[analysis.urgency_level] || '#64748b', textTransform: 'capitalize' }}>{analysis.urgency_level}</p>
                  </div>
                </div>

                <div style={{ background: '#eff6ff', borderRadius: 10, padding: 14 }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: '#1d4ed8', marginBottom: 6 }}>📋 Summary</p>
                  <p style={{ fontSize: 14, color: '#1e40af', lineHeight: 1.5 }}>{analysis.result?.summary}</p>
                </div>

                {analysis.result?.keyFindings?.length > 0 && (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🔍 Key Findings</p>
                    {analysis.result.keyFindings.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <span style={{ color: '#2563eb', fontWeight: 700 }}>•</span>
                        <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{f}</p>
                      </div>
                    ))}
                  </div>
                )}

                {analysis.result?.whatItMeans && (
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#065f46', marginBottom: 6 }}>💡 What This Means</p>
                    <p style={{ fontSize: 13, color: '#047857', lineHeight: 1.5 }}>{analysis.result.whatItMeans}</p>
                  </div>
                )}

                {analysis.result?.indicators?.length > 0 && (
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>📊 Indicators</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {analysis.result.indicators.slice(0, 6).map((ind, i) => (
                        <div key={i} style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px' }}>
                          <p style={{ fontSize: 11, color: '#94a3b8' }}>{ind.name}</p>
                          <p style={{ fontWeight: 600, fontSize: 13, color: ind.status === 'abnormal' ? '#ef4444' : ind.status === 'borderline' ? '#f59e0b' : '#10b981' }}>
                            {ind.value || ind.status}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.result?.aiInsight && (
                  <div style={{ background: '#f5f3ff', borderRadius: 10, padding: 14 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#5b21b6', marginBottom: 6 }}>🤖 AI Insight</p>
                    <p style={{ fontSize: 13, color: '#6d28d9', lineHeight: 1.5 }}>{analysis.result.aiInsight}</p>
                  </div>
                )}

                {analysis.recommended_specialty && (
                  <div style={{ background: '#fff7ed', borderRadius: 10, padding: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 24 }}>👨‍⚕️</span>
                    <div>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>RECOMMENDED SPECIALIST</p>
                      <p style={{ fontWeight: 700, color: '#c2410c' }}>{analysis.recommended_specialty}</p>
                    </div>
                  </div>
                )}

                <p style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>{analysis.result?.disclaimer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 500, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>📤 Upload Document</h2>
              <button onClick={() => setShowUpload(false)} style={{ fontSize: 22, background: 'none', color: '#94a3b8' }}>×</button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label>File (PDF, Image)</label>
                <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="input" required />
              </div>
              <div className="input-group">
                <label>Title</label>
                <input name="title" className="input" placeholder="e.g. Blood Test Results" />
              </div>
              <div className="input-group">
                <label>Category</label>
                <select name="category" className="input">
                  {CATS.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={uploading}>
                {uploading ? 'Uploading…' : 'Upload & Analyze'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
