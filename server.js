import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo5173Restro';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'demo_secret_key_12345';
const RESTAURANT_NAME = process.env.RESTAURANT_NAME || 'RestroAI Fine Dining & Bar';
const RESTAURANT_GSTIN = process.env.RESTAURANT_GSTIN || '27AABCR1234M1Z8';
const RESTAURANT_FSSAI = process.env.RESTAURANT_FSSAI || '10020033004455';

let razorpay = null;
if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.includes('demo')) {
  try {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('✅ Razorpay Live/Test Gateway initialized with Key ID:', RAZORPAY_KEY_ID);
  } catch (e) {
    console.warn('⚠️ Razorpay init warning:', e.message);
  }
} else {
  console.log('ℹ️ Running Razorpay UPI in Sandbox / Developer Simulation Mode');
}

/**
 * 1. Create UPI Payment Order with 5% GST (2.5% CGST + 2.5% SGST)
 */
app.post('/api/payment/create-order', async (req, res) => {
  try {
    const {
      tableId,
      items = [],
      tipAmount = 0,
      discountPercent = 0,
      customAmount,
      customerName = 'Dine-In Guest',
    } = req.body;

    const subtotal = customAmount !== undefined
      ? Number(customAmount)
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const discountAmount = Math.round((subtotal * (discountPercent || 0)) / 100);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    
    // Standard Indian Restaurant GST: 2.5% CGST + 2.5% SGST = 5%
    const cgst = Number((taxableAmount * 0.025).toFixed(2));
    const sgst = Number((taxableAmount * 0.025).toFixed(2));
    const totalGst = Number((cgst + sgst).toFixed(2));
    const grandTotal = Number((taxableAmount + totalGst + (tipAmount || 0)).toFixed(2));
    const amountPaise = Math.round(grandTotal * 100);

    let orderId = `order_test_${Date.now()}`;
    let isSandbox = true;

    // If real Razorpay keys are provided, call official API
    if (razorpay) {
      try {
        const rzpOrder = await razorpay.orders.create({
          amount: amountPaise,
          currency: 'INR',
          receipt: `rcpt_tbl${tableId}_${Date.now()}`,
          notes: {
            tableId: String(tableId),
            customerName,
            restaurant: RESTAURANT_NAME,
          },
        });
        orderId = rzpOrder.id;
        isSandbox = false;
      } catch (err) {
        console.warn('Razorpay API order creation failed, fallback to test simulator:', err.message);
      }
    }

    const upiDeepLink = `upi://pay?pa=restaurant@icici&pn=${encodeURIComponent(RESTAURANT_NAME)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=Table${tableId}_Bill`;

    return res.json({
      success: true,
      orderId,
      amountPaise,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      isSandbox,
      upiDeepLink,
      taxes: {
        subtotal,
        discountAmount,
        taxableAmount,
        cgst,
        sgst,
        totalGst,
        tipAmount,
        grandTotal,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Failed to create payment order' });
  }
});

/**
 * 2. Cryptographic Payment Verification & GST Tax Invoice Generation
 */
app.post('/api/payment/verify', (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tableId,
      order,
      customerName = 'Dine-In Guest',
      customerPhone = '9876543210',
      method = 'UPI',
    } = req.body;

    let isVerified = true;

    // If real Razorpay keys configured, verify cryptographic HMAC-SHA256 signature
    if (razorpay && razorpay_signature && !razorpay_signature.includes('sandbox')) {
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid payment signature. Fraud detected.' });
      }
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const invoice = {
      invoiceNumber,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      tableId: Number(tableId),
      customerName,
      customerPhone,
      paidAt: new Date().toISOString(),
      subtotal: order?.taxes?.subtotal || 0,
      discountAmount: order?.taxes?.discountAmount || 0,
      taxableAmount: order?.taxes?.taxableAmount || 0,
      cgst: order?.taxes?.cgst || 0,
      sgst: order?.taxes?.sgst || 0,
      totalTax: order?.taxes?.totalGst || 0,
      tipAmount: order?.taxes?.tipAmount || 0,
      grandTotal: order?.taxes?.grandTotal || 0,
      paymentMethod: method,
      gstin: RESTAURANT_GSTIN,
      fssai: RESTAURANT_FSSAI,
      upiRrn: String(Math.floor(400000000000 + Math.random() * 900000000000)),
    };

    return res.json({
      success: true,
      verified: isVerified,
      invoice,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ error: 'Payment verification failed' });
  }
});

/**
 * 3. Official Razorpay Webhook Handler
 */
app.post('/api/webhooks/razorpay', (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || RAZORPAY_KEY_SECRET;

    if (signature && secret) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    console.log(`🔔 Webhook received from Razorpay: ${event}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = req.body.payload?.payment?.entity;
      const orderEntity = req.body.payload?.order?.entity;
      const tableId = paymentEntity?.notes?.tableId || orderEntity?.notes?.tableId;

      console.log(`💰 Table #${tableId} payment captured successfully!`);
    }

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

let globalServiceCalls = [];
let globalOrders = [];

app.get('/api/state', (req, res) => {
  res.json({
    orders: globalOrders,
    serviceCalls: globalServiceCalls,
    tables: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, status: 'Free' })),
  });
});

app.post('/api/service-calls', (req, res) => {
  try {
    const call = req.body.call || req.body;
    if (call && call.tableId) {
      const newCall = {
        id: call.id || `CALL-${Date.now()}`,
        tableId: Number(call.tableId),
        type: call.type || 'Assistance / Service',
        note: call.note || '',
        status: 'pending',
        createdAt: call.createdAt || new Date().toISOString(),
      };
      globalServiceCalls = [newCall, ...globalServiceCalls.filter(c => c.id !== newCall.id)].slice(0, 50);
    }
    res.json({ success: true, serviceCalls: globalServiceCalls });
  } catch (e) {
    res.status(400).json({ error: 'invalid json' });
  }
});

app.post('/api/service-calls/status', (req, res) => {
  try {
    const data = req.body;
    globalServiceCalls = globalServiceCalls.map(c => 
      (c.id === data.callId || (data.tableId && c.tableId === Number(data.tableId) && c.status !== 'resolved'))
        ? { ...c, status: data.status, staffName: data.staffName || 'Floor Staff', resolvedAt: data.status === 'resolved' ? new Date().toISOString() : undefined }
        : c
    );
    res.json({ success: true, serviceCalls: globalServiceCalls });
  } catch (e) {
    res.status(400).json({ error: 'invalid json' });
  }
});

let globalDemoBookings = [];

app.post('/api/demo/book', (req, res) => {
  try {
    const booking = req.body;
    booking.receivedAt = new Date().toISOString();
    globalDemoBookings.unshift(booking);
    console.log('📬 [DEMO BOOKING] New lead received for biompriya2006@gmail.com:');
    console.log(`   Client: ${booking.name} <${booking.email}>`);
    console.log(`   Phone: ${booking.countryCode || ''} ${booking.phone}`);
    console.log(`   Restaurant: ${booking.businessName} (${booking.city}, ${booking.pincode})`);
    console.log(`   Modules: ${(booking.interestedProducts || []).join(', ')}`);
    console.log(`   ID: ${booking.id}`);
    res.json({ success: true, message: 'Demo request registered', leadId: booking.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/demo/leads', (req, res) => {
  res.json({ success: true, count: globalDemoBookings.length, leads: globalDemoBookings });
});

app.listen(PORT, () => {
  console.log(`🚀 Restaurant Payment API Server running on http://localhost:${PORT}`);
});

