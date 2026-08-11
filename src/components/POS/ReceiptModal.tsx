import React, { useRef } from 'react';
import { usePOS } from '../../context/POSContext';
import { Sale } from '../../types';
import { Printer, Download, Share2, X, CheckCircle, Barcode as BarcodeIcon } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const { settings } = usePOS();
  const printRef = useRef<HTMLDivElement>(null);

  if (!sale) return null;

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;

    // Method 1: Use dynamic hidden iframe (bypasses popup blockers in sandboxed app viewers/iframes)
    try {
      let iframe = document.getElementById('receipt-print-frame') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'receipt-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);
      }

      const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice Receipt ${sale.orderNumber}</title>
              <style>
                @page {
                  size: ${settings.paperSize === '58mm' ? '58mm' : '80mm'} auto;
                  margin: 0;
                }
                body {
                  font-family: 'Courier New', Courier, monospace;
                  width: ${settings.paperSize === '58mm' ? '58mm' : '80mm'};
                  margin: 0 auto;
                  padding: 10px;
                  font-size: 11px;
                  color: #000;
                  background: #fff;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .bold { font-weight: bold; }
                .border-b { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
                .flex { display: flex; justify-content: space-between; }
                table { width: 100%; border-collapse: collapse; margin: 6px 0; }
                th, td { text-align: left; padding: 2px 0; font-size: 11px; }
                .total-row { font-size: 13px; font-weight: bold; border-top: 1px solid #000; border-bottom: 1px double #000; padding: 4px 0; }
                img { max-width: 100%; }
              </style>
            </head>
            <body>
              ${printContents}
            </body>
          </html>
        `);
        frameDoc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn("Iframe print popup blocked, using window.open fallback:", e);
            fallbackWindowPrint(printContents);
          }
        }, 250);
        return;
      }
    } catch (e) {
      console.warn("Hidden iframe creation failed:", e);
    }

    fallbackWindowPrint(printContents);
  };

  const fallbackWindowPrint = (printContents: string) => {
    const printWindow = window.open('', '_blank', 'height=600,width=400');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice Receipt ${sale.orderNumber}</title>
            <style>
              body {
                font-family: 'Courier New', Courier, monospace;
                width: ${settings.paperSize === '58mm' ? '58mm' : '80mm'};
                margin: 0 auto;
                padding: 8px;
                font-size: 11px;
                color: #000;
                background: #fff;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .bold { font-weight: bold; }
              .border-b { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
              .flex { display: flex; justify-content: space-between; }
              table { width: 100%; border-collapse: collapse; margin: 6px 0; }
              th, td { text-align: left; padding: 2px 0; font-size: 11px; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 300);
    } else {
      // Direct window.print fallback
      window.print();
    }
  };

  const handleWhatsAppShare = () => {
    const text = `*${settings.storeName} - Invoice*
Order #: ${sale.orderNumber}
Customer: ${sale.customerName}
Total Amount: ${settings.currencySymbol} ${sale.grandTotal}
Payment Method: ${sale.paymentMethod.toUpperCase()}
Date: ${new Date(sale.createdAt).toLocaleString()}

Thank you for shopping with us!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl text-white my-auto max-h-[94vh] flex flex-col my-2 sm:my-8">
        
        {/* Actions Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Sale Success Receipt</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="overflow-y-auto flex-1 pr-0.5 custom-scrollbar mb-3">
          {/* Thermal Paper Printable Receipt Container */}
          <div className="bg-white text-slate-900 p-4 sm:p-6 rounded-xl font-mono text-xs shadow-inner space-y-3" ref={printRef}>
          
          {/* Header */}
          <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
            <h2 className="font-black text-base uppercase tracking-wider">{settings.storeName}</h2>
            <p className="text-[11px] font-sans text-slate-600">{settings.tagline}</p>
            <p className="text-[10px] text-slate-500">{settings.address}</p>
            <p className="text-[10px] text-slate-500">{settings.phone}</p>
            {settings.ntnGst && <p className="text-[10px] font-bold text-slate-700">{settings.ntnGst}</p>}
            {settings.receiptHeader && (
              <p className="text-[10px] italic font-semibold text-slate-700 pt-1">{settings.receiptHeader}</p>
            )}
          </div>

          {/* Meta details */}
          <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Order #:</span>
              <span className="font-bold">{sale.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Date/Time:</span>
              <span>{new Date(sale.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cashier:</span>
              <span className="font-semibold">{sale.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold">{sale.customerName}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 text-slate-600">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sale.items.map((item, idx) => {
                const itemTot = item.product.sellPrice * item.quantity * (1 - item.itemDiscountPercent / 100);
                return (
                  <tr key={idx}>
                    <td className="py-1 font-sans">
                      <span className="font-semibold block">{item.product.name}</span>
                      {item.product.nameUrdu && <span className="text-[9px] text-slate-500 block">{item.product.nameUrdu}</span>}
                    </td>
                    <td className="py-1 text-center font-mono">{item.quantity} {item.selectedUnit}</td>
                    <td className="py-1 text-right font-mono">{settings.currencySymbol}{item.product.sellPrice}</td>
                    <td className="py-1 text-right font-mono font-bold">{settings.currencySymbol}{Math.round(itemTot)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Specialized Token for Nan Shop (Facilitates Tandoor Order) */}
          {settings.businessType === 'nan_shop' && (
            <div className="mt-4 border-t-2 border-double border-slate-900 pt-4 text-center">
              <div className="inline-block border-2 border-slate-950 p-2 rounded-lg mb-2">
                <h3 className="font-black text-lg uppercase tracking-tighter leading-none mb-1">ORDER TOKEN</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">Nan Center ID: {sale.orderNumber.split('-').pop()}</p>
              </div>
              
              <div className="space-y-1 my-2">
                {sale.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-center gap-3">
                    <span className="text-xl font-black">{item.quantity}</span>
                    <span className="text-base font-bold uppercase">{item.product.name}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-[10px] italic text-slate-500 mt-2 border-t border-dashed border-slate-300 pt-2">
                Please present this token at the tandoor to collect your fresh nans.
              </p>
            </div>
          )}

          {/* Calculations */}
          <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-semibold">{settings.currencySymbol} {sale.subtotal}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount {sale.promoCode ? `(${sale.promoCode})` : ''}:</span>
                <span>-{settings.currencySymbol} {sale.discountAmount}</span>
              </div>
            )}
            {sale.taxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Tax GST:</span>
                <span>+{settings.currencySymbol} {sale.taxAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black border-t border-b border-slate-900 py-1.5 my-1">
              <span>GRAND TOTAL:</span>
              <span>{settings.currencySymbol} {sale.grandTotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Payment Mode:</span>
              <span className="font-bold capitalize">
                {sale.paymentMethod === 'online' ? 'Online / Bank Transfer' : sale.paymentMethod === 'credit_udhaar' ? 'Credit / Udhaar' : sale.paymentMethod}
              </span>
            </div>
            {sale.paymentMethod === 'cash' && (
              <>
                <div className="flex justify-between text-slate-600">
                  <span>Tendered:</span>
                  <span>{settings.currencySymbol} {sale.amountTendered}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-semibold">
                  <span>Change Return:</span>
                  <span>{settings.currencySymbol} {sale.changeGiven}</span>
                </div>
              </>
            )}

            {sale.paymentMethod === 'card' && sale.cardDetails && (
              <div className="bg-slate-50 p-2 rounded border border-slate-200 mt-1 space-y-0.5 text-[10px]">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Card Type:</span>
                  <span>{sale.cardDetails.cardType || 'Card'} (**** {sale.cardDetails.last4Digits || '****'})</span>
                </div>
                {sale.cardDetails.authCodeRef && (
                  <div className="flex justify-between text-slate-600">
                    <span>Auth / Ref #:</span>
                    <span className="font-mono">{sale.cardDetails.authCodeRef}</span>
                  </div>
                )}
                {sale.cardDetails.terminalId && (
                  <div className="flex justify-between text-slate-600">
                    <span>Terminal:</span>
                    <span>{sale.cardDetails.terminalId}</span>
                  </div>
                )}
              </div>
            )}

            {sale.paymentMethod === 'wallet' && sale.walletDetails && (
              <div className="bg-slate-50 p-2 rounded border border-slate-200 mt-1 space-y-0.5 text-[10px]">
                <div className="flex justify-between font-semibold text-slate-700">
                  <span>Wallet Provider:</span>
                  <span>{sale.walletDetails.provider || 'Mobile Wallet'}</span>
                </div>
                {sale.walletDetails.accountPhone && (
                  <div className="flex justify-between text-slate-600">
                    <span>Mobile #:</span>
                    <span>{sale.walletDetails.accountPhone}</span>
                  </div>
                )}
                {sale.walletDetails.txnId && (
                  <div className="flex justify-between text-slate-600">
                    <span>TRX ID:</span>
                    <span className="font-mono">{sale.walletDetails.txnId}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barcode SVG representation */}
          <div className="pt-2 text-center">
            <div className="inline-block px-4 py-1 bg-slate-100 rounded border border-slate-200">
              <div className="h-8 flex items-center justify-center gap-0.5">
                {[2,1,3,1,2,2,1,3,1,2,1,2,3,1,1,2,1,3,2,1,2].map((w, i) => (
                  <span
                    key={i}
                    className="bg-slate-900 inline-block h-6"
                    style={{ width: `${w * 1.5}px` }}
                  />
                ))}
              </div>
              <p className="text-[9px] text-slate-600 mt-0.5 tracking-widest">{sale.orderNumber}</p>
            </div>
          </div>

          {/* Footer message */}
          {settings.receiptFooter && (
            <div className="text-center pt-2 text-[10px] text-slate-500 italic border-t border-dashed border-slate-200">
              {settings.receiptFooter}
            </div>
          )}

        </div>
        </div>

        {/* Bottom Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 shrink-0 pt-2 border-t border-slate-800/80">
          <button
            onClick={handlePrint}
            className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-3 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors col-span-2 sm:col-span-1"
          >
            <span>Close & New Sale</span>
          </button>
        </div>

      </div>
    </div>
  );
};
