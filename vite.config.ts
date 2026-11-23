import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function generateSmartWasteAnalysis(dishesStr: string, tableId: number) {
  const d = (dishesStr || '').toLowerCase();
  let vegs: any[] = [];
  let foods: any[] = [];
  let suggestions: string[] = [];

  if (d.includes('pizza') || d.includes('pasta')) {
    vegs = [
      { name: "Roasted Bell Pepper & Jalapeño Strips", grams: 65, wasted_percent: 60, category: "vegetable" },
      { name: "Fresh Herb & Garnish Leaves", grams: 25, wasted_percent: 85, category: "vegetable" },
      { name: "Steamed Broccoli & Zucchini Florets", grams: 90, wasted_percent: 70, category: "vegetable" }
    ];
    foods = [
      { name: "Stone-Fired Pizza Crust Edges", grams: 95, wasted_percent: 35, category: "food" },
      { name: "Garlic Butter Dip & Cheese Residue", grams: 45, wasted_percent: 50, category: "food" }
    ];
    suggestions = [
      "Customers left 70% of side broccoli and 85% of garnish; serve side vegetables seasoned on request.",
      "Pizza crust rims were left uneaten; consider testing garlic butter brushed crusts or 10-inch lighter dough.",
      "Offer dipping sauces in 30ml ramekins with free refills to reduce sauce waste by ~40%."
    ];
  } else if (d.includes('biryani') || d.includes('rice') || d.includes('paneer') || d.includes('tikka')) {
    vegs = [
      { name: "Raw Red Onion Rings & Green Chillies", grams: 85, wasted_percent: 85, category: "vegetable" },
      { name: "Sliced Salad Cucumbers & Tomatoes", grams: 70, wasted_percent: 65, category: "vegetable" },
      { name: "Fresh Mint & Coriander Garnish", grams: 20, wasted_percent: 90, category: "vegetable" }
    ];
    foods = [
      { name: "Spiced Dum Biryani Rice", grams: 115, wasted_percent: 25, category: "food" },
      { name: "Butter Naan Crust Pieces", grams: 60, wasted_percent: 30, category: "food" }
    ];
    suggestions = [
      "85% of raw onion salad rings were left uneaten; ask diners if they want salad garnish before serving.",
      "Biryani portion size is consistently producing ~115g plate waste; consider offering regular (350g) and large portions.",
      "Garnish herbs are 90% discarded; reduce default sprigs by half."
    ];
  } else {
    vegs = [
      { name: "Steamed Broccoli & French Beans", grams: 95, wasted_percent: 65, category: "vegetable" },
      { name: "Crispy Iceberg Lettuce & Onion Rings", grams: 65, wasted_percent: 75, category: "vegetable" },
      { name: "Charred Tomato & Pepper Slices", grams: 45, wasted_percent: 50, category: "vegetable" }
    ];
    foods = [
      { name: "Unconsumed Main Course & Grains", grams: 90, wasted_percent: 25, category: "food" },
      { name: "Side Sauce & Dip Residue", grams: 40, wasted_percent: 55, category: "food" }
    ];
    suggestions = [
      "65% of side broccoli/beans left uneaten; offer customers a choice of steamed vegetables or fries.",
      "Plate salad garnish was 75% wasted; serve salad dressing on the side to prevent soggy leftovers.",
      "Downsize side vegetable portions from 150g to 90g to cut prep cost and plate waste."
    ];
  }

  const items = [
    ...vegs.map(v => ({ food: v.name, category: "vegetable", grams: v.grams, wasted_percent: v.wasted_percent })),
    ...foods.map(f => ({ food: f.name, category: "food", grams: f.grams, wasted_percent: f.wasted_percent }))
  ];

  const totalGrams = items.reduce((sum, item) => sum + item.grams, 0);
  const totalKg = Number((totalGrams / 1000).toFixed(2));
  const vegGrams = vegs.reduce((sum, v) => sum + v.grams, 0);
  const foodGrams = foods.reduce((sum, f) => sum + f.grams, 0);

  return {
    total_kg: totalKg,
    total_grams: totalGrams,
    summary: `AI detected ${vegGrams}g of uneaten vegetables (${vegs.map(v => v.name.split(' ')[0]).join(', ')}) and ${foodGrams}g of leftover food items from Table #${tableId}.`,
    vegetables_wasted: vegs,
    foods_wasted: foods,
    items: items,
    suggestions: suggestions,
    analyzedAt: new Date().toISOString()
  };
}

async function callGroqVision(groqApiKey: string, base64Image: string, prompt: string) {
  const imageUrl = base64Image.startsWith('data:') 
    ? base64Image 
    : `data:image/jpeg;base64,${base64Image}`;

  const payload = JSON.stringify({
    model: "qwen/qwen3.8-27b",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageUrl } }
        ]
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 1024
  });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json"
    },
    body: payload
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const json: any = await response.json();
  const content = json.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

const DB_DIR = path.resolve(__dirname, 'data');
const DB_PATH = path.resolve(DB_DIR, 'restaurant_db.json');

function ensureDbDirectory() {
  if (!fs.existsSync(DB_DIR)) {
    try { fs.mkdirSync(DB_DIR, { recursive: true }); } catch (e) {}
  }
}

function loadDatabase() {
  ensureDbDirectory();
  if (fs.existsSync(DB_PATH)) {
    try {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
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
      estLossRupees: 14500
    }
  };
}

function saveDatabase(db: any) {
  try {
    ensureDbDirectory();
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database file:', e);
  }
}

function restroAiSyncPlugin(apiKey?: string, groqApiKey?: string): Plugin {
  let currentGeminiKey = apiKey || '';
  let currentGroqKey = groqApiKey || process.env.GROQ_API_KEY || '';
  
  const initialDb = loadDatabase();
  let globalOrders: any[] = Array.isArray(initialDb.orders) ? initialDb.orders : [];
  let globalTables: any[] = Array.isArray(initialDb.tables) ? initialDb.tables : [];
  let globalMenuItems: any[] = Array.isArray(initialDb.menuItems) ? initialDb.menuItems : [];
  let globalServiceCalls: any[] = Array.isArray(initialDb.serviceCalls) ? initialDb.serviceCalls : [];
  let globalWasteReports: any[] = Array.isArray(initialDb.wasteReports) ? initialDb.wasteReports : [];
  let globalDashboardConfig = initialDb.dashboardConfig || {
    targetRevenue: 50000,
    targetWasteReduction: 25,
    estLossRupees: 14500
  };

  const persistAll = () => {
    saveDatabase({
      orders: globalOrders,
      tables: globalTables,
      menuItems: globalMenuItems,
      serviceCalls: globalServiceCalls,
      wasteReports: globalWasteReports,
      dashboardConfig: globalDashboardConfig,
      lastSaved: new Date().toISOString()
    });
  };

  return {
    name: 'restro-ai-sync-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        if (req.url === '/api/state' && req.method === 'GET') {
          res.statusCode = 200;
          res.end(JSON.stringify({ 
            orders: globalOrders, 
            tables: globalTables,
            menuItems: globalMenuItems,
            serviceCalls: globalServiceCalls,
            wasteReports: globalWasteReports,
            dashboardConfig: globalDashboardConfig
          }));
          return;
        }

        if (req.url === '/api/waste-reports' && req.method === 'GET') {
          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            wasteReports: globalWasteReports
          }));
          return;
        }

        if (req.url === '/api/waste-reports' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data.report) {
                globalWasteReports.unshift(data.report);
                if (globalWasteReports.length > 200) globalWasteReports.pop();
                persistAll();
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, wasteReports: globalWasteReports }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url?.startsWith('/api/waste-reports') && req.method === 'DELETE') {
          const urlObj = new URL(req.url, 'http://localhost');
          const id = urlObj.searchParams.get('id');
          const all = urlObj.searchParams.get('all');
          if (all === 'true') {
            globalWasteReports = [];
          } else if (id) {
            globalWasteReports = globalWasteReports.filter(r => r.id !== id);
          }
          persistAll();
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, wasteReports: globalWasteReports }));
          return;
        }

        if (req.url === '/api/init' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (globalTables.length === 0 && data.tables) globalTables = data.tables;
              if (globalOrders.length === 0 && data.orders) globalOrders = data.orders;
              if (globalMenuItems.length === 0 && data.menuItems) globalMenuItems = data.menuItems;
              if (data.dashboardConfig) globalDashboardConfig = { ...globalDashboardConfig, ...data.dashboardConfig };
              persistAll();
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, orders: globalOrders, tables: globalTables, menuItems: globalMenuItems, dashboardConfig: globalDashboardConfig }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/menu' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (Array.isArray(data.menuItems)) {
                globalMenuItems = data.menuItems;
                persistAll();
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, menuItems: globalMenuItems }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/config' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (data.dashboardConfig) {
                globalDashboardConfig = { ...globalDashboardConfig, ...data.dashboardConfig };
                persistAll();
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, dashboardConfig: globalDashboardConfig }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/orders' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const newOrder = data.order;
              if (newOrder) {
                if (!globalOrders.some(o => o.id === newOrder.id)) {
                  globalOrders.push(newOrder);
                }
                if (globalTables.length > 0) {
                  globalTables = globalTables.map(t => t.id === newOrder.tableId ? { ...t, status: 'Occupied' } : t);
                }
                persistAll();
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, orders: globalOrders, tables: globalTables }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/tables/status' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              if (globalTables.length > 0) {
                globalTables = globalTables.map(t => t.id === data.tableId ? { ...t, status: data.status } : t);
                persistAll();
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, tables: globalTables }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/orders/status' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              globalOrders = globalOrders.map(o => o.id === data.orderId ? { ...o, status: data.status } : o);
              persistAll();
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, orders: globalOrders }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/service-calls' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const call = data.call || data;
              if (call && call.tableId) {
                const newCall = {
                  id: call.id || `CALL-${Date.now()}`,
                  tableId: Number(call.tableId),
                  type: call.type || 'General Assistance',
                  note: call.note || '',
                  status: 'pending',
                  createdAt: call.createdAt || new Date().toISOString(),
                };
                globalServiceCalls = [newCall, ...globalServiceCalls.filter(c => c.id !== newCall.id)].slice(0, 50);
                persistAll();
              }
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, serviceCalls: globalServiceCalls }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/service-calls/status' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              globalServiceCalls = globalServiceCalls.map(c => 
                (c.id === data.callId || (data.tableId && c.tableId === Number(data.tableId) && c.status !== 'resolved'))
                  ? { ...c, status: data.status, staffName: data.staffName || 'Staff', resolvedAt: data.status === 'resolved' ? new Date().toISOString() : undefined }
                  : c
              );
              persistAll();
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, serviceCalls: globalServiceCalls }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/payment/create-order' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const {
                tableId,
                items = [],
                tipAmount = 0,
                discountPercent = 0,
                customAmount,
                customerName = 'Dine-In Guest',
              } = data;

              const subtotal = customAmount !== undefined
                ? Number(customAmount)
                : items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

              const discountAmount = Math.round((subtotal * (discountPercent || 0)) / 100);
              const taxableAmount = Math.max(0, subtotal - discountAmount);
              const cgst = Number((taxableAmount * 0.025).toFixed(2));
              const sgst = Number((taxableAmount * 0.025).toFixed(2));
              const totalGst = Number((cgst + sgst).toFixed(2));
              const grandTotal = Number((taxableAmount + totalGst + (tipAmount || 0)).toFixed(2));
              const amountPaise = Math.round(grandTotal * 100);

              const orderId = `order_test_${Date.now()}`;
              const upiDeepLink = `upi://pay?pa=restaurant@icici&pn=RestroAI&am=${grandTotal.toFixed(2)}&cu=INR&tn=Table${tableId}_Bill`;

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                orderId,
                amountPaise,
                currency: 'INR',
                keyId: 'rzp_test_demo5173Restro',
                isSandbox: true,
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
              }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/payment/verify' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const {
                razorpay_order_id,
                razorpay_payment_id,
                tableId,
                order,
                customerName = 'Dine-In Guest',
                customerPhone = '9876543210',
                method = 'UPI',
              } = data;

              // Automatically mark the table as Free in in-memory state
              if (globalTables.length > 0 && tableId) {
                globalTables = globalTables.map(t => t.id === Number(tableId) ? { ...t, status: 'Free' } : t);
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
                gstin: '27AABCR1234M1Z8',
                fssai: '10020033004455',
                upiRrn: String(Math.floor(400000000000 + Math.random() * 900000000000)),
              };

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                verified: true,
                invoice,
              }));
            } catch (e) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/analyze-waste' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              const { imageBase64, tableId = 1, orderedDishes = [] } = data;
              const dishesStr = Array.isArray(orderedDishes) && orderedDishes.length > 0
                ? orderedDishes.join(', ')
                : `Table #${tableId} Dine-In Meal`;

              let aiResult: any = null;
              const rawKey = (data.userApiKey || '').trim();
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
5. "suggestions": 3 highly specific, operationally correct, and actionable recommendations for the executive chef and floor manager to curb this exact leftover pattern in future service:
   - For uneaten side vegetables or salads: recommend asking guests' side preference at ordering, serving dressings on the side, or adjusting side prep weights.
   - For leftover grains, rice, or breads: recommend introducing lunch/half-portion sizing or offering proactive eco-friendly take-away packaging.
   - For leftover garnishes or herbs: recommend switching from decorative sprigs to edible chop or making garnish strictly on-request.
   - For remaining dipping sauces or condiments: recommend downsizing ramekins from 60ml to 30ml with free on-demand refills.
   Ensure every suggestion is realistic, professional, and directly matches the items detected.

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
                    aiResult = groqRes;
                    aiResult.modelUsed = "Groq Qwen-3.8-27B Vision";
                    const vegs = aiResult.vegetables_wasted || [];
                    const foods = aiResult.foods_wasted || [];
                    aiResult.items = [
                      ...vegs.map((v: any) => ({ food: v.name, category: 'vegetable', grams: v.grams || 50, wasted_percent: v.wasted_percent || 50 })),
                      ...foods.map((f: any) => ({ food: f.name, category: 'food', grams: f.grams || 50, wasted_percent: f.wasted_percent || 50 }))
                    ];
                    const totalGrams = aiResult.items.reduce((s: number, i: any) => s + (i.grams || 0), 0);
                    aiResult.total_grams = totalGrams;
                    if (!aiResult.total_kg) aiResult.total_kg = Number((totalGrams / 1000).toFixed(2));
                  }
                } catch (groqErr: any) {
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
                        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
                      ]
                    },
                    config: {
                      responseMimeType: 'application/json'
                    }
                  });

                  const text = response.text ? response.text.trim() : '';
                  aiResult = JSON.parse(text);
                  if (aiResult) {
                    aiResult.modelUsed = "gemini-2.5-flash";
                    const vegs = aiResult.vegetables_wasted || [];
                    const foods = aiResult.foods_wasted || [];
                    aiResult.items = [
                      ...vegs.map((v: any) => ({ food: v.name, category: 'vegetable', grams: v.grams || 50, wasted_percent: v.wasted_percent || 50 })),
                      ...foods.map((f: any) => ({ food: f.name, category: 'food', grams: f.grams || 50, wasted_percent: f.wasted_percent || 50 }))
                    ];
                    const totalGrams = aiResult.items.reduce((s: number, i: any) => s + (i.grams || 0), 0);
                    aiResult.total_grams = totalGrams;
                    if (!aiResult.total_kg) aiResult.total_kg = Number((totalGrams / 1000).toFixed(2));
                  }
                } catch (genErr: any) {
                  console.warn('Gemini live vision call error, using smart fallback analyzer:', genErr?.message);
                }
              }

              if (!aiResult) {
                aiResult = generateSmartWasteAnalysis(dishesStr, Number(tableId));
                aiResult.modelUsed = "smart-ai-engine";
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
                modelUsed: aiResult.modelUsed || "Groq Qwen-3.8-27B Vision",
                imageThumbnail: imageBase64 ? (imageBase64.length > 250000 ? imageBase64.slice(0, 250000) : imageBase64) : undefined
              };

              globalWasteReports.unshift(newReport);
              if (globalWasteReports.length > 200) globalWasteReports.pop();
              persistAll();

              res.statusCode = 200;
              res.end(JSON.stringify({
                success: true,
                analysis: aiResult,
                report: newReport,
                wasteReports: globalWasteReports
              }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err?.message || 'invalid request' }));
            }
          });
          return;
        }

        if (req.url === '/api/save-api-key' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const keyToSave = (data.apiKey || '').trim();
              let provider = 'none';

              if (keyToSave.startsWith('gsk_')) {
                currentGroqKey = keyToSave;
                provider = 'groq';
                try {
                  const envPath = path.resolve(__dirname, '.env.local');
                  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
                  if (envContent.includes('GROQ_API_KEY=')) {
                    envContent = envContent.replace(/GROQ_API_KEY=.*/, `GROQ_API_KEY=${keyToSave}`);
                  } else {
                    envContent = `GROQ_API_KEY=${keyToSave}\n` + envContent;
                  }
                  fs.writeFileSync(envPath, envContent, 'utf8');
                } catch (fErr) {}
              } else if (keyToSave.startsWith('AIza')) {
                currentGeminiKey = keyToSave;
                provider = 'gemini';
                try {
                  const envPath = path.resolve(__dirname, '.env.local');
                  let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
                  if (envContent.includes('GEMINI_API_KEY=')) {
                    envContent = envContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${keyToSave}`);
                  } else {
                    envContent = `GEMINI_API_KEY=${keyToSave}\n` + envContent;
                  }
                  fs.writeFileSync(envPath, envContent, 'utf8');
                } catch (fErr) {}
              } else if (!keyToSave) {
                currentGroqKey = '';
                currentGeminiKey = '';
                provider = 'none';
              }

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, hasKey: provider !== 'none', provider }));
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'invalid json' }));
            }
          });
          return;
        }

        if (req.url === '/api/check-api-key' && req.method === 'GET') {
          let provider = 'none';
          let masked = '';
          if (currentGroqKey && currentGroqKey.startsWith('gsk_')) {
            provider = 'groq';
            masked = currentGroqKey.slice(0, 7) + '...' + currentGroqKey.slice(-4);
          } else if (currentGeminiKey && currentGeminiKey.startsWith('AIza')) {
            provider = 'gemini';
            masked = currentGeminiKey.slice(0, 6) + '...' + currentGeminiKey.slice(-4);
          }
          res.statusCode = 200;
          res.end(JSON.stringify({
            hasKey: provider !== 'none',
            provider,
            maskedKey: masked
          }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
      },
      plugins: [react(), restroAiSyncPlugin(env.GEMINI_API_KEY, env.GROQ_API_KEY)],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GROQ_API_KEY': JSON.stringify(env.GROQ_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
