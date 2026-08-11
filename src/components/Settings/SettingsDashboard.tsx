import React, { useState, useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { t } from '../../utils/i18n';
import { sounds } from '../../utils/sound';
import {
  Settings,
  Store,
  Printer,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  Save,
  Shield,
  Trash2,
  PackagePlus,
  Building2,
  Sparkles,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  Landmark,
  Smartphone,
  BookOpen,
  Zap,
  Check
} from 'lucide-react';
import { StoreSettings } from '../../types';

const INDUSTRY_LIST = [
  { id: 'supermarket', name: 'Supermarket / Grocery / Kiryana', icon: '🛒', defaultName: 'Bismillah Super Store' },
  { id: 'home_appliances', name: 'Home Appliances (TV, AC, Oven, Refrigerator)', icon: '📺', defaultName: 'Al-Rehman Electronics & Appliances' },
  { id: 'sanitary_fittings', name: 'Sanitary, Water Pumps & Plumbing', icon: '🚰', defaultName: 'Pak Sanitary & Hardware' },
  { id: 'restaurant_cafe', name: 'Restaurant, Cafe & Dine-In POS', icon: '🍔', defaultName: 'Khyber Shinwari Restaurant' },
  { id: 'fast_food', name: 'Pizza, Burger & Fast Food Shop', icon: '🍕', defaultName: 'Cheezious Fast Food' },
  { id: 'nan_shop', name: 'Nan Shop & Tandoor Token System', icon: '🥯', defaultName: 'Al-Madina Tandoor & Nan Shop' },
  { id: 'solar_shop', name: 'Solar Energy & Systems Shop', icon: '☀️', defaultName: 'Pak Solar Tech Solutions' },
  { id: 'beverages', name: 'Beverages, Cold Drinks & Water Mart', icon: '🥤', defaultName: 'Cold Corner & Water Mart' },
  { id: 'garments', name: 'Garments, Boutique & Clothes', icon: '👕', defaultName: 'Royal Garments & Boutique' },
  { id: 'pharmacy', name: 'Pharmacy & Medical Store', icon: '💊', defaultName: 'Shaheen Pharmacy & Medical' },
  { id: 'bakery', name: 'Bakery, Sweets & Cafe', icon: '🥐', defaultName: 'Gourmet Bakery & Sweets' },
  { id: 'spare_parts', name: 'Auto Spare Parts & Hardware', icon: '🔧', defaultName: 'Master Auto Spare Parts' },
  { id: 'jewellery', name: 'Jewellery & Gold Shop', icon: '💍', defaultName: 'Al-Anwar Jewellers & Gold' },
  { id: 'electronics', name: 'General Electronics & Gadgets', icon: '⚡', defaultName: 'Galaxy Electronics Hub' },
  { id: 'mobiles_accessories', name: 'Mobiles & Accessories Studio', icon: '📱', defaultName: 'Smart Mobile Zone' },
  { id: 'computers_laptops', name: 'Laptops, Computers & Accessories', icon: '💻', defaultName: 'TechZone Laptops & Computers' },
  { id: 'cosmetics', name: 'Cosmetics & Beauty Store', icon: '💄', defaultName: 'Glamour Beauty & Cosmetics' },
];

export const SettingsDashboard: React.FC = () => {
  const {
    language,
    settings,
    savedIndustryProfiles,
    updateSettings,
    exportBackupData,
    importBackupData,
    resetToDummyData,
    loadIndustryPreset,
    clearAllDataToZero
  } = usePOS();

  const [formState, setFormState] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProfile = savedIndustryProfiles ? savedIndustryProfiles[formState.businessType || 'supermarket'] : undefined;

  React.useEffect(() => {
    setFormState({ ...settings });
  }, [settings]);

  const enabledPM = formState.enabledPaymentMethods || {
    cash: true,
    card: true,
    online: true,
    wallet: true,
    credit_udhaar: true,
  };

  const togglePaymentMethod = (method: 'cash' | 'card' | 'online' | 'wallet' | 'credit_udhaar') => {
    const current = formState.enabledPaymentMethods || {
      cash: true,
      card: true,
      online: true,
      wallet: true,
      credit_udhaar: true,
    };
    setFormState({
      ...formState,
      enabledPaymentMethods: {
        ...current,
        [method]: current[method] === false ? true : false,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playSuccess();
    updateSettings(formState);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const text = event.target?.result as string;
        if (text) importBackupData(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Settings className="w-6 h-6" /> {t('settings', language)} & Store Customization
          </h2>
          <p className="text-xs text-slate-400">Customize store information, receipt thermal printer layout, taxes & data backups</p>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl animate-fade-in">
            <CheckCircle className="w-4 h-4" /> Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ⚡ 1-Click Saved Industry Store Profiles Manager */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="font-bold text-base text-emerald-400 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                <span>⚡ 1-Click Saved Store Profiles Switcher</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Switch instantly between saved store profiles (e.g. Bismillah Super Store, Nan Shop, Electronics). All custom products & settings are automatically remembered!
              </p>
            </div>
            <span className="text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
              💾 {Object.keys(savedIndustryProfiles || {}).length} Store Profiles Saved
            </span>
          </div>

          {/* Quick Filter or Profile Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1 custom-scrollbar">
            {INDUSTRY_LIST.map((ind) => {
              const savedProfile = savedIndustryProfiles ? savedIndustryProfiles[ind.id] : undefined;
              const isActive = formState.businessType === ind.id;

              return (
                <div
                  key={ind.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 relative ${
                    isActive
                      ? 'bg-emerald-950/70 border-emerald-400 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                      : savedProfile
                      ? 'bg-slate-900/90 border-slate-700 hover:border-emerald-500/60'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                        <span className="text-base leading-none">{ind.icon}</span>
                        <span className="truncate">{ind.name}</span>
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-emerald-300 truncate mt-1">
                      {savedProfile ? savedProfile.settings.storeName : ind.defaultName}
                    </p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1.5">
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                        📦 {savedProfile ? savedProfile.products.length : 'Preset'} Items
                      </span>
                      <span className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                        📁 {savedProfile ? savedProfile.categories.length : 'Preset'} Cats
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isActive || formState.isIndustryLocked}
                    onClick={() => {
                      sounds.playSuccess();
                      loadIndustryPreset(ind.id);
                    }}
                    className={`w-full py-2 px-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : formState.isIndustryLocked
                        ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 shadow-md shadow-emerald-500/20 active:scale-95'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Active Store</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{savedProfile ? `1-Click Restore "${savedProfile.settings.storeName}"` : `1-Click Load ${ind.name.split('/')[0]}`}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Profile Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
            <Store className="w-4 h-4" /> Store Profile & Business Identification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Store / Business Name *</label>
              <input
                type="text"
                required
                value={formState.storeName || ''}
                onChange={e => setFormState({ ...formState, storeName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">Business Industry / Store Type</label>
                <button
                  type="button"
                  onClick={() => {
                    const nextLocked = !formState.isIndustryLocked;
                    setFormState({ ...formState, isIndustryLocked: nextLocked });
                  }}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all ${
                    formState.isIndustryLocked
                      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 hover:bg-amber-900'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                  title={formState.isIndustryLocked ? "Industry locked. Click to unlock" : "Click to lock industry selection"}
                >
                  {formState.isIndustryLocked ? (
                    <>
                      <Lock className="w-3 h-3 text-amber-400" />
                      <span>Industry Locked</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-slate-400" />
                      <span>Lock Selection</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  disabled={formState.isIndustryLocked}
                  value={formState.businessType || 'supermarket'}
                  onChange={e => setFormState({ ...formState, businessType: e.target.value as any })}
                  className={`flex-1 border rounded-xl px-3 py-2 text-emerald-400 font-bold focus:outline-none ${
                    formState.isIndustryLocked
                      ? 'bg-slate-900 border-slate-800 opacity-60 cursor-not-allowed text-slate-400'
                      : 'bg-slate-950 border-slate-800 focus:border-emerald-500'
                  }`}
                >
                  <option value="supermarket">🛒 Supermarket / Grocery / Kiryana Store</option>
                  <option value="home_appliances">📺 Home Appliances (TV, Refrigerator, AC, Washing Machine, Oven, Heater)</option>
                  <option value="sanitary_fittings">🚰 Sanitary Fittings, Water Pumps & Plumbing</option>
                  <option value="restaurant_cafe">🍔 Restaurant, Fast Food & Cafe POS</option>
                  <option value="fast_food">🍕 Pizza, Burger & Fries Shop (Specialized Fast Food)</option>
                  <option value="nan_shop">🥯 Nan Shop & Tandoor (Specialized Token System)</option>
                  <option value="solar_shop">☀️ Solar Energy Shop & System Solutions</option>
                  <option value="beverages">🥤 Beverages, Cold Drinks & Water Mart</option>
                  <option value="garments">👕 Garments, Boutique & Apparel Shop</option>
                  <option value="pharmacy">💊 Pharmacy & Medical Store</option>
                  <option value="bakery">🥐 Bakery, Sweets & Cafe</option>
                  <option value="spare_parts">🔧 Auto Spare Parts & Hardware</option>
                  <option value="jewellery">💍 Jewellery & Gold Shop</option>
                  <option value="electronics">⚡ General Electronics & Gadgets</option>
                  <option value="mobiles_accessories">📱 Mobiles & Accessories Studio</option>
                  <option value="computers_laptops">💻 Laptops, Computers & Tech Accessories</option>
                  <option value="cosmetics">💄 Cosmetics & Beauty Store</option>
                </select>

                <button
                  type="button"
                  disabled={formState.isIndustryLocked}
                  onClick={() => loadIndustryPreset(formState.businessType || 'supermarket')}
                  className={`px-3 py-2 border font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                    formState.isIndustryLocked
                      ? 'bg-slate-900 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                      : selectedProfile
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                      : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/50 text-emerald-300'
                  }`}
                  title={formState.isIndustryLocked ? "Unlock industry selection to switch profiles" : "Load or switch to this industry store profile"}
                >
                  <PackagePlus className="w-4 h-4" />
                  <span>
                    {selectedProfile
                      ? `Restore "${selectedProfile.settings.storeName}" Saved Profile`
                      : 'Load Industry Store Profile'}
                  </span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 mt-1">
                {formState.isIndustryLocked ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    🔒 <strong>Industry preset is currently LOCKED.</strong> Unlock to switch or load store profiles.
                  </span>
                ) : selectedProfile ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    💾 <strong>Saved Profile Available:</strong> "{selectedProfile.settings.storeName}" ({selectedProfile.products.length} products saved). Click button to restore!
                  </span>
                ) : (
                  <span>
                    Select an industry and click <span className="text-emerald-400 font-semibold">"Load Industry Store Profile"</span>. All edits made under each industry profile will be automatically saved and remembered!
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tagline / Slogan</label>
              <input
                type="text"
                value={formState.tagline || ''}
                onChange={e => setFormState({ ...formState, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Address & City</label>
              <input
                type="text"
                value={formState.address || ''}
                onChange={e => setFormState({ ...formState, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Numbers</label>
              <input
                type="text"
                value={formState.phone || ''}
                onChange={e => setFormState({ ...formState, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">NTN / GST Reg Number</label>
              <input
                type="text"
                value={formState.ntnGst || ''}
                onChange={e => setFormState({ ...formState, ntnGst: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Currency Symbol *</label>
              <input
                type="text"
                required
                value={formState.currencySymbol || ''}
                onChange={e => setFormState({ ...formState, currencySymbol: e.target.value })}
                placeholder="e.g. Rs. or $"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Receipt & Thermal Printer Layout */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
            <Printer className="w-4 h-4" /> Thermal Receipt Customization & Paper Size
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Thermal Paper Width</label>
              <select
                value={formState.paperSize || '80mm'}
                onChange={e => setFormState({ ...formState, paperSize: e.target.value as '80mm' | '58mm' })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="80mm">Standard 80mm Thermal Receipt Paper</option>
                <option value="58mm">Compact 58mm POS Receipt Paper</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Sales GST Tax Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                value={formState.taxRatePercent ?? 0}
                onChange={e => setFormState({ ...formState, taxRatePercent: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Receipt Top Header Banner Message</label>
              <input
                type="text"
                value={formState.receiptHeader || ''}
                onChange={e => setFormState({ ...formState, receiptHeader: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Receipt Footer Note / Return Policy Greeting</label>
              <textarea
                rows={2}
                value={formState.receiptFooter || ''}
                onChange={e => setFormState({ ...formState, receiptFooter: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Allowed Payment Methods Control (ادائیگی کے ذرائع کا ایڈمن کنٹرول) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Allowed Payment Wasooli Options (ادائیگی کے ذرائع کا ایڈمن کنٹرول)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin control: Hide or unhide payment options during POS terminal checkout (کیشیئر فارم پر جن ادائیگی کے طریقوں کو آن رکھیں گے صرف وہی نظر آئیں گے)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Cash */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Banknote className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Cash (نقد)</span>
                  <span className="text-[10px] text-slate-400">Counter Cash Payment</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePaymentMethod('cash')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  enabledPM.cash !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {enabledPM.cash !== false ? 'ACTIVE (آن)' : 'HIDDEN (آف)'}
              </button>
            </div>

            {/* Card / ATM */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">ATM Card (کارڈ مشین)</span>
                  <span className="text-[10px] text-slate-400">Debit / Credit Card Swipe</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePaymentMethod('card')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  enabledPM.card !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {enabledPM.card !== false ? 'ACTIVE (آن)' : 'HIDDEN (آف)'}
              </button>
            </div>

            {/* Online / Bank Transfer */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Landmark className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Online / Bank Transfer</span>
                  <span className="text-[10px] text-slate-400">Bank / Raast / Online</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePaymentMethod('online')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  enabledPM.online !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {enabledPM.online !== false ? 'ACTIVE (آن)' : 'HIDDEN (آف)'}
              </button>
            </div>

            {/* Mobile Wallet */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Mobile Wallet</span>
                  <span className="text-[10px] text-slate-400">EasyPaisa / JazzCash</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePaymentMethod('wallet')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  enabledPM.wallet !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {enabledPM.wallet !== false ? 'ACTIVE (آن)' : 'HIDDEN (آف)'}
              </button>
            </div>

            {/* Customer Credit / Udhaar */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Customer Credit / Udhaar</span>
                  <span className="text-[10px] text-slate-400">Add to Customer Ledger</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => togglePaymentMethod('credit_udhaar')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                  enabledPM.credit_udhaar !== false
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
              >
                {enabledPM.credit_udhaar !== false ? 'ACTIVE (آن)' : 'HIDDEN (آف)'}
              </button>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:from-emerald-400 hover:to-teal-300"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>

      </form>

      {/* Automated Data Backup & Safety Tools */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Automated Local Backup & Data Safety
        </h3>
        <p className="text-xs text-slate-400">
          Your POS inventory, customer ledger, sales records, and settings are continuously saved to offline storage. You can also export or import JSON backups manually.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportBackupData}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Complete Data JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" /> Restore JSON File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            onClick={resetToDummyData}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
            title="Restore original multi-item demo catalog"
          >
            <RotateCcw className="w-4 h-4" /> Reset Default Demo
          </button>

          <button
            onClick={clearAllDataToZero}
            className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/60 text-rose-300 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all ml-auto"
            title="Delete all products, categories and sales to start fresh with 0 items"
          >
            <Trash2 className="w-4 h-4 text-rose-400" /> Start Fresh from Zero (Clear All Data)
          </button>
        </div>
      </div>

    </div>
  );
};
