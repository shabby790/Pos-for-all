import React from 'react';
import { Zap, X, Check } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { sounds } from '../utils/sound';

const HEADER_INDUSTRIES = [
  { id: 'supermarket', name: 'Supermarket / Grocery', icon: '🛒', defaultName: 'Bismillah Super Store' },
  { id: 'home_appliances', name: 'Home Appliances', icon: '📺', defaultName: 'Al-Rehman Electronics' },
  { id: 'sanitary_fittings', name: 'Sanitary & Plumbing', icon: '🚰', defaultName: 'Pak Sanitary & Hardware' },
  { id: 'restaurant_cafe', name: 'Restaurant & Cafe', icon: '🍔', defaultName: 'Khyber Shinwari Restaurant' },
  { id: 'fast_food', name: 'Pizza & Fast Food', icon: '🍕', defaultName: 'Cheezious Fast Food' },
  { id: 'nan_shop', name: 'Nan Shop & Tandoor', icon: '🥯', defaultName: 'Al-Madina Tandoor & Nan Shop' },
  { id: 'solar_shop', name: 'Solar Energy Shop', icon: '☀️', defaultName: 'Pak Solar Tech' },
  { id: 'beverages', name: 'Beverages & Water Mart', icon: '🥤', defaultName: 'Cold Corner Water Mart' },
  { id: 'garments', name: 'Garments & Boutique', icon: '👕', defaultName: 'Royal Garments' },
  { id: 'pharmacy', name: 'Pharmacy & Medical', icon: '💊', defaultName: 'Shaheen Pharmacy' },
  { id: 'bakery', name: 'Bakery & Sweets', icon: '🥐', defaultName: 'Gourmet Bakery' },
  { id: 'spare_parts', name: 'Auto Spare Parts', icon: '🔧', defaultName: 'Master Auto Parts' },
  { id: 'jewellery', name: 'Jewellery & Gold', icon: '💍', defaultName: 'Al-Anwar Jewellers' },
  { id: 'electronics', name: 'General Electronics', icon: '⚡', defaultName: 'Galaxy Electronics' },
  { id: 'mobiles_accessories', name: 'Mobiles & Accessories', icon: '📱', defaultName: 'Smart Mobile Zone' },
  { id: 'computers_laptops', name: 'Laptops & Computers', icon: '💻', defaultName: 'TechZone Laptops' },
  { id: 'cosmetics', name: 'Cosmetics & Beauty', icon: '💄', defaultName: 'Glamour Cosmetics' },
];

interface ProfileSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileSwitcherModal: React.FC<ProfileSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { settings, savedIndustryProfiles, loadIndustryPreset } = usePOS();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">⚡ 1-Click Store Profiles Switcher</h3>
              <p className="text-xs text-slate-400">Select any saved store profile to restore its products and settings immediately.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-1 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HEADER_INDUSTRIES.map((ind) => {
            const savedProfile = savedIndustryProfiles ? savedIndustryProfiles[ind.id] : undefined;
            const isActive = settings.businessType === ind.id;

            return (
              <div
                key={ind.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                  isActive
                    ? 'bg-emerald-950/80 border-emerald-400 shadow-md ring-1 ring-emerald-500/40'
                    : savedProfile
                    ? 'bg-slate-950/80 border-slate-700 hover:border-emerald-500/60'
                    : 'bg-slate-950/40 border-slate-800/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-100 truncate flex items-center gap-1.5">
                      <span>{ind.icon}</span>
                      <span className="truncate">{ind.name}</span>
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shrink-0">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-emerald-300 truncate mt-1">
                    {savedProfile ? savedProfile.settings.storeName : ind.defaultName}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                    <span>📦 {savedProfile ? savedProfile.products.length : 'Preset'} Items</span>
                    <span>•</span>
                    <span>📁 {savedProfile ? savedProfile.categories.length : 'Preset'} Cats</span>
                  </div>
                </div>

                <button
                  disabled={isActive || settings.isIndustryLocked}
                  onClick={() => {
                    sounds.playSuccess();
                    loadIndustryPreset(ind.id);
                    onClose();
                  }}
                  className={`w-full py-2 px-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all duration-100 active:scale-95 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                      : settings.isIndustryLocked
                      ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-400 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Current Store</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>{savedProfile ? `1-Click Restore "${savedProfile.settings.storeName}"` : `Load ${ind.name}`}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
          >
            Close Switcher
          </button>
        </div>
      </div>
    </div>
  );
};
