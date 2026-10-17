import React from 'react';
import { 
  Receipt, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { studentProfile } from '../data/mockData';

export default function FeesModule({ 
  feesList, 
  onInitiatePayment, 
  onViewReceipt 
}) {
  const totalPayable = feesList.reduce((acc, f) => acc + f.totalAmount, 0);
  const totalPaid = feesList.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalPending = feesList.reduce((acc, f) => acc + f.dueAmount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Tuition Fees, Assessment Dues & Receipts
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b' }}>
              Secure payment gateway integration with automated numbered receipts (PRD Section 3.8)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {totalPending > 0 ? (
              <button 
                className="btn btn-emerald"
                onClick={() => onInitiatePayment(feesList.find(f => f.status === 'PENDING'))}
              >
                <CreditCard size={15} />
                <span>Pay Full Dues: ₹{totalPending.toLocaleString('en-IN')}</span>
              </button>
            ) : (
              <span className="badge badge-emerald" style={{ padding: '6px 14px' }}>
                <CheckCircle2 size={14} />
                <span>All Academic Dues Cleared</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Financial Health Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Semester Billed</span>
            <div className="stat-icon-wrap stat-icon-sky"><Receipt size={18} /></div>
          </div>
          <div className="stat-value">₹ {totalPayable.toLocaleString('en-IN')}</div>
          <div className="stat-footer">
            <span>Tuition, Labs & Exam fees</span>
            <span className="badge badge-sky">Semester 5</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Amount Paid</span>
            <div className="stat-icon-wrap stat-icon-emerald"><CheckCircle2 size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: '#059669' }}>
            ₹ {totalPaid.toLocaleString('en-IN')}
          </div>
          <div className="stat-footer">
            <span>Verified by Accounts Office</span>
            <span style={{ color: '#059669', fontWeight: '600' }}>
              {((totalPaid / totalPayable) * 100).toFixed(0)}% Cleared
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Outstanding Dues</span>
            <div className="stat-icon-wrap stat-icon-rose"><AlertCircle size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: totalPending > 0 ? '#e11d48' : '#059669' }}>
            ₹ {totalPending.toLocaleString('en-IN')}
          </div>
          <div className="stat-footer">
            <span>Due Date: October 30, 2026</span>
            <span className={`badge ${totalPending > 0 ? 'badge-rose' : 'badge-emerald'}`}>
              {totalPending > 0 ? 'Pending' : 'Zero Dues'}
            </span>
          </div>
        </div>
      </div>

      {/* Dues Breakdown Table */}
      <div className="white-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Fee Heads & Transaction Schedule
            </h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Instant digital numbered receipt with QR verification for each transaction
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>256-bit SSL Sandbox Payment Environment</span>
          </div>
        </div>

        <div className="clean-table-container">
          <table className="clean-table">
            <thead>
              <tr>
                <th>Fee Head Details</th>
                <th>Category</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt / Action</th>
              </tr>
            </thead>
            <tbody>
              {feesList.map((fee) => {
                const isPaid = fee.status === 'PAID';
                return (
                  <tr key={fee.id}>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{fee.title}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>Ref ID: {fee.id}</div>
                    </td>
                    <td>
                      <span className="badge badge-gray">{fee.category}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12.5px', color: '#334155' }}>{fee.dueDate}</div>
                      {isPaid && fee.paymentDate && (
                        <div style={{ fontSize: '11px', color: '#059669' }}>Paid on {fee.paymentDate}</div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a' }}>
                        ₹ {fee.totalAmount.toLocaleString('en-IN')}
                      </div>
                      {isPaid && (
                        <div style={{ fontSize: '11px', color: '#64748b' }}>Via {fee.paymentMode}</div>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${isPaid ? 'badge-emerald' : 'badge-rose'}`}>
                        {isPaid ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td>
                      {isPaid ? (
                        <button 
                          className="btn btn-outline btn-sm"
                          onClick={() => onViewReceipt(fee)}
                          style={{ gap: '6px' }}
                        >
                          <Download size={13} color="#4f46e5" />
                          <span>Receipt {fee.receiptNo ? `#${fee.receiptNo.slice(-5)}` : ''}</span>
                        </button>
                      ) : (
                        <button 
                          className="btn btn-emerald btn-sm"
                          onClick={() => onInitiatePayment(fee)}
                        >
                          <CreditCard size={13} />
                          <span>Pay Now (Sandbox)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
