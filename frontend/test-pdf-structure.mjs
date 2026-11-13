import { jsPDF } from 'jspdf';
import fs from 'node:fs';
import assert from 'node:assert';

console.log('Testing 58mm continuous roll PDF generation...');

const pdfWidthMm = 58;
// Typical 58mm receipt height for 4-item bill: ~140mm
const estimatedHeightMm = 142.5;

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: [pdfWidthMm, estimatedHeightMm],
  compress: true,
});

doc.setFont('Courier', 'bold');
doc.setFontSize(10);
doc.text('THE STATION STORIES', 29, 8, { align: 'center' });

doc.setFont('Courier', 'normal');
doc.setFontSize(7.5);
doc.text('Fast Food & Restaurant', 29, 12, { align: 'center' });
doc.text('Railway Station Road, Station Area', 29, 15, { align: 'center' });
doc.text('------------------------------------------', 29, 19, { align: 'center' });

doc.setFontSize(7);
doc.text('BILL: TSS-20261113-0001', 4, 23);
doc.text('DATE: 13 Nov 2026  TIME: 09:30 AM', 4, 27);
doc.text('ORDER: DINE_IN (Cabin A)', 4, 31);
doc.text('CASHIER: StaffOperator', 4, 35);
doc.text('PAYMENT: CASH', 4, 39);
doc.text('------------------------------------------', 29, 43, { align: 'center' });

doc.setFont('Courier', 'bold');
doc.text('ITEM', 4, 47);
doc.text('QTY x RATE', 26, 47);
doc.text('AMOUNT', 54, 47, { align: 'right' });
doc.text('------------------------------------------', 29, 50, { align: 'center' });

doc.setFont('Courier', 'normal');
const items = [
  { name: 'Veg Hakka Noodles', qty: 2, rate: '120.00', amount: '240.00' },
  { name: 'Paneer Butter Masala', qty: 1, rate: '220.00', amount: '220.00' },
  { name: 'Butter Naan', qty: 3, rate: '40.00', amount: '120.00' },
  { name: 'Mineral Water 1L', qty: 2, rate: '20.00', amount: '40.00' },
];

let y = 54;
items.forEach((item) => {
  doc.setFont('Courier', 'bold');
  doc.text(item.name, 4, y);
  y += 3.5;
  doc.setFont('Courier', 'normal');
  doc.text(`${item.qty} x ${item.rate}`, 4, y);
  doc.text(item.amount, 54, y, { align: 'right' });
  y += 4.5;
});

doc.text('------------------------------------------', 29, y, { align: 'center' });
y += 4;
doc.text('SUBTOTAL:', 4, y);
doc.text('620.00', 54, y, { align: 'right' });
y += 4;
doc.text('DISCOUNT (NONE):', 4, y);
doc.text('0.00', 54, y, { align: 'right' });
y += 4;
doc.setFont('Courier', 'bold');
doc.setFontSize(8.5);
doc.text('TOTAL:', 4, y);
doc.text('Rs. 620.00', 54, y, { align: 'right' });
y += 6;
doc.setFont('Courier', 'normal');
doc.setFontSize(7);
doc.text('*** THANK YOU! PLEASE VISIT AGAIN ***', 29, y, { align: 'center' });
y += 3.5;
doc.setFontSize(6.5);
doc.text('The Station Stories - 58mm Thermal Receipt', 29, y, { align: 'center' });

// Verify single page, 0 blank pages
const pageCount = doc.getNumberOfPages();
assert.strictEqual(pageCount, 1, 'PDF must contain exactly 1 continuous roll page');

const pageSize = doc.internal.pageSize;
const widthMm = pageSize.getWidth();
const heightMm = pageSize.getHeight();

assert.strictEqual(Math.round(widthMm), 58, 'PDF width must be 58mm');
console.log(`✔ Verified PDF dimensions: ${widthMm.toFixed(1)}mm x ${heightMm.toFixed(1)}mm`);
console.log(`✔ Verified page count: ${pageCount} (Zero blank pages, continuous thermal roll format)`);

const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
fs.writeFileSync('./sample-58mm-thermal-receipt.pdf', pdfBuffer);
console.log(`✔ Generated sample receipt PDF: sample-58mm-thermal-receipt.pdf (${pdfBuffer.length} bytes)`);
