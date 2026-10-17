import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Receipt,
  Download
} from 'lucide-react';
import { studentProfile } from '../data/mockData';

export default function FeeReceiptModal({ feeItem, onClose }) {
  const handlePrint = () => {
    window.print();
  };

  const receiptNo = feeItem?.receiptNo || 'RCPT-2026-90412';
  const paymentDate = feeItem?.paymentDate || 'October 14, 2026';
  const paymentMode = feeItem?.paymentMode || 'Online Sandbox (Razorpay)';
  const amount = feeItem?.totalAmount || 8500;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '32px' }}
      >
        {/* Modal Controls (no-print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">Verified Transaction</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Receipt #{receiptNo}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-indigo btn-sm" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print / Download</span>
            </button>
            <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Receipt Paper Surface */}
        <div style={{ border: '1px solid #0f172a', padding: '28px', borderRadius: '4px', background: '#ffffff', color: '#0f172a' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', textTransform: 'uppercase' }}>
                College of Engineering & Technology
              </h2>
              <div style={{ fontSize: '11.5px', color: '#475569' }}>
                Finance & Accounts Division • Green Campus, Sector 4
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>GSTIN: 27AAACE1234F1Z8</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="badge badge-emerald" style={{ marginBottom: '4px' }}>PAID RECEIPT</div>
              <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'monospace' }}>{receiptNo}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{paymentDate}</div>
            </div>
          </div>

          {/* Student Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '12.5px', background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
            <div><strong>Student Name:</strong> {studentProfile.name}</div>
            <div><strong>Roll Number:</strong> {studentProfile.rollNo}</div>
            <div><strong>Enrolment ID:</strong> {studentProfile.enrolmentNo}</div>
            <div><strong>Program:</strong> {studentProfile.program}</div>
            <div><strong>Semester:</strong> {studentProfile.semester}</div>
            <div><strong>Payment Mode:</strong> {paymentMode}</div>
          </div>

          {/* Fee Item Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', marginBottom: '24px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Description / Head</th>
                <th style={{ padding: '8px 10px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', fontWeight: '600' }}>{feeItem ? feeItem.title : 'Semester Assessment Fee'}</td>
                <td style={{ padding: '10px' }}>{feeItem ? feeItem.category : 'Tuition & Labs'}</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>₹ {amount.toLocaleString('en-IN')}.00</td>
              </tr>
              <tr style={{ background: '#fafbfc' }}>
                <td colSpan={2} style={{ padding: '10px', fontWeight: '700', textAlign: 'right' }}>Total Amount Paid:</td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '800', fontSize: '15px', color: '#059669' }}>
                  ₹ {amount.toLocaleString('en-IN')}.00
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer note & Stamp */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
            <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '340px' }}>
              Note: This is a system-generated electronic receipt issued via the Cloud Student Management System. No physical signature required.
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontSize: '11px', fontWeight: '700', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '4px', marginBottom: '6px' }}>
                <ShieldCheck size={14} />
                <span>Accounts Verified</span>
              </div>
              <div style={{ fontSize: '11px', fontWeight: '600' }}>Bursar / Cashier</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
