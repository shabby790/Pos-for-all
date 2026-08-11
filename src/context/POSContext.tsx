import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Category,
  Customer,
  CartItem,
  HoldCart,
  Language,
  NotificationItem,
  Product,
  PromoCode,
  Sale,
  StoreSettings,
  SyncLog,
  User,
  UserRole,
  UserPermissions
} from '../types';
import {
  initialCategories,
  initialCustomers,
  initialProducts,
  initialPromoCodes,
  initialSalesHistory,
  initialStoreSettings,
  initialUsers
} from '../data/initialData';
import { industryTemplates } from '../data/industryPresets';
import { sounds } from '../utils/sound';
import { db, auth } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc,
  getDocs,
  getDocFromServer,
  writeBatch,
  updateDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errCode = (error as any)?.code;
  const errMsg = error instanceof Error ? error.message : String(error);

  // If error is network/connection/offline/unavailable related, log warning gracefully & do not throw fatal error
  if (
    errCode === 'unavailable' ||
    errCode === 'failed-precondition' ||
    errMsg.includes('unavailable') ||
    errMsg.includes('offline') ||
    errMsg.includes('Could not reach Cloud Firestore')
  ) {
    console.warn(`[Firestore Offline/Unavailable] ${operationType} on ${path}: ${errMsg}`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = typeof value === 'object' && value !== null ? sanitizeForFirestore(value) : value;
    }
  }
  return result as T;
}

interface POSContextType {
  // State
  language: Language;
  setLanguage: (lang: Language) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  products: Product[];
  categories: Category[];
  customers: Customer[];
  sales: Sale[];
  holdCarts: HoldCart[];
  cart: CartItem[];
  cartDiscountPercent: number;
  setCartDiscountPercent: (val: number) => void;
  appliedPromo?: PromoCode;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  selectedCustomer?: Customer;
  setSelectedCustomer: (cust?: Customer) => void;
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  isOnline: boolean;
  setIsOnline: (status: boolean) => void;
  syncQueueCount: number;
  syncLogs: SyncLog[];
  triggerCloudSync: () => Promise<void>;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  isLoading: boolean;

  // Role Permissions
  userPermissions: UserPermissions;

  // Cart Operations
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  updateCartItemDiscount: (productId: string, discountPercent: number, discountAmount?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  saveCartHold: (title?: string) => void;
  restoreHoldCart: (holdId: string) => void;
  deleteHoldCart: (holdId: string) => void;

  // Checkout & Void
  processCheckout: (
    paymentMethod: 'cash' | 'card' | 'wallet' | 'credit_udhaar',
    amountTendered: number,
    paymentMetaData?: {
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
  ) => { success: boolean; sale?: Sale; error?: string };
  voidSale: (saleId: string) => { success: boolean; message: string };

  // Inventory CRUD
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, deltaQty: number, note?: string) => void;

  // Category CRUD
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  // Customer CRUD & Udhaar
  addCustomer: (customer: Omit<Customer, 'id' | 'loyaltyPoints' | 'outstandingBalance' | 'totalSpent' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  collectUdhaarPayment: (customerId: string, amount: number) => void;

  // Role & Users
  usersList: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  toggleUserActive: (userId: string) => void;

  // Backup & Reset
  savedIndustryProfiles: Record<string, { businessType: string; settings: StoreSettings; products: Product[]; categories: Category[]; updatedAt: string }>;
  exportBackupData: () => void;
  importBackupData: (jsonString: string) => boolean;
  resetToDummyData: () => void;
  loadIndustryPreset: (businessType: string) => void;
  clearAllDataToZero: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'SMART_POS_STUDIO_V1';
const PROFILES_STORAGE_KEY = 'SMART_POS_INDUSTRY_PROFILES_V1';

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or default
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse localStorage:', e);
    }
    return null;
  };

  const loadSavedProfiles = () => {
    try {
      const saved = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned: Record<string, any> = {};
        Object.keys(parsed).forEach(type => {
          const prof = parsed[type];
          if (prof && prof.categories && prof.products) {
            const catIds = new Set(prof.categories.map((c: Category) => c.id));
            cleaned[type] = {
              ...prof,
              products: prof.products.filter((p: Product) => catIds.has(p.category))
            };
          } else {
            cleaned[type] = prof;
          }
        });
        return cleaned;
      }
    } catch (e) {
      console.error('Failed to parse saved profiles:', e);
    }
    return {};
  };

  const localData = loadInitialState();

  const [language, setLanguageState] = useState<Language>(localData?.language || 'ur_roman');
  const [usersList, setUsersList] = useState<User[]>(localData?.usersList || initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(localData?.currentUser || initialUsers[0]);
  const [products, setProducts] = useState<Product[]>(localData?.products || initialProducts);
  const [categories, setCategories] = useState<Category[]>(localData?.categories || initialCategories);
  const [customers, setCustomers] = useState<Customer[]>(localData?.customers || initialCustomers);
  const [sales, setSales] = useState<Sale[]>(localData?.sales || initialSalesHistory);
  const [holdCarts, setHoldCarts] = useState<HoldCart[]>(localData?.holdCarts || []);
  const [settings, setSettings] = useState<StoreSettings>(localData?.settings || initialStoreSettings);
  const [savedIndustryProfiles, setSavedIndustryProfiles] = useState<Record<string, { businessType: string; settings: StoreSettings; products: Product[]; categories: Category[]; updatedAt: string }>>(loadSavedProfiles());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscountPercent, setCartDiscountPercent] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Auto-save active store state into savedIndustryProfiles dictionary
  useEffect(() => {
    const currentType = settings.businessType || 'supermarket';
    const currentCatIds = new Set(categories.map(c => c.id));
    const cleanProds = products.filter(p => currentCatIds.has(p.category));

    setSavedIndustryProfiles(prev => {
      const updated = {
        ...prev,
        [currentType]: {
          businessType: currentType,
          settings,
          products: cleanProds,
          categories,
          updatedAt: new Date().toISOString()
        }
      };
      try {
        localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('LocalStorage profile save error:', e);
      }
      return updated;
    });
  }, [settings, products, categories]);
  
  // Test Connection on Mount
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Firebase connection validated');
      } catch (error) {
        const errCode = (error as any)?.code;
        const errMsg = error instanceof Error ? error.message : String(error);
        if (
          errCode === 'unavailable' ||
          errCode === 'failed-precondition' ||
          errMsg.includes('offline') ||
          errMsg.includes('unavailable') ||
          errMsg.includes('Could not reach Cloud Firestore')
        ) {
          console.warn("Firestore backend currently unreachable or offline. Operating with local persistent cache.");
        } else {
          console.error("Firebase connection check:", error);
        }
      }
    }
    testConnection();
  }, []);

  // Real-time Sync from Firestore
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods: Product[] = [];
      snapshot.forEach(doc => prods.push({ ...doc.data(), id: doc.id } as Product));
      if (prods.length > 0) {
        setProducts(prods);
      } else if (snapshot.empty) {
        initialProducts.forEach(p => {
          setDoc(doc(db, 'products', p.id), sanitizeForFirestore(p)).catch(() => {});
        });
        setProducts(initialProducts);
      }
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats: Category[] = [];
      snapshot.forEach(doc => cats.push({ ...doc.data(), id: doc.id } as Category));
      if (cats.length > 0) {
        setCategories(cats);
      } else if (snapshot.empty) {
        initialCategories.forEach(c => {
          setDoc(doc(db, 'categories', c.id), sanitizeForFirestore(c)).catch(() => {});
        });
        setCategories(initialCategories);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'categories'));

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const custs: Customer[] = [];
      snapshot.forEach(doc => custs.push({ ...doc.data(), id: doc.id } as Customer));
      if (custs.length > 0) {
        setCustomers(custs);
      } else if (snapshot.empty) {
        initialCustomers.forEach(c => {
          setDoc(doc(db, 'customers', c.id), sanitizeForFirestore(c)).catch(() => {});
        });
        setCustomers(initialCustomers);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'customers'));

    const unsubSales = onSnapshot(query(collection(db, 'sales'), orderBy('createdAt', 'desc')), (snapshot) => {
      const salesHistory: Sale[] = [];
      snapshot.forEach(doc => salesHistory.push({ ...doc.data(), id: doc.id } as Sale));
      if (salesHistory.length > 0) {
        setSales(salesHistory);
      } else if (snapshot.empty) {
        initialSalesHistory.forEach(s => {
          setDoc(doc(db, 'sales', s.id), sanitizeForFirestore(s)).catch(() => {});
        });
        setSales(initialSalesHistory);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sales'));

    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as StoreSettings);
      } else {
        setDoc(doc(db, 'settings', 'store_config'), sanitizeForFirestore(initialStoreSettings)).catch(() => {});
        setSettings(initialStoreSettings);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/store_config'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users: User[] = [];
      snapshot.forEach(doc => users.push({ ...doc.data(), id: doc.id } as User));
      if (users.length > 0) {
        setUsersList(users);
      } else if (snapshot.empty) {
        initialUsers.forEach(u => {
          setDoc(doc(db, 'users', u.id), sanitizeForFirestore(u)).catch(() => {});
        });
        setUsersList(initialUsers);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    return () => {
      unsubProducts();
      unsubCategories();
      unsubCustomers();
      unsubSales();
      unsubSettings();
    };
  }, []);
  
  // Online / Offline & Sync
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(localData?.syncLogs || []);
  const [notifications, setNotifications] = useState<NotificationItem[]>(localData?.notifications || [
    {
      id: 'notif_1',
      title: 'POS System Ready',
      message: 'Smart POS Studio loaded with offline capability and sample data.',
      type: 'system',
      read: false,
      timestamp: new Date().toLocaleTimeString()
    },
    {
      id: 'notif_2',
      title: 'Low Stock Alert',
      message: 'Lays Chips and Type-C Cable are below reorder level.',
      type: 'low_stock',
      read: false,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // Handle Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save state to localStorage
  useEffect(() => {
    try {
      const dataToSave = {
        language,
        usersList,
        currentUser,
        products,
        categories,
        customers,
        sales,
        holdCarts,
        settings,
        syncLogs,
        notifications
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }, [language, usersList, currentUser, products, categories, customers, sales, holdCarts, settings, syncLogs, notifications]);

  // Derived User Permissions based on role
  const getUserPermissions = (role: UserRole): UserPermissions => {
    if (role === 'admin') {
      return {
        canPOS: true,
        canManageInventory: true,
        canViewAnalytics: true,
        canManageCustomers: true,
        canManageRoles: true,
        canSettings: true,
        canApplyDiscount: true,
        canEditPrices: true,
      };
    } else if (role === 'manager') {
      return {
        canPOS: true,
        canManageInventory: true,
        canViewAnalytics: true,
        canManageCustomers: true,
        canManageRoles: false,
        canSettings: false,
        canApplyDiscount: true,
        canEditPrices: true,
      };
    } else {
      // Cashier
      return {
        canPOS: true,
        canManageInventory: false,
        canViewAnalytics: false,
        canManageCustomers: true,
        canManageRoles: false,
        canSettings: false,
        canApplyDiscount: false,
        canEditPrices: false,
      };
    }
  };

  const userPermissions = getUserPermissions(currentUser.role);

  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: 'notif_' + Date.now(),
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 25)]);
  };

  // Cart Operations
  const addToCart = (product: Product, quantity = 1) => {
    if (product.stockQuantity <= 0) {
      alert(`Cannot add ${product.name}: Out of Stock!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + quantity;
        if (newQty > product.stockQuantity) {
          alert(`Stock limit reached! Only ${product.stockQuantity} available.`);
          return prevCart;
        }
        return prevCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      } else {
        return [...prevCart, { product, quantity, selectedUnit: product.unit, itemDiscountPercent: 0, itemDiscountAmount: 0 }];
      }
    });

    if (settings.enableSound) {
      sounds.playBeep();
    }
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = products.find(p => p.id === productId);
    if (prod && quantity > prod.stockQuantity) {
      alert(`Maximum stock available for ${prod.name} is ${prod.stockQuantity}`);
      return;
    }

    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity } : item));
  };

  const updateCartItemDiscount = (productId: string, discountPercent: number, discountAmount: number = 0) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { 
      ...item, 
      itemDiscountPercent: Math.min(100, Math.max(0, discountPercent)),
      itemDiscountAmount: Math.max(0, discountAmount)
    } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscountPercent(0);
    setAppliedPromo(undefined);
    setSelectedCustomer(undefined);
  };

  const applyPromoCode = (code: string) => {
    const found = initialPromoCodes.find(p => p.code.toUpperCase() === code.trim().toUpperCase() && p.active);
    if (found) {
      setAppliedPromo(found);
      return { success: true, message: `Promo code ${found.code} applied! (${found.discountPercent}% OFF)` };
    }
    return { success: false, message: 'Invalid or expired promo code.' };
  };

  const removePromoCode = () => {
    setAppliedPromo(undefined);
  };

  // Hold Carts
  const saveCartHold = (title?: string) => {
    if (cart.length === 0) return;
    const newHold: HoldCart = {
      id: 'hold_' + Date.now(),
      title: title || `Cart #${holdCarts.length + 1} (${selectedCustomer?.name || 'Walk-in'})`,
      items: [...cart],
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name,
      savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setHoldCarts(prev => [newHold, ...prev]);
    clearCart();
    addNotification('Cart Placed on Hold', `Held ${newHold.items.length} items for ${newHold.title}`, 'system');
  };

  const restoreHoldCart = (holdId: string) => {
    const found = holdCarts.find(h => h.id === holdId);
    if (found) {
      setCart(found.items);
      if (found.customerId) {
        const cust = customers.find(c => c.id === found.customerId);
        if (cust) setSelectedCustomer(cust);
      }
      setHoldCarts(prev => prev.filter(h => h.id !== holdId));
    }
  };

  const deleteHoldCart = (holdId: string) => {
    setHoldCarts(prev => prev.filter(h => h.id !== holdId));
  };

  // Checkout
  const processCheckout = (
    paymentMethod: 'cash' | 'card' | 'wallet' | 'credit_udhaar',
    amountTendered: number,
    paymentMetaData?: {
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
  ) => {
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty!' };
    }

    if (paymentMethod === 'credit_udhaar' && !selectedCustomer) {
      return { success: false, error: 'Customer selection required for Udhaar / Store Credit!' };
    }

    // Calculate subtotal & discounts
    let rawSubtotal = 0;
    let itemDiscountsTotal = 0;
    cart.forEach(item => {
      const itemRaw = item.product.sellPrice * item.quantity;
      const percentDisc = itemRaw * ((item.itemDiscountPercent || 0) / 100);
      const flatDisc = item.itemDiscountAmount || 0;
      const itemDisc = Math.min(itemRaw, percentDisc + flatDisc);
      rawSubtotal += itemRaw;
      itemDiscountsTotal += itemDisc;
    });

    const subtotalAfterItemDiscounts = rawSubtotal - itemDiscountsTotal;

    let overallDiscountPercent = cartDiscountPercent;
    if (appliedPromo) {
      overallDiscountPercent += appliedPromo.discountPercent;
    }

    const cartDiscountAmount = (subtotalAfterItemDiscounts * overallDiscountPercent) / 100;
    const discountAmount = itemDiscountsTotal + cartDiscountAmount;
    const totalAfterDiscount = Math.max(0, rawSubtotal - discountAmount);
    const taxAmount = (totalAfterDiscount * settings.taxRatePercent) / 100;
    const grandTotal = Math.round(totalAfterDiscount + taxAmount);

    if (paymentMethod === 'cash' && amountTendered < grandTotal) {
      return { success: false, error: `Amount tendered (${amountTendered}) is less than total bill (${grandTotal})!` };
    }

    const changeGiven = paymentMethod === 'cash' ? Math.max(0, amountTendered - grandTotal) : 0;
    const orderNum = `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;

    const newSale: Sale = {
      id: 'sale_' + Date.now(),
      orderNumber: orderNum,
      items: [...cart],
      subtotal: Math.round(rawSubtotal),
      discountAmount: Math.round(discountAmount),
      promoCode: appliedPromo?.code,
      taxAmount: Math.round(taxAmount),
      grandTotal,
      paymentMethod,
      amountTendered: paymentMethod === 'cash' ? amountTendered : grandTotal,
      changeGiven,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Walk-in Customer',
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      createdAt: new Date().toISOString(),
      synced: isOnline,
      cardDetails: paymentMethod === 'card' ? paymentMetaData?.cardDetails : undefined,
      walletDetails: paymentMethod === 'wallet' ? paymentMetaData?.walletDetails : undefined,
    };

    // Atomically update stock, customer stats, and save sale
    const batch = writeBatch(db);

    // Deduct stock
    cart.forEach(item => {
      const p = products.find(prod => prod.id === item.product.id);
      if (p) {
        const newQty = Math.max(0, p.stockQuantity - item.quantity);
        batch.update(doc(db, 'products', p.id), { stockQuantity: newQty });
        if (newQty <= p.reorderLevel) {
          addNotification('Low Stock Alert', `${p.name} stock is down to ${newQty} ${p.unit}!`, 'low_stock');
        }
      }
    });

    // Update customer stats & Udhaar balance
    if (selectedCustomer) {
      const addedPoints = Math.floor(grandTotal / 100);
      const addedBalance = paymentMethod === 'credit_udhaar' ? grandTotal : 0;
      batch.update(doc(db, 'customers', selectedCustomer.id), {
        loyaltyPoints: (selectedCustomer.loyaltyPoints || 0) + addedPoints,
        outstandingBalance: (selectedCustomer.outstandingBalance || 0) + addedBalance,
        totalSpent: (selectedCustomer.totalSpent || 0) + grandTotal
      });
    }

    // Save sale
    batch.set(doc(db, 'sales', newSale.id), sanitizeForFirestore(newSale));

    batch.commit()
      .then(() => {
        if (settings.enableSound) sounds.playSuccess();
        addNotification('Sale Processed', `Order ${orderNum} completed (${settings.currencySymbol} ${grandTotal})`, 'sale');
        clearCart();
      })
      .catch(error => handleFirestoreError(error, OperationType.WRITE, 'checkout-batch'));

    return { success: true, sale: newSale };
  };

  const voidSale = async (saleId: string) => {
    const targetSale = sales.find(s => s.id === saleId);
    if (!targetSale) {
      return { success: false, message: 'Sale order not found.' };
    }

    const batch = writeBatch(db);

    // Revert stock
    targetSale.items.forEach(item => {
      const p = products.find(prod => prod.id === item.product.id);
      if (p) {
        batch.update(doc(db, 'products', p.id), { stockQuantity: p.stockQuantity + item.quantity });
      }
    });

    // Revert customer balance / points
    if (targetSale.customerId) {
      const c = customers.find(cust => cust.id === targetSale.customerId);
      if (c) {
        const deductedPoints = Math.floor(targetSale.grandTotal / 100);
        const deductedUdhaar = targetSale.paymentMethod === 'credit_udhaar' ? targetSale.grandTotal : 0;
        batch.update(doc(db, 'customers', c.id), {
          loyaltyPoints: Math.max(0, (c.loyaltyPoints || 0) - deductedPoints),
          outstandingBalance: Math.max(0, (c.outstandingBalance || 0) - deductedUdhaar),
          totalSpent: Math.max(0, (c.totalSpent || 0) - targetSale.grandTotal)
        });
      }
    }

    // Remove sale from Firestore
    batch.delete(doc(db, 'sales', saleId));

    try {
      await batch.commit();
      addNotification('Sale Voided', `Order ${targetSale.orderNumber} was voided and stock restored.`, 'system');
      return { success: true, message: `Order ${targetSale.orderNumber} voided successfully!` };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sales/${saleId}`);
      return { success: false, message: 'Failed to void sale in cloud.' };
    }
  };

  // Inventory CRUD
  const addProduct = async (prodData: Omit<Product, 'id'>) => {
    const id = 'prod_' + Date.now();
    const newProd: Product = { ...prodData, id };
    setProducts(prev => [newProd, ...prev]);
    try {
      await setDoc(doc(db, 'products', id), sanitizeForFirestore(newProd));
      addNotification('Product Added', `${newProd.name} added to cloud inventory.`, 'system');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    }
  };

  const updateProduct = async (prod: Product) => {
    setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
    try {
      await setDoc(doc(db, 'products', prod.id), sanitizeForFirestore(prod));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${prod.id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const adjustStock = async (id: string, deltaQty: number, note?: string) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const updatedQty = Math.max(0, p.stockQuantity + deltaQty);
    setProducts(prev => prev.map(prod => prod.id === id ? { ...prod, stockQuantity: updatedQty } : prod));
    try {
      await updateDoc(doc(db, 'products', id), { stockQuantity: updatedQty });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
    }
  };

  // Categories CRUD
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    const id = 'cat_' + Date.now();
    const newCat: Category = { ...catData, id };
    setCategories(prev => [...prev, newCat]);
    try {
      await setDoc(doc(db, 'categories', id), sanitizeForFirestore(newCat));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${id}`);
    }
  };

  const updateCategory = async (cat: Category) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
    try {
      await setDoc(doc(db, 'categories', cat.id), sanitizeForFirestore(cat));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${cat.id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    }
  };

  // Customers & Udhaar
  const addCustomer = (cData: Omit<Customer, 'id' | 'loyaltyPoints' | 'outstandingBalance' | 'totalSpent' | 'createdAt'>): Customer => {
    const id = 'cust_' + Date.now();
    const newCust: Customer = {
      ...cData,
      id,
      loyaltyPoints: 0,
      outstandingBalance: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [...prev, newCust]);
    setDoc(doc(db, 'customers', id), sanitizeForFirestore(newCust)).catch(error => handleFirestoreError(error, OperationType.WRITE, `customers/${id}`));
    return newCust;
  };

  const updateCustomer = async (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
    try {
      await setDoc(doc(db, 'customers', cust.id), sanitizeForFirestore(cust));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `customers/${cust.id}`);
    }
  };

  const collectUdhaarPayment = async (customerId: string, amount: number) => {
    const c = customers.find(cust => cust.id === customerId);
    if (!c) return;
    const newBal = Math.max(0, c.outstandingBalance - amount);
    setCustomers(prev => prev.map(cust => cust.id === customerId ? { ...cust, outstandingBalance: newBal } : cust));
    try {
      await updateDoc(doc(db, 'customers', customerId), { outstandingBalance: newBal });
      addNotification('Udhaar Payment Received', `Payment of ${settings.currencySymbol}${amount} recorded.`, 'system');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `customers/${customerId}`);
    }
  };

  // Roles & Users
  const addUser = async (userData: Omit<User, 'id'>) => {
    const id = 'usr_' + Date.now();
    const newUser: User = { ...userData, id };
    setUsersList(prev => [...prev, newUser]);
    try {
      await setDoc(doc(db, 'users', id), sanitizeForFirestore(newUser));
      addNotification('Staff Added', `${newUser.name} created.`, 'system');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${id}`);
    }
  };

  const updateUser = async (updatedUser: User) => {
    setUsersList(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    try {
      await setDoc(doc(db, 'users', updatedUser.id), sanitizeForFirestore(updatedUser));
      addNotification('User Updated', `Staff account for ${updatedUser.name} updated.`, 'system');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${updatedUser.id}`);
    }
  };

  const deleteUser = async (userId: string) => {
    if (usersList.length <= 1) {
      alert('Cannot delete the last remaining staff account!');
      return;
    }
    setUsersList(prev => prev.filter(u => u.id !== userId));
    try {
      await deleteDoc(doc(db, 'users', userId));
      addNotification('User Removed', `Staff account removed.`, 'system');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const toggleUserActive = async (userId: string) => {
    const u = usersList.find(user => user.id === userId);
    if (!u) return;
    const newStatus = !u.active;
    setUsersList(prev => prev.map(user => user.id === userId ? { ...user, active: newStatus } : user));
    try {
      await updateDoc(doc(db, 'users', userId), { active: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  // Settings
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    try {
      await setDoc(doc(db, 'settings', 'store_config'), sanitizeForFirestore(updated));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/store_config');
    }
  };

  // Cloud Sync
  const syncQueueCount = sales.filter(s => !s.synced).length;

  const triggerCloudSync = async () => {
    try {
      const unsyncedSales = sales.filter(s => !s.synced);
      
      // Sync unsynced sales to Firestore
      for (const sale of unsyncedSales) {
        await setDoc(doc(db, 'sales', sale.id), sanitizeForFirestore({
          ...sale,
          synced: true,
          syncedAt: new Date().toISOString()
        }));
      }

      // Sync settings to Firestore
      await setDoc(doc(db, 'settings', 'store_config'), sanitizeForFirestore({
        ...settings,
        updatedAt: new Date().toISOString()
      }));

      const res = await fetch('/api/cloud-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: settings.storeName,
          payload: { sales: unsyncedSales, productsCount: products.length },
          timestamp: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSales(prev => prev.map(s => ({ ...s, synced: true })));
        const newLog: SyncLog = {
          id: 'log_' + Date.now(),
          type: 'sale',
          status: 'success',
          timestamp: new Date().toLocaleTimeString(),
          details: `Synced ${unsyncedSales.length} transaction records directly to Firebase Firestore.`
        };
        setSyncLogs(prev => [newLog, ...prev]);
        addNotification('Cloud Sync Complete', `All records safely synchronized to Firebase Firestore.`, 'sync');
      }
    } catch (e: any) {
      console.error('Firestore sync error:', e);
      const newLog: SyncLog = {
        id: 'log_' + Date.now(),
        type: 'sale',
        status: 'failed',
        timestamp: new Date().toLocaleTimeString(),
        details: 'Network error or offline during cloud sync.'
      };
      setSyncLogs(prev => [newLog, ...prev]);
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Export / Import / Reset
  const exportBackupData = () => {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products,
      categories,
      customers,
      sales,
      settings,
      usersList
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `POS_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.products && parsed.sales && parsed.settings) {
        setProducts(parsed.products);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.sales) setSales(parsed.sales);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.usersList) setUsersList(parsed.usersList);
        alert('Backup data successfully restored!');
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    alert('Invalid backup JSON format!');
    return false;
  };

  const resetToDummyData = async () => {
    if (confirm('Are you sure you want to reset all data back to original demo state?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setProducts(initialProducts);
      setCategories(initialCategories);
      setCustomers(initialCustomers);
      setSales(initialSalesHistory);
      setSettings(initialStoreSettings);
      setUsersList(initialUsers);
      setCurrentUser(initialUsers[0]);
      setCart([]);
      setHoldCarts([]);

      try {
        const batch = writeBatch(db);
        initialProducts.forEach(p => batch.set(doc(db, 'products', p.id), sanitizeForFirestore(p)));
        initialCategories.forEach(c => batch.set(doc(db, 'categories', c.id), sanitizeForFirestore(c)));
        initialCustomers.forEach(c => batch.set(doc(db, 'customers', c.id), sanitizeForFirestore(c)));
        initialSalesHistory.forEach(s => batch.set(doc(db, 'sales', s.id), sanitizeForFirestore(s)));
        initialUsers.forEach(u => batch.set(doc(db, 'users', u.id), sanitizeForFirestore(u)));
        batch.set(doc(db, 'settings', 'store_config'), sanitizeForFirestore(initialStoreSettings));
        await batch.commit();
      } catch (err) {
        console.error('Error resetting Firestore:', err);
      }

      alert('System reset to clean sample data successfully.');
    }
  };

  const loadIndustryPreset = async (businessType: string) => {
    const currentType = settings.businessType || 'supermarket';
    
    // Clean current products by current categories before snapshotting
    const currentCatIds = new Set(categories.map(c => c.id));
    const cleanCurrentProducts = products.filter(p => currentCatIds.has(p.category));

    // Snapshot current active state before switching
    const profilesCopy = {
      ...savedIndustryProfiles,
      [currentType]: {
        businessType: currentType,
        settings,
        products: cleanCurrentProducts,
        categories,
        updatedAt: new Date().toISOString()
      }
    };

    let targetProducts: Product[] = [];
    let targetCategories: Category[] = [];
    let targetSettings: StoreSettings;
    let isRestored = false;

    // Check if we have a previously saved profile for this industry
    if (profilesCopy[businessType]) {
      const saved = profilesCopy[businessType];
      targetCategories = saved.categories && saved.categories.length > 0 ? saved.categories : (industryTemplates[businessType]?.categories || []);
      const targetCatIds = new Set(targetCategories.map(c => c.id));
      targetProducts = (saved.products || []).filter(p => targetCatIds.has(p.category));

      // Fallback if targetProducts was empty or contaminated
      if (targetProducts.length === 0 && industryTemplates[businessType]?.products) {
        targetProducts = industryTemplates[businessType].products;
      }

      targetSettings = {
        ...saved.settings,
        businessType: businessType as any
      };
      isRestored = true;
    } else {
      // Fallback to fresh template
      const template = industryTemplates[businessType];
      if (!template) return;
      targetProducts = template.products;
      targetCategories = template.categories;
      targetSettings = {
        ...settings,
        businessType: businessType as any,
        storeName: template.name,
        tagline: template.tagline
      };
    }

    // Keep profile dictionary updated with cleaned target products/categories
    profilesCopy[businessType] = {
      businessType,
      settings: targetSettings,
      products: targetProducts,
      categories: targetCategories,
      updatedAt: new Date().toISOString()
    };

    setSavedIndustryProfiles(profilesCopy);
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profilesCopy));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    setProducts(targetProducts);
    setCategories(targetCategories);
    setSettings(targetSettings);
    setCart([]);
    setHoldCarts([]);

    try {
      // Fetch all existing product and category documents in Firestore
      const existingProdsSnap = await getDocs(collection(db, 'products'));
      const existingCatsSnap = await getDocs(collection(db, 'categories'));

      const targetProdIds = new Set(targetProducts.map(p => p.id));
      const targetCatIds = new Set(targetCategories.map(c => c.id));

      const batch = writeBatch(db);

      // Clean out Firestore documents from previous store profiles
      existingProdsSnap.forEach(d => {
        if (!targetProdIds.has(d.id)) {
          batch.delete(doc(db, 'products', d.id));
        }
      });

      existingCatsSnap.forEach(d => {
        if (!targetCatIds.has(d.id)) {
          batch.delete(doc(db, 'categories', d.id));
        }
      });

      // Write target products, categories and settings
      targetProducts.forEach(p => batch.set(doc(db, 'products', p.id), sanitizeForFirestore(p)));
      targetCategories.forEach(c => batch.set(doc(db, 'categories', c.id), sanitizeForFirestore(c)));
      batch.set(doc(db, 'settings', 'store_config'), sanitizeForFirestore(targetSettings));
      batch.set(doc(db, 'settings', 'industry_profiles'), sanitizeForFirestore({ data: profilesCopy }));
      await batch.commit();
    } catch (err) {
      console.error('Error syncing preset to Firestore:', err);
    }

    sounds.playSuccess();

    if (isRestored) {
      alert(`✅ Restored saved store profile for "${targetSettings.storeName}"!\nAll your custom prices, items, and settings for this store have been restored exactly as you saved them.`);
    } else {
      alert(`✅ Loaded catalog for "${targetSettings.storeName}"!\nAll future changes for this store will now be saved independently.`);
    }
  };

  const clearAllDataToZero = async () => {
    if (confirm('⚠️ WARNING: Clear All Data to Zero!\n\nThis will delete all products, categories, sales history, customers, and active carts so you can start completely fresh from scratch.\n\nAre you sure you want to start from ZERO?')) {
      setProducts([]);
      setCategories([]);
      setSales([]);
      setCustomers([]);
      setCart([]);
      setHoldCarts([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      try {
        const batch = writeBatch(db);
        products.forEach(p => batch.delete(doc(db, 'products', p.id)));
        categories.forEach(c => batch.delete(doc(db, 'categories', c.id)));
        sales.forEach(s => batch.delete(doc(db, 'sales', s.id)));
        customers.forEach(c => batch.delete(doc(db, 'customers', c.id)));
        await batch.commit();
      } catch (err) {
        console.error('Error clearing Firestore DB:', err);
      }

      sounds.playSuccess();
      alert('✨ All dummy data cleared! Your POS system is now fresh & ready for real entry (0 products, 0 sales).');
    }
  };

  return (
    <POSContext.Provider
      value={{
        language,
        setLanguage: setLanguageState,
        currentUser,
        setCurrentUser,
        products,
        categories,
        customers,
        sales,
        holdCarts,
        cart,
        cartDiscountPercent,
        setCartDiscountPercent,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        selectedCustomer,
        setSelectedCustomer,
        settings,
        updateSettings,
        isOnline,
        setIsOnline,
        syncQueueCount,
        syncLogs,
        triggerCloudSync,
        notifications,
        markNotificationRead,
        clearNotifications,
        isLoading,
        userPermissions,
        addToCart,
        updateCartQuantity,
        updateCartItemDiscount,
        removeFromCart,
        clearCart,
        saveCartHold,
        restoreHoldCart,
        deleteHoldCart,
        processCheckout,
        voidSale,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addCustomer,
        updateCustomer,
        collectUdhaarPayment,
        usersList,
        addUser,
        updateUser,
        deleteUser,
        toggleUserActive,
        exportBackupData,
        importBackupData,
        resetToDummyData,
        loadIndustryPreset,
        clearAllDataToZero
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
