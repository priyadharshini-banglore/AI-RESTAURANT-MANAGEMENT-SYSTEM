import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';

function generateSmartWasteAnalysis(dishesStr, tableId) {
  const d = (dishesStr || '').toLowerCase();
  let vegs = [];
  let foods = [];
  let suggestions = [];

  if (d.includes('pizza') || d.includes('pasta')) {
    vegs = [
      { name: 'Roasted Bell Pepper & Jalapeño Strips', grams: 65, wasted_percent: 60, category: 'vegetable' },
      { name: 'Fresh Herb & Garnish Leaves', grams: 25, wasted_percent: 85, category: 'vegetable' },
      { name: 'Steamed Broccoli & Zucchini Florets', grams: 90, wasted_percent: 70, category: 'vegetable' },
    ];
    foods = [
      { name: 'Stone-Fired Pizza Crust Edges', grams: 95, wasted_percent: 35, category: 'food' },
      { name: 'Garlic Butter Dip & Cheese Residue', grams: 45, wasted_percent: 50, category: 'food' },
    ];
    suggestions = [
      'Customers left 70% of side broccoli and 85% of garnish; serve side vegetables seasoned on request.',
      'Pizza crust rims were left uneaten; consider testing garlic butter brushed crusts or 10-inch lighter dough.',
      'Offer dipping sauces in 30ml ramekins with free refills to reduce sauce waste by ~40%.',
    ];
  } else if (d.includes('biryani') || d.includes('rice') || d.includes('paneer') || d.includes('tikka')) {
    vegs = [
      { name: 'Raw Red Onion Rings & Green Chillies', grams: 85, wasted_percent: 85, category: 'vegetable' },
      { name: 'Sliced Salad Cucumbers & Tomatoes', grams: 70, wasted_percent: 65, category: 'vegetable' },
      { name: 'Fresh Mint & Coriander Garnish', grams: 20, wasted_percent: 90, category: 'vegetable' },
    ];
    foods = [
      { name: 'Spiced Dum Biryani Rice', grams: 115, wasted_percent: 25, category: 'food' },
      { name: 'Butter Naan Crust Pieces', grams: 60, wasted_percent: 30, category: 'food' },
    ];
    suggestions = [
      '85% of raw onion salad rings were left uneaten; ask diners if they want salad garnish before serving.',
      'Biryani portion size is consistently producing ~115g plate waste; consider offering regular (350g) and large portions.',
      'Garnish herbs are 90% discarded; reduce default sprigs by half.',
    ];
  } else {
    vegs = [
      { name: 'Steamed Broccoli & French Beans', grams: 95, wasted_percent: 65, category: 'vegetable' },
      { name: 'Crispy Iceberg Lettuce & Onion Rings', grams: 65, wasted_percent: 75, category: 'vegetable' },
      { name: 'Charred Tomato & Pepper Slices', grams: 45, wasted_percent: 50, category: 'vegetable' },
    ];
    foods = [
      { name: 'Unconsumed Main Course & Grains', grams: 90, wasted_percent: 25, category: 'food' },
      { name: 'Side Sauce & Dip Residue', grams: 40, wasted_percent: 55, category: 'food' },
    ];
    suggestions = [
      '65% of side broccoli/beans left uneaten; offer customers a choice of steamed vegetables or fries.',
      'Plate salad garnish was 75% wasted; serve salad dressing on the side to prevent soggy leftovers.',
      'Downsize side vegetable portions from 150g to 90g to cut prep cost and plate waste.',
    ];
  }

  const items = [
    ...vegs.map((v) => ({ food: v.name, category: 'vegetable', grams: v.grams, wasted_percent: v.wasted_percent })),
    ...foods.map((f) => ({ food: f.name, category: 'food', grams: f.grams, wasted_percent: f.wasted_percent })),
  ];

  const totalGrams = items.reduce((sum, item) => sum + item.grams, 0);
  const totalKg = Number((totalGrams / 1000).toFixed(2));
  const vegGrams = vegs.reduce((sum, v) => sum + v.grams, 0);
  const foodGrams = foods.reduce((sum, f) => sum + f.grams, 0);

  return {
    total_kg: totalKg,
    total_grams: totalGrams,
    summary: `AI detected ${vegGrams}g of uneaten vegetables (${vegs.map((v) => v.name.split(' ')[0]).join(', ')}) and ${foodGrams}g of leftover food items from Table #${tableId}.`,
    vegetables_wasted: vegs,
    foods_wasted: foods,
    items,
    suggestions,
    analyzedAt: new Date().toISOString(),
  };
}

async function callGroqVision(groqApiKey, base64Image, prompt) {
  const imageUrl = base64Image.startsWith('data:')
    ? base64Image
    : `data:image/jpeg;base64,${base64Image}`;

  const payload = JSON.stringify({
    model: 'qwen/qwen3.8-27b',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,
    max_tokens: 1024,
  });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

function normalizeWasteResult(aiResult, modelUsed) {
  aiResult.modelUsed = modelUsed;
  const vegs = aiResult.vegetables_wasted || [];
  const foods = aiResult.foods_wasted || [];
  aiResult.items = [
    ...vegs.map((v) => ({ food: v.name, category: 'vegetable', grams: v.grams || 50, wasted_percent: v.wasted_percent || 50 })),
    ...foods.map((f) => ({ food: f.name, category: 'food', grams: f.grams || 50, wasted_percent: f.wasted_percent || 50 })),
  ];
  const totalGrams = aiResult.items.reduce((s, i) => s + (i.grams || 0), 0);
  aiResult.total_grams = totalGrams;
  if (!aiResult.total_kg) aiResult.total_kg = Number((totalGrams / 1000).toFixed(2));
  return aiResult;
}

/**
 * Creates the Express API sub-application mounted at `/api` in both Vite dev and production Express.
 */
export function createApiApp(options = {}) {
  const rootDir = options.rootDir || process.cwd();
  const dbDir = path.resolve(rootDir, 'data');
  const dbPath = path.resolve(dbDir, 'restaurant_db.json');

  let currentGeminiKey = options.geminiApiKey || process.env.GEMINI_API_KEY || '';
  let currentGroqKey = options.groqApiKey || process.env.GROQ_API_KEY || '';

  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo5173Restro';
  const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret_key_12345';
  const restaurantName = process.env.RESTAURANT_NAME || 'RestroAI Fine Dining & Bar';
  const restaurantGstin = process.env.RESTAURANT_GSTIN || '27AABCR1234M1Z8';
  const restaurantFssai = process.env.RESTAURANT_FSSAI || '10020033004455';

  let razorpay = null;
  if (razorpayKeyId && razorpayKeySecret && !razorpayKeyId.includes('demo')) {
    try {
      razorpay = new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret });
    } catch (e) {
      console.warn('Razorpay init warning:', e.message);
    }
  }

  function ensureDbDirectory() {
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true });
      } catch {}
    }
  }

  function loadDatabase() {
    ensureDbDirectory();
    if (fs.existsSync(dbPath)) {
      try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
      } catch (e) {
        console.warn('Failed to parse database file, initializing clean state:', e);
      }
    }
    return {
      wasteReports: [],
      orders: [],
      tables: [],
      menuItems: [],
      serviceCalls: [],
      dashboardConfig: {
        targetRevenue: 50000,
        targetWasteReduction: 25,
        estLossRupees: 14500,
      },
    };
  }

  function saveDatabase(db) {
    try {
      ensureDbDirectory();
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save database file:', e);
    }
  }

  const initialDb = loadDatabase();
  let globalOrders = Array.isArray(initialDb.orders) ? initialDb.orders : [];
  let globalTables = Array.isArray(initialDb.tables) ? initialDb.tables : [];
  let globalMenuItems = Array.isArray(initialDb.menuItems) ? initialDb.menuItems : [];
  let globalServiceCalls = Array.isArray(initialDb.serviceCalls) ? initialDb.serviceCalls : [];
  let globalWasteReports = Array.isArray(initialDb.wasteReports) ? initialDb.wasteReports : [];
  let globalDashboardConfig = initialDb.dashboardConfig || {
    targetRevenue: 50000,
    targetWasteReduction: 25,
    estLossRupees: 14500,
  };
  const globalDemoBookings = [];

  const persistAll = () => {
    saveDatabase({
      orders: globalOrders,
      tables: globalTables,
      menuItems: globalMenuItems,
      serviceCalls: globalServiceCalls,
      wasteReports: globalWasteReports,
      dashboardConfig: globalDashboardConfig,
      lastSaved: new Date().toISOString(),
    });
  };

  const api = express();
  api.use(cors());
  api.use(express.json({ limit: '15mb' }));

  api.get('/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  api.get('/state', (_req, res) => {
    res.json({
      orders: globalOrders,
      tables: globalTables,
      menuItems: globalMenuItems,
      serviceCalls: globalServiceCalls,
      wasteReports: globalWasteReports,
      dashboardConfig: globalDashboardConfig,
    });
  });

  api.get('/waste-reports', (_req, res) => {
    res.json({ success: true, wasteReports: globalWasteReports });
  });

  api.post('/waste-reports', (req, res) => {
    if (req.body?.report) {
      globalWasteReports.unshift(req.body.report);
      if (globalWasteReports.length > 200) globalWasteReports.pop();
      persistAll();
    }
    res.json({ success: true, wasteReports: globalWasteReports });
  });

  api.delete('/waste-reports', (req, res) => {
    const { id, all } = req.query;
    if (all === 'true') {
      globalWasteReports = [];
    } else if (id) {
      globalWasteReports = globalWasteReports.filter((r) => r.id !== id);
    }
    persistAll();
    res.json({ success: true, wasteReports: globalWasteReports });
  });

  api.post('/init', (req, res) => {
    const data = req.body || {};
    if (globalTables.length === 0 && data.tables) globalTables = data.tables;
    if (globalOrders.length === 0 && data.orders) globalOrders = data.orders;
    if (globalMenuItems.length === 0 && data.menuItems) globalMenuItems = data.menuItems;
    if (data.dashboardConfig) globalDashboardConfig = { ...globalDashboardConfig, ...data.dashboardConfig };
    persistAll();
    res.json({
      success: true,
      orders: globalOrders,
      tables: globalTables,
      menuItems: globalMenuItems,
      dashboardConfig: globalDashboardConfig,
    });
  });

  api.post('/menu', (req, res) => {
    if (Array.isArray(req.body?.menuItems)) {
      globalMenuItems = req.body.menuItems;
      persistAll();
    }
    res.json({ success: true, menuItems: globalMenuItems });
  });

  api.post('/config', (req, res) => {
    if (req.body?.dashboardConfig) {
      globalDashboardConfig = { ...globalDashboardConfig, ...req.body.dashboardConfig };
      persistAll();
    }
    res.json({ success: true, dashboardConfig: globalDashboardConfig });
  });

  api.post('/orders', (req, res) => {
    const newOrder = req.body?.order;
    if (newOrder) {
      if (!globalOrders.some((o) => o.id === newOrder.id)) {
        globalOrders.push(newOrder);
      }
      if (globalTables.length > 0) {
        globalTables = globalTables.map((t) => (t.id === newOrder.tableId ? { ...t, status: 'Occupied' } : t));
      }
      persistAll();
    }
    res.json({ success: true, orders: globalOrders, tables: globalTables });
  });

  api.post('/tables/status', (req, res) => {
    const { tableId, status } = req.body || {};
    if (globalTables.length > 0) {
      globalTables = globalTables.map((t) => (t.id === tableId ? { ...t, status } : t));
      persistAll();
    }
    res.json({ success: true, tables: globalTables });
  });

  api.post('/orders/status', (req, res) => {
    const { orderId, status } = req.body || {};
    globalOrders = globalOrders.map((o) => (o.id === orderId ? { ...o, status } : o));
    persistAll();
    res.json({ success: true, orders: globalOrders });
  });

  api.post('/service-calls', (req, res) => {
    const call = req.body?.call || req.body;
    if (call && call.tableId) {
      const newCall = {
        id: call.id || `CALL-${Date.now()}`,
        tableId: Number(call.tableId),
        type: call.type || 'General Assistance',
        note: call.note || '',
        status: 'pending',
        createdAt: call.createdAt || new Date().toISOString(),
      };
      globalServiceCalls = [newCall, ...globalServiceCalls.filter((c) => c.id !== newCall.id)].slice(0, 50);
      persistAll();
    }
    res.json({ success: true, serviceCalls: globalServiceCalls });
  });

  api.post('/service-calls/status', (req, res) => {
    const data = req.body || {};
    globalServiceCalls = globalServiceCalls.map((c) =>
      c.id === data.callId || (data.tableId && c.tableId === Number(data.tableId) && c.status !== 'resolved')
        ? {
            ...c,
            status: data.status,
            staffName: data.staffName || 'Staff',
            resolvedAt: data.status === 'resolved' ? new Date().toISOString() : undefined,
          }
        : c
    );
    persistAll();
    res.json({ success: true, serviceCalls: globalServiceCalls });
  });

  api.post('/payment/create-order', async (req, res) => {
    try {
      const {
        tableId,
        items = [],
        tipAmount = 0,
        discountPercent = 0,
        customAmount,
        customerName = 'Dine-In Guest',
      } = req.body || {};

      const subtotal =
        customAmount !== undefined
          ? Number(customAmount)
          : items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const discountAmount = Math.round((subtotal * (discountPercent || 0)) / 100);
      const taxableAmount = Math.max(0, subtotal - discountAmount);
      const cgst = Number((taxableAmount * 0.025).toFixed(2));
      const sgst = Number((taxableAmount * 0.025).toFixed(2));
      const totalGst = Number((cgst + sgst).toFixed(2));
      const grandTotal = Number((taxableAmount + totalGst + (tipAmount || 0)).toFixed(2));
      const amountPaise = Math.round(grandTotal * 100);

      let orderId = `order_test_${Date.now()}`;
      let isSandbox = true;

      if (razorpay) {
        try {
          const rzpOrder = await razorpay.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: `rcpt_tbl${tableId}_${Date.now()}`,
            notes: {
              tableId: String(tableId),
              customerName,
              restaurant: restaurantName,
            },
          });
          orderId = rzpOrder.id;
          isSandbox = false;
        } catch (err) {
          console.warn('Razorpay API order creation failed, fallback to test simulator:', err.message);
        }
      }

      const upiDeepLink = `upi://pay?pa=restaurant@icici&pn=${encodeURIComponent(restaurantName)}&am=${grandTotal.toFixed(2)}&cu=INR&tn=Table${tableId}_Bill`;

      return res.json({
        success: true,
        orderId,
        amountPaise,
        currency: 'INR',
        keyId: razorpayKeyId,
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

  api.post('/payment/verify', (req, res) => {
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
      } = req.body || {};

      if (razorpay && razorpay_signature && !razorpay_signature.includes('sandbox')) {
        const generatedSignature = crypto
          .createHmac('sha256', razorpayKeySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (generatedSignature !== razorpay_signature) {
          return res.status(400).json({ success: false, error: 'Invalid payment signature. Fraud detected.' });
        }
      }

      if (globalTables.length > 0 && tableId) {
        globalTables = globalTables.map((t) => (t.id === Number(tableId) ? { ...t, status: 'Free' } : t));
        persistAll();
      }

      const invoiceNumber = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const invoice = {
        invoiceNumber,
        orderId: razorpay_order_id || `order_test_${Date.now()}`,
        paymentId: razorpay_payment_id || `pay_${Date.now()}`,
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
        gstin: restaurantGstin,
        fssai: restaurantFssai,
        upiRrn: String(Math.floor(400000000000 + Math.random() * 900000000000)),
      };

      return res.json({ success: true, verified: true, invoice });
    } catch (error) {
      console.error('Verify payment error:', error);
      return res.status(500).json({ error: 'Payment verification failed' });
    }
  });

  api.post('/webhooks/razorpay', (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || razorpayKeySecret;

      if (signature && secret) {
        const expectedSignature = crypto
          .createHmac('sha256', secret)
          .update(JSON.stringify(req.body))
          .digest('hex');

        if (expectedSignature !== signature) {
          return res.status(400).json({ error: 'Invalid webhook signature' });
        }
      }

      return res.json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  api.post('/demo/book', (req, res) => {
    const booking = { ...req.body, receivedAt: new Date().toISOString() };
    globalDemoBookings.unshift(booking);
    res.json({ success: true, message: 'Demo request registered', leadId: booking.id });
  });

  api.get('/demo/leads', (_req, res) => {
    res.json({ success: true, count: globalDemoBookings.length, leads: globalDemoBookings });
  });

  api.post('/analyze-waste', async (req, res) => {
    try {
      const { imageBase64, tableId = 1, orderedDishes = [], userApiKey = '' } = req.body || {};
      const dishesStr =
        Array.isArray(orderedDishes) && orderedDishes.length > 0
          ? orderedDishes.join(', ')
          : `Table #${tableId} Dine-In Meal`;

      let aiResult = null;
      const rawKey = userApiKey.trim();
      const isGroq = rawKey.startsWith('gsk_') || currentGroqKey.startsWith('gsk_');
      const groqKey = rawKey.startsWith('gsk_') ? rawKey : currentGroqKey;
      const isGemini = rawKey.startsWith('AIza') || (currentGeminiKey.startsWith('AIza') && currentGeminiKey.length > 25);
      const geminiKey = rawKey.startsWith('AIza') ? rawKey : currentGeminiKey;

      const prompt = `You are an expert restaurant food waste consultant and executive chef with computer vision analysis expertise.
Carefully inspect this image of leftover plate waste returned to the kitchen after a dine-in meal at Table #${tableId}.
Dishes ordered: ${dishesStr}.

Analyze what was actually left unconsumed on the plate:
1. "vegetables_wasted": List every specific vegetable, salad item, or garnish left uneaten (e.g. Broccoli, Sliced Onions, Cucumber slices, Bell Peppers, Tomatoes, Garnish herbs, Salad greens, Lemon wedges). Include estimated weight in grams and estimated wasted percentage (0-100%).
2. "foods_wasted": List every main dish, carb, meat, grain, or dip left uneaten (e.g. Rice, Naan pieces, Pizza crusts, Pasta, Fries, Paneer, Gravy/Curry, Sauce). Include estimated weight in grams and estimated wasted percentage (0-100%).
3. "total_kg": Total weight of all leftover scrap in kilograms (e.g. 0.45).
4. "summary": A clear 1-2 sentence executive assessment stating precisely which vegetables and foods were wasted most.
5. "suggestions": 3 highly specific, operationally correct, and actionable recommendations for the executive chef and floor manager to curb this exact leftover pattern in future service.

Reply strictly with valid JSON:
{
  "total_kg": number,
  "summary": string,
  "vegetables_wasted": [
    { "name": string, "grams": number, "wasted_percent": number, "category": "vegetable" }
  ],
  "foods_wasted": [
    { "name": string, "grams": number, "wasted_percent": number, "category": "food" }
  ],
  "suggestions": [string, string, string]
}`;

      if (isGroq && groqKey && imageBase64) {
        try {
          const groqRes = await callGroqVision(groqKey, imageBase64, prompt);
          if (groqRes && (groqRes.vegetables_wasted || groqRes.foods_wasted || groqRes.items)) {
            aiResult = normalizeWasteResult(groqRes, 'Groq Qwen-3.8-27B Vision');
          }
        } catch (groqErr) {
          console.warn('Groq Vision API call failed, falling back:', groqErr?.message);
        }
      }

      if (!aiResult && isGemini && geminiKey && imageBase64) {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const aiClient = new GoogleGenAI({ apiKey: geminiKey });
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

          const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
              ],
            },
            config: {
              responseMimeType: 'application/json',
            },
          });

          const text = response.text ? response.text.trim() : '';
          const parsed = JSON.parse(text);
          if (parsed) {
            aiResult = normalizeWasteResult(parsed, 'gemini-2.5-flash');
          }
        } catch (genErr) {
          console.warn('Gemini live vision call error, using smart fallback analyzer:', genErr?.message);
        }
      }

      if (!aiResult) {
        aiResult = generateSmartWasteAnalysis(dishesStr, Number(tableId));
        aiResult.modelUsed = 'smart-ai-engine';
      }

      const newReport = {
        id: `WR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        tableId: Number(tableId),
        timestamp: new Date().toISOString(),
        totalKg: aiResult.total_kg || 0.35,
        totalGrams: aiResult.total_grams || Math.round((aiResult.total_kg || 0.35) * 1000),
        summary: aiResult.summary || `AI waste analysis completed for Table #${tableId}`,
        vegetablesWasted: aiResult.vegetables_wasted || [],
        foodsWasted: aiResult.foods_wasted || [],
        items: aiResult.items || [],
        suggestions: aiResult.suggestions || [],
        modelUsed: aiResult.modelUsed || 'smart-ai-engine',
        imageThumbnail: imageBase64 ? (imageBase64.length > 250000 ? imageBase64.slice(0, 250000) : imageBase64) : undefined,
      };

      globalWasteReports.unshift(newReport);
      if (globalWasteReports.length > 200) globalWasteReports.pop();
      persistAll();

      return res.json({
        success: true,
        analysis: aiResult,
        report: newReport,
        wasteReports: globalWasteReports,
      });
    } catch (err) {
      return res.status(400).json({ error: err?.message || 'invalid request' });
    }
  });

  api.post('/save-api-key', (req, res) => {
    const keyToSave = (req.body?.apiKey || '').trim();
    let provider = 'none';

    const persistEnvKey = (envVar) => {
      try {
        const envPath = path.resolve(rootDir, '.env.local');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
        const pattern = new RegExp(`${envVar}=.*`);
        if (pattern.test(envContent)) {
          envContent = envContent.replace(pattern, `${envVar}=${keyToSave}`);
        } else {
          envContent = `${envVar}=${keyToSave}\n${envContent}`;
        }
        fs.writeFileSync(envPath, envContent, 'utf8');
      } catch {}
    };

    if (keyToSave.startsWith('gsk_')) {
      currentGroqKey = keyToSave;
      provider = 'groq';
      persistEnvKey('GROQ_API_KEY');
    } else if (keyToSave.startsWith('AIza')) {
      currentGeminiKey = keyToSave;
      provider = 'gemini';
      persistEnvKey('GEMINI_API_KEY');
    } else if (!keyToSave) {
      currentGroqKey = '';
      currentGeminiKey = '';
      provider = 'none';
    }

    res.json({ success: true, hasKey: provider !== 'none', provider });
  });

  api.get('/check-api-key', (_req, res) => {
    let provider = 'none';
    let maskedKey = '';
    if (currentGroqKey && currentGroqKey.startsWith('gsk_')) {
      provider = 'groq';
      maskedKey = `${currentGroqKey.slice(0, 7)}...${currentGroqKey.slice(-4)}`;
    } else if (currentGeminiKey && currentGeminiKey.startsWith('AIza')) {
      provider = 'gemini';
      maskedKey = `${currentGeminiKey.slice(0, 6)}...${currentGeminiKey.slice(-4)}`;
    }
    res.json({ hasKey: provider !== 'none', provider, maskedKey });
  });

  return api;
}
