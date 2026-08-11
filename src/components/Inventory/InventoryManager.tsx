import React, { useState, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { t } from '../../utils/i18n';
import { generateBarcodeBars, generateBarcodeSvgString } from '../../utils/barcodeGenerator';
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
  Image as ImageIcon,
  CheckSquare,
  Square,
  Copy,
  LayoutGrid,
  Sparkles,
  Truck,
  Building2,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import { Category, Product } from '../../types';
import { industryTemplates } from '../../data/industryPresets';

const PRESET_PHARMA_SUPPLIERS = [
  { name: 'Muller & Phipps (M&P)', phone: '021-111-676-111', address: 'Wholesale Market, Karachi / Lahore', notes: 'Distributor for GSK, Pfizer, Sanofi, Novartis', pendingBalance: 0 },
  { name: 'Getz Pharma', phone: '021-38642000', address: 'Korangi Industrial Area, Karachi', notes: 'Top local pharmaceutical manufacturer & distributor', pendingBalance: 0 },
  { name: 'GSK Pakistan (GlaxoSmithKline)', phone: '021-111-475-725', address: 'West Wharf, Karachi', notes: 'Panadol, Augmentin, Calpol, Amoxil distributor', pendingBalance: 0 },
  { name: 'The Searle Company', phone: '021-35810630', address: 'Main Clifton, Karachi', notes: 'Extensive retail pharmacy & hospital supply chain', pendingBalance: 0 },
  { name: 'Hilton Pharma', phone: '021-35063061', address: 'Landhi Industrial Area, Karachi', notes: 'Antibiotics & general medicine supplier', pendingBalance: 0 },
  { name: 'Martin Dow', phone: '021-111-111-635', address: 'Plot 37, Sector 19 Korangi, Karachi', notes: 'Cardiology, Neuro & General healthcare', pendingBalance: 0 },
  { name: 'Abbott Laboratories Pakistan', phone: '021-111-222-688', address: 'Landhi, Karachi', notes: 'Brufen, Surbex Z, Entogre, Klaricid', pendingBalance: 0 },
  { name: 'Sami Pharmaceuticals', phone: '021-35060856', address: 'Korangi, Karachi', notes: 'Wide generic & brand portfolio', pendingBalance: 0 },
  { name: 'Sanofi Pakistan', phone: '021-35060221', address: 'Karachi', notes: 'Insulin, Flagyl, Avil, No-Spa', pendingBalance: 0 },
  { name: 'Pfizer Pakistan', phone: '021-35060121', address: 'B-2, S.I.T.E., Karachi', notes: 'Oncology, Ponstan, Zithromax', pendingBalance: 0 },
  { name: 'Aga Khan Pharma Distribution', phone: '021-34861000', address: 'Stadium Road, Karachi', notes: 'Specialized healthcare & hospital supply', pendingBalance: 0 },
  { name: 'Barrett Hodgson Pakistan', phone: '021-35061681', address: 'Korangi, Karachi', notes: 'Pharma retail supplier', pendingBalance: 0 },
  { name: 'Highnoon Laboratories', phone: '042-35290021', address: 'Multan Road, Lahore', notes: 'Gastroenterology & Cardiology', pendingBalance: 0 },
  { name: 'Wilshire Laboratories', phone: '042-35111111', address: 'Kot Lakhpat, Lahore', notes: 'Pediatric & general care', pendingBalance: 0 },
  { name: 'Brookes Pharma', phone: '021-35060613', address: 'Korangi Industrial Zone, Karachi', notes: 'Anesthesia & general medicine', pendingBalance: 0 },
  { name: 'Ferozsons Laboratories', phone: '042-36301968', address: 'Rawalpindi / Lahore', notes: 'Hepatology & Gastro products', pendingBalance: 0 },
  { name: 'Atco Laboratories', phone: '021-32561111', address: 'S.I.T.E., Karachi', notes: 'General formulations & OTC', pendingBalance: 0 },
  { name: 'CCL Pharmaceuticals', phone: '042-35113000', address: 'Kot Lakhpat, Lahore', notes: 'Cardiovascular & Respiratory', pendingBalance: 0 }
];

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

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'suppliers' | 'barcode_sheet'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSupplier, setSelectedSupplier] = useState('all');

  // Supplier details & expanded state
  const [expandedSuppliers, setExpandedSuppliers] = useState<Record<string, boolean>>({});
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supplierContacts, setSupplierContacts] = useState<Record<string, { phone: string; address: string; notes: string; pendingBalance: number; isActive?: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('pos_supplier_contacts');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [editingSupplierContact, setEditingSupplierContact] = useState<{ name: string; oldName?: string; phone: string; address: string; notes: string; pendingBalance: number; isActive?: boolean } | null>(null);

  // New Supplier & Preset Suppliers Modals
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isPresetSupplierModalOpen, setIsPresetSupplierModalOpen] = useState(false);
  const [newSupplierForm, setNewSupplierForm] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
    pendingBalance: 0,
    isActive: true
  });

  const saveSupplierContact = (
    name: string,
    data: { phone: string; address: string; notes: string; pendingBalance: number; isActive?: boolean },
    oldName?: string
  ) => {
    const updated = { ...supplierContacts };
    if (oldName && oldName !== name) {
      delete updated[oldName];
      products.forEach(p => {
        if (p.supplierName && p.supplierName.trim().toLowerCase() === oldName.trim().toLowerCase()) {
          updateProduct({ ...p, supplierName: name });
        }
      });
    }
    updated[name] = { ...data, isActive: data.isActive !== false };
    setSupplierContacts(updated);
    try {
      localStorage.setItem('pos_supplier_contacts', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save supplier contacts', e);
    }
    setEditingSupplierContact(null);
    setIsAddSupplierModalOpen(false);
  };

  const toggleSupplierActive = (name: string) => {
    const current = supplierContacts[name] || { phone: '', address: '', notes: '', pendingBalance: 0, isActive: true };
    const updatedData = { ...current, isActive: current.isActive === false ? true : false };
    saveSupplierContact(name, updatedData);
  };

  const deleteSupplier = (name: string) => {
    const updated = { ...supplierContacts };
    delete updated[name];
    setSupplierContacts(updated);
    try {
      localStorage.setItem('pos_supplier_contacts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleImportPresetSupplier = (preset: typeof PRESET_PHARMA_SUPPLIERS[0]) => {
    saveSupplierContact(preset.name, {
      phone: preset.phone,
      address: preset.address,
      notes: preset.notes,
      pendingBalance: preset.pendingBalance,
      isActive: true
    });

    // Import dummy medicines for this supplier if available
    const pharmaProds = industryTemplates.pharmacy?.products || [];
    const keyword = preset.name.split(' ')[0].toLowerCase();
    const supplierMeds = pharmaProds.filter(p => p.supplierName && p.supplierName.toLowerCase().includes(keyword));

    supplierMeds.forEach(presetProd => {
      const exists = products.some(p => p.sku === presetProd.sku || p.barcode === presetProd.barcode || p.name.toLowerCase() === presetProd.name.toLowerCase());
      if (!exists) {
        let matchedCatId = categories[0]?.id || 'cat_tablets';
        const foundCat = categories.find(c => c.id === presetProd.category || c.name.toLowerCase().includes(presetProd.category.replace('cat_', '').toLowerCase()));
        if (foundCat) matchedCatId = foundCat.id;

        addProduct({
          ...presetProd,
          id: `p_dummy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          category: matchedCatId,
          supplierName: preset.name,
          isActive: true
        });
      }
    });
  };

  const handleImportAllPresets = () => {
    const updated = { ...supplierContacts };
    PRESET_PHARMA_SUPPLIERS.forEach(preset => {
      if (!updated[preset.name]) {
        updated[preset.name] = {
          phone: preset.phone,
          address: preset.address,
          notes: preset.notes,
          pendingBalance: preset.pendingBalance,
          isActive: true
        };
      }
    });
    setSupplierContacts(updated);
    try {
      localStorage.setItem('pos_supplier_contacts', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setIsPresetSupplierModalOpen(false);
  };

  const handleImportDummyMedicines = () => {
    const pharmaProds = industryTemplates.pharmacy?.products || [];
    let addedCount = 0;

    const updatedSuppliers = { ...supplierContacts };

    pharmaProds.forEach(presetProd => {
      // Register supplier if present
      if (presetProd.supplierName && !updatedSuppliers[presetProd.supplierName]) {
        const foundPreset = PRESET_PHARMA_SUPPLIERS.find(s => s.name === presetProd.supplierName);
        updatedSuppliers[presetProd.supplierName] = {
          phone: foundPreset?.phone || '021-111-475-725',
          address: foundPreset?.address || 'Wholesale Medicine Market, Pakistan',
          notes: foundPreset?.notes || `Distributor for ${presetProd.name}`,
          pendingBalance: 0,
          isActive: true
        };
      }

      // Check if product already exists
      const exists = products.some(p =>
        p.sku === presetProd.sku ||
        p.barcode === presetProd.barcode ||
        p.name.toLowerCase() === presetProd.name.toLowerCase()
      );

      if (!exists) {
        // Match or fallback category
        let matchedCatId = categories[0]?.id || 'cat_tablets';
        const foundCat = categories.find(c =>
          c.id === presetProd.category ||
          c.name.toLowerCase().includes(presetProd.category.replace('cat_', '').toLowerCase())
        );
        if (foundCat) matchedCatId = foundCat.id;

        addProduct({
          ...presetProd,
          id: `p_dummy_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          category: matchedCatId,
          isActive: true
        });
        addedCount++;
      }
    });

    setSupplierContacts(updatedSuppliers);
    try {
      localStorage.setItem('pos_supplier_contacts', JSON.stringify(updatedSuppliers));
    } catch (e) {
      console.error(e);
    }

    if (addedCount > 0) {
      alert(`✅ Successfully imported ${addedCount} famous dummy medicines (Panadol, Risek, Brufen, Augmentin, Flagyl, Surbex Z, etc.) & registered their suppliers!`);
    } else {
      alert('ℹ️ All famous dummy medicines are already present in your inventory.');
    }
  };

  // Barcode Sheet Print Options State
  const [selectedBarcodeProdIds, setSelectedBarcodeProdIds] = useState<string[]>([]);
  const [copiesMode, setCopiesMode] = useState<'1' | '2' | '4' | 'stock'>('1');
  const [paperLayout, setPaperLayout] = useState<'a4_3col' | 'a4_4col' | 'thermal_single'>('a4_3col');
  const [showMainSuggestions, setShowMainSuggestions] = useState(false);
  const [showSheetSuggestions, setShowSheetSuggestions] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);

  // Custom Delete Confirm Modal State
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ type: 'product' | 'category' | 'supplier'; id: string; name: string } | null>(null);

  // Auto-suggestion catalog built from current industry preset, all presets, and existing items
  const allPresetProducts = React.useMemo(() => {
    const map = new Map<string, Product>();
    // 1. Current business preset first
    const currentKey = settings.businessType || 'supermarket';
    if (industryTemplates[currentKey]) {
      industryTemplates[currentKey].products.forEach(p => map.set(p.name.toLowerCase(), p));
    }
    // 2. All industry templates
    Object.values(industryTemplates).forEach(tmpl => {
      tmpl.products.forEach(p => {
        if (!map.has(p.name.toLowerCase())) {
          map.set(p.name.toLowerCase(), p);
        }
      });
    });
    // 3. Existing inventory products
    products.forEach(p => {
      if (!map.has(p.name.toLowerCase())) {
        map.set(p.name.toLowerCase(), p);
      }
    });
    return Array.from(map.values());
  }, [settings.businessType, products]);

  const applyProductSuggestion = (sugg: Product) => {
    const matchingCat = categories.find(c =>
      c.name.toLowerCase().includes(sugg.category?.toLowerCase() || '') ||
      c.id === sugg.category ||
      (sugg.category && sugg.category.toLowerCase().includes(c.name.toLowerCase()))
    );

    setFormData(prev => ({
      ...prev,
      name: sugg.name,
      nameUrdu: sugg.nameUrdu || prev.nameUrdu,
      buyPrice: sugg.buyPrice ?? prev.buyPrice,
      sellPrice: sugg.sellPrice ?? prev.sellPrice,
      unit: sugg.unit || prev.unit,
      reorderLevel: sugg.reorderLevel ?? prev.reorderLevel,
      image: sugg.image || prev.image,
      description: sugg.description || prev.description,
      category: matchingCat ? matchingCat.id : (categories[0]?.id || prev.category)
    }));
    setShowTitleSuggestions(false);
  };

  // Select / Deselect All products for barcode sheet
  const handleToggleSelectAllBarcodes = () => {
    if (selectedBarcodeProdIds.length === products.length) {
      setSelectedBarcodeProdIds([]);
    } else {
      setSelectedBarcodeProdIds(products.map(p => p.id));
    }
  };

  const handleToggleBarcodeProd = (id: string) => {
    if (selectedBarcodeProdIds.includes(id)) {
      setSelectedBarcodeProdIds(prev => prev.filter(pId => pId !== id));
    } else {
      setSelectedBarcodeProdIds(prev => [...prev, id]);
    }
  };

  // Robust Print Barcode Sheet function
  const handlePrintBarcodes = () => {
    // If none explicitly toggled, print all
    const targetProds = selectedBarcodeProdIds.length > 0
      ? products.filter(p => selectedBarcodeProdIds.includes(p.id))
      : products;

    if (targetProds.length === 0) {
      alert('Please select at least one product to print barcodes.');
      return;
    }

    // Generate list of items according to copies mode
    const stickerList: Product[] = [];
    targetProds.forEach(p => {
      let count = 1;
      if (copiesMode === '2') count = 2;
      if (copiesMode === '4') count = 4;
      if (copiesMode === 'stock') count = Math.max(1, Math.min(p.stockQuantity, 100));

      for (let i = 0; i < count; i++) {
        stickerList.push(p);
      }
    });

    const gridStyle = paperLayout === 'a4_4col'
      ? 'grid-template-columns: repeat(4, 1fr);'
      : paperLayout === 'thermal_single'
      ? 'grid-template-columns: 1fr; width: 60mm; margin: 0 auto;'
      : 'grid-template-columns: repeat(3, 1fr);';

    const stickersHtml = stickerList.map(p =>
      generateBarcodeSvgString(
        p.barcode || p.sku,
        settings.storeName,
        p.name,
        `${settings.currencySymbol} ${p.sellPrice}`
      )
    ).join('');

    const printDocHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Barcode Sticker Sheet - ${settings.storeName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 10px;
      background: #ffffff;
      color: #000000;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .no-print-bar {
      margin-bottom: 16px;
      text-align: center;
      padding: 12px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
    }
    .print-btn {
      padding: 10px 24px;
      background: #059669;
      color: #ffffff;
      font-weight: bold;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .sticker-grid {
      display: grid;
      ${gridStyle}
      gap: 10px;
      width: 100%;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="print-btn" onclick="window.print()">
      🖨️ Click Here to Print Barcode Stickers (${stickerList.length} Stickers)
    </button>
  </div>
  <div class="sticker-grid">
    ${stickersHtml}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

    // 1. Attempt window.open popup first
    let printWindow: Window | null = null;
    try {
      printWindow = window.open('', '_blank', 'width=950,height=800');
    } catch (e) {
      console.warn('Popup blocked, falling back to hidden iframe', e);
    }

    if (printWindow && !printWindow.closed) {
      printWindow.document.open();
      printWindow.document.write(printDocHtml);
      printWindow.document.close();
    } else {
      // 2. Fallback: Create dynamic hidden print iframe
      let iframe = document.getElementById('barcode-sticker-print-frame') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'barcode-sticker-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        iframe.style.zIndex = '-9999';
        document.body.appendChild(iframe);
      }

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(printDocHtml);
        frameDoc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 500);
      } else {
        // Last fallback: replace window location or alert
        alert('Please allow popups for this site to print barcode sheets.');
      }
    }
  };

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
    description: '',
    formulaName: '',
    supplierName: '',
    isActive: true
  });

  // Stock Adjust Modal State
  const [stockAdjustProd, setStockAdjustProd] = useState<Product | null>(null);
  const [adjustQtyDelta, setAdjustQtyDelta] = useState<number>(0);

  // Category Modal State
  const [newCatName, setNewCatName] = useState('');
  const [newCatUrdu, setNewCatUrdu] = useState('');

  const uniqueSuppliers = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.supplierName && p.supplierName.trim()) {
        set.add(p.supplierName.trim());
      }
    });
    // Add any manually saved contact suppliers even if 0 items
    Object.keys(supplierContacts).forEach(s => set.add(s));
    return Array.from(set).sort();
  }, [products, supplierContacts]);

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSupplier = selectedSupplier === 'all' || (p.supplierName && p.supplierName.trim().toLowerCase() === selectedSupplier.trim().toLowerCase());
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      p.barcode.includes(query) ||
      (p.nameUrdu && p.nameUrdu.includes(query)) ||
      (p.formulaName && p.formulaName.toLowerCase().includes(query)) ||
      (p.supplierName && p.supplierName.toLowerCase().includes(query));
    return matchesCat && matchesSupplier && matchesSearch;
  });

  // Calculate supplier ledger summary map
  const supplierLedgerData = React.useMemo(() => {
    const map: Record<string, {
      name: string;
      products: Product[];
      totalProductsCount: number;
      totalStockUnits: number;
      totalCostValue: number;
      totalRetailValue: number;
      formulasList: string[];
    }> = {};

    uniqueSuppliers.forEach(supName => {
      const supProducts = products.filter(p => p.supplierName && p.supplierName.trim().toLowerCase() === supName.trim().toLowerCase());
      const totalUnits = supProducts.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
      const totalCost = supProducts.reduce((acc, p) => acc + (p.buyPrice || 0) * (p.stockQuantity || 0), 0);
      const totalRetail = supProducts.reduce((acc, p) => acc + (p.sellPrice || 0) * (p.stockQuantity || 0), 0);
      const formulasSet = new Set<string>();
      supProducts.forEach(p => {
        if (p.formulaName) formulasSet.add(p.formulaName.trim());
      });

      map[supName] = {
        name: supName,
        products: supProducts,
        totalProductsCount: supProducts.length,
        totalStockUnits: totalUnits,
        totalCostValue: totalCost,
        totalRetailValue: totalRetail,
        formulasList: Array.from(formulasSet)
      };
    });

    return map;
  }, [uniqueSuppliers, products]);

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
      description: '',
      formulaName: '',
      supplierName: '',
      isActive: true
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
      description: p.description || '',
      formulaName: p.formulaName || '',
      supplierName: p.supplierName || '',
      isActive: p.isActive !== false
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
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'suppliers' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Suppliers & Ledger (ڈسٹری بیوٹرز)</span>
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
                  list="inventory-products-datalist"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowMainSuggestions(true);
                  }}
                  onFocus={() => setShowMainSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowMainSuggestions(false), 200)}
                  placeholder="Filter by product name, SKU or barcode..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowMainSuggestions(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* HTML5 Datalist for native keyboard suggestions */}
                <datalist id="inventory-products-datalist">
                  {products.map(p => (
                    <option key={p.id} value={p.barcode || p.sku}>
                      {p.name} - {settings.currencySymbol}{p.sellPrice}
                    </option>
                  ))}
                </datalist>

                {/* Live Auto-Suggestion Floating Dropdown */}
                {showMainSuggestions && searchQuery.trim().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                    {products
                      .filter(p =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.barcode.includes(searchQuery) ||
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.nameUrdu && p.nameUrdu.includes(searchQuery)) ||
                        (p.formulaName && p.formulaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (p.supplierName && p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                      .slice(0, 8)
                      .map(p => (
                        <div
                          key={p.id}
                          onMouseDown={() => {
                            setSearchQuery(p.barcode || p.name);
                            setShowMainSuggestions(false);
                          }}
                          className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                              alt=""
                              className="w-7 h-7 rounded bg-slate-950 object-cover shrink-0"
                            />
                            <div className="truncate">
                              <p className="font-bold text-slate-200 truncate">{p.name}</p>
                              {p.formulaName && (
                                <p className="text-[10px] text-cyan-300 font-medium truncate">
                                  🧪 {p.formulaName}
                                </p>
                              )}
                              <p className="text-[10px] text-emerald-400 font-mono">
                                BC: <span className="font-bold">{p.barcode}</span> | SKU: {p.sku}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className="font-bold text-emerald-400">{settings.currencySymbol}{p.sellPrice}</p>
                            <p className="text-[10px] text-slate-400">{p.stockQuantity} in stock</p>
                          </div>
                        </div>
                      ))}
                    {products.filter(p =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.barcode.includes(searchQuery) ||
                      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.formulaName && p.formulaName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                      (p.supplierName && p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()))
                    ).length === 0 && (
                      <div className="p-3 text-center text-slate-400 text-xs">
                        No matching product, formula, or distributor found
                      </div>
                    )}
                  </div>
                )}
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

              <select
                value={selectedSupplier}
                onChange={e => setSelectedSupplier(e.target.value)}
                className="w-full sm:w-44 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Distributors / Suppliers</option>
                {uniqueSuppliers.map(sup => (
                  <option key={sup} value={sup}>{sup}</option>
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
                  {settings.businessType !== 'sanitary_fittings' && <th className="p-3">Buy Price</th>}
                  <th className="p-3">{settings.businessType === 'sanitary_fittings' ? 'Price (قیمت)' : 'Sell Price'}</th>
                  {settings.businessType !== 'sanitary_fittings' && <th className="p-3">Margin</th>}
                  <th className="p-3">Stock Qty</th>
                  <th className="p-3">POS Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={settings.businessType === 'sanitary_fittings' ? 7 : 9} className="p-8 text-center text-slate-500">
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
                      <tr key={p.id} className={`hover:bg-slate-850/50 transition-colors ${p.isActive === false ? 'opacity-65 bg-slate-950/40' : ''}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                              alt=""
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100';
                              }}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-950 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-100">{p.name}</p>
                              {p.nameUrdu && <p className="text-[10px] text-slate-400 dir-rtl text-right">{p.nameUrdu}</p>}
                              {(p.formulaName || p.supplierName) && (
                                <div className="mt-1 flex flex-wrap items-center gap-1">
                                  {p.formulaName && (
                                    <span className="text-[10px] font-semibold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-md">
                                      🧪 {p.formulaName}
                                    </span>
                                  )}
                                  {p.supplierName && (
                                    <span className="text-[10px] font-semibold bg-purple-950/90 text-purple-300 border border-purple-800/80 px-2 py-0.5 rounded-md">
                                      🏭 {p.supplierName}
                                    </span>
                                  )}
                                </div>
                              )}
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

                        {settings.businessType !== 'sanitary_fittings' && (
                          <td className="p-3 font-semibold text-slate-300">
                            {settings.currencySymbol} {p.buyPrice}
                          </td>
                        )}

                        <td className="p-3 font-bold text-emerald-400">
                          {settings.currencySymbol} {p.sellPrice}
                        </td>

                        {settings.businessType !== 'sanitary_fittings' && (
                          <td className="p-3 text-emerald-300 font-semibold">
                            +{settings.currencySymbol}{margin} ({marginPct}%)
                          </td>
                        )}

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

                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => updateProduct({ ...p, isActive: p.isActive === false ? true : false })}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                              p.isActive === false
                                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            }`}
                            title="Click to toggle Active / Inactive in POS Terminal"
                          >
                            {p.isActive === false ? '🔴 Inactive' : '🟢 Active'}
                          </button>
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
                              onClick={() => setDeleteConfirmItem({ type: 'product', id: p.id, name: p.name })}
                              title="Delete item"
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 cursor-pointer"
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
                      onClick={() => setDeleteConfirmItem({ type: 'category', id: cat.id, name: cat.name })}
                      className="p-1.5 text-slate-500 hover:text-red-400 cursor-pointer"
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

      {/* TAB 3: SUPPLIERS & DISTRIBUTORS LEDGER (ڈسٹری بیوٹرز / سپلائرز) */}
      {activeTab === 'suppliers' && (
        <div className="space-y-5">
          {/* Top KPI Cards for Suppliers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Distributors</p>
                <p className="text-2xl font-black text-slate-100">{uniqueSuppliers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-800 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Purchase Cost</p>
                <p className="text-xl font-black text-cyan-400">
                  {settings.currencySymbol} {Object.values(supplierLedgerData).reduce((sum: number, s: any) => sum + (s.totalCostValue || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-800 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Total Retail Return</p>
                <p className="text-xl font-black text-emerald-400">
                  {settings.currencySymbol} {Object.values(supplierLedgerData).reduce((sum: number, s: any) => sum + (s.totalRetailValue || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-400 font-semibold uppercase">Total Pending Udhaar</p>
                <p className="text-xl font-black text-amber-400">
                  {settings.currencySymbol} {Object.values(supplierContacts).reduce((sum: number, c: any) => sum + (c.pendingBalance || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search & Actions Bar for Suppliers */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={supplierSearchQuery}
                onChange={e => setSupplierSearchQuery(e.target.value)}
                placeholder="Search distributor, medicine formula, or contact..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleImportDummyMedicines}
                className="px-3.5 py-2 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                title="Import Panadol, Risek, Brufen, Augmentin, Flagyl, Surbex Z, etc. with suppliers"
              >
                <Package className="w-4 h-4 text-purple-400" />
                <span>💊 Import Famous Dummy Medicines</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPresetSupplierModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/80 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>⚡ Quick Famous Suppliers (List)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewSupplierForm({
                    name: '',
                    phone: '',
                    address: '',
                    notes: '',
                    pendingBalance: 0,
                    isActive: true
                  });
                  setIsAddSupplierModalOpen(true);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Supplier / Distributor</span>
              </button>
            </div>
          </div>

          {/* Supplier Cards List */}
          <div className="space-y-4">
            {uniqueSuppliers
              .filter(sName => {
                const q = supplierSearchQuery.toLowerCase().trim();
                if (!q) return true;
                const contact = supplierContacts[sName];
                const ledger = supplierLedgerData[sName];
                const matchesName = sName.toLowerCase().includes(q);
                const matchesPhone = contact && contact.phone.includes(q);
                const matchesFormula = ledger && ledger.formulasList.some(f => f.toLowerCase().includes(q));
                return matchesName || matchesPhone || matchesFormula;
              })
              .map(sName => {
                const ledger = supplierLedgerData[sName] || {
                  name: sName,
                  products: [],
                  totalProductsCount: 0,
                  totalStockUnits: 0,
                  totalCostValue: 0,
                  totalRetailValue: 0,
                  formulasList: []
                };
                const contact = supplierContacts[sName] || { phone: '', address: '', notes: '', pendingBalance: 0, isActive: true };
                const isExpanded = !!expandedSuppliers[sName];

                return (
                  <div key={sName} className={`bg-slate-900 border rounded-2xl overflow-hidden shadow-xl transition-all ${contact.isActive === false ? 'border-slate-800 opacity-75' : 'border-slate-800'}`}>
                    {/* Header Row */}
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-900/80 to-slate-800 border border-purple-700/50 text-purple-300 flex items-center justify-center shrink-0 shadow-md">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base text-slate-100">{sName}</h3>
                            <span className="bg-purple-950 text-purple-300 border border-purple-800/80 text-[10px] font-bold px-2 py-0.5 rounded-md">
                              Distributor
                            </span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${contact.isActive === false ? 'bg-red-950 text-red-400 border-red-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'}`}>
                              {contact.isActive === false ? '🔴 Inactive' : '🟢 Active'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                            {contact.phone && (
                              <span className="flex items-center gap-1 font-mono text-slate-300">
                                <Phone className="w-3.5 h-3.5 text-purple-400" /> {contact.phone}
                              </span>
                            )}
                            {contact.address && (
                              <span className="flex items-center gap-1 text-slate-400">
                                <MapPin className="w-3.5 h-3.5 text-amber-400" /> {contact.address}
                              </span>
                            )}
                            {contact.pendingBalance > 0 && (
                              <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded">
                                Udhaar/Pending: {settings.currencySymbol}{contact.pendingBalance.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Summary Metrics & Toggle */}
                      <div className="flex items-center gap-3 flex-wrap md:flex-nowrap justify-between md:justify-end">
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Stock Purchase Value</p>
                          <p className="text-sm font-black text-cyan-400">{settings.currencySymbol}{ledger.totalCostValue.toLocaleString()}</p>
                          <p className="text-[10px] text-slate-500">{ledger.totalStockUnits} Total Units ({ledger.totalProductsCount} Medicines)</p>
                        </div>

                        <div className="text-right pl-3 border-l border-slate-800">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Total Retail Value</p>
                          <p className="text-sm font-black text-emerald-400">{settings.currencySymbol}{ledger.totalRetailValue.toLocaleString()}</p>
                          <p className="text-[10px] text-emerald-500 font-bold">
                            Margin: {settings.currencySymbol}{(ledger.totalRetailValue - ledger.totalCostValue).toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 pl-2">
                          <button
                            type="button"
                            onClick={() => toggleSupplierActive(sName)}
                            className={`px-2 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all cursor-pointer ${
                              contact.isActive === false
                                ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                : 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                            }`}
                            title="Toggle Active / Inactive Status"
                          >
                            {contact.isActive === false ? 'Inactive' : 'Active'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingSupplierContact({ name: sName, oldName: sName, ...contact })}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit supplier info & pending balance"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmItem({ type: 'supplier', id: sName, name: sName })}
                            className="p-2 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 border border-slate-700/80 hover:border-red-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                            title="Delete supplier from system"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setExpandedSuppliers({ ...expandedSuppliers, [sName]: !isExpanded })}
                            className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide Medicines' : `View ${ledger.totalProductsCount} Medicines`}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Formula Salts summary tag bar */}
                    {ledger.formulasList.length > 0 && (
                      <div className="px-4 py-2 bg-slate-950/60 border-t border-b border-slate-800/60 flex items-center gap-2 overflow-x-auto">
                        <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">🧪 Medicines Formulas / Salts:</span>
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          {ledger.formulasList.map((formula, idx) => (
                            <span key={idx} className="text-[10px] font-semibold bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 px-2 py-0.5 rounded-md whitespace-nowrap">
                              {formula}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded Medicines Ledger List */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
                        {ledger.products.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">No active medicines registered under this distributor name yet.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                                <tr>
                                  <th className="p-2.5">Medicine Name / Brand</th>
                                  <th className="p-2.5">Formula / Salt</th>
                                  <th className="p-2.5">Stock Available</th>
                                  <th className="p-2.5 text-right">Purchase Price (Cost)</th>
                                  <th className="p-2.5 text-right">Retail Sale Price</th>
                                  <th className="p-2.5 text-right">Total Investment</th>
                                  <th className="p-2.5 text-center">Status & Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {ledger.products.map(p => (
                                  <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                                    <td className="p-2.5">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={p.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100'}
                                          alt=""
                                          className="w-8 h-8 rounded-lg bg-slate-900 object-cover border border-slate-800 shrink-0"
                                        />
                                        <div>
                                          <p className="font-bold text-slate-100">{p.name}</p>
                                          {p.nameUrdu && <p className="text-[10px] text-slate-400">{p.nameUrdu}</p>}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-2.5">
                                      {p.formulaName ? (
                                        <span className="text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-md">
                                          🧪 {p.formulaName}
                                        </span>
                                      ) : (
                                        <span className="text-slate-600 text-[10px] italic">Not set</span>
                                      )}
                                    </td>
                                    <td className="p-2.5 font-bold">
                                      <span className={p.stockQuantity <= p.reorderLevel ? 'text-amber-400 font-extrabold' : 'text-slate-200'}>
                                        {p.stockQuantity} {p.unit || 'Pcs'}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-right font-semibold text-cyan-400">
                                      {settings.currencySymbol}{p.buyPrice}
                                    </td>
                                    <td className="p-2.5 text-right font-bold text-emerald-400">
                                      {settings.currencySymbol}{p.sellPrice}
                                    </td>
                                    <td className="p-2.5 text-right font-extrabold text-cyan-300">
                                      {settings.currencySymbol}{(p.buyPrice * p.stockQuantity).toLocaleString()}
                                    </td>
                                    <td className="p-2.5 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => updateProduct({ ...p, isActive: p.isActive === false ? true : false })}
                                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border cursor-pointer transition-all ${
                                            p.isActive === false
                                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                                              : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                          }`}
                                          title="Toggle Active / Inactive Status"
                                        >
                                          {p.isActive === false ? 'Inactive' : 'Active'}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditModal(p)}
                                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                                          title="Edit Medicine / Update Distributor"
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => setDeleteConfirmItem({ type: 'product', id: p.id, name: p.name })}
                                          className="p-1.5 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 rounded-lg text-xs font-semibold cursor-pointer"
                                          title="Delete Medicine"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

            {uniqueSuppliers.length === 0 && (
              <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                <Truck className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="font-bold text-slate-300 text-sm">No Suppliers or Distributors Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you add products with a "Distributor / Supplier" name in Inventory, they will automatically appear here along with total ledger purchase history!
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BARCODE STICKER SHEET GENERATOR */}
      {activeTab === 'barcode_sheet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                <Barcode className="w-5 h-5" /> Printable Barcode Sticker Sheets
              </h3>
              <p className="text-xs text-slate-400">
                Generate and print shelf tags & sticker barcodes for your inventory items
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleToggleSelectAllBarcodes}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {selectedBarcodeProdIds.length === products.length ? (
                  <>
                    <CheckSquare className="w-4 h-4 text-emerald-400" /> Deselect All
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-slate-400" /> Select All ({products.length})
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handlePrintBarcodes}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" /> Print Barcode Sheet
              </button>
            </div>
          </div>

          {/* Options & Filter Bar */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                <Copy className="w-3.5 h-3.5 text-emerald-400" /> Stickers Per Item
              </label>
              <select
                value={copiesMode}
                onChange={e => setCopiesMode(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="1">1 Sticker per product</option>
                <option value="2">2 Stickers per product</option>
                <option value="4">4 Stickers per product</option>
                <option value="stock">Match Stock Quantity (e.g. 15 stock = 15 stickers)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 flex items-center gap-1.5">
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" /> Sheet / Paper Format
              </label>
              <select
                value={paperLayout}
                onChange={e => setPaperLayout(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="a4_3col">A4 Paper (3 Columns Grid)</option>
                <option value="a4_4col">A4 Paper (4 Columns Grid)</option>
                <option value="thermal_single">Thermal Sticker Roll (Single Column - 50x30mm)</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-slate-400 font-bold mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400" /> Filter Barcodes
                </span>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSheetSuggestions(false);
                    }}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Clear Filter
                  </button>
                )}
              </label>
              <input
                type="text"
                list="barcode-sheet-datalist"
                placeholder="Search by name, SKU or code..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setShowSheetSuggestions(true);
                }}
                onFocus={() => setShowSheetSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSheetSuggestions(false), 200)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-emerald-500"
              />

              {/* Native datalist suggestions */}
              <datalist id="barcode-sheet-datalist">
                {products.map(p => (
                  <option key={p.id} value={p.barcode || p.sku}>
                    {p.name}
                  </option>
                ))}
              </datalist>

              {/* Interactive suggestion popover overlay */}
              {showSheetSuggestions && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto divide-y divide-slate-800">
                  {products
                    .filter(p =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.barcode.includes(searchQuery) ||
                      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.nameUrdu && p.nameUrdu.includes(searchQuery))
                    )
                    .slice(0, 8)
                    .map(p => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          setSearchQuery(p.barcode || p.name);
                          setShowSheetSuggestions(false);
                        }}
                        className="p-2.5 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                            alt=""
                            className="w-7 h-7 rounded bg-slate-950 object-cover shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-slate-100 truncate">{p.name}</p>
                            <p className="text-[10px] text-amber-400 font-mono">
                              BC: <span className="font-bold">{p.barcode}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="font-bold text-emerald-400">{settings.currencySymbol}{p.sellPrice}</p>
                        </div>
                      </div>
                    ))}
                  {products.filter(p =>
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.barcode.includes(searchQuery) ||
                    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 && (
                    <div className="p-3 text-center text-slate-400 text-xs">
                      No matching barcode or product
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Barcode Stickers Grid Preview */}
          <div id="printable-barcode-sheet" className="pt-2">
            <div className={`grid ${
              paperLayout === 'a4_4col'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                : paperLayout === 'thermal_single'
                ? 'grid-cols-1 max-w-xs mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
            } gap-4`}>
              {products
                .filter(p => 
                  !searchQuery || 
                  p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  p.barcode.includes(searchQuery) || 
                  p.sku.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(p => {
                  const isSelected = selectedBarcodeProdIds.length === 0 || selectedBarcodeProdIds.includes(p.id);
                  const cleanCode = p.barcode || p.sku;
                  const bars = generateBarcodeBars(cleanCode);
                  const totalUnits = bars.reduce((a, b) => a + b, 0);

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleToggleBarcodeProd(p.id)}
                      className={`relative bg-white text-slate-950 p-3 rounded-xl border-2 transition-all cursor-pointer font-sans shadow-md select-none ${
                        isSelected
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'border-slate-300 opacity-40 grayscale'
                      }`}
                    >
                      <div className="absolute top-2 right-2 no-print">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleBarcodeProd(p.id)}
                          className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                      </div>

                      <div className="text-center space-y-1">
                        <p className="font-extrabold text-[10px] text-slate-800 uppercase tracking-tight truncate pr-5">
                          {settings.storeName || 'STORE'}
                        </p>
                        <p className="font-bold text-[11px] text-slate-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-[12px] font-black text-emerald-700">
                          {settings.currencySymbol} {p.sellPrice}
                        </p>

                        {/* Crisp SVG Barcode Bars */}
                        <div className="my-2 flex justify-center w-full px-1">
                          <svg
                            viewBox={`0 0 ${totalUnits} 36`}
                            className="w-full h-9 max-w-[180px] display-block"
                          >
                            {(() => {
                              let currX = 0;
                              return bars.map((w, idx) => {
                                const isBlack = idx % 2 === 0;
                                const rect = isBlack ? (
                                  <rect
                                    key={idx}
                                    x={currX}
                                    y={0}
                                    width={w}
                                    height={36}
                                    fill="#000000"
                                  />
                                ) : null;
                                currX += w;
                                return rect;
                              });
                            })()}
                          </svg>
                        </div>

                        <p className="text-[10px] font-mono font-bold text-slate-700 tracking-wider">
                          {cleanCode}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
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
              
              {/* Quick Smart Suggestions Chips */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> ✨ Quick Product Suggestions (Type or Click)
                  </span>
                  <span className="text-slate-500 text-[10px]">Auto-fills prices, Urdu & details</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {allPresetProducts.slice(0, 10).map((sugg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyProductSuggestion(sugg)}
                      className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 rounded-lg text-[10px] text-slate-200 font-semibold transition-all whitespace-nowrap flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span className="text-emerald-400 font-bold">+</span>
                      <span className="truncate max-w-[120px]">{sugg.name}</span>
                      <span className="text-emerald-400 font-mono">({settings.currencySymbol}{sugg.sellPrice})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="relative">
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Product Title (English) *</span>
                    {formData.name && (
                      <span className="text-[10px] text-emerald-400 font-normal">Type for suggestions</span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    list="modal-product-title-datalist"
                    value={formData.name}
                    onChange={e => {
                      setFormData({ ...formData, name: e.target.value });
                      setShowTitleSuggestions(true);
                    }}
                    onFocus={() => setShowTitleSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTitleSuggestions(false), 200)}
                    placeholder="e.g. Nestle Milkpak 1L"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />

                  {/* Native HTML5 Datalist */}
                  <datalist id="modal-product-title-datalist">
                    {allPresetProducts.map((p, idx) => (
                      <option key={idx} value={p.name}>
                        {p.nameUrdu ? `${p.nameUrdu} - ` : ''}{settings.currencySymbol}{p.sellPrice}
                      </option>
                    ))}
                  </datalist>

                  {/* Interactive floating suggestion list */}
                  {showTitleSuggestions && formData.name.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-800">
                      {allPresetProducts
                        .filter(p =>
                          p.name.toLowerCase().includes(formData.name.toLowerCase()) ||
                          (p.nameUrdu && p.nameUrdu.includes(formData.name)) ||
                          p.sku.toLowerCase().includes(formData.name.toLowerCase())
                        )
                        .slice(0, 8)
                        .map((sugg, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => applyProductSuggestion(sugg)}
                            className="p-2 hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <img
                                src={sugg.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                                alt=""
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100';
                                }}
                                className="w-7 h-7 rounded bg-slate-950 object-cover shrink-0"
                              />
                              <div className="truncate">
                                <p className="font-bold text-slate-100 truncate">{sugg.name}</p>
                                {sugg.nameUrdu && <p className="text-[10px] text-emerald-400 dir-rtl truncate">{sugg.nameUrdu}</p>}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className="text-[10px] text-slate-400 block font-mono">Buy: {settings.currencySymbol}{sugg.buyPrice}</span>
                              <span className="font-bold text-emerald-400 block">Sell: {settings.currencySymbol}{sugg.sellPrice}</span>
                            </div>
                          </div>
                        ))}
                      {allPresetProducts.filter(p =>
                        p.name.toLowerCase().includes(formData.name.toLowerCase()) ||
                        (p.nameUrdu && p.nameUrdu.includes(formData.name))
                      ).length === 0 && (
                        <div className="p-2.5 text-center text-slate-400 text-[11px]">
                          No matching preset found. Enter custom details.
                        </div>
                      )}
                    </div>
                  )}
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
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Formula / Generic Name (فارمولا / جنیڑک)</span>
                    <span className="text-[10px] text-cyan-400 font-mono">Medicines / Salt</span>
                  </label>
                  <input
                    type="text"
                    value={formData.formulaName || ''}
                    onChange={e => setFormData({ ...formData, formulaName: e.target.value })}
                    placeholder="e.g. Paracetamol 500mg, Amoxicillin 625mg"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-cyan-500 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                    <span>Distributor / Supplier (ڈسٹری بیوٹر)</span>
                    <span className="text-[10px] text-purple-400 font-mono">Vendor / Company</span>
                  </label>
                  <input
                    type="text"
                    value={formData.supplierName || ''}
                    onChange={e => setFormData({ ...formData, supplierName: e.target.value })}
                    placeholder="e.g. Muller & Phipps, GSK, Aga Khan Pharma"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-purple-500 text-sm font-semibold"
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

                {settings.businessType !== 'sanitary_fittings' && (
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
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {settings.businessType === 'sanitary_fittings'
                      ? `Product Price / قیمت (${settings.currencySymbol}) *`
                      : `Sale Price (${settings.currencySymbol}) *`}
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.sellPrice}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setFormData({
                        ...formData,
                        sellPrice: val,
                        ...(settings.businessType === 'sanitary_fittings' ? { buyPrice: val } : {})
                      });
                    }}
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

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status (Active in POS) *</label>
                  <select
                    value={formData.isActive === false ? 'inactive' : 'active'}
                    onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="active">🟢 Active (Visible in POS & Terminal)</option>
                    <option value="inactive">🔴 Inactive (Hidden from POS)</option>
                  </select>
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

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800 text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">
                  Delete {deleteConfirmItem.type === 'product' ? 'Product' : deleteConfirmItem.type === 'category' ? 'Category' : 'Supplier / Distributor'}
                </h3>
                <p className="text-xs text-slate-400">Are you sure you want to delete this item?</p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-emerald-400 truncate">
              {deleteConfirmItem.name}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteConfirmItem.type === 'product') {
                    deleteProduct(deleteConfirmItem.id);
                  } else if (deleteConfirmItem.type === 'category') {
                    deleteCategory(deleteConfirmItem.id);
                  } else if (deleteConfirmItem.type === 'supplier') {
                    deleteSupplier(deleteConfirmItem.name);
                  }
                  setDeleteConfirmItem(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 transition-all cursor-pointer"
              >
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIER CONTACT EDIT MODAL */}
      {editingSupplierContact && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              saveSupplierContact(
                editingSupplierContact.name,
                {
                  phone: editingSupplierContact.phone,
                  address: editingSupplierContact.address,
                  notes: editingSupplierContact.notes,
                  pendingBalance: editingSupplierContact.pendingBalance || 0,
                  isActive: editingSupplierContact.isActive !== false
                },
                editingSupplierContact.oldName
              );
            }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">Edit Distributor / Supplier Info</h3>
              </div>
              <button type="button" onClick={() => setEditingSupplierContact(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={editingSupplierContact.name}
                  onChange={e => setEditingSupplierContact({ ...editingSupplierContact, name: e.target.value })}
                  placeholder="Company name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={editingSupplierContact.phone}
                  onChange={e => setEditingSupplierContact({ ...editingSupplierContact, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Office / Distribution Address</label>
                <input
                  type="text"
                  value={editingSupplierContact.address}
                  onChange={e => setEditingSupplierContact({ ...editingSupplierContact, address: e.target.value })}
                  placeholder="e.g. Medicine Market, Wholesale Plaza, Lahore"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Pending Balance / Payable Udhaar (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={editingSupplierContact.pendingBalance || 0}
                  onChange={e => setEditingSupplierContact({ ...editingSupplierContact, pendingBalance: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={editingSupplierContact.isActive !== false ? 'active' : 'inactive'}
                  onChange={e => setEditingSupplierContact({ ...editingSupplierContact, isActive: e.target.value === 'active' })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🔴 Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ledger Notes / Terms</label>
                <textarea
                  rows={2}
                  value={editingSupplierContact.notes}
                  onChange={e => setEditingSupplierContact({ ...editingSupplierContact, notes: e.target.value })}
                  placeholder="Payment terms, delivery schedules, representative contact..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const sName = editingSupplierContact.oldName || editingSupplierContact.name;
                  setEditingSupplierContact(null);
                  setDeleteConfirmItem({ type: 'supplier', id: sName, name: sName });
                }}
                className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSupplierContact(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20"
                >
                  Save Ledger Details
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ADD NEW SUPPLIER MODAL */}
      {isAddSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form
            onSubmit={e => {
              e.preventDefault();
              if (newSupplierForm.name.trim()) {
                saveSupplierContact(newSupplierForm.name.trim(), {
                  phone: newSupplierForm.phone,
                  address: newSupplierForm.address,
                  notes: newSupplierForm.notes,
                  pendingBalance: newSupplierForm.pendingBalance || 0,
                  isActive: newSupplierForm.isActive !== false
                });
              }
            }}
            className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm text-slate-100">Add New Distributor / Supplier</h3>
              </div>
              <button type="button" onClick={() => setIsAddSupplierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplierForm.name}
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, name: e.target.value })}
                  placeholder="e.g. Muller & Phipps, Getz Pharma, Local Distributor"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone / WhatsApp Number</label>
                <input
                  type="text"
                  value={newSupplierForm.phone}
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Office / Distribution Address</label>
                <input
                  type="text"
                  value={newSupplierForm.address}
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, address: e.target.value })}
                  placeholder="e.g. Wholesale Medicine Market, Lahore"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Pending Udhaar / Balance (Rs.)</label>
                <input
                  type="number"
                  min="0"
                  value={newSupplierForm.pendingBalance || 0}
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, pendingBalance: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Status</label>
                <select
                  value={newSupplierForm.isActive ? 'active' : 'inactive'}
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, isActive: e.target.value === 'active' })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500 font-semibold"
                >
                  <option value="active">🟢 Active</option>
                  <option value="inactive">🔴 Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Notes / Terms</label>
                <textarea
                  rows={2}
                  value={newSupplierForm.notes}
                  onChange={e => setNewSupplierForm({ ...newSupplierForm, notes: e.target.value })}
                  placeholder="Payment terms, representative contact info..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddSupplierModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20"
              >
                Add Supplier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAMOUS PAKISTANI PRESET SUPPLIERS MODAL */}
      {isPresetSupplierModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl text-white max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base text-slate-100">Famous Pakistani Distributors & Suppliers List</h3>
              </div>
              <button type="button" onClick={() => setIsPresetSupplierModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select any famous pharmaceutical distributor below to instantly add them to your registered suppliers list, or import all with one click:
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 border border-slate-800 rounded-xl">
              <span className="text-xs text-purple-300 font-semibold">{PRESET_PHARMA_SUPPLIERS.length} Major Preset Distributors</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleImportDummyMedicines}
                  className="px-3 py-1.5 bg-purple-950/90 hover:bg-purple-900 border border-purple-700/80 text-purple-200 font-extrabold text-xs rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1"
                >
                  <Package className="w-3.5 h-3.5 text-purple-400" />
                  <span>💊 Import Famous Dummy Medicines</span>
                </button>

                <button
                  type="button"
                  onClick={handleImportAllPresets}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-md transition-all cursor-pointer"
                >
                  + Import All Presets
                </button>
              </div>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {PRESET_PHARMA_SUPPLIERS.map((preset, idx) => {
                const isAlreadyAdded = !!supplierContacts[preset.name];
                return (
                  <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-purple-800/80 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100">{preset.name}</span>
                        {isAlreadyAdded && (
                          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.2 rounded font-semibold">
                            Added
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">📞 {preset.phone} | 📍 {preset.address}</p>
                      <p className="text-[10px] text-purple-300 italic">{preset.notes}</p>
                    </div>

                    <button
                      type="button"
                      disabled={isAlreadyAdded}
                      onClick={() => handleImportPresetSupplier(preset)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isAlreadyAdded
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                      }`}
                    >
                      {isAlreadyAdded ? 'Already in List' : '+ Import'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsPresetSupplierModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
