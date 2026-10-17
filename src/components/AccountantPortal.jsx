import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  LayoutDashboard
} from 'lucide-react';

export default function AccountantPortal({
  feeStructures = [],
  feesList = [],
  students = [],
  onAddFeeStructure,
  onViewReceipt,
  activeSection = 'overview',
  setActiveSection
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFee, setNewFee] = useState({ head: '', amount: '', dueDate: '', semester: 4 });

  const currentTab = activeSection || 'overview';
  const setTab = setActiveSection || (() => {});

  // Filter dues
  const filteredDues = feesList.filter(f => {
    const matchesSearch = 
      (f.studentName && f.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.rollNo && f.rollNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (f.head && f.head.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'ALL' || f.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalCollected = feesList
    .filter(f => f.status === 'PAID')
    .reduce((acc, f) => acc + ((f.amountInPaise ? f.amountInPaise / 100 : f.amount) || 0), 0);

  const totalOutstanding = feesList
    .filter(f => f.status === 'PENDING')
    .reduce((acc, f) => acc + ((f.amountInPaise ? f.amountInPaise / 100 : f.amount) || 0), 0);

  const totalInvoiced = totalCollected + totalOutstanding;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Finance Header */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-rose">Role: Institution Accountant & Bursar</span>
              <span className="badge badge-emerald">Live Financial Ledger</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>
              Fee Management & Accounts Ledger
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Reconciliation of student tuition fees, bank settlements, online Razorpay transactions, and overdue accounts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowAddModal(true)}
              style={{ background: '#0f172a', borderColor: '#0f172a' }}
            >
              <Plus size={14} />
              <span>Define Fee Head</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto' }}>
        <button
          className={`btn btn-sm ${currentTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('overview')}
          style={{ background: currentTab === 'overview' ? '#0f172a' : '' }}
        >
          <LayoutDashboard size={14} />
          <span>0. Finance Dashboard</span>
        </button>
        <button
          className={`btn btn-sm ${currentTab === 'dues' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('dues')}
          style={{ background: currentTab === 'dues' ? '#0f172a' : '' }}
        >
          <Receipt size={14} />
          <span>1. Student Invoices Ledger ({filteredDues.length})</span>
        </button>
        <button
          className={`btn btn-sm ${currentTab === 'structures' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setTab('structures')}
          style={{ background: currentTab === 'structures' ? '#0f172a' : '' }}
        >
          <CreditCard size={14} />
          <span>2. Fee Structures ({feeStructures.length})</span>
        </button>
      </div>

      {/* TAB 0: FINANCE DASHBOARD OVERVIEW */}
      {currentTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Financial Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Invoiced (Sem 4)</span>
                <div className="stat-icon-wrap stat-icon-indigo"><TrendingUp size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#0f172a' }}>
                ₹ {totalInvoiced.toLocaleString('en-IN')}
              </div>
              <div className="stat-footer">
                <span>{feesList.length} Invoiced Ledger Entries</span>
                <span className="badge badge-indigo">Across 20 Students</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Total Collections Realized</span>
                <div className="stat-icon-wrap stat-icon-emerald"><CheckCircle2 size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#059669' }}>
                ₹ {totalCollected.toLocaleString('en-IN')}
              </div>
              <div className="stat-footer">
                <span>{feesList.filter(f => f.status === 'PAID').length} Paid Receipts</span>
                <span className="badge badge-emerald">{totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}% Realized</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-label">Pending Dues Receivable</span>
                <div className="stat-icon-wrap stat-icon-rose"><Clock size={19} /></div>
              </div>
              <div className="stat-value" style={{ color: '#e11d48' }}>
                ₹ {totalOutstanding.toLocaleString('en-IN')}
              </div>
              <div className="stat-footer">
                <span>{feesList.filter(f => f.status === 'PENDING').length} Unpaid Accounts</span>
                <span className="badge badge-rose">Action Required</span>
              </div>
            </div>
          </div>

          {/* Fee Realization Progress Meter */}
          <div className="white-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  Semester 4 Fee Realization & Collection Meter
                </h3>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Statutory recovery target vs actual bank settlements</p>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '13px', fontWeight: '700' }}>
                {totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}% Collected
              </span>
            </div>

            <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
              <div 
                style={{ 
                  width: `${totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 0}%`, 
                  background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
                  borderRadius: '10px'
                }} 
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '12px', color: '#64748b' }}>
              <span>Settled Collections: <strong>₹ {totalCollected.toLocaleString('en-IN')}</strong></span>
              <span>Pending Receivables: <strong style={{ color: '#e11d48' }}>₹ {totalOutstanding.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>

          {/* Quick Actions & Recent Transactions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            <div className="white-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Recent Paid Invoices</h3>
                <button className="btn btn-outline btn-sm" onClick={() => setTab('dues')}>
                  <span>View Full Ledger</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {feesList.filter(f => f.status === 'PAID').slice(0, 5).map((f) => (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{f.studentName || 'Student'} ({f.rollNo || '22CS001'})</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{f.head} • Paid via UPI</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#059669' }}>
                        ₹ {((f.amountInPaise ? f.amountInPaise / 100 : f.amount) || 0).toLocaleString('en-IN')}
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: '10px' }}>Settled</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="white-card">
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
                Bursar Financial Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setTab('dues')}
                  style={{ justifyContent: 'flex-start', padding: '14px 16px', background: '#ffffff' }}
                >
                  <Receipt size={16} color="#be123c" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Reconcile Student Ledger</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Search and audit {feesList.length} fee invoices across all 20 students</div>
                  </div>
                </button>

                <button 
                  className="btn btn-outline" 
                  onClick={() => setShowAddModal(true)}
                  style={{ justifyContent: 'flex-start', padding: '14px 16px', background: '#ffffff' }}
                >
                  <CreditCard size={16} color="#4f46e5" />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Configure Fee Head</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Schedule new semester dues, tuition fees, or lab charges</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DUES LEDGER */}
      {currentTab === 'dues' && (
        <div className="white-card">
          {/* Search and Filters */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '400px' }}>
              <div className="search-box" style={{ width: '100%' }}>
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by student name, roll number, or fee head..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'PENDING', 'PAID'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`btn btn-sm ${filterStatus === st ? 'btn-indigo' : 'btn-outline'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {filteredDues.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <Receipt size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: '600', color: '#0f172a' }}>No ledger records match criteria</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Try clearing the search or switching filter tabs.</div>
            </div>
          ) : (
            <div className="clean-table-container">
              <table className="clean-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Fee Head</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status</th>
                    <th>Receipt / Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDues.map((due) => {
                    const amt = due.amountInPaise ? due.amountInPaise / 100 : due.amount;
                    return (
                      <tr key={due.id}>
                        <td style={{ fontWeight: '700', color: '#0f172a' }}>{due.studentName || 'Alex Rivera'}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>{due.rollNo || '22CS001'}</td>
                        <td>{due.head}</td>
                        <td style={{ fontWeight: '700' }}>₹ {amt.toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {due.dueDate ? new Date(due.dueDate).toLocaleDateString('en-IN') : '2026-04-30'}
                        </td>
                        <td>
                          <span className={`badge ${due.status === 'PAID' ? 'badge-emerald' : 'badge-rose'}`}>
                            {due.status}
                          </span>
                        </td>
                        <td>
                          {due.status === 'PAID' ? (
                            <button 
                              className="btn btn-outline btn-sm" 
                              onClick={() => onViewReceipt && onViewReceipt({
                                title: due.head,
                                totalAmount: amt,
                                receiptNo: due.payment?.receiptNo || 'RCP-2026-849102',
                                paymentDate: due.payment?.paidAt || '2026-03-01',
                                paymentMode: 'UPI / Online Sandbox'
                              })}
                            >
                              <Download size={12} />
                              <span>{due.payment?.receiptNo || 'Receipt'}</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: '600' }}>Awaiting Settlement</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* STRUCTURES TAB */}
      {currentTab === 'structures' && (
        <div className="white-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Institutional Fee Structures</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Curriculum-linked fee schedule for 2026 academic calendar</p>
            </div>
          </div>

          <div className="clean-table-container">
            <table className="clean-table">
              <thead>
                <tr>
                  <th>Fee Head Title</th>
                  <th>Semester</th>
                  <th>Programme</th>
                  <th>Amount</th>
                  <th>Official Due Date</th>
                </tr>
              </thead>
              <tbody>
                {feeStructures.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{s.head}</td>
                    <td>Semester {s.semester}</td>
                    <td>{s.programmeName || 'All Programmes'}</td>
                    <td style={{ fontWeight: '700', color: '#4f46e5' }}>
                      ₹ {((s.amountInPaise || 0) / 100).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b' }}>
                      {new Date(s.dueDate).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Fee Head Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
              Create Institutional Fee Head
            </h3>
            <form onSubmit={e => {
              e.preventDefault();
              if (!newFee.head || !newFee.amount || !newFee.dueDate) return;
              onAddFeeStructure({
                head: newFee.head,
                amountInPaise: parseInt(newFee.amount, 10) * 100,
                dueDate: newFee.dueDate,
                semester: parseInt(newFee.semester, 10)
              });
              setShowAddModal(false);
              setNewFee({ head: '', amount: '', dueDate: '', semester: 4 });
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Fee Head Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Laboratory & Computing Dues"
                  value={newFee.head}
                  onChange={e => setNewFee({ ...newFee, head: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 12500"
                    value={newFee.amount}
                    onChange={e => setNewFee({ ...newFee, amount: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Semester *
                  </label>
                  <select
                    value={newFee.semester}
                    onChange={e => setNewFee({ ...newFee, semester: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Payment Due Date *
                </label>
                <input
                  type="date"
                  value={newFee.dueDate}
                  onChange={e => setNewFee({ ...newFee, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: '#0f172a', borderColor: '#0f172a' }}>
                  Save & Publish Fee Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
