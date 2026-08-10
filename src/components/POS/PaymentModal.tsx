import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { t } from '../../utils/i18n';
import {
  Banknote,
  CreditCard,
  Smartphone,
  BookOpen,
  User,
  CheckCircle,
  X,
  AlertCircle,
  ArrowLeft,
  Wifi,
  Terminal,
  ShieldCheck,
  Zap,
  QrCode,
  Landmark
} from 'lucide-react';
import { Customer, PaymentMethod, Sale } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  onSuccess: (sale: Sale) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, grandTotal, onSuccess }) => {
  const {
    language,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    processCheckout,
    settings
  } = usePOS();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [tenderedText, setTenderedText] = useState<string>(grandTotal.toString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Card details state
  const [cardType, setCardType] = useState<string>('Visa');
  const [last4Digits, setLast4Digits] = useState<string>('4321');
  const [authCodeRef, setAuthCodeRef] = useState<string>('');
  const [terminalId, setTerminalId] = useState<string>('HBL POS Machine #1');

  // Wallet details state
  const [walletProvider, setWalletProvider] = useState<string>('EasyPaisa');
  const [accountPhone, setAccountPhone] = useState<string>('');
  const [txnId, setTxnId] = useState<string>('');

  useEffect(() => {
    setTenderedText(grandTotal.toString());
    setErrorMsg(null);

    const enabled = settings.enabledPaymentMethods || { cash: true, card: true, online: true, wallet: true, credit_udhaar: true };
    const isCurrentActive = 
      (paymentMethod === 'cash' && enabled.cash !== false) ||
      (paymentMethod === 'card' && enabled.card !== false) ||
      (paymentMethod === 'online' && enabled.online !== false) ||
      (paymentMethod === 'wallet' && enabled.wallet !== false) ||
      (paymentMethod === 'credit_udhaar' && enabled.credit_udhaar !== false);

    if (!isCurrentActive) {
      if (enabled.cash !== false) setPaymentMethod('cash');
      else if (enabled.card !== false) setPaymentMethod('card');
      else if (enabled.online !== false) setPaymentMethod('online');
      else if (enabled.wallet !== false) setPaymentMethod('wallet');
      else if (enabled.credit_udhaar !== false) setPaymentMethod('credit_udhaar');
    }
  }, [grandTotal, isOpen, settings.enabledPaymentMethods]);

  if (!isOpen) return null;

  const numTendered = parseFloat(tenderedText) || 0;
  const changeReturn = paymentMethod === 'cash' ? Math.max(0, numTendered - grandTotal) : 0;

  // Auto-fill test Card transaction details
  const handleSimulateCardTap = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const randomAuth = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    setLast4Digits(randomDigits);
    setAuthCodeRef(randomAuth);
    setErrorMsg(null);
  };

  // Auto-fill test Wallet transaction details
  const handleSimulateWalletTxn = () => {
    const randomTxn = `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTxnId(randomTxn);
    setErrorMsg(null);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (paymentMethod === 'cash') {
      if (isNaN(numTendered) || numTendered < grandTotal) {
        setErrorMsg(`Vasooli amount (${settings.currencySymbol}${isNaN(numTendered) ? 0 : numTendered}) is less than total bill (${settings.currencySymbol}${grandTotal}).`);
        return;
      }
    }

    const finalTendered = paymentMethod === 'cash' ? numTendered : grandTotal;

    const paymentMetaData = {
      cardDetails: (paymentMethod === 'card' || paymentMethod === 'online') ? {
        cardType: paymentMethod === 'online' ? (cardType || 'Bank Transfer') : cardType,
        last4Digits: last4Digits || '4321',
        authCodeRef: authCodeRef || `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
        terminalId: terminalId || (paymentMethod === 'online' ? 'Online Bank / Raast' : 'POS Machine #1')
      } : undefined,
      walletDetails: paymentMethod === 'wallet' ? {
        provider: walletProvider,
        accountPhone: accountPhone || '0300-0000000',
        txnId: txnId || `TRX-${Math.floor(10000000 + Math.random() * 90000000)}`
      } : undefined
    };

    const result = processCheckout(paymentMethod, finalTendered, paymentMetaData);
    if (result.success && result.sale) {
      onSuccess(result.sale);
      onClose();
    } else {
      setErrorMsg(result.error || 'Payment processing failed.');
    }
  };

  // Generate smart quick cash suggestions
  const getQuickCashSuggestions = (total: number) => {
    const list = new Set<number>();
    list.add(total);
    if (total % 50 !== 0) list.add(Math.ceil(total / 50) * 50);
    if (total % 100 !== 0) list.add(Math.ceil(total / 100) * 100);
    if (total % 500 !== 0) list.add(Math.ceil(total / 500) * 500);
    [500, 1000, 2000, 5000].forEach(v => {
      if (v >= total) list.add(v);
    });
    return Array.from(list).sort((a, b) => a - b);
  };

  const quickCashOptions = getQuickCashSuggestions(grandTotal);

  const addQuickIncrement = (addVal: number) => {
    const current = parseFloat(tenderedText) || grandTotal;
    setTenderedText((current + addVal).toString());
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl text-white my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{t('checkout', language)}</h3>
            <p className="text-xs text-slate-400">Select payment method & tender amount</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Wapas (واپسی)</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Total Payable Box */}
        <div className="bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/30 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-300 font-medium uppercase tracking-wider">{t('grand_total', language)}</p>
            <p className="text-2xl font-black text-emerald-400">
              {settings.currencySymbol} {grandTotal.toLocaleString()}
            </p>
          </div>
          {selectedCustomer ? (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block">{t('customer_name', language)}</span>
              <span className="text-xs font-bold text-slate-200 block truncate max-w-[140px]">{selectedCustomer.name}</span>
              {selectedCustomer.outstandingBalance > 0 && (
                <span className="text-[10px] text-amber-400 font-medium block">
                  Udhaar: {settings.currencySymbol}{selectedCustomer.outstandingBalance}
                </span>
              )}
            </div>
          ) : (
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Walk-in Customer</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
          
          {/* Payment Method Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Payment Wasooli Option:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              
              {(settings.enabledPaymentMethods?.cash !== false) && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-4 h-4 shrink-0" />
                  <span>{t('pay_cash', language)}</span>
                </button>
              )}

              {(settings.enabledPaymentMethods?.card !== false) && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>ATM / Card Swipe</span>
                </button>
              )}

              {(settings.enabledPaymentMethods?.online !== false) && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    paymentMethod === 'online'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Landmark className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>Online / Bank</span>
                </button>
              )}

              {(settings.enabledPaymentMethods?.wallet !== false) && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    paymentMethod === 'wallet'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>Mobile Wallet</span>
                </button>
              )}

              {(settings.enabledPaymentMethods?.credit_udhaar !== false) && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_udhaar')}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                    paymentMethod === 'credit_udhaar'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{t('pay_udhaar', language)}</span>
                </button>
              )}

            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3.5">
              
              {/* Custom Wasooli Payment Input Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-emerald-400">
                    Vasooli / Payment Received (وصولی):
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Client ne kitne paise diye
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-400">
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={tenderedText}
                    onChange={e => {
                      setTenderedText(e.target.value);
                      setErrorMsg(null);
                    }}
                    onFocus={e => e.target.select()}
                    onClick={e => (e.target as HTMLInputElement).select()}
                    placeholder={`e.g. ${grandTotal}, 800, 1000...`}
                    className="w-full bg-slate-950 border-2 border-emerald-500/50 rounded-xl pl-10 pr-3 py-2.5 text-2xl font-black text-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>

              {/* Quick Cash Suggestions */}
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block mb-1.5">{t('quick_cash', language)} / Quick Notes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickCashOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTenderedText(opt.toString());
                        setErrorMsg(null);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        numTendered === opt
                          ? 'bg-emerald-500 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      }`}
                    >
                      {opt === grandTotal ? `Exact (${settings.currencySymbol}${opt})` : `${settings.currencySymbol} ${opt.toLocaleString()}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Add Buttons (+50, +100, +500, +1000) */}
              <div>
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">Add Extra Cash:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[50, 100, 500, 1000].map(addVal => (
                    <button
                      key={addVal}
                      type="button"
                      onClick={() => addQuickIncrement(addVal)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800 rounded-md text-[11px] font-bold text-emerald-400 transition-colors"
                    >
                      +{addVal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status or Change Return */}
              <div className="pt-2 border-t border-slate-700/80">
                {numTendered < grandTotal ? (
                  <div className="flex items-center justify-between text-amber-400 text-xs font-semibold bg-amber-950/40 p-2 rounded-lg border border-amber-500/30">
                    <span>Shortage / Rehne Wale Paise:</span>
                    <span className="font-bold text-sm">
                      -{settings.currencySymbol} {(grandTotal - numTendered).toLocaleString()}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-300 font-bold block">{t('change', language)} / Baqi Wapsi (باقی واپسی):</span>
                      <span className="text-[10px] text-slate-400">Customer ko wapas karen</span>
                    </div>
                    <span className="text-2xl font-black text-emerald-400 drop-shadow-sm">
                      {settings.currencySymbol} {changeReturn.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Online Bank Transfer Payment Details */}
          {paymentMethod === 'online' && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-slate-700/80 pb-2">
                <Landmark className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Online / Bank Transfer Wasooli (آن لائن / بینک ٹرانسفر)</h4>
                  <p className="text-[10px] text-slate-400">Direct bank transfer, Raast, or online payment receipt details</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Bank / Service Name (بینک / ایپ):</label>
                  <input
                    type="text"
                    value={terminalId}
                    onChange={e => setTerminalId(e.target.value)}
                    placeholder="e.g. Meezan Bank / HBL / Raast"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Sender Account Title / Name:</label>
                  <input
                    type="text"
                    value={cardType}
                    onChange={e => setCardType(e.target.value)}
                    placeholder="e.g. Ali Raza"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Transaction Ref / TRX ID (ٹرانزیکشن آئی ڈی):</label>
                <input
                  type="text"
                  value={authCodeRef}
                  onChange={e => setAuthCodeRef(e.target.value)}
                  placeholder="e.g. TRX-87291045"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-cyan-950/30 border border-cyan-500/30 rounded-lg text-[11px] text-cyan-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Confirm transfer of <strong>{settings.currencySymbol}{grandTotal}</strong> in bank account before approving.</span>
              </div>
            </div>
          )}

          {/* Card / ATM Payment Details */}
          {paymentMethod === 'card' && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">ATM / Credit / Debit Card Terminal</h4>
                    <p className="text-[10px] text-slate-400">Transaction approval and card details</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateCardTap}
                  className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-500/50 text-blue-300 font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                  title="Simulate POS Card Swipe / Tap"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Auto Swipe/Tap
                </button>
              </div>

              {/* Card Network Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Card Type / Network:</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Visa', 'MasterCard', 'PayPak', 'UnionPay', 'Debit/Credit'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCardType(type)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        cardType === type
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Last 4 Digits */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Card Last 4 Digits:</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={last4Digits}
                    onChange={e => setLast4Digits(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 4321"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Auth / Approval Ref Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Auth / Approval Code:</label>
                  <input
                    type="text"
                    value={authCodeRef}
                    onChange={e => setAuthCodeRef(e.target.value)}
                    placeholder="e.g. AUTH-98213"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* POS Terminal Machine Ref */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">ATM / POS Machine Name:</label>
                <input
                  type="text"
                  value={terminalId}
                  onChange={e => setTerminalId(e.target.value)}
                  placeholder="e.g. HBL Terminal / MCB POS Machine"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="p-2.5 bg-blue-950/30 border border-blue-500/30 rounded-lg text-[11px] text-blue-200 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Total bill <strong>{settings.currencySymbol}{grandTotal}</strong> card machine par swipe/tap karen aur confirm karen.</span>
              </div>
            </div>
          )}

          {/* Mobile Wallet Details */}
          {paymentMethod === 'wallet' && (
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">Mobile Wallet Payment</h4>
                    <p className="text-[10px] text-slate-400">EasyPaisa, JazzCash, Raast, SadaPay, NayaPay</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateWalletTxn}
                  className="px-2.5 py-1 bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-bold text-[10px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-purple-400" /> Auto TRX Ref
                </button>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">Wallet App / Provider:</label>
                <div className="flex flex-wrap gap-1.5">
                  {['EasyPaisa', 'JazzCash', 'Raast', 'NayaPay', 'SadaPay', 'Upaisa'].map(prov => (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setWalletProvider(prov)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        walletProvider === prov
                          ? 'bg-purple-600 text-white shadow'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      {prov}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Account / Mobile # */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Customer Mobile #:</label>
                  <input
                    type="text"
                    value={accountPhone}
                    onChange={e => setAccountPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Transaction ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Transaction ID (TRX ID):</label>
                  <input
                    type="text"
                    value={txnId}
                    onChange={e => setTxnId(e.target.value)}
                    placeholder="TRX-102938"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Udhaar Customer warning */}
          {paymentMethod === 'credit_udhaar' && (
            <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl text-amber-200 text-xs space-y-2">
              <p className="font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" /> Store Credit / Udhaar Transaction
              </p>
              {!selectedCustomer ? (
                <p className="text-amber-300 font-bold">
                  ⚠️ Please select or add a customer below to attach this Udhaar bill.
                </p>
              ) : (
                <p>
                  This bill of <span className="font-bold">{settings.currencySymbol}{grandTotal}</span> will be added to <span className="font-bold">{selectedCustomer.name}</span>'s ledger.
                </p>
              )}

              {/* Customer Selector if not selected */}
              {!selectedCustomer && (
                <select
                  onChange={e => {
                    const cust = customers.find(c => c.id === e.target.value);
                    if (cust) setSelectedCustomer(cust);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-100"
                >
                  <option value="">-- Select Customer for Udhaar --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-2/5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Wapas (واپسی)</span>
            </button>

            <button
              type="submit"
              className="w-3/5 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Confirm & Print</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
