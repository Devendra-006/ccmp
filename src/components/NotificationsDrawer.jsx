import React from 'react';
import { 
  Bell, 
  CheckCheck, 
  X, 
  AlertCircle, 
  Calendar, 
  GraduationCap, 
  DollarSign 
} from 'lucide-react';
import { noticesList } from '../data/mockData';

export default function NotificationsDrawer({ onClose, onSelectNotice }) {
  const alerts = [
    {
      id: "alt-1",
      title: "Semester 5 Mid-Term Schedule Released",
      description: "Exam begins Nov 10, 2026. Hall tickets available next week.",
      time: "2 hours ago",
      type: "exam",
      unread: true
    },
    {
      id: "alt-2",
      title: "Attendance Shortage Advisory (CS504)",
      description: "Your attendance in Machine Learning is 72.9% (below 75% limit).",
      time: "1 day ago",
      type: "warning",
      unread: true
    },
    {
      id: "alt-3",
      title: "Fee Payment Reminder",
      description: "Term-II Exam & Lab fee of ₹12,500 due by Oct 30, 2026.",
      time: "2 days ago",
      type: "fee",
      unread: false
    },
    {
      id: "alt-4",
      title: "AWS Cloud Bootcamp Registration",
      description: "Hands-on cloud architecture workshop slots now open.",
      time: "4 days ago",
      type: "event",
      unread: false
    }
  ];

  return (
    <div className="notifications-drawer no-print">
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} color="#4f46e5" />
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
            Notifications & Alerts
          </span>
        </div>
        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="drawer-body">
        {alerts.map((item) => (
          <div 
            key={item.id} 
            className={`notification-item ${item.unread ? 'unread' : ''}`}
            onClick={() => {
              if (onSelectNotice) onSelectNotice();
              onClose();
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.unread && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5' }} />}
                <span>{item.title}</span>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, margin: '4px 0' }}>
              {item.description}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.time}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <button 
          className="btn btn-outline btn-sm" 
          style={{ width: '100%', fontSize: '12px' }}
          onClick={onClose}
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
