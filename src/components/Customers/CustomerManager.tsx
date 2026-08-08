import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { t } from '../../utils/i18n';
import {
  Users,
  UserPlus,
  Search,
  BookOpen,
  Award,
  DollarSign,
  History,
  CheckCircle,
  X,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { Customer } from '../../types';

export const CustomerManager: React.FC = () => {
  const {
    language,
    customers,
    addCustomer,
    updateCustomer,
    collectUdhaarPayment,
    sales,
    settings
  } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustForLedger, setSelectedCustForLedger] = useState<Customer | null>(null);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustForPayment, setSelectedCustForPayment] = useState<Customer | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  const totalUdhaarOutstanding = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      addCustomer({ name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim() });
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setIsAddModalOpen(false);
    }
  };

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustForPayment && collectAmount > 0) {
      collectUdhaarPayment(selectedCustForPayment.id, collectAmount);
      setIsPaymentModalOpen(false);
      setSelectedCustForPayment(null);
      setCollectAmount(0);
    }
  };

  const customerSales = selectedCustForLedger
    ? sales.filter(s => s.customerId === selectedCustForLedger.id)
    : [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
            <Users className="w-6 h-6" /> {t('customers', language)} & Udhaar Ledger
          </h2>
          <p className="text-xs text-slate-400">Manage customer accounts, loyalty points & collect outstanding credit balance</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('add_customer', language)}</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Registered Customers</p>
            <p className="text-2xl font-black text-slate-100">{customers.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-400 font-semibold uppercase">Total Outstanding Udhaar</p>
            <p className="text-2xl font-black text-amber-400">
              {settings.currencySymbol} {totalUdhaarOutstanding.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase">Total Customer Lifetime Spend</p>
            <p className="text-2xl font-black text-emerald-400">
              {settings.currencySymbol} {customers.reduce((a, b) => a + b.totalSpent, 0).toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        
        <div className="p-4 border-b border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or phone..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Loyalty Points</th>
                <th className="p-3">Total Spend</th>
                <th className="p-3">Udhaar Balance</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3 font-bold text-slate-100">{c.name}</td>
                    
                    <td className="p-3 font-mono text-slate-300">
                      <div>{c.phone}</div>
                      {c.email && <div className="text-[10px] text-slate-500">{c.email}</div>}
                    </td>

                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 bg-yellow-950/60 text-yellow-400 border border-yellow-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                        <Award className="w-3 h-3" /> {c.loyaltyPoints} pts
                      </span>
                    </td>

                    <td className="p-3 font-bold text-slate-200">
                      {settings.currencySymbol} {c.totalSpent.toLocaleString()}
                    </td>

                    <td className="p-3">
                      {c.outstandingBalance > 0 ? (
                        <span className="font-black text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800">
                          {settings.currencySymbol} {c.outstandingBalance.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold">Cleared (0)</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.outstandingBalance > 0 && (
                          <button
                            onClick={() => {
                              setSelectedCustForPayment(c);
                              setCollectAmount(c.outstandingBalance);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition-colors"
                          >
                            Collect Udhaar
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCustForLedger(c)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* COLLECT PAYMENT MODAL */}
      {isPaymentModalOpen && selectedCustForPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-white">
            <h3 className="font-bold text-base text-amber-400 mb-2">Collect Udhaar Payment</h3>
            <p className="text-xs text-slate-300 mb-3">Customer: <span className="font-bold">{selectedCustForPayment.name}</span></p>

            <form onSubmit={handleCollectSubmit} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400">Total Udhaar Due:</p>
                <p className="text-lg font-black text-amber-400">
                  {settings.currencySymbol} {selectedCustForPayment.outstandingBalance}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Received Payment Amount *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max={selectedCustForPayment.outstandingBalance}
                  value={collectAmount}
                  onChange={e => setCollectAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-emerald-400">Add New Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Chaudhry Ali"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="e.g. 0300-1234567"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. ali@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Address / Locality</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="e.g. House # 4, DHA Phase 5"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-bold rounded-xl"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER HISTORY DRAWER */}
      {selectedCustForLedger && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 max-w-md w-full p-6 shadow-2xl text-white overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="font-bold text-base text-emerald-400">Customer Purchase Ledger</h3>
              <button onClick={() => setSelectedCustForLedger(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 space-y-1 text-xs">
              <p className="font-bold text-slate-100 text-sm">{selectedCustForLedger.name}</p>
              <p className="text-slate-400">{selectedCustForLedger.phone}</p>
              <p className="text-amber-400 font-bold">Outstanding Udhaar: {settings.currencySymbol}{selectedCustForLedger.outstandingBalance}</p>
            </div>

            <h4 className="font-bold text-xs text-slate-300 mb-3 uppercase tracking-wider">Past Sale Orders ({customerSales.length})</h4>

            {customerSales.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No past purchases recorded for this customer.</p>
            ) : (
              <div className="space-y-3">
                {customerSales.map(s => (
                  <div key={s.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-200">{s.orderNumber}</span>
                      <span className="text-emerald-400">{settings.currencySymbol} {s.grandTotal}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                      <span className="uppercase font-semibold text-slate-300">{s.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
