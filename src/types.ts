export type Language = 'en' | 'ur_roman' | 'ur' | 'sd' | 'ps';

export type UserRole = 'admin' | 'manager' | 'cashier';

export interface UserPermissions {
  canPOS: boolean;
  canManageInventory: boolean;
  canViewAnalytics: boolean;
  canManageCustomers: boolean;
  canManageRoles: boolean;
  canSettings: boolean;
  canApplyDiscount: boolean;
  canEditPrices: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string;
  avatar?: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameUrdu?: string;
  icon?: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  nameUrdu?: string;
  category: string;
  sku: string;
  barcode: string;
  buyPrice: number;
  sellPrice: number;
  stockQuantity: number;
  unit: string; // e.g. "Pcs", "Kg", "Pack", "Ltr"
  reorderLevel: number;
  image?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit: string;
  itemDiscountPercent: number; // item level discount %
  itemDiscountAmount?: number; // item level discount in flat currency amount (e.g. Rs)
}

export type PaymentMethod = 'cash' | 'card' | 'wallet' | 'credit_udhaar';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  outstandingBalance: number; // Udhaar
  totalSpent: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  promoCode?: string;
  taxAmount: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  amountTendered: number;
  changeGiven: number;
  customerId?: string;
  customerName?: string;
  cashierId: string;
  cashierName: string;
  createdAt: string;
  synced: boolean;
  cardDetails?: {
    cardType?: string;
    last4Digits?: string;
    authCodeRef?: string;
    terminalId?: string;
  };
  walletDetails?: {
    provider?: string;
    accountPhone?: string;
    txnId?: string;
  };
}

export interface HoldCart {
  id: string;
  title: string;
  items: CartItem[];
  customerId?: string;
  customerName?: string;
  savedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  businessType?: 'supermarket' | 'garments' | 'pharmacy' | 'bakery' | 'spare_parts' | 'jewellery' | 'electronics' | 'hardware' | 'cosmetics' | 'beverages' | 'mobiles_accessories' | 'computers_laptops';
  address: string;
  phone: string;
  email: string;
  ntnGst: string;
  currencySymbol: string;
  taxRatePercent: number;
  paperSize: '80mm' | '58mm';
  receiptHeader: string;
  receiptFooter: string;
  receiptLogo?: string;
  enableSound: boolean;
  enableAutoBackup: boolean;
  enableCloudSync: boolean;
  theme: 'light' | 'dark' | 'high_contrast';
}

export interface SyncLog {
  id: string;
  type: 'sale' | 'inventory' | 'customer' | 'backup';
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  details: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'low_stock' | 'sync' | 'system' | 'sale';
  read: boolean;
  timestamp: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  maxDiscount?: number;
  minOrderValue?: number;
  active: boolean;
}
