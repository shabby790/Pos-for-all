import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { t } from '../../utils/i18n';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Calendar,
  PieChart as PieChartIcon,
  Award,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Eye,
  X,
  Download,
  FileText,
  Trash2,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { ReceiptModal } from '../POS/ReceiptModal';
import { Sale } from '../../types';

export const AnalyticsDashboard: React.FC = () => {
  const { language, sales, products, categories, customers, settings, voidSale } = usePOS();

  const [dateFilter, setDateFilter] = useState<'today' | '7days' | 'month' | 'all'>('7days');
  const [aiInsightText, setAiInsightText] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReceiptSale, setSelectedReceiptSale] = useState<Sale | null>(null);
  const [saleToVoid, setSaleToVoid] = useState<Sale | null>(null);
  const [voidNotification, setVoidNotification] = useState<string | null>(null);

  // Filter Sales Data based on selected date filter
  const now = Date.now();
  const filteredSales = sales.filter(s => {
    const saleTime = new Date(s.createdAt).getTime();
    if (dateFilter === 'today') {
      const startOfToday = new Date().setHours(0, 0, 0, 0);
      return saleTime >= startOfToday;
    } else if (dateFilter === '7days') {
      return now - saleTime <= 7 * 24 * 60 * 60 * 1000;
    } else if (dateFilter === 'month') {
      return now - saleTime <= 30 * 24 * 60 * 60 * 1000;
    }
    return true;
  });

  // Sort sales newest first so recent orders always show at top
  const sortedFilteredSales = [...filteredSales].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Calculate Metrics
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalOrders = filteredSales.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Est Profit calculation
  let totalCost = 0;
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      totalCost += item.product.buyPrice * item.quantity;
    });
  });
  const estProfit = Math.max(0, totalRevenue - totalCost);
  const profitMarginPct = totalRevenue > 0 ? Math.round((estProfit / totalRevenue) * 100) : 0;

  // CSV Export function
  const exportCSVReport = () => {
    if (filteredSales.length === 0) {
      alert('No sales data available to export.');
      return;
    }

    const headers = [
      'Order No',
      'Date & Time',
      'Items Count',
      'Subtotal',
      'Discount',
      'Tax',
      'Grand Total',
      'Payment Method',
      'Cashier'
    ];

    const rows = filteredSales.map(s => [
      `"${s.orderNumber}"`,
      `"${new Date(s.createdAt).toLocaleString()}"`,
      s.items.reduce((acc, i) => acc + i.quantity, 0),
      s.subtotal,
      s.discountAmount,
      s.taxAmount,
      s.grandTotal,
      `"${s.paymentMethod.toUpperCase()}"`,
      `"${s.cashierName || 'Cashier'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sales_Report_${dateFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable PDF / Web Print function
  const printPDFReport = () => {
    window.print();
  };

  // Chart 1: Revenue Trend (grouped by day)
  const salesByDate: Record<string, { date: string; revenue: number; profit: number }> = {};
  filteredSales.forEach(s => {
    const dayKey = new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!salesByDate[dayKey]) {
      salesByDate[dayKey] = { date: dayKey, revenue: 0, profit: 0 };
    }
    salesByDate[dayKey].revenue += s.grandTotal;
    
    let cost = 0;
    s.items.forEach(i => { cost += i.product.buyPrice * i.quantity; });
    salesByDate[dayKey].profit += Math.max(0, s.grandTotal - cost);
  });
  const revenueTrendData = Object.values(salesByDate);

  // Chart 2: Category Breakdown
  const categoryTotals: Record<string, number> = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      const catObj = categories.find(c => c.id === item.product.category);
      const catName = catObj?.name || 'General';
      const itemTot = item.product.sellPrice * item.quantity;
      categoryTotals[catName] = (categoryTotals[catName] || 0) + itemTot;
    });
  });
  const categoryPieData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  // Chart 3: Top 5 Best Sellers
  const productQuantities: Record<string, { name: string; qty: number }> = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      if (!productQuantities[item.product.id]) {
        productQuantities[item.product.id] = { name: item.product.name, qty: 0 };
      }
      productQuantities[item.product.id].qty += item.quantity;
    });
  });
  const topProductsData = Object.values(productQuantities)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Gemini AI Insights Trigger
  const handleFetchAiInsights = async () => {
    setIsAiLoading(true);
    setAiError(null);

    const lowStockItems = products
      .filter(p => p.stockQuantity <= p.reorderLevel)
      .map(p => ({ name: p.name, currentStock: p.stockQuantity }));

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salesData: {
            totalRevenue,
            totalOrders,
            estProfit,
            avgOrderValue,
            topProducts: topProductsData
          },
          inventoryData: lowStockItems,
          language: language === 'ur' ? 'Urdu' : 'Roman Urdu / English'
        })
      });

      const data = await res.json();
      if (data.success && data.insight) {
        setAiInsightText(data.insight);
      } else {
        setAiError(data.error || 'Could not fetch AI insights.');
      }
    } catch (e: any) {
      setAiError('Network error connecting to Gemini AI insights service.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Void Notification Toast Banner */}
      {voidNotification && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 p-3.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{voidNotification}</span>
          </div>
          <button onClick={() => setVoidNotification(null)} className="text-emerald-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header & Date Filters & Export Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <BarChart3 className="w-6 h-6" /> {t('analytics', language)}
          </h2>
          <p className="text-xs text-slate-400">Real-time revenue performance, margins, category trends & AI forecasts</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter Buttons */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            {(['today', '7days', 'month', 'all'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  dateFilter === f ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === '7days' ? 'Last 7 Days' : f === 'month' ? 'This Month' : f}
              </button>
            ))}
          </div>

          {/* Report Export Buttons */}
          <button
            onClick={exportCSVReport}
            className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            title="Download sales report in Excel/CSV format"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>CSV Export</span>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
            title="View & print PDF report"
          >
            <Eye className="w-4 h-4 text-sky-400" />
            <span>View / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('total_sales', language)}</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {settings.currencySymbol} {totalRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-300 font-semibold mt-1 block">From {totalOrders} total sales orders</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('net_profit', language)}</p>
          <p className="text-2xl font-black text-teal-400 mt-1">
            {settings.currencySymbol} {estProfit.toLocaleString()}
          </p>
          <span className="text-[10px] text-teal-300 font-semibold mt-1 block">Est. Profit Margin ~{profitMarginPct}%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Ticket Size</p>
          <p className="text-2xl font-black text-blue-400 mt-1">
            {settings.currencySymbol} {avgOrderValue.toLocaleString()}
          </p>
          <span className="text-[10px] text-blue-300 font-semibold mt-1 block">Revenue per checkout order</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">{t('udhaar_balance', language)}</p>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {settings.currencySymbol} {customers.reduce((a, b) => a + b.outstandingBalance, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-amber-300 font-semibold mt-1 block">Total customer receivables</span>
        </div>

      </div>

      {/* AI Business Assistant Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              Gemini AI Smart Sales Forecast & Business Copilot
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generates intelligent financial advice, reordering priorities, and promotional bundle suggestions based on live sales data.
            </p>
          </div>

          <button
            onClick={handleFetchAiInsights}
            disabled={isAiLoading}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0 transition-all"
          >
            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isAiLoading ? 'Analyzing Business...' : 'Generate AI Insights'}</span>
          </button>
        </div>

        {aiError && (
          <div className="mt-3 p-3 bg-red-950/80 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{aiError}</span>
          </div>
        )}

        {aiInsightText && (
          <div className="mt-4 p-4 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            <p className="font-bold text-emerald-400 mb-2 border-b border-slate-800 pb-1">AI Executive Report:</p>
            {aiInsightText}
          </div>
        )}
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Revenue & Profit Trend */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="font-bold text-sm text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Revenue & Profit Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="profit" stroke="#14b8a6" fillOpacity={1} fill="url(#colorProf)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Pie Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="font-bold text-sm text-slate-100 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-emerald-400" /> Sales by Category
          </h3>
          <div className="h-64 w-full">
            {categoryPieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No category sales recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Top Products Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <h3 className="font-bold text-sm text-slate-100 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Top Selling Items
        </h3>
        <div className="h-56 w-full">
          {topProductsData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No sales data recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="qty" fill="#10b981" radius={[8, 8, 0, 0]} name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Main Recent Orders & Sales History (Hisab Kitab) */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" /> Recent Sales Transactions (حالیہ آرڈرز اور سیلز کا حساب کتاب)
            </h3>
            <p className="text-xs text-slate-400">View recent orders, print receipts, or void/cancel incorrect sales</p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Full Report & Export
          </button>
        </div>

        <div className="border border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="p-3">Order #</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Items Purchased</th>
                <th className="p-3">Payment</th>
                <th className="p-3 text-right">Total Bill</th>
                <th className="p-3 text-center">Action / Ghalat Order Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedFilteredSales.map(s => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-3 font-mono font-bold text-emerald-400">{s.orderNumber}</td>
                  <td className="p-3 text-slate-300">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-slate-300">
                    <span className="font-bold text-slate-200">{s.items.reduce((acc, i) => acc + i.quantity, 0)} Pcs</span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">
                      {s.items.map(i => i.product.name).join(', ')}
                    </span>
                  </td>
                  <td className="p-3 uppercase font-bold text-slate-300">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      s.paymentMethod === 'cash' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      s.paymentMethod === 'credit_udhaar' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      s.paymentMethod === 'wallet' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                      'bg-blue-950 text-blue-300 border border-blue-800'
                    }`}>
                      {s.paymentMethod}
                    </span>
                    {s.paymentMethod === 'card' && s.cardDetails && (
                      <span className="block text-[10px] text-blue-400 font-medium mt-0.5 normal-case font-mono">
                        {s.cardDetails.cardType} ****{s.cardDetails.last4Digits} {s.cardDetails.authCodeRef ? `(${s.cardDetails.authCodeRef})` : ''}
                      </span>
                    )}
                    {s.paymentMethod === 'wallet' && s.walletDetails && (
                      <span className="block text-[10px] text-purple-400 font-medium mt-0.5 normal-case font-mono">
                        {s.walletDetails.provider} {s.walletDetails.txnId ? `(${s.walletDetails.txnId})` : ''}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right font-black text-slate-100 text-sm">
                    {settings.currencySymbol} {s.grandTotal.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedReceiptSale(s)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-700 flex items-center gap-1 transition-all"
                        title="View Receipt"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" /> Bill
                      </button>
                      <button
                        onClick={() => setSaleToVoid(s)}
                        className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                        title="Ghalat order delete / void karen"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" /> Void / Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {sortedFilteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    Koi transaction recorded nahi hay. (No sales found for this filter)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-slate-100">Sales & Revenue Report ({dateFilter.toUpperCase()})</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportCSVReport}
                  className="px-3 py-1.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold text-xs rounded-lg flex items-center gap-1 hover:bg-emerald-900 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                </button>
                <button
                  onClick={printPDFReport}
                  className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1 hover:bg-emerald-400 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content / Printable Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-100 bg-slate-900" id="printable-report">
              <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black text-emerald-400">{settings.storeName}</h1>
                  <p className="text-xs text-slate-400">{settings.address} | {settings.phone}</p>
                  <p className="text-xs text-slate-300 font-semibold mt-1">
                    Report Period: <span className="text-emerald-400 capitalize">{dateFilter}</span> ({filteredSales.length} Total Sales)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Generated On:</span>
                  <p className="text-xs font-mono font-bold text-slate-200">{new Date().toLocaleString()}</p>
                </div>
              </div>

              {/* Summary Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Total Sales</p>
                  <p className="text-lg font-black text-emerald-400">{settings.currencySymbol} {totalRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Est Profit</p>
                  <p className="text-lg font-black text-teal-400">{settings.currencySymbol} {estProfit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Total Orders</p>
                  <p className="text-lg font-black text-blue-400">{totalOrders}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-slate-400 font-bold">Avg Order</p>
                  <p className="text-lg font-black text-purple-400">{settings.currencySymbol} {avgOrderValue.toLocaleString()}</p>
                </div>
              </div>

              {/* Sales Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detailed Sales Transactions</h4>
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                      <tr>
                        <th className="p-3">Order #</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sortedFilteredSales.map(s => (
                        <tr key={s.id} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-emerald-400">{s.orderNumber}</td>
                          <td className="p-3 text-slate-300">{new Date(s.createdAt).toLocaleString()}</td>
                          <td className="p-3 text-slate-300">{s.items.reduce((acc, i) => acc + i.quantity, 0)} Pcs</td>
                          <td className="p-3 uppercase text-slate-300 font-semibold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              s.paymentMethod === 'cash' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              s.paymentMethod === 'credit_udhaar' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              s.paymentMethod === 'wallet' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                              'bg-blue-950 text-blue-300 border border-blue-800'
                            }`}>
                              {s.paymentMethod}
                            </span>
                            {s.paymentMethod === 'card' && s.cardDetails && (
                              <span className="block text-[9px] text-blue-400 font-normal mt-0.5 normal-case font-mono">
                                {s.cardDetails.cardType} ****{s.cardDetails.last4Digits}
                              </span>
                            )}
                            {s.paymentMethod === 'wallet' && s.walletDetails && (
                              <span className="block text-[9px] text-purple-400 font-normal mt-0.5 normal-case font-mono">
                                {s.walletDetails.provider} {s.walletDetails.txnId ? `(${s.walletDetails.txnId})` : ''}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-black text-slate-100">
                            {settings.currencySymbol} {s.grandTotal.toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSaleToVoid(s)}
                              className="px-2.5 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-[10px] rounded-lg flex items-center gap-1 mx-auto transition-all cursor-pointer"
                              title="Cancel / Void Sale (Restore Stock)"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" /> Void / Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                      {sortedFilteredSales.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-500">No transactions recorded for this period.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Receipt Modal for viewing/re-printing past sale */}
      {selectedReceiptSale && (
        <ReceiptModal sale={selectedReceiptSale} onClose={() => setSelectedReceiptSale(null)} />
      )}

      {/* Void Confirmation Modal (In-App Modal to replace blocked browser confirm alert) */}
      {saleToVoid && (
        <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-red-950/80 border border-red-500/40 rounded-xl text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-red-400">Ghalat Order Void / Cancel Karen?</h3>
                <p className="text-xs text-slate-400">Order #{saleToVoid.orderNumber}</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Kul Total Bill:</span>
                <span className="font-bold text-emerald-400">{settings.currencySymbol} {saleToVoid.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Items Quantity:</span>
                <span className="font-bold">{saleToVoid.items.reduce((a, b) => a + b.quantity, 0)} Pcs</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payment Method:</span>
                <span className="font-bold uppercase text-slate-200">{saleToVoid.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tareekh (Date):</span>
                <span>{new Date(saleToVoid.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-amber-950/30 border border-amber-500/30 p-3 rounded-xl">
              ⚠️ <strong>Dhyan den:</strong> Is order ko cancel karne se is ke sary products ka stock wapas inventory main shamil ho jaye ga aur yeh sale delete ho jaye gi.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSaleToVoid(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Nahi, Wapas Jayein
              </button>

              <button
                type="button"
                onClick={() => {
                  const res = voidSale(saleToVoid.id);
                  setVoidNotification(res.message);
                  setSaleToVoid(null);
                  setTimeout(() => setVoidNotification(null), 6000);
                }}
                className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Haan, Void Karen</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
