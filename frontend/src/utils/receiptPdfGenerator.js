import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Utility for generating 58mm Thermal Receipt PDFs.
 *
 * Requirements satisfied:
 * - Independent of physical printers / print dialogs.
 * - 58mm width standard continuous roll.
 * - Dynamic height according to content length (zero blank pages, no clipping).
 * - Full Unicode font support (handles Hindi Devanagari and English simultaneously).
 * - Monospaced receipt typography with clean borders and right-aligned financial amounts.
 * - Authoritative totals from ThermalReceiptResponse (never frontend overrides).
 * - Meaningful filename: TSS-BILL-{billNumber}.pdf
 */

const formatINR = (val) => {
  const num = Number(val || 0);
  return `₹${num.toFixed(2)}`;
};

/**
 * Builds offscreen 58mm thermal receipt HTML element
 * @param {Object} receipt ThermalReceiptResponse DTO
 * @returns {HTMLElement} The prepared DOM element
 */
function createReceiptElement(receipt) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  // 58mm roll width: ~210px at standard 96dpi (printable area ~48-52mm = ~190-200px)
  container.style.width = '200px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#000000';
  container.style.fontFamily = "'Courier New', Courier, 'Noto Sans Devanagari', monospace";
  container.style.fontSize = '9px';
  container.style.lineHeight = '1.25';
  container.style.padding = '8px 6px';
  container.style.boxSizing = 'border-box';
  container.style.webkitFontSmoothing = 'antialiased';

  const hasTax = (Number(receipt.taxRate) > 0 || Number(receipt.totalTax) > 0);
  const hasDiscount = Number(receipt.discountAmount) > 0;

  // Build Items HTML
  const itemsHtml = (receipt.items && receipt.items.length > 0)
    ? receipt.items.map(item => `
        <div style="margin-bottom: 4px;">
          <div style="font-weight: bold; word-break: break-word;">${escapeHtml(item.name || 'Item')}</div>
          <div style="display: flex; justify-content: space-between; font-size: 8.5px; color: #333333;">
            <span>${item.quantity} × ${Number(item.unitPrice || 0).toFixed(2)}</span>
            <span style="font-weight: bold; color: #000000;">${Number(item.subtotal || 0).toFixed(2)}</span>
          </div>
        </div>
      `).join('')
    : '<div style="text-align: center; color: #666; font-style: italic;">No items</div>';

  container.innerHTML = `
    <div style="text-align: center; border-bottom: 1px dashed #444; padding-bottom: 5px; margin-bottom: 5px;">
      <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${escapeHtml(receipt.restaurantName || 'THE STATION STORIES')}
      </div>
      ${receipt.tagline ? `<div style="font-size: 8px; color: #444; margin-top: 1px;">${escapeHtml(receipt.tagline)}</div>` : ''}
      ${receipt.address ? `<div style="font-size: 7.5px; color: #555; margin-top: 1px; word-break: break-word;">${escapeHtml(receipt.address)}</div>` : ''}
      ${receipt.phone ? `<div style="font-size: 7.5px; color: #555;">Tel: ${escapeHtml(receipt.phone)}</div>` : ''}
      ${receipt.gstin ? `<div style="font-size: 8px; font-weight: bold; margin-top: 2px;">GSTIN: ${escapeHtml(receipt.gstin)}</div>` : ''}
    </div>

    <div style="border-bottom: 1px dashed #444; padding-bottom: 4px; margin-bottom: 4px; font-size: 8px;">
      <div style="display: flex; justify-content: space-between;">
        <span>BILL:</span>
        <span style="font-weight: bold;">${escapeHtml(receipt.billNumber || '')}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>DATE: ${escapeHtml(receipt.date || '')}</span>
        <span>TIME: ${escapeHtml(receipt.time || '')}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>ORDER:</span>
        <span style="font-weight: bold;">${escapeHtml(receipt.orderType || '')} ${receipt.cabinTableRef ? `(${escapeHtml(receipt.cabinTableRef)})` : ''}</span>
      </div>
      ${receipt.cashierName ? `
        <div style="display: flex; justify-content: space-between;">
          <span>CASHIER:</span>
          <span>${escapeHtml(receipt.cashierName)}</span>
        </div>
      ` : ''}
      ${receipt.customerName ? `
        <div style="display: flex; justify-content: space-between;">
          <span>CUSTOMER:</span>
          <span>${escapeHtml(receipt.customerName)}</span>
        </div>
      ` : ''}
      <div style="display: flex; justify-content: space-between;">
        <span>PAYMENT:</span>
        <span style="font-weight: bold;">${escapeHtml(receipt.paymentMethod || 'CASH')}</span>
      </div>
    </div>

    <!-- Items Header -->
    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 8px; border-bottom: 1px dashed #444; padding-bottom: 3px; margin-bottom: 3px;">
      <span>ITEM (QTY × RATE)</span>
      <span>AMOUNT</span>
    </div>

    <!-- Items List -->
    <div style="border-bottom: 1px dashed #444; padding-bottom: 4px; margin-bottom: 4px;">
      ${itemsHtml}
    </div>

    <!-- Financial Totals -->
    <div style="border-bottom: 1px dashed #444; padding-bottom: 4px; margin-bottom: 5px; font-size: 8.5px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
        <span>SUBTOTAL:</span>
        <span>${formatINR(receipt.subtotal)}</span>
      </div>
      ${hasDiscount ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
          <span>DISCOUNT:</span>
          <span>-${formatINR(receipt.discountAmount)}</span>
        </div>
      ` : ''}
      ${hasTax ? `
        <div style="display: flex; justify-content: space-between; margin-bottom: 1px;">
          <span>TAX (${receipt.taxRate}%):</span>
          <span>${formatINR(receipt.totalTax)}</span>
        </div>
      ` : `
        <div style="display: flex; justify-content: space-between; color: #555; font-size: 7.5px; margin-bottom: 1px;">
          <span>TAX:</span>
          <span>Tax-Exempt</span>
        </div>
      `}
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 10.5px; border-top: 1px solid #222; padding-top: 3px; margin-top: 2px;">
        <span>TOTAL:</span>
        <span>${formatINR(receipt.grandTotal)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; font-size: 8px; color: #333333; padding-top: 2px;">
      ${receipt.footerText ? `<div style="font-weight: bold;">${escapeHtml(receipt.footerText)}</div>` : '<div style="font-weight: bold;">THANK YOU! PLEASE VISIT AGAIN</div>'}
      <div style="font-size: 7px; color: #777; margin-top: 2px;">The Station Stories • 58mm Thermal Invoice</div>
    </div>
  `;

  return container;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates and triggers browser download of the 58mm thermal receipt PDF.
 * @param {Object} receiptData The authoritative ThermalReceiptResponse object
 * @returns {Promise<{ success: boolean, filename: string }>}
 */
export async function downloadReceiptPdf(receiptData) {
  if (!receiptData || !receiptData.billNumber) {
    throw new Error('Invalid receipt data: billNumber is required for PDF generation.');
  }

  // Sanitize bill number for filename
  const cleanBillNum = receiptData.billNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `TSS-BILL-${cleanBillNum}.pdf`;

  // 1. Create offscreen element
  const element = createReceiptElement(receiptData);
  document.body.appendChild(element);

  try {
    // 2. High-resolution canvas rasterization (3x scale ensures crisp 300dpi print quality)
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    // 3. Compute dynamic 58mm PDF height
    const pdfWidthMm = 58;
    const pdfHeightMm = (canvas.height * pdfWidthMm) / canvas.width;

    // 4. Create custom-dimension jsPDF document (single continuous thermal roll page)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [pdfWidthMm, pdfHeightMm],
      compress: true,
    });

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');

    // 5. Trigger browser download
    pdf.save(filename);

    return {
      success: true,
      filename,
    };
  } finally {
    // 6. Clean up offscreen element
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

export default {
  downloadReceiptPdf,
};
