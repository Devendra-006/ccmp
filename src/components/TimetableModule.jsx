import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle2, 
  Download,
  BookOpen
} from 'lucide-react';
import { weeklyTimetable, studentProfile } from '../data/mockData';

export default function TimetableModule() {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const [selectedDay, setSelectedDay] = useState('Wednesday');

  const scheduleForDay = weeklyTimetable[selectedDay] || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Academic Timetable & Schedule
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Section {studentProfile.section} • Semester 5 (Fall 2026) • 22 Enrolled Academic Credits
            </p>
          </div>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => window.print()}
          >
            <Download size={14} />
            <span>Print Weekly Timetable</span>
          </button>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {days.map((day) => {
          const isSelected = selectedDay === day;
          const count = (weeklyTimetable[day] || []).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              style={{
                padding: '12px 20px',
                borderRadius: '10px',
                border: isSelected ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                background: isSelected ? '#eef2ff' : '#ffffff',
                color: isSelected ? '#4f46e5' : '#475569',
                cursor: 'pointer',
                fontWeight: isSelected ? '700' : '600',
                fontSize: '13.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Calendar size={15} color={isSelected ? '#4f46e5' : '#94a3b8'} />
              <span>{day}</span>
              <span 
                style={{ 
                  fontSize: '11px', 
                  padding: '2px 6px', 
                  borderRadius: '999px',
                  background: isSelected ? '#ffffff' : '#f1f5f9',
                  color: isSelected ? '#4f46e5' : '#64748b'
                }}
              >
                {count} Periods
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots List for Selected Day */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            {selectedDay} Schedule Overview
          </h3>
          <span className="badge badge-sky" style={{ fontSize: '11px' }}>
            Zero Room / Instructor Clashes Detected
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {scheduleForDay.map((slot, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '16px 20px',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                borderLeft: `5px solid ${slot.color || '#4f46e5'}`,
                transition: 'all 0.15s ease'
              }}
            >
              {/* Period Number and Time */}
              <div style={{ minWidth: '130px' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8' }}>
                  Period {slot.period}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={13} color="#0284c7" />
                  <span>{slot.time}</span>
                </div>
              </div>

              {/* Subject Title and Code */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                    {slot.name}
                  </span>
                  <span className="badge badge-gray" style={{ fontSize: '11px', fontWeight: '600' }}>
                    {slot.code}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '4px', fontSize: '12.5px', color: '#64748b' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={13} color="#475569" />
                    <span>{slot.faculty}</span>
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#e11d48" />
                    <span style={{ fontWeight: '600', color: '#334155' }}>{slot.room}</span>
                  </span>
                </div>
              </div>

              {/* Action / Status Pill */}
              <div>
                <span 
                  style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    padding: '4px 10px', 
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#475569'
                  }}
                >
                  Regular Session
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
