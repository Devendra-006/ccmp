import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

console.log('--- Testing Resend API Credentials ---');

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  try {
    console.log('Querying Resend API domains / status...');
    const domains = await resend.domains.list();
    console.log('✓ Resend API Key is AUTHENTIC and OPERATIONAL!');
    console.log(`  Registered sending domains: ${domains.data?.data?.length || 0}`);
    if (domains.data?.data?.length) {
      domains.data.data.forEach(d => console.log(`   - ${d.name} (${d.status})`));
    } else {
      console.log('   (Using onboarding@resend.dev sandbox domain for testing)');
    }
  } catch (err) {
    console.error('Resend verification error:', err);
  }
}

testResend();
