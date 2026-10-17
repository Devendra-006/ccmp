import React, { useState } from 'react';
import { 
  BellRing, 
  Search, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  X
} from 'lucide-react';
import { noticesList } from '../data/mockData';

export default function NoticeBoardModule() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeNotice, setActiveNotice] = useState(null);

  const categories = ['All', 'Exams', 'Academic', 'Events', 'Campus'];

  const filteredNotices = noticesList.filter(item => {
    const matchesCat = filter === 'All' || item.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.content.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Institutional Circulars & Notice Board
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Official administrative notifications & departmental memos (PRD Section 3.11 COM-1)
            </p>
          </div>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text"
              placeholder="Search circulars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${filter === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notices Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}>
        {filteredNotices.map((notice) => (
          <div 
            key={notice.id}
            className="white-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: `4px solid ${notice.color}`,
              cursor: 'pointer'
            }}
            onClick={() => setActiveNotice(notice)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    textTransform: 'uppercase',
                    color: notice.color,
                    background: '#f8fafc',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {notice.category}
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{notice.date}</span>
              </div>

              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
                {notice.title}
              </h3>

              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                {notice.content.slice(0, 160)}...
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
              <span>Issued by: <strong>{notice.issuer}</strong></span>
              <span style={{ color: '#4f46e5', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Read Notice <ChevronRight size={13} />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {activeNotice && (
        <div className="modal-backdrop" onClick={() => setActiveNotice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '580px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: '700', 
                    textTransform: 'uppercase',
                    color: activeNotice.color,
                    background: '#f8fafc',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}
                >
                  {activeNotice.category} Circular
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '8px' }}>
                  {activeNotice.title}
                </h3>
              </div>
              <button 
                className="icon-btn" 
                onClick={() => setActiveNotice(null)}
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', display: 'flex', gap: '12px' }}>
              <span>Published on: <strong>{activeNotice.date}</strong></span>
              <span>•</span>
              <span>Issuer: <strong>{activeNotice.issuer}</strong></span>
            </div>

            <div style={{ fontSize: '14px', color: '#334155', lineHeight: 1.6, padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              {activeNotice.content}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setActiveNotice(null)}>
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
