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
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
  toggleUserActive: (userId: string) => void;

  // Backup & Reset
  exportBackupData: () => void;
  importBackupData: (jsonString: string) => boolean;
  resetToDummyData: () => void;
  loadIndustryPreset: (businessType: string) => void;
  clearAllDataToZero: () => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'SMART_POS_STUDIO_V1';

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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscountPercent, setCartDiscountPercent] = useState<number>(0);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  
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

    // Deduct stock
    setProducts(prevProds =>
      prevProds.map(p => {
        const cartMatch = cart.find(ci => ci.product.id === p.id);
        if (cartMatch) {
          const newQty = Math.max(0, p.stockQuantity - cartMatch.quantity);
          if (newQty <= p.reorderLevel) {
            addNotification('Low Stock Alert', `${p.name} stock is down to ${newQty} ${p.unit}!`, 'low_stock');
          }
          return { ...p, stockQuantity: newQty };
        }
        return p;
      })
    );

    // Update customer stats & Udhaar balance
    if (selectedCustomer) {
      setCustomers(prevCusts =>
        prevCusts.map(c => {
          if (c.id === selectedCustomer.id) {
            const addedPoints = Math.floor(grandTotal / 100);
            const addedBalance = paymentMethod === 'credit_udhaar' ? grandTotal : 0;
            return {
              ...c,
              loyaltyPoints: c.loyaltyPoints + addedPoints,
              outstandingBalance: c.outstandingBalance + addedBalance,
              totalSpent: c.totalSpent + grandTotal
            };
          }
          return c;
        })
      );
    }

    // Save sale
    setSales(prev => [newSale, ...prev]);

    if (settings.enableSound) {
      sounds.playSuccess();
    }

    addNotification('Sale Processed', `Order ${orderNum} completed (${settings.currencySymbol} ${grandTotal})`, 'sale');

    clearCart();

    return { success: true, sale: newSale };
  };

  const voidSale = (saleId: string) => {
    const targetSale = sales.find(s => s.id === saleId);
    if (!targetSale) {
      return { success: false, message: 'Sale order not found.' };
    }

    // Revert stock
    setProducts(prevProds =>
      prevProds.map(p => {
        const matchedItem = targetSale.items.find(i => i.product.id === p.id);
        if (matchedItem) {
          return { ...p, stockQuantity: p.stockQuantity + matchedItem.quantity };
        }
        return p;
      })
    );

    // Revert customer balance / points
    if (targetSale.customerId) {
      setCustomers(prevCusts =>
        prevCusts.map(c => {
          if (c.id === targetSale.customerId) {
            const deductedPoints = Math.floor(targetSale.grandTotal / 100);
            const deductedUdhaar = targetSale.paymentMethod === 'credit_udhaar' ? targetSale.grandTotal : 0;
            return {
              ...c,
              loyaltyPoints: Math.max(0, c.loyaltyPoints - deductedPoints),
              outstandingBalance: Math.max(0, c.outstandingBalance - deductedUdhaar),
              totalSpent: Math.max(0, c.totalSpent - targetSale.grandTotal)
            };
          }
          return c;
        })
      );
    }

    // Remove sale from history
    setSales(prev => prev.filter(s => s.id !== saleId));
    addNotification('Sale Voided', `Order ${targetSale.orderNumber} was voided and stock restored.`, 'system');

    return { success: true, message: `Order ${targetSale.orderNumber} voided successfully!` };
  };

  // Inventory CRUD
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: 'prod_' + Date.now()
    };
    setProducts(prev => [newProd, ...prev]);
    addNotification('Product Added', `${newProd.name} added to inventory.`, 'system');
  };

  const updateProduct = (prod: Product) => {
    setProducts(prev => prev.map(p => p.id === prod.id ? prod : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const adjustStock = (id: string, deltaQty: number, note?: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updatedQty = Math.max(0, p.stockQuantity + deltaQty);
          return { ...p, stockQuantity: updatedQty };
        }
        return p;
      })
    );
  };

  // Categories CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: 'cat_' + Date.now()
    };
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = (cat: Category) => {
    setCategories(prev => prev.map(c => c.id === cat.id ? cat : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Customers & Udhaar
  const addCustomer = (cData: Omit<Customer, 'id' | 'loyaltyPoints' | 'outstandingBalance' | 'totalSpent' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...cData,
      id: 'cust_' + Date.now(),
      loyaltyPoints: 0,
      outstandingBalance: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [...prev, newCust]);
    return newCust;
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
  };

  const collectUdhaarPayment = (customerId: string, amount: number) => {
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const newBal = Math.max(0, c.outstandingBalance - amount);
          return { ...c, outstandingBalance: newBal };
        }
        return c;
      })
    );
    addNotification('Udhaar Payment Received', `Payment of ${settings.currencySymbol}${amount} recorded.`, 'system');
  };

  // Roles & Users
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: 'usr_' + Date.now() };
    setUsersList(prev => [...prev, newUser]);
  };

  const toggleUserActive = (userId: string) => {
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u));
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Cloud Sync
  const syncQueueCount = sales.filter(s => !s.synced).length;

  const triggerCloudSync = async () => {
    try {
      const unsyncedSales = sales.filter(s => !s.synced);
      
      // Sync unsynced sales to Firestore
      for (const sale of unsyncedSales) {
        await setDoc(doc(db, 'sales', sale.id), {
          ...sale,
          synced: true,
          syncedAt: new Date().toISOString()
        });
      }

      // Sync settings to Firestore
      await setDoc(doc(db, 'settings', 'store_config'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });

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

  const resetToDummyData = () => {
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
      alert('System reset to clean sample data successfully.');
    }
  };

  const loadIndustryPreset = (businessType: string) => {
    const template = industryTemplates[businessType];
    if (template) {
      setProducts(template.products);
      setCategories(template.categories);
      setSettings(prev => ({
        ...prev,
        businessType: businessType as any,
        storeName: template.name,
        tagline: template.tagline
      }));
      setCart([]);
      setHoldCarts([]);
      sounds.playSuccess();
      alert(`✅ Loaded sample catalog for "${template.name}" successfully! (${template.products.length} Items & ${template.categories.length} Categories)`);
    }
  };

  const clearAllDataToZero = () => {
    if (confirm('⚠️ WARNING: Clear All Data to Zero!\n\nThis will delete all products, categories, sales history, customers, and active carts so you can start completely fresh from scratch.\n\nAre you sure you want to start from ZERO?')) {
      setProducts([]);
      setCategories([]);
      setSales([]);
      setCustomers([]);
      setCart([]);
      setHoldCarts([]);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
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
