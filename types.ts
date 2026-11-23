export enum TableStatus {
  Free = 'Free',
  Occupied = 'Occupied',
  Reserved = 'Reserved',
  NeedsCleaning = 'Needs Cleaning',
}

export interface Table {
  id: number;
  status: TableStatus;
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: 'Appetizer' | 'Main Course' | 'Dessert' | 'Beverage' | string;
}

export enum OrderStatus {
    Preparing = 'Preparing',
    Ready = 'Ready',
    Served = 'Served'
}

export interface OrderItem {
  menuItemId: number;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: Date;
}

export interface WasteLog {
    id: string;
    date: string;
    menuItemId: number;
    wastedAmountKg: number;
    reason: string;
}

export enum PortionFeedback {
    TooSmall = 'Too Small',
    OK = 'OK',
    TooLarge = 'Too Large'
}

export interface Feedback {
    id: string;
    tableId: number;
    menuItemId?: number;
    tasteRating: number; // 1-5
    portionFeedback?: PortionFeedback;
    comment?: string;
    servantTip?: number;
    servantName?: string;
    compliments?: string[];
    createdAt?: string;
}

export interface Prediction {
    itemName: string;
    suggestedQtyKg: number;
    reasoning: string;
    confidence: 'Low' | 'Medium' | 'High';
}

export interface VisualWasteAnalysis {
    identifiedItems: string[];
    wasteEstimateKg: number;
    suggestion: string;
}
  
export interface VisualWasteLog {
    id: string;
    createdAt: Date;
    imageBase64: string;
    notes?: string;
    analysis: VisualWasteAnalysis;
}

export interface AIPredictionResult {
    predictions: Prediction[];
    menuSuggestion: string;
    customerFeedbackInsights: string;
}

export interface TaxInvoice {
    invoiceNumber: string;
    orderId: string;
    paymentId: string;
    tableId: number;
    customerName?: string;
    customerPhone?: string;
    paidAt: string;
    items: {
        name: string;
        price: number;
        quantity: number;
        total: number;
    }[];
    subtotal: number;
    discountPercent: number;
    discountAmount: number;
    taxableAmount: number;
    cgst: number; // 2.5%
    sgst: number; // 2.5%
    totalTax: number; // 5%
    tipAmount: number;
    grandTotal: number;
    paymentMethod: 'UPI' | 'GPay' | 'PhonePe' | 'Paytm' | 'Card' | 'Cash';
    gstin: string;
    fssai: string;
    upiRrn?: string;
}

export interface WasteItemDetail {
    name: string;
    grams: number;
    wasted_percent: number;
    category: 'vegetable' | 'food';
}

export interface LeftoverWasteReport {
    id: string;
    tableId: number;
    timestamp: string;
    totalKg: number;
    totalGrams: number;
    summary: string;
    vegetablesWasted: WasteItemDetail[];
    foodsWasted: WasteItemDetail[];
    items?: WasteItemDetail[];
    suggestions: string[];
    modelUsed?: string;
    imageThumbnail?: string;
}

