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
  FileSpreadsheet
} from 'lucide-react';

export default function AccountantPortal({
  feeStructures = [],
  feesList = [],
  students = [],
  onAddFeeStructure,
  onViewReceipt
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [activeTab, setActiveTab] = useState('dues'); // 'dues', 'structures'
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFee, setNewFee] = useState({ head: '', amount: '', dueDate: '', semester: 4 });

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
            <span className="badge badge-indigo">100% Audited</span>
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
            <span className="badge badge-emerald">Settled</span>
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

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          className={`btn btn-sm ${activeTab === 'dues' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('dues')}
        >
          <Receipt size={14} />
          <span>Student Invoices Ledger ({filteredDues.length})</span>
        </button>
        <button
          className={`btn btn-sm ${activeTab === 'structures' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('structures')}
        >
          <CreditCard size={14} />
          <span>Fee Structures Configuration ({feeStructures.length})</span>
        </button>
      </div>

      {/* DUES LEDGER */}
      {activeTab === 'dues' && (
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
      {activeTab === 'structures' && (
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
