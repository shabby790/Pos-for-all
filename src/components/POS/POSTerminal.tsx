import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { t } from '../../utils/i18n';
import {
  Search,
  Barcode,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  Percent,
  PauseCircle,
  UserPlus,
  CreditCard,
  Check,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  X
} from 'lucide-react';
import { Product, Sale } from '../../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

export const POSTerminal: React.FC = () => {
  const {
    language,
    products,
    categories,
    cart,
    addToCart,
    updateCartQuantity,
    updateCartItemDiscount,
    removeFromCart,
    clearCart,
    cartDiscountPercent,
    setCartDiscountPercent,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    addCustomer,
    saveCartHold,
    holdCarts,
    restoreHoldCart,
    deleteHoldCart,
    settings,
    userPermissions
  } = usePOS();

  // Search & Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');
  
  // Modals & Drawers
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showNewCustModal, setShowNewCustModal] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // New Customer Form
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Item discount mode per product ('flat' = Rs, 'percent' = %)
  const [itemDiscountMode, setItemDiscountMode] = useState<Record<string, 'flat' | 'percent'>>({});

  // Filter products by category & search query
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      (p.nameUrdu && p.nameUrdu.includes(query));
    return matchesCat && matchesSearch;
  });

  // Handle scanned barcode
  const handleBarcodeScanned = (code: string) => {
    const found = products.find(p => p.barcode === code.trim() || p.sku.toLowerCase() === code.trim().toLowerCase());
    if (found) {
      addToCart(found, 1);
    } else {
      alert(`No product found matching barcode / SKU: ${code}`);
    }
  };

  // Hardware USB/Bluetooth Barcode Scanner Gun Listener
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is actively typing in a form input/textarea/select, let normal typing happen
      const activeElement = document.activeElement;
      const targetTag = activeElement?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      const currentTime = Date.now();
      // Hardware barcode scanners send keystrokes in rapid succession (< 60ms apart)
      if (currentTime - lastKeyTime > 80) {
        barcodeBuffer = '';
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 2) {
          e.preventDefault();
          handleBarcodeScanned(barcodeBuffer.trim());
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
        lastKeyTime = currentTime;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products]);

  // Handle Promo Code Apply
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput) {
      const res = applyPromoCode(promoInput);
      setPromoMessage(res.message);
      if (res.success) setPromoInput('');
    }
  };

  // Handle Quick Add Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustName.trim() && newCustPhone.trim()) {
      const created = addCustomer({ name: newCustName.trim(), phone: newCustPhone.trim() });
      setSelectedCustomer(created);
      setNewCustName('');
      setNewCustPhone('');
      setShowNewCustModal(false);
    }
  };

  // Cart Totals calculation
  let rawSubtotal = 0;
  let itemDiscountsTotal = 0;
  cart.forEach(item => {
    const itemRaw = item.product.sellPrice * item.quantity;
    const pDisc = itemRaw * ((item.itemDiscountPercent || 0) / 100);
    const fDisc = item.itemDiscountAmount || 0;
    const itemDisc = Math.min(itemRaw, pDisc + fDisc);
    rawSubtotal += itemRaw;
    itemDiscountsTotal += itemDisc;
  });

  const subtotalAfterItemDiscounts = rawSubtotal - itemDiscountsTotal;

  let totalDiscountPercent = cartDiscountPercent;
  if (appliedPromo) {
    totalDiscountPercent += appliedPromo.discountPercent;
  }

  const cartDiscountAmount = (subtotalAfterItemDiscounts * totalDiscountPercent) / 100;
  const discountAmount = Math.round(itemDiscountsTotal + cartDiscountAmount);
  const subtotal = Math.round(rawSubtotal);
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((totalAfterDiscount * settings.taxRatePercent) / 100);
  const grandTotal = Math.round(totalAfterDiscount + taxAmount);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 overflow-hidden overflow-x-hidden max-w-full w-full relative">
      
      {/* Mobile Top Navigation Tabs (visible only on small screens < lg) */}
      <div className="flex lg:hidden bg-slate-900 border-b border-slate-800 p-1.5 gap-1.5 shrink-0 z-20">
        <button
          onClick={() => setMobileView('products')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileView === 'products'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white bg-slate-950/60'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all relative ${
            mobileView === 'cart'
              ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
              : 'text-slate-400 hover:text-white bg-slate-950/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          {cart.length > 0 && (
            <span className="font-mono text-[10px] bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
              {settings.currencySymbol}{grandTotal}
            </span>
          )}
        </button>
      </div>

      {/* Left Main Section: Search, Categories, Product Grid */}
      <div className={`flex-1 flex flex-col p-3 sm:p-4 overflow-hidden relative ${mobileView === 'cart' ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Top Search & Action Bar */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  const code = searchQuery.trim();
                  const found = products.find(p => p.barcode === code || p.sku.toLowerCase() === code.toLowerCase() || p.name.toLowerCase().includes(code.toLowerCase()));
                  if (found) {
                    addToCart(found, 1);
                    setSearchQuery('');
                  }
                }
              }}
              placeholder={t('search_product', language)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Suggestions Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                {products
                  .filter(p => 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (p.nameUrdu && p.nameUrdu.includes(searchQuery)) ||
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.barcode.includes(searchQuery)
                  )
                  .slice(0, 8)
                  .map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        addToCart(p, 1);
                        setSearchQuery('');
                      }}
                      className="w-full p-2.5 flex items-center justify-between text-left hover:bg-slate-800 transition-colors group"
                    >
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-xs text-slate-200 group-hover:text-emerald-400 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          {p.nameUrdu && <span>{p.nameUrdu}</span>}
                          <span>SKU: {p.sku}</span>
                          <span className={p.stockQuantity <= p.reorderLevel ? 'text-amber-400 font-semibold' : ''}>
                            Stock: {p.stockQuantity} {p.unit}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-black text-xs text-emerald-400">
                          {settings.currencySymbol} {p.sellPrice}
                        </p>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                          + Add
                        </span>
                      </div>
                    </button>
                  ))}
                {products.filter(p => 
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (p.nameUrdu && p.nameUrdu.includes(searchQuery)) ||
                  p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.barcode.includes(searchQuery)
                ).length === 0 && (
                  <div className="p-3 text-center text-xs text-slate-500">
                    No matching products found
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-xs transition-all shrink-0"
          >
            <Barcode className="w-4 h-4" />
            <span className="hidden sm:inline">{t('scan_barcode', language)}</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
            }`}
          >
            {t('all_categories', language)}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <ShoppingBag className="w-10 h-10 mb-2 stroke-1 opacity-50" />
              <p>No products match search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => {
                const isOutOfStock = product.stockQuantity <= 0;
                const isLowStock = product.stockQuantity <= product.reorderLevel;

                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product, 1)}
                    className={`group relative text-left bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between transition-all hover:scale-[1.02] ${
                      isOutOfStock
                        ? 'border-slate-800 opacity-60 cursor-not-allowed'
                        : isLowStock
                        ? 'border-amber-500/40 hover:border-amber-400'
                        : 'border-slate-800 hover:border-emerald-500/50 shadow-md hover:shadow-emerald-500/5'
                    }`}
                  >
                    {/* Stock Pill */}
                    <div className="absolute top-2 right-2 z-10">
                      {isOutOfStock ? (
                        <span className="bg-red-950/90 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-red-800">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="bg-amber-950/90 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-800">
                          Stock: {product.stockQuantity}
                        </span>
                      ) : (
                        <span className="bg-slate-800/80 text-slate-400 text-[9px] font-medium px-2 py-0.5 rounded-full">
                          {product.stockQuantity} {product.unit}
                        </span>
                      )}
                    </div>

                    {/* Image / Thumbnail */}
                    <div className="w-full aspect-square rounded-xl bg-slate-950 overflow-hidden mb-2 relative flex items-center justify-center">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <ShoppingBag className="w-8 h-8 text-slate-700" />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="font-bold text-xs text-slate-100 line-clamp-1 leading-tight">
                        {product.name}
                      </h4>
                      {product.nameUrdu && (
                        <p className="text-[10px] text-slate-400 truncate dir-rtl text-right mt-0.5">
                          {product.nameUrdu}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                        <span className="text-sm font-black text-emerald-400">
                          {settings.currencySymbol} {product.sellPrice}
                        </span>
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500 group-hover:text-slate-950 flex items-center justify-center transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Mobile Cart Action Bar */}
        {cart.length > 0 && (
          <div className="lg:hidden mt-3 pt-2 border-t border-slate-800 shrink-0">
            <button
              onClick={() => setMobileView('cart')}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{cart.reduce((a, b) => a + b.quantity, 0)} items in Cart</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm">
                <span>{settings.currencySymbol} {grandTotal}</span>
                <span>→</span>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Right Sidebar: Active Cart & Billing Calculation */}
      <div className={`w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-full shadow-2xl ${mobileView === 'products' ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-100">{t('cart', language)}</h3>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
              {cart.reduce((a, b) => a + b.quantity, 0)} items
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Hold Cart Trigger */}
            <button
              onClick={() => saveCartHold()}
              disabled={cart.length === 0}
              title="Hold this cart"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 disabled:opacity-40 transition-colors"
            >
              <PauseCircle className="w-4 h-4" />
            </button>

            {/* View Hold Carts */}
            <button
              onClick={() => setShowHoldModal(true)}
              className="relative p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Saved / Held carts"
            >
              <RotateCcw className="w-4 h-4" />
              {holdCarts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-500 text-slate-950 font-bold text-[8px] rounded-full flex items-center justify-center">
                  {holdCarts.length}
                </span>
              )}
            </button>

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              title={t('clear_cart', language)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-400 disabled:opacity-40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Selector Bar */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-2">
          <div className="flex-1">
            <select
              value={selectedCustomer?.id || ''}
              onChange={e => {
                const cust = customers.find(c => c.id === e.target.value);
                setSelectedCustomer(cust);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Walk-in Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) {c.outstandingBalance > 0 ? `[Udhaar: ${settings.currencySymbol}${c.outstandingBalance}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowNewCustModal(true)}
            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold shrink-0 transition-colors"
            title="Quick Register Customer"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
              <ShoppingBag className="w-12 h-12 stroke-1 opacity-40 mb-2" />
              <p>{t('empty_cart', language)}</p>
            </div>
          ) : (
            cart.map(item => {
              const rawItemPrice = item.product.sellPrice * item.quantity;
              const pDisc = rawItemPrice * ((item.itemDiscountPercent || 0) / 100);
              const fDisc = item.itemDiscountAmount || 0;
              const lineDisc = Math.min(rawItemPrice, pDisc + fDisc);
              const itemTotal = rawItemPrice - lineDisc;

              return (
                <div
                  key={item.product.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs text-slate-100">{item.product.name}</h5>
                      <span className="text-[10px] text-slate-400">
                        {settings.currencySymbol} {item.product.sellPrice} / {item.selectedUnit}
                      </span>
                    </div>
                    <div className="text-right">
                      {lineDisc > 0 && (
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-[10px] text-slate-500 line-through">
                            {settings.currencySymbol}{Math.round(rawItemPrice)}
                          </span>
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1 py-0.5 rounded">
                            -{settings.currencySymbol}{Math.round(lineDisc)}
                          </span>
                        </div>
                      )}
                      <span className="font-black text-xs text-emerald-400">
                        {settings.currencySymbol} {Math.round(itemTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls & Per-Product Discount & Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-800/60">
                    {/* Quantity Box */}
                    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        title="Reduce Quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        value={item.quantity}
                        onChange={e => {
                          const q = parseInt(e.target.value) || 0;
                          updateCartQuantity(item.product.id, q);
                        }}
                        className="w-10 bg-slate-950 border border-slate-800 text-center text-xs font-bold text-slate-100 rounded focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Product Specific Discount Input */}
                    {userPermissions.canApplyDiscount && (
                      <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/40 rounded-lg px-2 py-1">
                        <span className="text-[10px] font-bold text-amber-400">Discount:</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            onFocus={(e) => e.target.select()}
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                            placeholder="0"
                            value={
                              (itemDiscountMode[item.product.id] === 'percent' 
                                ? (item.itemDiscountPercent || '') 
                                : (item.itemDiscountAmount || ''))
                            }
                            onChange={e => {
                              const val = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                              const mode = itemDiscountMode[item.product.id] || 'flat';
                              if (mode === 'percent') {
                                updateCartItemDiscount(item.product.id, val, 0);
                              } else {
                                updateCartItemDiscount(item.product.id, 0, val);
                              }
                            }}
                            className="w-14 bg-slate-900 border border-slate-700 text-amber-300 font-bold text-center text-xs rounded px-1 py-0.5 focus:border-amber-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentMode = itemDiscountMode[item.product.id] || 'flat';
                              const newMode = currentMode === 'flat' ? 'percent' : 'flat';
                              setItemDiscountMode(prev => ({ ...prev, [item.product.id]: newMode }));
                              updateCartItemDiscount(item.product.id, 0, 0);
                            }}
                            className="px-1.5 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 text-[10px] font-black rounded border border-amber-500/40 transition-all cursor-pointer"
                            title="Switch between Flat Currency Amount (Rs) and Percentage (%)"
                          >
                            {itemDiscountMode[item.product.id] === 'percent' ? '%' : settings.currencySymbol}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove Product"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Promo Code & Cart Level Discount */}
        {cart.length > 0 && (
          <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/40 space-y-2">
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="flex gap-1.5">
              <input
                type="text"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
                placeholder="Promo Code (e.g. AZADI10)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 uppercase"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>

            {appliedPromo && (
              <div className="flex items-center justify-between text-[11px] bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-emerald-300 font-semibold">
                <span>Promo Applied: {appliedPromo.code} (-{appliedPromo.discountPercent}%)</span>
                <button onClick={removePromoCode} className="text-slate-400 hover:text-white">✕</button>
              </div>
            )}

            {/* Overall Bill / Cart Level Discount */}
            {userPermissions.canApplyDiscount && (
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Overall Total Bill Discount:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    value={cartDiscountPercent}
                    onChange={e => setCartDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-xs font-bold text-amber-400 text-center focus:outline-none focus:border-amber-400"
                  />
                  <span>%</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Checkout Summary Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{t('subtotal', language)}:</span>
            <span className="font-semibold text-slate-200">{settings.currencySymbol} {Math.round(subtotal)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400">
              <span>{t('discount', language)}:</span>
              <span className="font-semibold">-{settings.currencySymbol} {discountAmount}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between text-xs text-slate-400">
              <span>{t('tax', language)} ({settings.taxRatePercent}%):</span>
              <span className="font-semibold text-slate-200">+{settings.currencySymbol} {taxAmount}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-slate-100 border-t border-slate-800 pt-2">
            <span>{t('grand_total', language)}:</span>
            <span className="text-emerald-400 text-lg">{settings.currencySymbol} {grandTotal.toLocaleString()}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setIsPaymentOpen(true)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-2"
          >
            <CreditCard className="w-5 h-5" />
            <span>{t('checkout', language)}</span>
          </button>
        </div>

      </div>

      {/* Modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        grandTotal={grandTotal}
        onSuccess={sale => setCompletedSale(sale)}
      />

      <ReceiptModal
        sale={completedSale}
        onClose={() => {
          setCompletedSale(null);
          setMobileView('products');
        }}
      />

      {/* Saved / Held Carts Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <PauseCircle className="w-5 h-5" /> Saved & Held Carts
              </h3>
              <button onClick={() => setShowHoldModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {holdCarts.length === 0 ? (
              <p className="text-xs text-slate-500 py-8 text-center">No held carts currently saved.</p>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
                {holdCarts.map(h => (
                  <div key={h.id} className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-100">{h.title}</p>
                      <p className="text-[10px] text-slate-400">{h.items.length} items • Saved at {h.savedAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          restoreHoldCart(h.id);
                          setShowHoldModal(false);
                        }}
                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => deleteHoldCart(h.id)}
                        className="p-1 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowHoldModal(false)}
              className="w-full py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quick Customer Add Modal */}
      {showNewCustModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-white">
            <h3 className="font-bold text-sm text-emerald-400 mb-3">Quick Add Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  placeholder="e.g. Ali Raza"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  placeholder="e.g. 0300-1234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Save & Select
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCustModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-medium text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
