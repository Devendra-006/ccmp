# Serverless Function Architecture (FaaS)
**Component:** Automated Digital Fee Receipt Generation  
**Deployment Models:** AWS Lambda / Supabase Edge Functions / Vercel Serverless Functions

## Why Serverless for Receipt Generation?
1. **Zero Idle Cost:** The receipt generation compute only spins up when a student completes a fee payment. It incurs 0 cost when no payments are occurring.
2. **Infinite Autoscaling:** During university registration week when thousands of students pay fees simultaneously, the serverless provider automatically spawns concurrent isolated execution runtimes.
3. **Decoupled Architecture:** Heavy PDF and crypto-signing logic runs off the main Node.js/Express event loop, keeping the core API responsive.

## Invocation Contract
```json
POST /generate-receipt
{
  "receiptNo": "RCP-2026-948123",
  "studentName": "Alex Rivera",
  "amountInPaise": 1250000,
  "feeHead": "Tuition Fee - Semester 4",
  "paidAt": "2026-10-17T18:00:00Z"
}
```
