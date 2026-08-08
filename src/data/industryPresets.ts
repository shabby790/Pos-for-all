import { Category, Product, StoreSettings } from '../types';

export interface IndustryTemplate {
  name: string;
  tagline: string;
  categories: Category[];
  products: Product[];
}

export const industryTemplates: Record<string, IndustryTemplate> = {
  supermarket: {
    name: 'Bismillah Super Mart',
    tagline: 'Quality Fresh Grocery & Daily Essentials',
    categories: [
      { id: 'cat_beverages', name: 'Beverages & Soft Drinks', nameUrdu: 'مشروبات / کولڈ ڈرنکس', icon: 'CupSoda', color: 'text-cyan-400' },
      { id: 'cat_snacks', name: 'Snacks & Biscuits', nameUrdu: 'سنیکس اور بسکٹ', icon: 'Cookie', color: 'text-amber-400' },
      { id: 'cat_dairy', name: 'Dairy & Bakery', nameUrdu: 'ڈیری اور دودھ کی اشیاء', icon: 'Milk', color: 'text-blue-300' },
      { id: 'cat_groceries', name: 'Staples & Pulses', nameUrdu: 'دالیں، چاول اور آٹا', icon: 'Wheat', color: 'text-emerald-400' },
      { id: 'cat_personal', name: 'Personal Care & Soap', nameUrdu: 'صابن اور پرسنل کیئر', icon: 'Sparkles', color: 'text-purple-400' }
    ],
    products: [
      {
        id: 'p_sup_1',
        name: 'Nestle Milkpak 1L',
        nameUrdu: 'نسلے ملکن پیک 1 لیٹر',
        category: 'cat_dairy',
        sku: 'MILK-1L',
        barcode: '896400010101',
        buyPrice: 280,
        sellPrice: 320,
        stockQuantity: 48,
        unit: 'Pack',
        reorderLevel: 10,
        description: 'UHT Whole Milk 100% Pure'
      },
      {
        id: 'p_sup_2',
        name: 'Tapal Danedar Tea 450g',
        nameUrdu: 'تپال دانے دار چائے 450 گرام',
        category: 'cat_groceries',
        sku: 'TAPAL-450G',
        barcode: '896400010102',
        buyPrice: 620,
        sellPrice: 690,
        stockQuantity: 25,
        unit: 'Pack',
        reorderLevel: 5
      },
      {
        id: 'p_sup_3',
        name: 'Pepsi Bottle 1.5L',
        nameUrdu: 'پیپسی 1.5 لیٹر',
        category: 'cat_beverages',
        sku: 'PEPSI-1.5L',
        barcode: '896400010103',
        buyPrice: 155,
        sellPrice: 180,
        stockQuantity: 60,
        unit: 'Bottle',
        reorderLevel: 12
      },
      {
        id: 'p_sup_4',
        name: 'Lays Masala Wavy 50g',
        nameUrdu: 'لیز مصالحہ چپس',
        category: 'cat_snacks',
        sku: 'LAYS-MAS',
        barcode: '896400010104',
        buyPrice: 85,
        sellPrice: 100,
        stockQuantity: 8,
        unit: 'Pack',
        reorderLevel: 15
      },
      {
        id: 'p_sup_5',
        name: 'Guard Super Basmati Rice 5Kg',
        nameUrdu: 'گارڈ سپر باسٹھ چاول 5 کلو',
        category: 'cat_groceries',
        sku: 'RICE-5KG',
        barcode: '896400010105',
        buyPrice: 1850,
        sellPrice: 2100,
        stockQuantity: 18,
        unit: 'Bag',
        reorderLevel: 5
      },
      {
        id: 'p_sup_6',
        name: 'Surf Excel Washing Powder 1Kg',
        nameUrdu: 'سرف ایکسل 1 کلو',
        category: 'cat_personal',
        sku: 'SURF-1KG',
        barcode: '896400010106',
        buyPrice: 680,
        sellPrice: 750,
        stockQuantity: 30,
        unit: 'Pack',
        reorderLevel: 6
      }
    ]
  },

  garments: {
    name: 'Royal Fashion Garments & Boutique',
    tagline: 'Premium Men, Women & Kids Apparel',
    categories: [
      { id: 'cat_men', name: "Men's Wear", nameUrdu: 'مردانہ کپڑے', icon: 'Shirt', color: 'text-blue-400' },
      { id: 'cat_women', name: "Women's Collection", nameUrdu: 'زنانہ ملبوسات', icon: 'ShoppingBag', color: 'text-pink-400' },
      { id: 'cat_kids', name: "Kid's Wear", nameUrdu: 'بچوں کے کپڑے', icon: 'Smile', color: 'text-amber-400' },
      { id: 'cat_acc', name: "Fashion Accessories", nameUrdu: 'فیشن بیگز اور بیلیٹ', icon: 'Glasses', color: 'text-purple-400' }
    ],
    products: [
      {
        id: 'p_gar_1',
        name: "Men's Cotton Kurta Shalwar Suit (L)",
        nameUrdu: 'مردانہ کاٹن کرتہ شلوار سوٹ',
        category: 'cat_men',
        sku: 'MKURTA-COT-L',
        barcode: '896400020101',
        buyPrice: 2200,
        sellPrice: 3500,
        stockQuantity: 15,
        unit: 'Suit',
        reorderLevel: 3,
        description: '100% Egyptian Cotton Breathable Fabric'
      },
      {
        id: 'p_gar_2',
        name: 'Ladies 3-Piece Printed Lawn Suit',
        nameUrdu: 'زنانہ 3 پیس لان سوٹ',
        category: 'cat_women',
        sku: 'WLAWN-3PC-01',
        barcode: '896400020102',
        buyPrice: 3100,
        sellPrice: 4800,
        stockQuantity: 20,
        unit: 'Suit',
        reorderLevel: 4,
        description: 'Embroidered Dupatta with Printed Shirt & Trouser'
      },
      {
        id: 'p_gar_3',
        name: "Men's Slim Fit Denim Jeans (32)",
        nameUrdu: 'مردانہ ڈینم جینس پینٹ',
        category: 'cat_men',
        sku: 'JEANS-DEN-32',
        barcode: '896400020103',
        buyPrice: 1400,
        sellPrice: 2400,
        stockQuantity: 25,
        unit: 'Pcs',
        reorderLevel: 5
      },
      {
        id: 'p_gar_4',
        name: "Kid's Graphic Cotton T-Shirt (Age 6-8)",
        nameUrdu: 'بچوں کی ٹی شرٹ',
        category: 'cat_kids',
        sku: 'KID-TSHIRT-06',
        barcode: '896400020104',
        buyPrice: 450,
        sellPrice: 850,
        stockQuantity: 40,
        unit: 'Pcs',
        reorderLevel: 8
      },
      {
        id: 'p_gar_5',
        name: 'Genuine Leather Men Belt (Black)',
        nameUrdu: 'چمڑے کا مردانہ بیلٹ',
        category: 'cat_acc',
        sku: 'BELT-LTHR-BLK',
        barcode: '896400020105',
        buyPrice: 650,
        sellPrice: 1200,
        stockQuantity: 18,
        unit: 'Pcs',
        reorderLevel: 4
      }
    ]
  },

  pharmacy: {
    name: 'Shaheen Medicos & Pharmacy',
    tagline: 'Authentic Medicines & Surgical Supplies',
    categories: [
      { id: 'cat_tablets', name: 'Tablets & Capsules', nameUrdu: 'ٹیبلٹس اور کیپسول', icon: 'Pill', color: 'text-emerald-400' },
      { id: 'cat_syrups', name: 'Syrups & Suspensions', nameUrdu: 'شربت / سیپ', icon: 'Wine', color: 'text-red-400' },
      { id: 'cat_surgical', name: 'Surgical & Bandages', nameUrdu: 'سرجیکل سامان اور بینڈیج', icon: 'Scissors', color: 'text-amber-400' },
      { id: 'cat_babycare', name: 'Baby Care & Diapers', nameUrdu: 'بیبی ڈائپر اور دیکھ بھال', icon: 'Baby', color: 'text-cyan-400' }
    ],
    products: [
      {
        id: 'p_pha_1',
        name: 'Panadol Extra 500mg (10x10 Box)',
        nameUrdu: 'پیناڈول ایکسٹرا گولی',
        category: 'cat_tablets',
        sku: 'PANADOL-EXT-BOX',
        barcode: '896400030101',
        buyPrice: 320,
        sellPrice: 380,
        stockQuantity: 50,
        unit: 'Box',
        reorderLevel: 10,
        description: 'Paracetamol + Caffeine Pain Relief'
      },
      {
        id: 'p_pha_2',
        name: 'Augmentin 625mg Tablets (Strip 6)',
        nameUrdu: 'اگمنٹن 625 ملی گرام',
        category: 'cat_tablets',
        sku: 'AUG-625MG-STP',
        barcode: '896400030102',
        buyPrice: 280,
        sellPrice: 330,
        stockQuantity: 35,
        unit: 'Pack',
        reorderLevel: 8
      },
      {
        id: 'p_pha_3',
        name: 'Calpol 6 Plus Fever Syrup 120ml',
        nameUrdu: 'کالپول بخار کا شربت',
        category: 'cat_syrups',
        sku: 'CALPOL-120ML',
        barcode: '896400030103',
        buyPrice: 110,
        sellPrice: 135,
        stockQuantity: 28,
        unit: 'Bottle',
        reorderLevel: 6
      },
      {
        id: 'p_pha_4',
        name: 'Digital Body Thermometer LCD',
        nameUrdu: 'ڈیجیٹل تھرمامیٹر',
        category: 'cat_surgical',
        sku: 'THERMO-DIGI',
        barcode: '896400030104',
        buyPrice: 350,
        sellPrice: 550,
        stockQuantity: 12,
        unit: 'Pcs',
        reorderLevel: 3
      },
      {
        id: 'p_pha_5',
        name: 'Pampers Baby Diaper Mega Box (Large)',
        nameUrdu: 'پیمپرز ڈائپر لارج',
        category: 'cat_babycare',
        sku: 'PAMPER-L-BOX',
        barcode: '896400030105',
        buyPrice: 2400,
        sellPrice: 2850,
        stockQuantity: 16,
        unit: 'Box',
        reorderLevel: 4
      }
    ]
  },

  bakery: {
    name: 'Gourmet Bakers & Sweets',
    tagline: 'Fresh Baked Bread, Cakes & Traditional Mithai',
    categories: [
      { id: 'cat_cakes', name: 'Fresh Cakes & Pastries', nameUrdu: 'کیک اور پیسٹری', icon: 'Cake', color: 'text-pink-400' },
      { id: 'cat_sweets', name: 'Traditional Sweets (Mithai)', nameUrdu: 'روایتی مٹھائی', icon: 'Candy', color: 'text-amber-400' },
      { id: 'cat_savory', name: 'Nimco, Patties & Samosa', nameUrdu: 'پٹیز، سموسے اور نمکو', icon: 'Flame', color: 'text-red-400' },
      { id: 'cat_breads', name: 'Bread, Rusk & Biscuits', nameUrdu: 'بریڈ، رسک اور بسکٹ', icon: 'Wheat', color: 'text-emerald-400' }
    ],
    products: [
      {
        id: 'p_bak_1',
        name: 'Chocolate Fudge Cream Cake 2-Pound',
        nameUrdu: 'چاکلیٹ فج کیک 2 پاؤنڈ',
        category: 'cat_cakes',
        sku: 'CAKE-CHOC-2P',
        barcode: '896400040101',
        buyPrice: 900,
        sellPrice: 1450,
        stockQuantity: 8,
        unit: 'Pcs',
        reorderLevel: 2,
        description: 'Rich Belgian Chocolate Cream Layers'
      },
      {
        id: 'p_bak_2',
        name: 'Gulab Jamun Special Mithai 1Kg',
        nameUrdu: 'گلاب جامن مٹھائی 1 کلو',
        category: 'cat_sweets',
        sku: 'MITHAI-GJ-1KG',
        barcode: '896400040102',
        buyPrice: 700,
        sellPrice: 1100,
        stockQuantity: 15,
        unit: 'Kg',
        reorderLevel: 4
      },
      {
        id: 'p_bak_3',
        name: 'Fresh Chicken Patties (Box of 6)',
        nameUrdu: 'چکن پیٹیز 6 عدد',
        category: 'cat_savory',
        sku: 'PATTIES-CHK-6',
        barcode: '896400040103',
        buyPrice: 240,
        sellPrice: 420,
        stockQuantity: 20,
        unit: 'Pack',
        reorderLevel: 5
      },
      {
        id: 'p_bak_4',
        name: 'Large Milky Bread 800g',
        nameUrdu: 'ملکی بریڈ ڈبل روٹی',
        category: 'cat_breads',
        sku: 'BREAD-LRG',
        barcode: '896400040104',
        buyPrice: 130,
        sellPrice: 170,
        stockQuantity: 30,
        unit: 'Pack',
        reorderLevel: 8
      },
      {
        id: 'p_bak_5',
        name: 'Crispy Cake Rusk 500g',
        nameUrdu: 'کیک رسک 500 گرام',
        category: 'cat_breads',
        sku: 'RUSK-CAKE-500',
        barcode: '896400040105',
        buyPrice: 210,
        sellPrice: 320,
        stockQuantity: 25,
        unit: 'Pack',
        reorderLevel: 6
      }
    ]
  },

  spare_parts: {
    name: 'AutoTech Spare Parts & Hardware',
    tagline: 'Genuine Engine Parts, Oils & Workshop Hardware',
    categories: [
      { id: 'cat_oils', name: 'Engine Oil & Lubricants', nameUrdu: 'انجن آئل اور لبریکنٹس', icon: 'Droplet', color: 'text-amber-400' },
      { id: 'cat_filters', name: 'Filters & Spark Plugs', nameUrdu: 'فلٹر اور اسپارک پلگ', icon: 'Cog', color: 'text-blue-400' },
      { id: 'cat_brakes', name: 'Brake Pads & Suspension', nameUrdu: 'بریک پیڈ اور سسپنشن', icon: 'Shield', color: 'text-red-400' },
      { id: 'cat_tools', name: 'Hardware & Hand Tools', nameUrdu: 'ٹولز اور ہارڈویئر', icon: 'Wrench', color: 'text-slate-300' }
    ],
    products: [
      {
        id: 'p_sp_1',
        name: 'ZIC X7 20W-50 Synthetic Engine Oil 4L',
        nameUrdu: 'زک ایکس 7 انجن آئل 4 لیٹر',
        category: 'cat_oils',
        sku: 'ZIC-20W50-4L',
        barcode: '896400050101',
        buyPrice: 4200,
        sellPrice: 5100,
        stockQuantity: 12,
        unit: 'Can',
        reorderLevel: 3,
        description: 'Korean Synthetic Formulation for High Heat Endurance'
      },
      {
        id: 'p_sp_2',
        name: 'Toyota Corolla Genuine Oil Filter',
        nameUrdu: 'ٹویوٹا کرولا آئل فلٹر',
        category: 'cat_filters',
        sku: 'FILTER-OIL-COR',
        barcode: '896400050102',
        buyPrice: 650,
        sellPrice: 1050,
        stockQuantity: 30,
        unit: 'Pcs',
        reorderLevel: 8
      },
      {
        id: 'p_sp_3',
        name: 'NGK Iridium Spark Plug (Set of 4)',
        nameUrdu: 'این جی کے پلگ 4 عدد',
        category: 'cat_filters',
        sku: 'NGK-PLUG-4',
        barcode: '896400050103',
        buyPrice: 2800,
        sellPrice: 3900,
        stockQuantity: 10,
        unit: 'Set',
        reorderLevel: 3
      },
      {
        id: 'p_sp_4',
        name: 'Front Ceramic Brake Pads Set (Honda Civic)',
        nameUrdu: 'ہونڈا سیوک بریک پیڈ',
        category: 'cat_brakes',
        sku: 'PADS-CIVIC-FT',
        barcode: '896400050104',
        buyPrice: 3100,
        sellPrice: 4600,
        stockQuantity: 8,
        unit: 'Set',
        reorderLevel: 2
      },
      {
        id: 'p_sp_5',
        name: 'WD-40 Rust Remover Spray 400ml',
        nameUrdu: 'ڈبلیو ڈی 40 زنگ ہٹانے والا اسپرے',
        category: 'cat_tools',
        sku: 'WD40-400ML',
        barcode: '896400050105',
        buyPrice: 850,
        sellPrice: 1250,
        stockQuantity: 20,
        unit: 'Can',
        reorderLevel: 5
      }
    ]
  },

  jewellery: {
    name: 'Al-Zahra Gold & Diamond Jewellers',
    tagline: '22K Gold Bangles, Diamond Rings & Silver Ornaments',
    categories: [
      { id: 'cat_gold', name: '22K Gold Ornaments', nameUrdu: '22 کیرٹ سونا', icon: 'Gem', color: 'text-amber-300' },
      { id: 'cat_diamond', name: 'Diamond Rings & Sets', nameUrdu: 'ڈائمنڈ کی انگوٹھیاں', icon: 'Sparkles', color: 'text-cyan-300' },
      { id: 'cat_silver', name: '925 Sterling Silver', nameUrdu: 'چاندی کا سامان', icon: 'Circle', color: 'text-slate-300' },
      { id: 'cat_coins', name: 'Gold Bars & Coins', nameUrdu: 'سونے کے بسکٹ اور سکے', icon: 'Coins', color: 'text-yellow-400' }
    ],
    products: [
      {
        id: 'p_jew_1',
        name: '22K Gold Traditional Bangle (10 Grams)',
        nameUrdu: '22 کیرٹ سونے کی چُوڑی 10 گرام',
        category: 'cat_gold',
        sku: 'GOLD-BAN-10G',
        barcode: '896400060101',
        buyPrice: 235000,
        sellPrice: 252000,
        stockQuantity: 4,
        unit: 'Pcs',
        reorderLevel: 1,
        description: 'Certified 22 Karat Gold Hallmarked'
      },
      {
        id: 'p_jew_2',
        name: 'Solitaire Diamond Engagement Ring (0.50 Ct)',
        nameUrdu: 'ڈائمنڈ سولٹیئر انگوٹھی',
        category: 'cat_diamond',
        sku: 'RING-DIA-050',
        barcode: '896400060102',
        buyPrice: 180000,
        sellPrice: 215000,
        stockQuantity: 3,
        unit: 'Pcs',
        reorderLevel: 1
      },
      {
        id: 'p_jew_3',
        name: '925 Silver Italian Chain (25 Grams)',
        nameUrdu: 'چاندی کی ایٹالین چین',
        category: 'cat_silver',
        sku: 'SILVER-CHN-25G',
        barcode: '896400060103',
        buyPrice: 7500,
        sellPrice: 11500,
        stockQuantity: 12,
        unit: 'Pcs',
        reorderLevel: 3
      },
      {
        id: 'p_jew_4',
        name: 'ARY 1 Tola 24K Gold Coin',
        nameUrdu: 'اے آر وائی 1 تولہ سونا سکہ',
        category: 'cat_coins',
        sku: 'GOLD-COIN-1T',
        barcode: '896400060104',
        buyPrice: 270000,
        sellPrice: 278000,
        stockQuantity: 6,
        unit: 'Pcs',
        reorderLevel: 2
      }
    ]
  },

  electronics: {
    name: 'SmartTech Mobiles & Gadgets',
    tagline: 'Smartphones, Audio Accessories & Laptop Gadgets',
    categories: [
      { id: 'cat_mobiles', name: 'Smartphones & Tablets', nameUrdu: 'موبائل فونز', icon: 'Smartphone', color: 'text-blue-400' },
      { id: 'cat_audio', name: 'Wireless Earbuds & Audio', nameUrdu: 'ایئر بڈز اور اسپیکر', icon: 'Headphones', color: 'text-purple-400' },
      { id: 'cat_chargers', name: 'Fast Chargers & Cables', nameUrdu: 'چارجر اور ڈیٹا کیبل', icon: 'Zap', color: 'text-amber-400' },
      { id: 'cat_power', name: 'Powerbanks & Batteries', nameUrdu: 'پاور بینک اور بیٹری', icon: 'BatteryCharging', color: 'text-emerald-400' }
    ],
    products: [
      {
        id: 'p_ele_1',
        name: 'Realme Buds Air 5 Wireless TWS',
        nameUrdu: 'ریلمی وائرلیس ایئر بڈز',
        category: 'cat_audio',
        sku: 'REALME-BUDS-5',
        barcode: '896400070101',
        buyPrice: 6200,
        sellPrice: 8500,
        stockQuantity: 15,
        unit: 'Pcs',
        reorderLevel: 3,
        description: '50dB Active Noise Cancellation + Deep Bass'
      },
      {
        id: 'p_ele_2',
        name: 'Anker 20W PD Type-C Fast Charger',
        nameUrdu: 'اینکر 20 واٹ فاسٹ چارجر',
        category: 'cat_chargers',
        sku: 'ANKER-20W-PD',
        barcode: '896400070102',
        buyPrice: 2100,
        sellPrice: 3200,
        stockQuantity: 25,
        unit: 'Pcs',
        reorderLevel: 5
      },
      {
        id: 'p_ele_3',
        name: 'Redmi 20000mAh Powerbank Dual USB',
        nameUrdu: 'ریڈمی 20000 ایم اے ایچ پاور بینک',
        category: 'cat_power',
        sku: 'PBANK-REDMI-20K',
        barcode: '896400070103',
        buyPrice: 4100,
        sellPrice: 5800,
        stockQuantity: 10,
        unit: 'Pcs',
        reorderLevel: 2
      },
      {
        id: 'p_ele_4',
        name: 'Braided Nylon Type-C Data Cable 1m',
        nameUrdu: 'ٹائپ سی ڈیٹا کیبل 1 میٹر',
        category: 'cat_chargers',
        sku: 'CABLE-C-1M',
        barcode: '896400010107',
        buyPrice: 220,
        sellPrice: 450,
        stockQuantity: 50,
        unit: 'Pcs',
        reorderLevel: 10
      }
    ]
  },

  cosmetics: {
    name: 'Glamour Beauty & Cosmetics',
    tagline: 'Makeup, Skincare, Perfumes & Hair Accessories',
    categories: [
      { id: 'cat_makeup', name: 'Face Makeup & Lipstick', nameUrdu: 'میک اپ اور لپ اسٹک', icon: 'Heart', color: 'text-pink-400' },
      { id: 'cat_skincare', name: 'Skincare & Lotions', nameUrdu: 'اسکن کیئر اور لوشن', icon: 'Smile', color: 'text-cyan-400' },
      { id: 'cat_fragrance', name: 'Perfumes & Deodorants', nameUrdu: 'خوشبو اور پرفیوم', icon: 'Sparkles', color: 'text-purple-400' },
      { id: 'cat_haircare', name: 'Shampoo & Hair Care', nameUrdu: 'شیمپو اور بالوں کی دیکھ بھال', icon: 'Zap', color: 'text-emerald-400' }
    ],
    products: [
      {
        id: 'p_cos_1',
        name: 'Maybelline Matte Velvet Lipstick (Ruby Red)',
        nameUrdu: 'میبلین میٹ لپ اسٹک',
        category: 'cat_makeup',
        sku: 'MAYB-LIP-RED',
        barcode: '896400080101',
        buyPrice: 1400,
        sellPrice: 2200,
        stockQuantity: 20,
        unit: 'Pcs',
        reorderLevel: 4,
        description: 'Long Lasting 16-Hour Hydrating Matte Finish'
      },
      {
        id: 'p_cos_2',
        name: 'Ponds Bright Beauty Face Wash 100g',
        nameUrdu: 'پانڈز فیس واش 100 گرام',
        category: 'cat_skincare',
        sku: 'PONDS-FW-100G',
        barcode: '896400080102',
        buyPrice: 380,
        sellPrice: 490,
        stockQuantity: 30,
        unit: 'Pcs',
        reorderLevel: 6
      },
      {
        id: 'p_cos_3',
        name: 'J. Janan Eau De Parfum 100ml',
        nameUrdu: 'جے ڈاٹ جاناں پرفیوم 100 ملی',
        category: 'cat_fragrance',
        sku: 'JDOT-JANAN-100',
        barcode: '896400080103',
        buyPrice: 3500,
        sellPrice: 4800,
        stockQuantity: 8,
        unit: 'Pcs',
        reorderLevel: 2
      },
      {
        id: 'p_cos_4',
        name: 'Loreal Total Repair Shampoo 360ml',
        nameUrdu: 'لوریل شیمپو 360 ملی',
        category: 'cat_haircare',
        sku: 'LOREAL-SHMP-360',
        barcode: '896400080104',
        buyPrice: 750,
        sellPrice: 980,
        stockQuantity: 18,
        unit: 'Pcs',
        reorderLevel: 4
      }
    ]
  },

  beverages: {
    name: 'Gourmet Cold Corner & Beverage Mart',
    tagline: 'Chilled Soft Drinks, Juices, Energy Drinks & Mineral Water',
    categories: [
      { id: 'cat_bev_soda', name: 'Soft Drinks & Carbonated', nameUrdu: 'کولڈ ڈرنکس اور سوڈا', icon: 'CupSoda', color: 'text-cyan-400' },
      { id: 'cat_bev_juices', name: 'Fresh Juices & Nectars', nameUrdu: 'تازہ جوس اور فروٹ جوس', icon: 'Wine', color: 'text-amber-400' },
      { id: 'cat_bev_energy', name: 'Energy & Sports Drinks', nameUrdu: 'انرجی ڈرنکس', icon: 'Zap', color: 'text-red-400' },
      { id: 'cat_bev_water', name: 'Mineral Water & Soda Water', nameUrdu: 'منرل واٹر اور سادھا پانی', icon: 'Droplet', color: 'text-blue-300' }
    ],
    products: [
      {
        id: 'p_bev_1',
        name: 'Pepsi Cold Bottle 1.5L',
        nameUrdu: 'پیپسی 1.5 لیٹر ڈرنک',
        category: 'cat_bev_soda',
        sku: 'PEPSI-1.5L-BOT',
        barcode: '896400090101',
        buyPrice: 155,
        sellPrice: 180,
        stockQuantity: 40,
        unit: 'Bottle',
        reorderLevel: 10,
        description: 'Chilled Carbonated Cola Drink'
      },
      {
        id: 'p_bev_2',
        name: 'Nestle Fruita Vitals Mango Juice 1L',
        nameUrdu: 'نسلے فروٹا وائٹلز آم کا جوس 1 لیٹر',
        category: 'cat_bev_juices',
        sku: 'JUICE-MANGO-1L',
        barcode: '896400090102',
        buyPrice: 310,
        sellPrice: 360,
        stockQuantity: 24,
        unit: 'Pack',
        reorderLevel: 6
      },
      {
        id: 'p_bev_3',
        name: 'Red Bull Energy Drink 250ml Can',
        nameUrdu: 'ریڈ بل انرجی ڈرنک 250 ملی',
        category: 'cat_bev_energy',
        sku: 'REDBULL-250ML',
        barcode: '896400090103',
        buyPrice: 480,
        sellPrice: 580,
        stockQuantity: 30,
        unit: 'Can',
        reorderLevel: 8
      },
      {
        id: 'p_bev_4',
        name: 'Nestle Pure Life Mineral Water 1.5L',
        nameUrdu: 'نسلے پیور لائف منرل واٹر 1.5 لیٹر',
        category: 'cat_bev_water',
        sku: 'WATER-1.5L',
        barcode: '896400090104',
        buyPrice: 75,
        sellPrice: 95,
        stockQuantity: 80,
        unit: 'Bottle',
        reorderLevel: 20
      },
      {
        id: 'p_bev_5',
        name: 'Sting Berry Blast Energy Drink 500ml',
        nameUrdu: 'اسٹنگ بیری انرجی ڈرنک 500 ملی',
        category: 'cat_bev_energy',
        sku: 'STING-500ML',
        barcode: '896400090105',
        buyPrice: 85,
        sellPrice: 100,
        stockQuantity: 50,
        unit: 'Bottle',
        reorderLevel: 12
      }
    ]
  },

  mobiles_accessories: {
    name: 'Mobile World & Accessories Studio',
    tagline: 'Smartphones, Covers, Airpods, Chargers & Glass Protectors',
    categories: [
      { id: 'cat_mob_phones', name: 'Smartphones & Tablets', nameUrdu: 'موبائل فونز', icon: 'Smartphone', color: 'text-blue-400' },
      { id: 'cat_mob_covers', name: 'Covers & Glass Protectors', nameUrdu: 'کورز اور گلاس پروٹیکٹر', icon: 'Shield', color: 'text-purple-400' },
      { id: 'cat_mob_audio', name: 'Wireless Airpods & Speakers', nameUrdu: 'ایئر پوڈز اور وائرلیس اسپیکر', icon: 'Headphones', color: 'text-emerald-400' },
      { id: 'cat_mob_chargers', name: 'Fast Chargers & Power Banks', nameUrdu: 'فاسٹ چارجرز اور پاور بینک', icon: 'Zap', color: 'text-amber-400' }
    ],
    products: [
      {
        id: 'p_macc_1',
        name: 'Infinix Hot 40 Pro (8GB / 256GB)',
        nameUrdu: 'انفنکس ہاٹ 40 پرو',
        category: 'cat_mob_phones',
        sku: 'INF-HOT40-PRO',
        barcode: '896400100101',
        buyPrice: 42000,
        sellPrice: 45990,
        stockQuantity: 6,
        unit: 'Pcs',
        reorderLevel: 2,
        description: '108MP Camera, 120Hz Display, 33W Fast Charging'
      },
      {
        id: 'p_macc_2',
        name: 'iPhone 15 Pro Max Silicone Magnetic Case',
        nameUrdu: 'آئی فون 15 پرو میکس میگنیٹک کور',
        category: 'cat_mob_covers',
        sku: 'CASE-IP15PM-SIL',
        barcode: '896400100102',
        buyPrice: 650,
        sellPrice: 1450,
        stockQuantity: 25,
        unit: 'Pcs',
        reorderLevel: 5
      },
      {
        id: 'p_macc_3',
        name: 'Audionic Airbud 550 ANC Earbuds',
        nameUrdu: 'آڈیونک ایئر بڈز 550',
        category: 'cat_mob_audio',
        sku: 'AUD-BUD-550',
        barcode: '896400100103',
        buyPrice: 3800,
        sellPrice: 5200,
        stockQuantity: 12,
        unit: 'Pcs',
        reorderLevel: 3
      },
      {
        id: 'p_macc_4',
        name: 'Ronin 65W GaN Super Fast Charger',
        nameUrdu: 'رونن 65 واٹ چارجر',
        category: 'cat_mob_chargers',
        sku: 'RONIN-65W-GAN',
        barcode: '896400100104',
        buyPrice: 2800,
        sellPrice: 4200,
        stockQuantity: 15,
        unit: 'Pcs',
        reorderLevel: 4
      },
      {
        id: 'p_macc_5',
        name: '9D Full Curved Tempered Glass Protector',
        nameUrdu: '9 ڈی فل ٹیمپرڈ گلاس پروٹیکٹر',
        category: 'cat_mob_covers',
        sku: 'GLASS-9D-UNIV',
        barcode: '896400100105',
        buyPrice: 80,
        sellPrice: 350,
        stockQuantity: 100,
        unit: 'Pcs',
        reorderLevel: 20
      }
    ]
  },

  computers_laptops: {
    name: 'Computer City Laptops & Tech Center',
    tagline: 'Branded Laptops, Desktop PCs, SSDs, Monitors & Gaming Accessories',
    categories: [
      { id: 'cat_comp_laptops', name: 'Laptops & Desktop PCs', nameUrdu: 'لیپ ٹاپ اور کمپیوٹرز', icon: 'Laptop', color: 'text-cyan-400' },
      { id: 'cat_comp_storage', name: 'SSDs, RAM & Storage', nameUrdu: 'ایس ایس ڈی، ریم اور سٹوریج', icon: 'HardDrive', color: 'text-amber-400' },
      { id: 'cat_comp_periph', name: 'Keyboard, Mouse & Headphones', nameUrdu: 'کی بورڈ، ماؤس اور ماؤس پیڈ', icon: 'Mouse', color: 'text-purple-400' },
      { id: 'cat_comp_displays', name: 'Monitors & Display Cables', nameUrdu: 'مانیٹر اور ایچ ڈی ایم آئی کیبل', icon: 'Monitor', color: 'text-emerald-400' }
    ],
    products: [
      {
        id: 'p_comp_1',
        name: 'Dell Latitude 5400 Core i5 8th Gen (8GB/256GB SSD)',
        nameUrdu: 'ڈیل لیپ ٹاپ کور آئی 5',
        category: 'cat_comp_laptops',
        sku: 'DELL-LAT-5400',
        barcode: '896400110101',
        buyPrice: 58000,
        sellPrice: 68500,
        stockQuantity: 5,
        unit: 'Pcs',
        reorderLevel: 2,
        description: '14" FHD Anti-Glare Display, Backlit Keyboard, Grade A Import'
      },
      {
        id: 'p_comp_2',
        name: 'Samsung 870 EVO 512GB SATA SSD',
        nameUrdu: 'سام سنگ 512 جی بی ایس ایس ڈی',
        category: 'cat_comp_storage',
        sku: 'SSD-SAMSUNG-512',
        barcode: '896400110102',
        buyPrice: 8500,
        sellPrice: 11200,
        stockQuantity: 14,
        unit: 'Pcs',
        reorderLevel: 4
      },
      {
        id: 'p_comp_3',
        name: 'Logitech MK270 Wireless Keyboard & Mouse Combo',
        nameUrdu: 'لوگی ٹیک وائرلیس کی بورڈ ماؤس',
        category: 'cat_comp_periph',
        sku: 'LOGI-MK270-COM',
        barcode: '896400110103',
        buyPrice: 4200,
        sellPrice: 5800,
        stockQuantity: 10,
        unit: 'Set',
        reorderLevel: 3
      },
      {
        id: 'p_comp_4',
        name: 'EASE 24" IPS 100Hz Frameless LED Monitor',
        nameUrdu: 'ایز 24 انچ مانیٹر',
        category: 'cat_comp_displays',
        sku: 'MON-EASE-24IPS',
        barcode: '896400110104',
        buyPrice: 22500,
        sellPrice: 27500,
        stockQuantity: 4,
        unit: 'Pcs',
        reorderLevel: 1
      },
      {
        id: 'p_comp_5',
        name: 'A4Tech RGB Gaming Headset 7.1 Surround',
        nameUrdu: 'اے فور ٹیک گیمنگ ہیڈ سیٹ',
        category: 'cat_comp_periph',
        sku: 'A4T-HEADSET-71',
        barcode: '896400110105',
        buyPrice: 2900,
        sellPrice: 4100,
        stockQuantity: 8,
        unit: 'Pcs',
        reorderLevel: 2
      }
    ]
  }
};
