import React, { useState, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { t } from '../../utils/i18n';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Barcode,
  Layers,
  Printer,
  X,
  Check,
  TrendingUp,
  DollarSign,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { Category, Product } from '../../types';

export const InventoryManager: React.FC = () => {
  const {
    language,
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    addCategory,
    updateCategory,
    deleteCategory,
    settings
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'barcode_sheet'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Product Modal State
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size is too large. Please select an image under 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setFormData(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Form State
  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    nameUrdu: '',
    category: categories[0]?.id || 'cat_grocery',
    sku: '',
    barcode: '',
    buyPrice: 0,
    sellPrice: 0,
    stockQuantity: 0,
    unit: 'Pcs',
    reorderLevel: 5,
    image: '',
    description: ''
  });

  // Stock Adjust Modal State
  const [stockAdjustProd, setStockAdjustProd] = useState<Product | null>(null);
  const [adjustQtyDelta, setAdjustQtyDelta] = useState<number>(0);

  // Category Modal State
  const [newCatName, setNewCatName] = useState('');
  const [newCatUrdu, setNewCatUrdu] = useState('');

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

  const lowStockCount = products.filter(p => p.stockQuantity <= p.reorderLevel).length;
  const totalValuation = products.reduce((acc, p) => acc + p.buyPrice * p.stockQuantity, 0);

  const handleOpenAddModal = () => {
    setEditingProd(null);
    setFormData({
      name: '',
      nameUrdu: '',
      category: categories[0]?.id || 'cat_grocery',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `8964${Math.floor(10000000 + Math.random() * 90000000)}`,
      buyPrice: 100,
      sellPrice: 130,
      stockQuantity: 20,
      unit: 'Pcs',
      reorderLevel: 5,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
      description: ''
    });
    setIsProdModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProd(p);
    setFormData({
      name: p.name || '',
      nameUrdu: p.nameUrdu || '',
      category: p.category || categories[0]?.id || 'cat_grocery',
      sku: p.sku || '',
      barcode: p.barcode || '',
      buyPrice: p.buyPrice ?? 0,
      sellPrice: p.sellPrice ?? 0,
      stockQuantity: p.stockQuantity ?? 0,
      unit: p.unit || 'Pcs',
      reorderLevel: p.reorderLevel ?? 5,
      image: p.image || '',
      description: p.description || ''
    });
    setIsProdModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProd) {
      updateProduct({ ...formData, id: editingProd.id });
    } else {
      addProduct(formData);
    }
    setIsProdModalOpen(false);
  };

  const handleConfirmStockAdjust = () => {
    if (stockAdjustProd && adjustQtyDelta !== 0) {
      adjustStock(stockAdjustProd.id, adjustQtyDelta);
      setStockAdjustProd(null);
      setAdjustQtyDelta(0);
    }
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      addCategory({
        name: newCatName.trim(),
        nameUrdu: newCatUrdu.trim() || undefined,
        color: 'bg-emerald-500'
      });
      setNewCatName('');
      setNewCatUrdu('');
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header & Section Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Package className="w-6 h-6" /> {t('inventory', language)} Management
          </h2>
          <p className="text-xs text-slate-400">Track items, cost prices, barcodes, categories & reorder stock alerts</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'products' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Products List
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'categories' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('barcode_sheet')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'barcode_sheet' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Barcode Sticker Generator
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_product', language)}</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Products</p>
            <p className="text-2xl font-black text-slate-100">{products.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400 font-semibold uppercase">Low Stock Alerts</p>
            <p className="text-2xl font-black text-amber-400">{lowStockCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Stock Valuation</p>
            <p className="text-2xl font-black text-emerald-400">
              {settings.currencySymbol} {totalValuation.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: PRODUCTS TABLE */}
      {activeTab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter by product name, SKU or barcode..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full sm:w-44 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('add_product', language)}</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Item Details</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">SKU / Barcode</th>
                  <th className="p-3">Buy Price</th>
                  <th className="p-3">Sell Price</th>
                  <th className="p-3">Margin</th>
                  <th className="p-3">Stock Qty</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const catObj = categories.find(c => c.id === p.category);
                    const isLow = p.stockQuantity <= p.reorderLevel;
                    const margin = p.sellPrice - p.buyPrice;
                    const marginPct = Math.round((margin / p.sellPrice) * 100) || 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover bg-slate-950 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-100">{p.name}</p>
                              {p.nameUrdu && <p className="text-[10px] text-slate-400 dir-rtl text-right">{p.nameUrdu}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-slate-300 font-medium">
                          {catObj?.name || p.category}
                        </td>

                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          <div>SKU: {p.sku}</div>
                          <div className="text-[10px] text-emerald-400/80">BC: {p.barcode}</div>
                        </td>

                        <td className="p-3 font-semibold text-slate-300">
                          {settings.currencySymbol} {p.buyPrice}
                        </td>

                        <td className="p-3 font-bold text-emerald-400">
                          {settings.currencySymbol} {p.sellPrice}
                        </td>

                        <td className="p-3 text-emerald-300 font-semibold">
                          +{settings.currencySymbol}{margin} ({marginPct}%)
                        </td>

                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              p.stockQuantity <= 0
                                ? 'bg-red-950/80 text-red-400 border-red-800'
                                : isLow
                                ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                            }`}
                          >
                            {p.stockQuantity} {p.unit}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setStockAdjustProd(p)}
                              title="Restock / Adjust Quantity"
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-[10px] font-bold border border-slate-700"
                            >
                              +Restock
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              title="Edit item"
                              className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete product ${p.name}?`)) deleteProduct(p.id);
                              }}
                              title="Delete item"
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-emerald-400">Add New Category</h3>
            <form onSubmit={handleAddCategorySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name (English)</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Household & Cleaning"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Local / Urdu Name</label>
                <input
                  type="text"
                  value={newCatUrdu}
                  onChange={e => setNewCatUrdu(e.target.value)}
                  placeholder="e.g. صفائی کا سامان"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 dir-rtl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                Save Category
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="font-bold text-sm text-slate-100 mb-4">Existing Categories ({categories.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map(cat => {
                const count = products.filter(p => p.category === cat.id).length;
                return (
                  <div key={cat.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-100">{cat.name}</p>
                      {cat.nameUrdu && <p className="text-[10px] text-slate-400">{cat.nameUrdu}</p>}
                      <p className="text-[10px] text-emerald-400 font-semibold mt-1">{count} Products linked</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Delete category ${cat.name}?`)) deleteCategory(cat.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BARCODE STICKER SHEET GENERATOR */}
      {activeTab === 'barcode_sheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-emerald-400">Printable Barcode Sticker Sheets</h3>
              <p className="text-xs text-slate-400">Generate EAN/Code128 barcodes for shelf tagging and product stickers</p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" /> Print Barcode Sheet
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
            {products.map(p => (
              <div key={p.id} className="bg-white text-slate-900 p-3 rounded-xl text-center border border-slate-300 font-mono shadow-sm">
                <p className="font-bold text-[11px] truncate">{p.name}</p>
                <p className="text-[10px] font-sans font-bold text-emerald-700">{settings.currencySymbol} {p.sellPrice}</p>
                
                {/* SVG Barcode bars */}
                <div className="my-1.5 flex justify-center">
                  <div className="h-8 flex items-center gap-0.5">
                    {[2,1,3,1,2,2,1,3,1,2,1,2,3,1].map((w, i) => (
                      <span key={i} className="bg-slate-950 h-6" style={{ width: `${w * 1.5}px` }} />
                    ))}
                  </div>
                </div>

                <p className="text-[9px] font-semibold text-slate-600 tracking-wider">{p.barcode}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isProdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl text-white my-auto max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
              <h3 className="text-base font-bold text-emerald-400">
                {editingProd ? 'Edit Product' : 'Add New Inventory Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProdModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Nestle Milkpak 1L"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Urdu / Local Title (اردو نام)</label>
                  <input
                    type="text"
                    value={formData.nameUrdu || ''}
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 200);
                    }}
                    onChange={e => setFormData({ ...formData, nameUrdu: e.target.value })}
                    placeholder="مثلاً: ملک پیک 1 لیٹر"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 dir-rtl text-right focus:outline-none focus:border-emerald-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit Type *</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Pcs">Pcs (Pieces)</option>
                    <option value="Pack">Pack</option>
                    <option value="Kg">Kg (Kilogram)</option>
                    <option value="Ltr">Ltr (Liter)</option>
                    <option value="Box">Box</option>
                    <option value="Can">Can</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Barcode String</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cost / Buy Price ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.buyPrice}
                    onChange={e => setFormData({ ...formData, buyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sale Price ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    value={formData.sellPrice}
                    onChange={e => setFormData({ ...formData, sellPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Current Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={e => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reorder Low Stock Level *</label>
                  <input
                    type="number"
                    required
                    value={formData.reorderLevel}
                    onChange={e => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

              </div>

              {/* Product Image Selection: File Upload */}
              <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-xl space-y-2.5">
                <label className="block text-slate-300 font-semibold flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  Product Photo / Image
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all text-xs"
                  >
                    <Upload className="w-4 h-4 text-emerald-400" /> Upload Image File
                  </button>
                  {formData.image && (
                    <div className="flex items-center gap-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-emerald-500/50 bg-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="text-[11px] text-red-400 hover:underline font-semibold"
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProdModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-colors"
                >
                  Save Product
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* STOCK ADJUST / RESTOCK MODAL */}
      {stockAdjustProd && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-white">
            <h3 className="font-bold text-sm text-emerald-400 mb-2">Restock / Stock Adjustment</h3>
            <p className="text-xs text-slate-300 mb-3">{stockAdjustProd.name} (Current Stock: {stockAdjustProd.stockQuantity} {stockAdjustProd.unit})</p>

            <div className="space-y-3 mb-4">
              <label className="block text-xs font-semibold text-slate-400">Add / Deduct Quantity:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustQtyDelta(prev => prev - 5)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 font-bold text-xs rounded-xl"
                >
                  -5
                </button>
                <input
                  type="number"
                  value={adjustQtyDelta}
                  onChange={e => setAdjustQtyDelta(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-center font-bold text-emerald-400 text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setAdjustQtyDelta(prev => prev + 10)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl"
                >
                  +10
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                New calculated total will be: <span className="font-bold text-emerald-400">{stockAdjustProd.stockQuantity + adjustQtyDelta} {stockAdjustProd.unit}</span>
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleConfirmStockAdjust}
                className="flex-1 py-2 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Confirm Restock
              </button>
              <button
                onClick={() => setStockAdjustProd(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
