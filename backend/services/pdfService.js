const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');
const { generateQrBase64 } = require('../utils/qrUtil'); // import QR util

// --- Fonts ---
const fonts = {
  Roboto: {
    normal: path.join(__dirname, '..', 'fonts', 'Roboto_Condensed-Regular.ttf'),
    bold: path.join(__dirname, '..', 'fonts', 'Roboto_Condensed-Bold.ttf'),
    italics: path.join(__dirname, '..', 'fonts', 'Roboto_Condensed-Italic.ttf'),
    bolditalics: path.join(__dirname, '..', 'fonts', 'Roboto_Condensed-BoldItalic.ttf')
  }
};

const printer = new PdfPrinter(fonts);

// --- Load Logo ---
const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');
let logoBase64 = '';
try {
  logoBase64 = fs.readFileSync(logoPath).toString('base64');
} catch (err) {
  console.warn('Logo not found, PDF will be generated without logo.');
}

// function generateInvoicePDF(invoiceData) {
//   return new Promise((resolve, reject) => {
//     const { invoice, customer, items } = invoiceData;

//     if (!items || !Array.isArray(items)) {
//       return reject(new Error("PDF Generation Error: 'items' must be an array."));
//     }

async function generateInvoicePDF(invoiceData) {
  return new Promise(async (resolve, reject) => {
    const { invoice, customer, items } = invoiceData;

    if (!items || !Array.isArray(items)) {
      return reject(new Error("PDF Generation Error: 'items' must be an array."));
    }

    // Generate Feedback QR dynamically
    const feedbackQrBase64 = await generateQrBase64('https://forms.gle/m8R2yVTzMPMAX8dm6');
    const InstaQrBase64 = await generateQrBase64('https://www.instagram.com/embellish._nj/');






    const docDefinition = {
      pageMargins: [40, 60, 40, 60],
      content: [
        // --- HEADER ---
        {
          columns: [
            logoBase64
              ? { image: 'data:image/png;base64,' + logoBase64, width: 100 }
              : { text: '' },
            {
              width: '*',
              stack: [
                { text: 'Embellish Jewels', bold: true, fontSize: 18, color: '#333' },
                { text: 'by Nakul', fontSize: 11, margin: [0, 2, 0, 0], color: '#666' },
                { text: 'Jaipur, Rajasthan, 302112', fontSize: 10, color: '#555' },
                { text: 'support@embellishjewels.com', fontSize: 10, color: '#555' }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 25]
        },

        // --- INVOICE INFO ---
        {
          columns: [
            {
              stack: [
                { text: 'INVOICE', style: 'invoiceTitle' },
                { text: `Invoice #: ${invoice.invoiceNumber}`, style: 'invoiceMeta' },
                { text: `Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, style: 'invoiceMeta' },
                invoice.orderId ? { text: `Order ID: ${invoice.orderId}`, style: 'invoiceMeta' } : {}
              ]
            },
            {
              stack: [
                { text: invoice.status === 'Paid' ? 'PAID' : 'UNPAID', bold: true, color: invoice.status === 'Paid' ? 'green' : 'red', fontSize: 12 }
              ],
              alignment: 'right'
            }
          ],
          margin: [0, 0, 0, 20]
        },

        // --- CUSTOMER INFO ---
        {
          style: 'customerBox',
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    { text: 'Customer Details', bold: true, fontSize: 11, margin: [0, 0, 0, 6], color: '#333' },
                    { text: customer.name, fontSize: 10 },
                    { text: customer.email, fontSize: 10 },
                    { text: customer.phone, fontSize: 10 },
                    customer.address ? { text: customer.address, fontSize: 10 } : {}
                  ]
                }
              ]
            ]
          },
          layout: {
            fillColor: () => '#f9f9f9',
            hLineWidth: () => 0,
            vLineWidth: () => 0
          },
          margin: [0, 0, 0, 25]
        },

        // --- ORDER SUMMARY ---
        { text: 'Order Summary', bold: true, fontSize: 12, margin: [0, 0, 0, 10], color: '#333' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', 'auto', 'auto'],
            body: [
              [
                { text: 'Product', style: 'tableHeader' },
                { text: 'Qty', style: 'tableHeader' },
                { text: 'Price', style: 'tableHeader' },
                { text: 'Total', style: 'tableHeader' }
              ],
              ...items.map((item, i) => {
                const itemTotal = (item.quantity * parseFloat(item.price));
                return [
                  { text: item.Product.name, margin: [0, 5, 0, 5], fillColor: i % 2 === 0 ? '#fafafa' : null },
                  { text: item.quantity.toString(), alignment: 'center', margin: [0, 5, 0, 5], fillColor: i % 2 === 0 ? '#fafafa' : null },
                  { text: `₹${parseFloat(item.price).toFixed(2)}`, alignment: 'right', margin: [0, 5, 0, 5], fillColor: i % 2 === 0 ? '#fafafa' : null },
                  { text: `₹${itemTotal.toFixed(2)}`, alignment: 'right', margin: [0, 5, 0, 5], fillColor: i % 2 === 0 ? '#fafafa' : null }
                ];
              })
            ]
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === 0 ? '#C8A951' : null), // gold header
            hLineColor: '#e0e0e0',
            vLineColor: '#e0e0e0',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 5,
            paddingBottom: () => 5
          }
        },

        // --- TOTALS ---
        {
          alignment: 'right',
          margin: [0, 20, 0, 0],
          table: {
            widths: ['*', 'auto'],
            body: [
              ['Subtotal', `₹${parseFloat(invoice.subtotal).toFixed(2)}`],
              invoice.discount && invoice.discount > 0 ? ['Discount', `- ₹${parseFloat(invoice.discount).toFixed(2)}`] : null,
              invoice.deliveryCharge ? ['Delivery', `₹${parseFloat(invoice.deliveryCharge).toFixed(2)}`] : null,
              [
                { text: 'Grand Total', bold: true, fontSize: 13, color: '#333' },
                { text: `₹${parseFloat(invoice.grandTotal).toFixed(2)}`, bold: true, fontSize: 13, color: '#333' }
              ]
            ].filter(Boolean)
          },
          layout: {
            fillColor: (rowIndex) => (rowIndex === (invoice.discount || invoice.deliveryCharge ? 3 : 1) ? '#f5f5f5' : null),
            hLineColor: '#cccccc',
            vLineColor: '#cccccc'
          }
        },

        // --- FOOTER ---
        {
          text: 'Thank you for shopping with Embellish Jewels 💎',
          style: 'footerNote',
          margin: [0, 30, 0, 10]
        },
        {
          text: 'For support or returns, contact us at embellish.nj@gmail.com or WhatsApp +91-8618486616',
          fontSize: 8,
          color: '#777',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },


        {
          columns: [
            {
              stack: [
                InstaQrBase64
                  ? { image: InstaQrBase64, width: 80 }
                  : { text: '' },
                { text: 'Follow us on Instagram', fontSize: 8, alignment: 'center', margin: [0, 5, 0, 0] }
              ],
              alignment: 'center'
            },
            {
              stack: [
                feedbackQrBase64
                  ? { image: feedbackQrBase64, width: 80 }
                  : { text: '' },
                { text: 'Share your feedback', fontSize: 8, alignment: 'center', margin: [0, 5, 0, 0] }
              ],
              alignment: 'center'
            }
          ],
          margin: [0, 20, 0, 20]
        },

        // --- COMPLIANCE NOTE + TIMESTAMP ---
        {
          text: 'This is a computer-generated invoice/bill and does not require any signature.',
          fontSize: 8,
          italics: true,
          alignment: 'center',
          color: '#777',
          margin: [0, 10, 0, 0]
        },
        {
          text: `Generated on: ${new Date().toLocaleString()}`,
          fontSize: 8,
          color: '#999',
          alignment: 'center',
          margin: [0, 2, 0, 0]
        }
      ],

      styles: {
        invoiceTitle: { fontSize: 22, bold: true, margin: [0, 0, 0, 8], color: '#333' },
        invoiceMeta: { fontSize: 10, margin: [0, 2, 0, 2], color: '#555' },
        customerBox: { margin: [0, 0, 0, 20] },
        tableHeader: { bold: true, fontSize: 10, color: 'white', alignment: 'center' },
        footerNote: { italics: true, alignment: 'center', fontSize: 10, color: '#555' }
      }
    };


    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.end();
  });
}

module.exports = { generateInvoicePDF };
