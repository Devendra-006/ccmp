import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Loader2,
  Lock
} from 'lucide-react';
import { studentProfile } from '../data/mockData';

export default function SandboxPaymentModal({ feeItem, onClose, onPaymentSuccess }) {
  const [method, setMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const amount = feeItem ? feeItem.dueAmount || feeItem.totalAmount : 12500;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      setTimeout(() => {
        onPaymentSuccess(feeItem.id);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '0', overflow: 'hidden' }}
      >
        {/* Gateway Header */}
        <div style={{ background: '#0f172a', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={14} color="#10b981" />
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Razorpay Sandbox Gateway
              </span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', marginTop: '4px' }}>
              College Accounts Office
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Payment Body */}
        <div style={{ padding: '24px' }}>
          {isPaid ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginBottom: '6px' }}>
                Payment Captured Successfully!
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                Webhook verified • Numbered tax receipt has been dispatched to {studentProfile.email}
              </p>
              <div className="badge badge-emerald">
                Transaction ID: TXN_SANDBOX_{Math.floor(100000 + Math.random() * 900000)}
              </div>
            </div>
          ) : (
            <>
              {/* Order Amount Pill */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Paying for:</div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>{feeItem ? feeItem.title : 'Semester Assessment Dues'}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>Student: {studentProfile.name} ({studentProfile.rollNo})</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Amount</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                    ₹ {amount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: method === 'card' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                    background: method === 'card' ? '#eef2ff' : '#ffffff',
                    color: method === 'card' ? '#4f46e5' : '#475569',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <CreditCard size={18} />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('upi')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: method === 'upi' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                    background: method === 'upi' ? '#eef2ff' : '#ffffff',
                    color: method === 'upi' ? '#4f46e5' : '#475569',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Smartphone size={18} />
                  <span>UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('netbanking')}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: method === 'netbanking' ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                    background: method === 'netbanking' ? '#eef2ff' : '#ffffff',
                    color: method === 'netbanking' ? '#4f46e5' : '#475569',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Building2 size={18} />
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Mock Form fields */}
              <div style={{ background: '#fafbfc', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                {method === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>TEST CARD NUMBER</label>
                      <input 
                        type="text" 
                        readOnly 
                        value="4111 •••• •••• 1111" 
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '600', fontSize: '13px' }} 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>VALID THRU</label>
                        <input type="text" readOnly value="12 / 28" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>CVV</label>
                        <input type="text" readOnly value="789" style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }} />
                      </div>
                    </div>
                  </div>
                )}

                {method === 'upi' && (
                  <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                      Scan QR with GPay / PhonePe / Paytm
                    </div>
                    <div style={{ width: '110px', height: '110px', margin: '0 auto', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>[Sandbox QR]</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>VPA: alex.rivera@okhdfcbank</div>
                  </div>
                )}

                {method === 'netbanking' && (
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>SELECT TEST BANK</label>
                    <select style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '13px' }}>
                      <option>State Bank of India (Sandbox Simulator)</option>
                      <option>HDFC Bank (Sandbox Simulator)</option>
                      <option>ICICI Bank (Sandbox Simulator)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button 
                className="btn btn-emerald" 
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '8px' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing Sandbox Webhook...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Authorize Sandbox Payment (₹{amount.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
