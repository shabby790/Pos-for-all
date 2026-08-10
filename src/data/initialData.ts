import { Category, Customer, Product, PromoCode, Sale, StoreSettings, User } from '../types';

export const initialCategories: Category[] = [
  { id: 'cat_beverages', name: 'Beverages & Drinks', nameUrdu: 'مشروبات (Drinks)', color: 'bg-blue-500', icon: 'CupSoda' },
  { id: 'cat_grocery', name: 'Grocery & Staples', nameUrdu: 'کرایانہ (Grocery)', color: 'bg-emerald-500', icon: 'ShoppingBag' },
  { id: 'cat_snacks', name: 'Snacks & Biscuits', nameUrdu: 'سنیکس و بسکویٹ', color: 'bg-amber-500', icon: 'Cookie' },
  { id: 'cat_dairy', name: 'Dairy & Bakery', nameUrdu: 'ڈیری و بیکری', color: 'bg-yellow-500', icon: 'Milk' },
  { id: 'cat_electronics', name: 'Tech & Accessories', nameUrdu: 'الیکٹرانکس و اسسریز', color: 'bg-indigo-500', icon: 'Smartphone' },
];

export const initialProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Nestle Milkpak 1 Liter',
    nameUrdu: 'نسلے ملکی پیک ۱ لیٹر',
    category: 'cat_dairy',
    sku: 'MILK-001',
    barcode: '896400010101',
    buyPrice: 280,
    sellPrice: 320,
    stockQuantity: 45,
    unit: 'Pack',
    reorderLevel: 10,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop&q=80',
    description: 'Fresh UHT Whole Milk 1L Pack'
  },
  {
    id: 'prod_2',
    name: 'Tapal Danedar Tea 450g',
    nameUrdu: 'تپال دانے دار چائے ۴۵۰ گرام',
    category: 'cat_grocery',
    sku: 'TEA-002',
    barcode: '896400010102',
    buyPrice: 850,
    sellPrice: 980,
    stockQuantity: 28,
    unit: 'Pack',
    reorderLevel: 5,
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=80',
    description: 'Premium Granular Black Tea'
  },
  {
    id: 'prod_3',
    name: 'Pepsi 1.5 Liter Bottle',
    nameUrdu: 'پیپسی ۱.۵ لیٹر بوتل',
    category: 'cat_beverages',
    sku: 'BEV-003',
    barcode: '896400010103',
    buyPrice: 150,
    sellPrice: 190,
    stockQuantity: 60,
    unit: 'Pcs',
    reorderLevel: 15,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80',
    description: 'Chilled Carbonated Cola Drink'
  },
  {
    id: 'prod_4',
    name: 'Lays Masala Family Pack',
    nameUrdu: 'لیز مصالحہ فیملی پیک',
    category: 'cat_snacks',
    sku: 'SNK-004',
    barcode: '896400010104',
    buyPrice: 110,
    sellPrice: 140,
    stockQuantity: 8, // Low stock on purpose
    unit: 'Pack',
    reorderLevel: 12,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=80',
    description: 'Crispy Potato Chips Masala Flavour'
  },
  {
    id: 'prod_5',
    name: 'Shan Biryani Masala 50g',
    nameUrdu: 'شان بریانی مصالحہ ۵۰ گرام',
    category: 'cat_grocery',
    sku: 'GMC-005',
    barcode: '896400010105',
    buyPrice: 115,
    sellPrice: 140,
    stockQuantity: 50,
    unit: 'Pack',
    reorderLevel: 10,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=80',
    description: 'Authentic Spices Mixture for Rice'
  },
  {
    id: 'prod_6',
    name: 'Olpers Cheese Slice 200g',
    nameUrdu: 'اولپرز چیز سلائس ۲۰۰ گرام',
    category: 'cat_dairy',
    sku: 'DRY-006',
    barcode: '896400010106',
    buyPrice: 420,
    sellPrice: 520,
    stockQuantity: 18,
    unit: 'Pack',
    reorderLevel: 5,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&auto=format&fit=crop&q=80',
    description: 'Processed Processed Cheddar Slices'
  },
  {
    id: 'prod_7',
    name: 'USB Fast Charging Cable C-Type',
    nameUrdu: 'یو ایس بی فاسٹ چارجنگ کیبل',
    category: 'cat_electronics',
    sku: 'TEC-007',
    barcode: '896400010107',
    buyPrice: 350,
    sellPrice: 650,
    stockQuantity: 3, // Low stock
    unit: 'Pcs',
    reorderLevel: 5,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300&auto=format&fit=crop&q=80',
    description: 'Braided Nylon 65W Fast Cable'
  },
  {
    id: 'prod_8',
    name: 'Dawn Sandwich Bread Large',
    nameUrdu: 'ڈان سینڈوچ ڈبل روٹی',
    category: 'cat_dairy',
    sku: 'BAK-008',
    barcode: '896400010108',
    buyPrice: 180,
    sellPrice: 220,
    stockQuantity: 15,
    unit: 'Pack',
    reorderLevel: 5,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=80',
    description: 'Fresh Baked Plain White Bread'
  },
  {
    id: 'prod_9',
    name: 'Red Bull Energy Drink 250ml',
    nameUrdu: 'ریڈ بل انرجی ڈرنک ۲۵۰ ملی',
    category: 'cat_beverages',
    sku: 'BEV-009',
    barcode: '896400010109',
    buyPrice: 480,
    sellPrice: 580,
    stockQuantity: 32,
    unit: 'Can',
    reorderLevel: 8,
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80',
    description: 'Energy Drink Can'
  },
  {
    id: 'prod_10',
    name: 'Guard Basmati Rice 5kg',
    nameUrdu: 'گارڈ باسمتی چاول ۵ کلو',
    category: 'cat_grocery',
    sku: 'RIC-010',
    barcode: '896400010110',
    buyPrice: 2100,
    sellPrice: 2450,
    stockQuantity: 14,
    unit: 'Bag',
    reorderLevel: 4,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=80',
    description: 'Super Kernel Super Rice 5KG'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Chaudhry Muhammad Ali',
    phone: '0300-1234567',
    email: 'ali.chaudhry@gmail.com',
    address: 'House # 42, Block B, DHA Phase 5',
    loyaltyPoints: 340,
    outstandingBalance: 1450, // Udhaar
    totalSpent: 42500,
    createdAt: '2026-01-10'
  },
  {
    id: 'cust_2',
    name: 'Syed Tariq Mahmood',
    phone: '0321-9876543',
    email: 'tariq.syed@hotmail.com',
    address: 'Flat 302, Executive Heights, Gulberg',
    loyaltyPoints: 120,
    outstandingBalance: 0,
    totalSpent: 18200,
    createdAt: '2026-02-15'
  },
  {
    id: 'cust_3',
    name: 'Mrs. Saima Malik',
    phone: '0333-5554433',
    email: 'saima.malik@yahoo.com',
    address: 'Street 12, Model Town',
    loyaltyPoints: 580,
    outstandingBalance: 3200, // Udhaar
    totalSpent: 68900,
    createdAt: '2026-03-01'
  },
  {
    id: 'cust_4',
    name: 'Bilal Khan (Walk-in Regular)',
    phone: '0315-7778899',
    loyaltyPoints: 45,
    outstandingBalance: 0,
    totalSpent: 6200,
    createdAt: '2026-04-12'
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr_admin',
    name: 'Rana Hammad (Owner/Admin)',
    email: 'admin@posstudio.com',
    role: 'admin',
    pin: '1234',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'usr_mgr',
    name: 'Usman Ghani (Store Manager)',
    email: 'manager@posstudio.com',
    role: 'manager',
    pin: '5678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    active: true
  },
  {
    id: 'usr_cashier1',
    name: 'Zeeshan Ahmad (Cashier)',
    email: 'cashier@posstudio.com',
    role: 'cashier',
    pin: '0000',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    active: true
  }
];

export const initialPromoCodes: PromoCode[] = [
  { code: 'AZADI10', discountPercent: 10, active: true },
  { code: 'WELCOME50', discountPercent: 15, maxDiscount: 500, active: true },
  { code: 'EEDSPECIAL', discountPercent: 20, active: true }
];

export const initialStoreSettings: StoreSettings = {
  storeName: 'Bismillah Super Mart & POS',
  tagline: 'Quality Fresh Grocery & Daily Essentials',
  businessType: 'supermarket',
  address: 'Shop # 14-A, Main Commercial Market, Lahore',
  phone: '042-35789000 / 0300-8889900',
  email: 'sales@bismillahmart.pk',
  ntnGst: 'NTN: 4892019-2 | GST: 03-09-9999-011-17',
  currencySymbol: 'Rs.',
  taxRatePercent: 0, // GST off by default or configurable
  paperSize: '80mm',
  receiptHeader: '*** WELCOME TO BISMILLAH SUPER MART ***',
  receiptFooter: 'Thank you for shopping with us! Standard return policy within 3 days with receipt.',
  receiptLogo: '',
  enableSound: true,
  enableAutoBackup: true,
  enableCloudSync: true,
  theme: 'light',
  isIndustryLocked: false
};

// Past sales dummy data generator for analytical charts
export const initialSalesHistory: Sale[] = [
  {
    id: 'sale_101',
    orderNumber: 'INV-2026-0001',
    items: [
      { product: initialProducts[0], quantity: 2, selectedUnit: 'Pack', itemDiscountPercent: 0 },
      { product: initialProducts[2], quantity: 1, selectedUnit: 'Pcs', itemDiscountPercent: 0 }
    ],
    subtotal: 830,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 830,
    paymentMethod: 'cash',
    amountTendered: 1000,
    changeGiven: 170,
    customerId: 'cust_1',
    customerName: 'Chaudhry Muhammad Ali',
    cashierId: 'usr_cashier1',
    cashierName: 'Zeeshan Ahmad (Cashier)',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    synced: true
  },
  {
    id: 'sale_102',
    orderNumber: 'INV-2026-0002',
    items: [
      { product: initialProducts[1], quantity: 1, selectedUnit: 'Pack', itemDiscountPercent: 5 },
      { product: initialProducts[4], quantity: 3, selectedUnit: 'Pack', itemDiscountPercent: 0 }
    ],
    subtotal: 1351,
    discountAmount: 49,
    taxAmount: 0,
    grandTotal: 1351,
    paymentMethod: 'card',
    amountTendered: 1351,
    changeGiven: 0,
    customerId: 'cust_2',
    customerName: 'Syed Tariq Mahmood',
    cashierId: 'usr_cashier1',
    cashierName: 'Zeeshan Ahmad (Cashier)',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    synced: true
  },
  {
    id: 'sale_103',
    orderNumber: 'INV-2026-0003',
    items: [
      { product: initialProducts[9], quantity: 1, selectedUnit: 'Bag', itemDiscountPercent: 0 },
      { product: initialProducts[5], quantity: 2, selectedUnit: 'Pack', itemDiscountPercent: 0 }
    ],
    subtotal: 3490,
    discountAmount: 100,
    promoCode: 'AZADI10',
    taxAmount: 0,
    grandTotal: 3390,
    paymentMethod: 'credit_udhaar',
    amountTendered: 0,
    changeGiven: 0,
    customerId: 'cust_3',
    customerName: 'Mrs. Saima Malik',
    cashierId: 'usr_admin',
    cashierName: 'Rana Hammad (Owner/Admin)',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    synced: true
  },
  {
    id: 'sale_104',
    orderNumber: 'INV-2026-0004',
    items: [
      { product: initialProducts[3], quantity: 4, selectedUnit: 'Pack', itemDiscountPercent: 0 },
      { product: initialProducts[8], quantity: 2, selectedUnit: 'Can', itemDiscountPercent: 0 }
    ],
    subtotal: 1720,
    discountAmount: 0,
    taxAmount: 0,
    grandTotal: 1720,
    paymentMethod: 'wallet',
    amountTendered: 1720,
    changeGiven: 0,
    customerId: 'cust_1',
    customerName: 'Chaudhry Muhammad Ali',
    cashierId: 'usr_cashier1',
    cashierName: 'Zeeshan Ahmad (Cashier)',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    synced: true
  }
];
